"use client";

import { useEffect, useState } from "react";
import { Gamepad2, TrendingUp, TrendingDown } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";

interface PaperTradingStatsProps {
    userId: string;
    compact?: boolean;
}

const STARTING_CAPITAL = 10000; // $10,000 USD

export function PaperTradingStats({ userId, compact = false }: PaperTradingStatsProps) {
    const [stats, setStats] = useState<{
        totalValue: number;
        totalPL: number;
        plPercent: number;
        holdingsCount: number;
    } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            if (!supabase) return;

            try {
                const { data: holdings } = await (supabase as any)
                    .from("portfolio")
                    .select("*")
                    .eq("user_id", userId);

                if (!holdings || holdings.length === 0) {
                    setStats(null);
                    setIsLoading(false);
                    return;
                }

                // Fetch current prices
                let totalInvested = 0;
                let totalValue = 0;

                await Promise.all(
                    holdings.map(async (item: any) => {
                        try {
                            const res = await fetch(`/api/stocks/${item.symbol}`);
                            const stockData = await res.json();
                            const currentPrice = stockData.price || item.buy_price;
                            totalValue += item.shares * currentPrice;
                            totalInvested += item.shares * item.buy_price;
                        } catch {
                            totalValue += item.shares * item.buy_price;
                            totalInvested += item.shares * item.buy_price;
                        }
                    })
                );

                const pl = totalValue - totalInvested;
                const plPercent = totalInvested > 0 ? (pl / totalInvested) * 100 : 0;

                setStats({
                    totalValue,
                    totalPL: pl,
                    plPercent,
                    holdingsCount: holdings.length,
                });
            } catch (error) {
                console.error("Paper trading stats error:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, [userId]);

    if (isLoading) {
        return (
            <div className="p-4 rounded-xl bg-violet-500/5 border border-violet-500/10 animate-pulse">
                <div className="h-4 bg-white/10 rounded w-24" />
            </div>
        );
    }

    if (!stats) {
        return null; // Don't show section if user has no paper trades
    }

    if (compact) {
        // Compact inline version for profile cards
        return (
            <div className="flex items-center gap-2 text-xs">
                <Gamepad2 className="w-3 h-3 text-violet-400" />
                <span className={`font-bold tabular-nums ${stats.totalPL >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {stats.totalPL >= 0 ? "+" : ""}{stats.plPercent.toFixed(1)}%
                </span>
                <span className="text-white/30">arena</span>
            </div>
        );
    }

    return (
        <div className="p-5 rounded-2xl bg-gradient-to-br from-violet-500/10 to-fuchsia-500/5 border border-violet-500/20">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Gamepad2 className="w-4 h-4 text-violet-400" />
                    <h4 className="text-xs font-bold text-violet-400 uppercase tracking-widest">The Arena</h4>
                </div>
                <span className="text-[8px] px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-400 font-bold uppercase">
                    Simulation
                </span>
            </div>

            <div className="space-y-3">
                {/* P&L */}
                <div className="flex items-center justify-between">
                    <span className="text-xs text-white/50">Return</span>
                    <div className="flex items-center gap-1.5">
                        {stats.totalPL >= 0 ? (
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                            <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                        )}
                        <span className={`text-sm font-bold tabular-nums ${stats.totalPL >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                            {stats.totalPL >= 0 ? "+" : ""}{stats.plPercent.toFixed(2)}%
                        </span>
                    </div>
                </div>

                {/* Portfolio Value */}
                <div className="flex items-center justify-between">
                    <span className="text-xs text-white/50">Portfolio Value</span>
                    <span className="text-sm font-bold text-white tabular-nums">
                        ${stats.totalValue.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </span>
                </div>

                {/* Holdings Count */}
                <div className="flex items-center justify-between">
                    <span className="text-xs text-white/50">Holdings</span>
                    <span className="text-sm font-bold text-white">{stats.holdingsCount} pos</span>
                </div>
            </div>

            <Link
                href="/arena"
                className="mt-4 block text-center text-xs text-violet-400/70 hover:text-violet-400 transition-colors"
            >
                See leaderboard →
            </Link>
        </div>
    );
}
