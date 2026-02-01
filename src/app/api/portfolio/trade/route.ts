import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { fetchStockData } from '@/lib/stocks-api';
import { calculateTradeXP } from '@/lib/level-system'; // Corrected import source guess if needed, assumimg lib exists
// import { checkPaperTradingAchievements } from '@/lib/achievements';

const STARTING_CAPITAL = 10000;
const USD_TO_SEK = 10.5;

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const { symbol, shares, type, name, price, currency } = await request.json();
        const supabase = await createSupabaseServerClient();
        const admin = getSupabaseAdmin();

        // 1. Authenticate User
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (!user || authError) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Validate Input
        if (!symbol || !shares || shares <= 0 || !['buy', 'sell'].includes(type)) {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
        }

        // 3. Fetch REAL Price from Server Side (Yahoo Finance)
        const stockData = await fetchStockData(symbol);

        if (!stockData) {
            return NextResponse.json({ error: 'Could not verify stock price' }, { status: 500 });
        }

        const currentPrice = stockData.price;
        const currentCurrency = stockData.currency || 'USD';

        // Calculate costs in SEK
        const rate = currentCurrency === 'USD' ? USD_TO_SEK : 1;
        const totalCostSek = shares * currentPrice * rate;

        if (type === 'buy') {
            // === BUY LOGIC ===

            // Calculate current balance
            const { data: portfolio } = await admin
                .from("portfolio")
                .select("shares, buy_price, currency")
                .eq("user_id", user.id);

            let totalInvested = 0;
            (portfolio || []).forEach((item: any) => {
                const itemRate = item.currency === "USD" ? USD_TO_SEK : 1;
                totalInvested += item.shares * item.buy_price * itemRate;
            });

            const cashBalance = STARTING_CAPITAL - totalInvested;

            if (cashBalance < totalCostSek) {
                return NextResponse.json({ error: 'Insufficient funds' }, { status: 400 });
            }

            // Lock for 30 mins
            const lockedUntil = new Date(Date.now() + 30 * 60 * 1000).toISOString();

            // Execute Trade (Add to Portfolio) - Using ADMIN
            const { error: insertError } = await admin
                .from("portfolio")
                .insert({
                    user_id: user.id,
                    symbol: symbol,
                    name: stockData.name || name,
                    shares: shares,
                    buy_price: currentPrice,
                    currency: currentCurrency,
                    locked_until: lockedUntil,
                });

            if (insertError) throw insertError;

            // Log Transaction - Using ADMIN
            await admin.from("transactions").insert({
                user_id: user.id,
                symbol: symbol,
                name: stockData.name || name,
                type: "buy",
                shares: shares,
                price: currentPrice,
                currency: currentCurrency,
                total_sek: totalCostSek,
                realized_pnl: 0,
            });

            return NextResponse.json({ success: true, price: currentPrice });

        } else if (type === 'sell') {
            // === SELL LOGIC ===
            const { portfolioId } = await request.json();

            if (!portfolioId) {
                return NextResponse.json({ error: 'Portfolio ID required for sell' }, { status: 400 });
            }

            // Verify ownership and shares - Using ADMIN
            const { data: lot } = await admin
                .from("portfolio")
                .select("*")
                .eq("id", portfolioId)
                .eq("user_id", user.id)
                .single();

            if (!lot || lot.shares < shares) {
                return NextResponse.json({ error: 'Invalid share count or ownership' }, { status: 400 });
            }

            // Check Lock
            if (lot.locked_until && new Date(lot.locked_until) > new Date()) {
                return NextResponse.json({ error: 'Position is locked' }, { status: 400 });
            }

            // Calculate PnL
            const buyPriceSek = lot.buy_price * (lot.currency === 'USD' ? USD_TO_SEK : 1);
            const sellPriceSek = currentPrice * rate;
            const pnl = (sellPriceSek - buyPriceSek) * shares;

            // Execute Trade - Using ADMIN
            if (lot.shares === shares) {
                await admin.from("portfolio").delete().eq("id", portfolioId);
            } else {
                await admin.from("portfolio").update({ shares: lot.shares - shares }).eq("id", portfolioId);
            }

            // Log Transaction - Using ADMIN
            await admin.from("transactions").insert({
                user_id: user.id,
                symbol: symbol,
                name: lot.name,
                type: "sell",
                shares: shares,
                price: currentPrice,
                currency: currentCurrency,
                total_sek: shares * sellPriceSek,
                realized_pnl: pnl,
            });

            // Update Streak & XP - Using ADMIN
            try {
                const { data: profile } = await admin
                    .from("profiles")
                    .select("paper_win_streak, paper_best_streak, reputation_score")
                    .eq("id", user.id)
                    .single();

                const currentStreak = profile?.paper_win_streak || 0;
                const currentRep = profile?.reputation_score || 0;

                if (pnl > 0) {
                    const newStreak = currentStreak + 1;
                    const xpEarned = calculateTradeXP(pnl, newStreak);
                    await admin.from("profiles").update({
                        paper_win_streak: newStreak,
                        paper_best_streak: Math.max(newStreak, profile?.paper_best_streak || 0),
                        reputation_score: currentRep + xpEarned,
                    }).eq("id", user.id);
                } else {
                    await admin.from("profiles").update({
                        paper_win_streak: 0,
                    }).eq("id", user.id);
                }
            } catch (e) {
                console.error("Streak/XP update failed:", e);
            }

            return NextResponse.json({ success: true, pnl, totalProceeds: shares * sellPriceSek });
        }

    } catch (error: any) {
        console.error('Trade API Error:', error);
        return NextResponse.json({ error: error.message || 'Trade failed' }, { status: 500 });
    }
}
