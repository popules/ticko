"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/layout/Sidebar";
import { RightPanel } from "@/components/layout/RightPanel";
import { useAuth } from "@/providers/AuthProvider";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { Wallet, TrendingUp, TrendingDown, Loader2, Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

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

export default function PortfolioPage() {
    const { user, isLoading: authLoading } = useAuth();
    const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [totalValue, setTotalValue] = useState(0);
    const [totalPL, setTotalPL] = useState(0);

    useEffect(() => {
        if (!user || !isSupabaseConfigured || !supabase) return;

        const fetchPortfolio = async () => {
            setIsLoading(true);

            const { data, error } = await supabase
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
            let total = 0;
            let pl = 0;
            enrichedPortfolio.forEach((item: PortfolioItem) => {
                const currentValue = item.shares * (item.current_price || item.buy_price);
                const buyValue = item.shares * item.buy_price;
                total += currentValue;
                pl += currentValue - buyValue;
            });

            setTotalValue(total);
            setTotalPL(pl);
            setIsLoading(false);
        };

        fetchPortfolio();
    }, [user]);

    const handleDelete = async (id: string) => {
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
                        <Wallet className="w-16 h-16 text-white/20 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-white mb-2">Logga in för att se din portfölj</h2>
                        <Link href="/logga-in" className="text-emerald-400 hover:underline">
                            Logga in →
                        </Link>
                    </div>
                </main>
                <RightPanel />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen">
            <Sidebar />

            <main className="flex-1 border-r border-white/10">
                <header className="sticky top-0 z-10 backdrop-blur-xl bg-[#020617]/80 border-b border-white/10 px-6 py-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg">
                                <Wallet className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-white">Min Portfölj</h1>
                                <p className="text-xs text-white/40">{portfolio.length} innehav</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Portfolio Summary */}
                <div className="p-6 border-b border-white/10">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-6 rounded-2xl bg-white/[0.04] border border-white/10">
                            <p className="text-xs text-white/40 uppercase tracking-widest mb-2">Totalt Värde</p>
                            <p className="text-3xl font-black text-white tabular-nums">
                                ${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                        </div>
                        <div className={`p-6 rounded-2xl border ${totalPL >= 0 ? "bg-emerald-500/10 border-emerald-500/20" : "bg-rose-500/10 border-rose-500/20"}`}>
                            <p className="text-xs text-white/40 uppercase tracking-widest mb-2">Total Vinst/Förlust</p>
                            <div className="flex items-center gap-2">
                                {totalPL >= 0 ? (
                                    <TrendingUp className="w-6 h-6 text-emerald-400" />
                                ) : (
                                    <TrendingDown className="w-6 h-6 text-rose-400" />
                                )}
                                <p className={`text-3xl font-black tabular-nums ${totalPL >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                                    {totalPL >= 0 ? "+" : ""}{totalPL.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Holdings List */}
                <div className="p-6">
                    {portfolio.length === 0 ? (
                        <div className="text-center py-16">
                            <Wallet className="w-16 h-16 text-white/10 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">Inga innehav än</h3>
                            <p className="text-white/40 mb-6">Börja bygga din portfölj genom att köpa aktier</p>
                            <Link
                                href="/upptack"
                                className="inline-flex items-center gap-2 px-6 py-3 btn-gradient text-white rounded-xl font-bold"
                            >
                                <Plus className="w-4 h-4" />
                                Upptäck Aktier
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {portfolio.map((item, index) => {
                                const currentValue = item.shares * (item.current_price || item.buy_price);
                                const buyValue = item.shares * item.buy_price;
                                const pl = currentValue - buyValue;
                                const plPercent = ((pl / buyValue) * 100);

                                return (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.06] transition-all group"
                                    >
                                        <Link href={`/aktie/${item.symbol}`} className="flex items-center gap-4 flex-1">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center text-white font-bold">
                                                {item.symbol.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-white">${item.symbol}</p>
                                                <p className="text-sm text-white/40">{item.name || item.symbol}</p>
                                            </div>
                                        </Link>

                                        <div className="text-right mr-4">
                                            <p className="text-sm text-white/40">{item.shares} aktier</p>
                                            <p className="text-xs text-white/30">@ ${item.buy_price.toFixed(2)}</p>
                                        </div>

                                        <div className="text-right mr-4">
                                            <p className="font-bold text-white tabular-nums">
                                                ${currentValue.toFixed(2)}
                                            </p>
                                            <p className={`text-sm tabular-nums ${pl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                                                {pl >= 0 ? "+" : ""}{plPercent.toFixed(2)}%
                                            </p>
                                        </div>

                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="p-2 rounded-lg bg-white/[0.04] hover:bg-rose-500/20 text-white/20 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
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
