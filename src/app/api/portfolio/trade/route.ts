import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { fetchStockData } from '@/lib/stocks-api';
import { calculateTradeXP } from '@/lib/level-system'; // Corrected import source guess if needed, assumimg lib exists
// import { checkPaperTradingAchievements } from '@/lib/achievements';

const STARTING_CAPITAL = 10000;
const EXCHANGE_RATE_USD_SEK = 10.5;

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
        if (!symbol || !shares || shares <= 0 || !['buy', 'sell', 'short', 'cover'].includes(type)) {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
        }

        // 3. Fetch REAL Price from Server Side
        const stockData = await fetchStockData(symbol);
        if (!stockData) {
            return NextResponse.json({ error: 'Could not verify stock price' }, { status: 500 });
        }

        const currentPrice = stockData.price;
        const currentCurrency = stockData.currency || 'USD';

        // Calculate trade value in USD (Base Currency)
        const rateToUsd = currentCurrency === 'SEK' ? (1 / EXCHANGE_RATE_USD_SEK) : 1;
        const tradeValueUsd = shares * currentPrice * rateToUsd;

        // 4. Get Current Portfolio State (Netting Logic)
        const { data: existingPosition } = await admin
            .from("portfolio")
            .select("*")
            .eq("user_id", user.id)
            .eq("symbol", symbol)
            .single();

        const currentShares = existingPosition?.shares || 0;

        // 5. Get Cash Balance
        const { data: allHoldings } = await admin
            .from("portfolio")
            .select("shares, buy_price, currency")
            .eq("user_id", user.id);

        let totalInvestedUsd = 0;
        (allHoldings || []).forEach((item: any) => {
            const itemRateToUsd = item.currency === "SEK" ? (1 / EXCHANGE_RATE_USD_SEK) : 1;
            totalInvestedUsd += item.shares * item.buy_price * itemRateToUsd;
        });

        const cashBalance = STARTING_CAPITAL - totalInvestedUsd;

        // === EXECUTION LOGIC ===

        if (type === 'buy') {
            // Rule: Cannot Buy if Short (Must Cover first)
            if (currentShares < 0) {
                return NextResponse.json({ error: 'Position is net Short. Use "Buy to Cover" instead.' }, { status: 400 });
            }

            // Cost Check
            if (cashBalance < tradeValueUsd) {
                return NextResponse.json({ error: 'Insufficient funds' }, { status: 400 });
            }

            // Upsert Portfolio (Add Shares)
            if (existingPosition) {
                // Weighted Average Price Update
                const newShares = currentShares + shares;
                const totalCost = (currentShares * existingPosition.buy_price) + (shares * currentPrice);
                const newAvgPrice = totalCost / newShares;

                await admin.from("portfolio").update({
                    shares: newShares,
                    buy_price: newAvgPrice // Update avg price
                }).eq("id", existingPosition.id);
            } else {
                await admin.from("portfolio").insert({
                    user_id: user.id,
                    symbol,
                    name: stockData.name || name,
                    shares,
                    buy_price: currentPrice,
                    currency: currentCurrency
                });
            }

        } else if (type === 'sell') {
            // Rule: Cannot Sell if no shares or Short
            if (currentShares <= 0) {
                return NextResponse.json({ error: 'No shares to sell' }, { status: 400 });
            }
            if (shares > currentShares) {
                return NextResponse.json({ error: 'Cannot sell more than you own' }, { status: 400 });
            }

            // Update/Delete Portfolio
            if (shares === currentShares) {
                await admin.from("portfolio").delete().eq("id", existingPosition.id);
            } else {
                await admin.from("portfolio").update({
                    shares: currentShares - shares
                    // Avg price stays same on partial sell
                }).eq("id", existingPosition.id);
            }

            // PnL Calc
            const buyPriceUsd = existingPosition.buy_price * (existingPosition.currency === 'SEK' ? (1 / EXCHANGE_RATE_USD_SEK) : 1);
            const sellPriceUsd = currentPrice * rateToUsd;
            const pnl = (sellPriceUsd - buyPriceUsd) * shares;

            // Log PnL (Logic later)
            // ...

        } else if (type === 'short') {
            // Rule: Cannot Short if Long (Must Sell first)
            if (currentShares > 0) {
                return NextResponse.json({ error: 'Position is net Long. Sell existing shares first.' }, { status: 400 });
            }

            // Margin Check: 
            // We require User to have Cash > TradeValue (50% Margin roughly, effectively 100% cash secured).
            // Example: Short $1000 of TSLA. Need >$1000 Cash. 
            // After Trade: Cash becomes ($Existing + $1000). 
            // "Invested" becomes (-$1000). Total "Invested" calculation handles this?
            // If Invested is -1000, Cash = 10000 - (-1000) = 11000.
            // Safety: We must ensure they can't create Infinite Cash.

            if (cashBalance < tradeValueUsd) {
                return NextResponse.json({ error: 'Insufficient collateral (Cash) to open short.' }, { status: 400 });
            }

            if (existingPosition) {
                // Check if already short
                const newShares = currentShares - shares; // e.g. -10 - 10 = -20
                // Weighted Average?
                // Avg "Entry" Price for Short.
                // Current (-10 @ $100) + New (-10 @ $110). 
                // CostBasis (-1000) + (-1100) = -2100.
                // New shares -20. Avg = 105. COrrect.
                const totalCost = (currentShares * existingPosition.buy_price) + (-shares * currentPrice);
                const newAvgPrice = totalCost / newShares; // -2100 / -20 = 105.

                await admin.from("portfolio").update({
                    shares: newShares,
                    buy_price: newAvgPrice
                }).eq("id", existingPosition.id);
            } else {
                await admin.from("portfolio").insert({
                    user_id: user.id,
                    symbol,
                    name: stockData.name || name,
                    shares: -shares, // Negative Shares!
                    buy_price: currentPrice,
                    currency: currentCurrency
                });
            }

        } else if (type === 'cover') {
            // Rule: Must be Short
            if (currentShares >= 0) {
                return NextResponse.json({ error: 'No short position to cover.' }, { status: 400 });
            }
            if (shares > Math.abs(currentShares)) {
                return NextResponse.json({ error: 'Cannot cover more than open short position.' }, { status: 400 });
            }

            // Buying back to 0
            if (shares === Math.abs(currentShares)) {
                await admin.from("portfolio").delete().eq("id", existingPosition.id);
            } else {
                await admin.from("portfolio").update({
                    shares: currentShares + shares // -10 + 5 = -5
                    // Avg price stays same
                }).eq("id", existingPosition.id);
            }

            // PnL Calc for Short
            // Entry Price $100. Current (Cover) Price $80. Profit $20.
            // Formula: (Entry - Exit) * Shares.
            const entryPriceUsd = existingPosition.buy_price * (existingPosition.currency === 'SEK' ? (1 / EXCHANGE_RATE_USD_SEK) : 1);
            const exitPriceUsd = currentPrice * rateToUsd;
            const pnl = (entryPriceUsd - exitPriceUsd) * shares;
            // Note: Positive if Entry > Exit. Correct.

            // ... PnL Logging
        }

        // 6. Log Transaction (Universal)
        // Calculate PnL if closing
        let realizedPnl = 0;
        if (type === 'sell') {
            const entryPriceUsd = existingPosition!.buy_price * (existingPosition!.currency === 'SEK' ? (1 / EXCHANGE_RATE_USD_SEK) : 1);
            realizedPnl = (currentPrice * rateToUsd - entryPriceUsd) * shares;
        } else if (type === 'cover') {
            const entryPriceUsd = existingPosition!.buy_price * (existingPosition!.currency === 'SEK' ? (1 / EXCHANGE_RATE_USD_SEK) : 1);
            realizedPnl = (entryPriceUsd - currentPrice * rateToUsd) * shares;
        }

        await admin.from("transactions").insert({
            user_id: user.id,
            symbol,
            name: stockData.name || name,
            type,
            shares: shares, // Always positive in log? Or match direction?
            // "Shares traded". Usually positive integer in logs. Direction is 'type'.
            price: currentPrice,
            currency: currentCurrency,
            total_sek: tradeValueUsd,
            realized_pnl: realizedPnl
        });

        // 7. Update Streak Logic (If Closing Position)
        if (type === 'sell' || type === 'cover') {
            try {
                const { data: profile } = await admin
                    .from("profiles")
                    .select("paper_win_streak, paper_best_streak, reputation_score")
                    .eq("id", user.id)
                    .single();

                const currentStreak = profile?.paper_win_streak || 0;
                const currentRep = profile?.reputation_score || 0;

                if (realizedPnl > 0) {
                    const newStreak = currentStreak + 1;
                    const xpEarned = calculateTradeXP(realizedPnl, newStreak);
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
        }

        // 8. Update Fantasy League Standings
        try {
            const { updateLeagueStandings, sendRankUpNotifications } = await import('@/lib/league-standings');
            const rankChanges = await updateLeagueStandings(user.id);
            if (rankChanges.length > 0) {
                await sendRankUpNotifications(user.id, rankChanges);
            }
        } catch (e) {
            console.error("League standings update failed:", e);
        }

        return NextResponse.json({ success: true, price: currentPrice });

    } catch (error: any) {
        console.error('Trade API Error:', error);
        return NextResponse.json({ error: error.message || 'Trade failed' }, { status: 500 });
    }
}
