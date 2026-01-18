"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { RightPanel } from "@/components/layout/RightPanel";
import { useAuth } from "@/providers/AuthProvider";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { Gamepad2, TrendingUp, TrendingDown, Loader2, Plus, Trash2, Sparkles, AlertTriangle, Coins } from "lucide-react";
import { motion } from "framer-motion";

const STARTING_CAPITAL = 100000; // 100,000 kr virtual starting capital

interface PortfolioItem {
    id: string;
    symbol: string;
    name: string;
    shares: number;
    buy_price: number;
    currency: string;
    current_price?: number;
    change_percent?: number;
}

export default function PaperTradingPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [totalValue, setTotalValue] = useState(0);
    const [totalPL, setTotalPL] = useState(0);
    const [cashBalance, setCashBalance] = useState(STARTING_CAPITAL);

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!authLoading && !user) {
            router.replace("/logga-in");
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (!user || !isSupabaseConfigured || !supabase) return;

        const fetchPortfolio = async () => {
            setIsLoading(true);

            const { data, error } = await (supabase as any)
                .from("portfolio")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Portfolio fetch error:", error);
                setIsLoading(false);
                return;
            }

            // Fetch current prices for each stock
            const enrichedPortfolio = await Promise.all(
                ((data || []) as PortfolioItem[]).map(async (item: PortfolioItem) => {
                    try {
                        const res = await fetch(`/api/stocks/${item.symbol}`);
                        const stockData = await res.json();
                        return {
                            ...item,
                            current_price: stockData.price || item.buy_price,
                            change_percent: stockData.changePercent || 0,
                        };
                    } catch {
                        return { ...item, current_price: item.buy_price, change_percent: 0 };
                    }
                })
            );

            setPortfolio(enrichedPortfolio);

            // Calculate totals
            let totalInvested = 0;
            let total = 0;
            let pl = 0;
            enrichedPortfolio.forEach((item: PortfolioItem) => {
                const currentValue = item.shares * (item.current_price || item.buy_price);
                const buyValue = item.shares * item.buy_price;
                totalInvested += buyValue;
                total += currentValue;
                pl += currentValue - buyValue;
            });

            setTotalValue(total);
            setTotalPL(pl);
            // Cash = Starting capital - total invested + P&L realized (simplified: just show remaining)
            setCashBalance(STARTING_CAPITAL - totalInvested + pl);
            setIsLoading(false);
        };

        fetchPortfolio();
    }, [user]);

    const handleSell = async (id: string) => {
        if (!supabase) return;

        await supabase.from("portfolio").delete().eq("id", id);
        setPortfolio(prev => prev.filter(item => item.id !== id));
    };

    if (authLoading || isLoading) {
        return (
            <div className="flex min-h-screen">
                <Sidebar />
                <main className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-white/40" />
                </main>
                <RightPanel />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex min-h-screen">
                <Sidebar />
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <Gamepad2 className="w-16 h-16 text-white/20 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-white mb-2">Logga in för att testa paper trading</h2>
                        <Link href="/logga-in" className="text-emerald-400 hover:underline">
                            Logga in →
                        </Link>
                    </div>
                </main>
                <RightPanel />
            </div>
        );
    }

    const totalPortfolioValue = totalValue + cashBalance;
    const overallPL = totalPortfolioValue - STARTING_CAPITAL;
    const overallPLPercent = (overallPL / STARTING_CAPITAL) * 100;

    return (
        <div className="flex min-h-screen">
            <Sidebar />

            <main className="flex-1 border-r border-white/10">
                <header className="sticky top-0 z-10 backdrop-blur-xl bg-[#020617]/80 border-b border-white/10 px-6 py-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-400 to-fuchsia-600 flex items-center justify-center shadow-lg">
                                <Gamepad2 className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h1 className="text-2xl font-black text-white">Paper Trading</h1>
                                    <span className="px-2 py-0.5 rounded-full bg-violet-500/20 border border-violet-500/30 text-[10px] font-bold text-violet-400 uppercase tracking-wider">
                                        Simulering
                                    </span>
                                </div>
                                <p className="text-xs text-white/40">{portfolio.length} virtuella innehav</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Simulation Warning Banner */}
                <div className="mx-6 mt-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-bold text-amber-400">Detta är en simulering</p>
                        <p className="text-xs text-white/50 mt-1">
                            Paper trading använder virtuella pengar. Inga riktiga transaktioner görs.
                            Perfekt för att öva strategi och testa idéer utan risk!
                        </p>
                    </div>
                </div>

                {/* Portfolio Summary */}
                <div className="p-6 border-b border-white/10">
                    <div className="grid grid-cols-3 gap-4">
                        {/* Virtual Cash */}
                        <div className="p-5 rounded-2xl bg-gradient-to-br from-violet-500/10 to-violet-500/5 border border-violet-500/20">
                            <div className="flex items-center gap-2 mb-2">
                                <Coins className="w-4 h-4 text-violet-400" />
                                <p className="text-[10px] text-violet-400/80 uppercase tracking-widest font-bold">Virtuell Kassa</p>
                            </div>
                            <p className="text-2xl font-black text-white tabular-nums">
                                {cashBalance.toLocaleString("sv-SE", { minimumFractionDigits: 0, maximumFractionDigits: 0 })} kr
                            </p>
                            <p className="text-[10px] text-white/30 mt-1">Tillgängligt att investera</p>
                        </div>

                        {/* Portfolio Value */}
                        <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/10">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="w-4 h-4 text-white/40" />
                                <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Portföljvärde</p>
                            </div>
                            <p className="text-2xl font-black text-white tabular-nums">
                                {totalValue.toLocaleString("sv-SE", { minimumFractionDigits: 0, maximumFractionDigits: 0 })} kr
                            </p>
                            <p className="text-[10px] text-white/30 mt-1">Investerat i aktier</p>
                        </div>

                        {/* Total P&L */}
                        <div className={`p-5 rounded-2xl border ${overallPL >= 0 ? "bg-emerald-500/10 border-emerald-500/20" : "bg-rose-500/10 border-rose-500/20"}`}>
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="w-4 h-4 text-white/40" />
                                <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Total Avkastning</p>
                            </div>
                            <div className="flex items-center gap-2">
                                {overallPL >= 0 ? (
                                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                                ) : (
                                    <TrendingDown className="w-5 h-5 text-rose-400" />
                                )}
                                <p className={`text-2xl font-black tabular-nums ${overallPL >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                                    {overallPL >= 0 ? "+" : ""}{overallPL.toLocaleString("sv-SE", { minimumFractionDigits: 0, maximumFractionDigits: 0 })} kr
                                </p>
                            </div>
                            <p className={`text-[10px] mt-1 ${overallPL >= 0 ? "text-emerald-400/60" : "text-rose-400/60"}`}>
                                {overallPL >= 0 ? "+" : ""}{overallPLPercent.toFixed(2)}% sedan start
                            </p>
                        </div>
                    </div>

                    {/* Starting Capital Info */}
                    <div className="mt-4 text-center">
                        <p className="text-[10px] text-white/30">
                            🎮 Startkapital: <span className="text-white/50 font-bold">{STARTING_CAPITAL.toLocaleString("sv-SE")} kr</span> virtuella kronor
                        </p>
                    </div>
                </div>

                {/* Holdings List */}
                <div className="p-6">
                    {portfolio.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center mx-auto mb-4">
                                <Gamepad2 className="w-10 h-10 text-violet-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Inga virtuella innehav</h3>
                            <p className="text-white/40 mb-6 max-w-md mx-auto">
                                Du har {STARTING_CAPITAL.toLocaleString("sv-SE")} kr virtuella kronor att investera.
                                Gå till en aktiesida och klicka &quot;Köp&quot; för att börja testa!
                            </p>
                            <Link
                                href="/upptack"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-xl font-bold transition-transform hover:scale-105"
                            >
                                <Plus className="w-4 h-4" />
                                Upptäck aktier att handla
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Gamepad2 className="w-4 h-4" />
                                Dina virtuella innehav
                            </h3>
                            {portfolio.map((item, index) => {
                                const currentPrice = item.current_price || item.buy_price;
                                const currentValue = item.shares * currentPrice;
                                const buyValue = item.shares * item.buy_price;
                                const pl = currentValue - buyValue;
                                const plPercent = ((pl / buyValue) * 100);
                                const symbol = (item as any).currencySymbol || '$';

                                return (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.06] transition-all group"
                                    >
                                        <Link href={`/aktie/${item.symbol}`} className="flex items-center gap-4 flex-1">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-400 to-fuchsia-600 flex items-center justify-center text-white font-black text-xs">
                                                {item.symbol.split('.')[0].slice(0, 4)}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-bold text-white tracking-tight">${item.symbol}</p>
                                                    <span className="px-1.5 py-0.5 rounded bg-violet-500/20 text-[8px] font-bold text-violet-400 uppercase">
                                                        Paper
                                                    </span>
                                                </div>
                                                <p className="text-[11px] font-medium text-white/40 uppercase tracking-wider">{item.name || item.symbol}</p>
                                            </div>
                                        </Link>

                                        <div className="text-right mr-8">
                                            <p className="text-sm font-bold text-white tabular-nums">{item.shares} st</p>
                                            <p className="text-[10px] text-white/30 font-medium">á {symbol === 'kr' ? `${item.buy_price.toFixed(2)} kr` : `${symbol}${item.buy_price.toFixed(2)}`}</p>
                                        </div>

                                        <div className="text-right mr-6">
                                            <p className="font-black text-white tabular-nums">
                                                {symbol === 'kr' ? `${currentValue.toLocaleString("sv-SE", { minimumFractionDigits: 2 })} kr` : `${symbol}${currentValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
                                            </p>
                                            <div className={`flex items-center justify-end gap-1 text-xs font-black tabular-nums ${pl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                                                {pl >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                                {pl >= 0 ? "+" : ""}{plPercent.toFixed(2)}%
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleSell(item.id)}
                                            className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold opacity-0 group-hover:opacity-100 transition-all border border-rose-500/20 flex items-center gap-1.5"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            Sälj
                                        </button>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>

            <RightPanel />
        </div>
    );
}
