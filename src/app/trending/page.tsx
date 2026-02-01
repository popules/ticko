"use client";

import { useQuery } from "@tanstack/react-query";
import { Flame, MessageCircle, TrendingUp, TrendingDown, Loader2, Clock } from "lucide-react";
import Link from "next/link";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { Sidebar } from "@/components/layout/Sidebar";
import { RightPanel } from "@/components/layout/RightPanel";
import { motion } from "framer-motion";
import { useState } from "react";

interface TrendingStock {
    ticker_symbol: string;
    post_count: number;
    sentiment_score: number;
    bullish_count: number;
    bearish_count: number;
    latest_comment?: string;
    latest_user?: string;
}

type TimeRange = "4h" | "24h" | "7d";

export default function TrendingPage() {
    const [timeRange, setTimeRange] = useState<TimeRange>("24h");

    const { data: trendingData, isLoading } = useQuery<TrendingStock[]>({
        queryKey: ["trending-full", timeRange],
        enabled: isSupabaseConfigured,
        queryFn: async () => {
            if (!supabase) return [];

            const timeWindow = new Date();
            if (timeRange === "4h") {
                timeWindow.setHours(timeWindow.getHours() - 4);
            } else if (timeRange === "24h") {
                timeWindow.setHours(timeWindow.getHours() - 24);
            } else {
                timeWindow.setDate(timeWindow.getDate() - 7);
            }

            const { data, error } = await (supabase as any)
                .from("posts")
                .select(`
                    ticker_symbol,
                    sentiment,
                    content,
                    profiles (username)
                `)
                .not("ticker_symbol", "is", null)
                .gte("created_at", timeWindow.toISOString())
                .order("created_at", { ascending: false })
                .limit(500);

            if (error || !data) return [];

            // Aggregate by ticker
            const tickerMap = new Map<string, {
                count: number;
                bullish: number;
                bearish: number;
                latestComment?: string;
                latestUser?: string;
            }>();

            data.forEach((post: any) => {
                if (!post.ticker_symbol) return;

                const existing = tickerMap.get(post.ticker_symbol) || {
                    count: 0,
                    bullish: 0,
                    bearish: 0
                };

                existing.count++;
                if (post.sentiment === "bull") existing.bullish++;
                if (post.sentiment === "bear") existing.bearish++;

                if (!existing.latestComment && post.content) {
                    existing.latestComment = post.content.substring(0, 100);
                    existing.latestUser = post.profiles?.username;
                }

                tickerMap.set(post.ticker_symbol, existing);
            });

            return Array.from(tickerMap.entries())
                .map(([ticker, stats]) => ({
                    ticker_symbol: ticker,
                    post_count: stats.count,
                    sentiment_score: stats.count > 0
                        ? (stats.bullish - stats.bearish) / stats.count
                        : 0,
                    bullish_count: stats.bullish,
                    bearish_count: stats.bearish,
                    latest_comment: stats.latestComment,
                    latest_user: stats.latestUser,
                }))
                .sort((a, b) => b.post_count - a.post_count)
                .slice(0, 50);
        },
        refetchInterval: 60000,
    });

    const timeRangeLabels: Record<TimeRange, string> = {
        "4h": "Last 4 hours",
        "24h": "Last 24 hours",
        "7d": "Last 7 days"
    };

    return (
        <div className="flex flex-col lg:flex-row min-h-screen w-full overflow-x-hidden">
            <div className="shrink-0 lg:h-screen lg:sticky lg:top-0">
                <Sidebar />
            </div>

            <main className="flex-1 min-w-0 border-r border-white/10 pb-24 md:pb-0">
                {/* Header */}
                <header className="sticky top-0 z-10 backdrop-blur-xl bg-[#020617]/80 border-b border-white/10 px-4 sm:px-6 py-4 sm:py-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-rose-600 flex items-center justify-center shadow-lg">
                                <Flame className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl sm:text-2xl font-black text-white">Trending</h1>
                                <p className="text-xs text-white/40">Most discussed stocks</p>
                            </div>
                        </div>

                        {/* Time Range Selector */}
                        <div className="flex items-center gap-1 p-1 bg-white/[0.04] rounded-xl border border-white/10">
                            {(["4h", "24h", "7d"] as TimeRange[]).map((range) => (
                                <button
                                    key={range}
                                    onClick={() => setTimeRange(range)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                        timeRange === range
                                            ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                                            : "text-white/50 hover:text-white"
                                    }`}
                                >
                                    {range}
                                </button>
                            ))}
                        </div>
                    </div>
                </header>

                {/* Time indicator */}
                <div className="px-4 sm:px-6 py-3 border-b border-white/5">
                    <div className="flex items-center gap-2 text-xs text-white/40">
                        <Clock className="w-3 h-3" />
                        {timeRangeLabels[timeRange]}
                    </div>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-6">
                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-white/40" />
                        </div>
                    ) : !trendingData || trendingData.length === 0 ? (
                        <div className="text-center py-12">
                            <Flame className="w-12 h-12 text-white/20 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-white mb-2">No trending stocks</h3>
                            <p className="text-white/40 text-sm">No one has posted about stocks in this time period.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {trendingData.map((stock, index) => (
                                <motion.div
                                    key={stock.ticker_symbol}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                >
                                    <Link
                                        href={`/stock/${stock.ticker_symbol}`}
                                        className="flex items-center gap-4 p-4 bg-white/[0.04] rounded-2xl border border-white/10 hover:bg-white/[0.06] hover:border-white/20 transition-all group"
                                    >
                                        {/* Rank */}
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${
                                            index === 0 ? "bg-orange-500/20 text-orange-400 border border-orange-500/30" :
                                            index === 1 ? "bg-white/10 text-white/60 border border-white/20" :
                                            index === 2 ? "bg-amber-500/10 text-amber-500/60 border border-amber-500/20" :
                                            "bg-white/[0.04] text-white/30 border border-white/10"
                                        }`}>
                                            {index + 1}
                                        </div>

                                        {/* Stock Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-black text-white text-lg group-hover:text-emerald-400 transition-colors">
                                                    ${stock.ticker_symbol}
                                                </span>
                                                {stock.sentiment_score !== 0 && (
                                                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                        stock.sentiment_score > 0 
                                                            ? "bg-emerald-500/20 text-emerald-400" 
                                                            : "bg-rose-500/20 text-rose-400"
                                                    }`}>
                                                        {stock.sentiment_score > 0 ? (
                                                            <TrendingUp className="w-3 h-3" />
                                                        ) : (
                                                            <TrendingDown className="w-3 h-3" />
                                                        )}
                                                        {stock.sentiment_score > 0 ? "Bullish" : "Bearish"}
                                                    </div>
                                                )}
                                            </div>
                                            {stock.latest_comment && (
                                                <p className="text-xs text-white/40 truncate">
                                                    {stock.latest_user && (
                                                        <span className="text-white/60">@{stock.latest_user}: </span>
                                                    )}
                                                    {stock.latest_comment}
                                                </p>
                                            )}
                                        </div>

                                        {/* Stats */}
                                        <div className="text-right shrink-0">
                                            <div className="flex items-center gap-1 text-white/60 mb-1">
                                                <MessageCircle className="w-4 h-4" />
                                                <span className="font-bold">{stock.post_count}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px]">
                                                <span className="text-emerald-400">{stock.bullish_count} bull</span>
                                                <span className="text-white/20">•</span>
                                                <span className="text-rose-400">{stock.bearish_count} bear</span>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <RightPanel />
        </div>
    );
}
