"use client";

import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Flame, MessageCircle } from "lucide-react";
import Link from "next/link";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

interface TrendingTicker {
    ticker_symbol: string;
    post_count: number;
    sentiment_score: number; // -1 to 1, negative = bearish, positive = bullish
}

export function TrendingTickers() {
    const { data: trendingData, isLoading } = useQuery<TrendingTicker[]>({
        queryKey: ["trending-tickers"],
        enabled: isSupabaseConfigured,
        queryFn: async () => {
            if (!supabase) return [];

            // Get posts from last 24 hours grouped by ticker
            const twentyFourHoursAgo = new Date();
            twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

            const { data, error } = await (supabase as any)
                .from("posts")
                .select("ticker_symbol, sentiment")
                .not("ticker_symbol", "is", null)
                .gte("created_at", twentyFourHoursAgo.toISOString());

            if (error || !data) return [];

            // Aggregate by ticker
            const tickerMap = new Map<string, { count: number; bullish: number; bearish: number }>();

            data.forEach((post: any) => {
                if (!post.ticker_symbol) return;

                const existing = tickerMap.get(post.ticker_symbol) || { count: 0, bullish: 0, bearish: 0 };
                existing.count++;
                if (post.sentiment === "bull") existing.bullish++;
                if (post.sentiment === "bear") existing.bearish++;
                tickerMap.set(post.ticker_symbol, existing);
            });

            // Convert to array and sort by count
            const trending = Array.from(tickerMap.entries())
                .map(([ticker, stats]) => ({
                    ticker_symbol: ticker,
                    post_count: stats.count,
                    sentiment_score: stats.count > 0
                        ? (stats.bullish - stats.bearish) / stats.count
                        : 0,
                }))
                .sort((a, b) => b.post_count - a.post_count)
                .slice(0, 5);

            return trending;
        },
        refetchInterval: 60000, // Refresh every minute
    });

    if (isLoading) {
        return (
            <div className="p-5 border-b border-white/10">
                <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Flame className="w-3.5 h-3.5 text-orange-400" />
                    Populärt just nu
                </h3>
                <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-12 bg-white/[0.03] animate-pulse rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    if (!trendingData || trendingData.length === 0) {
        return (
            <div className="p-5 border-b border-white/10">
                <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Flame className="w-3.5 h-3.5 text-orange-400" />
                    Populärt just nu
                </h3>
                <p className="text-xs text-white/30 text-center py-4">
                    Inga aktier diskuteras just nu
                </p>
            </div>
        );
    }

    return (
        <div className="p-5 border-b border-white/10">
            <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                Populärt just nu
            </h3>
            <div className="space-y-2">
                {trendingData.map((item, index) => (
                    <Link
                        key={item.ticker_symbol}
                        href={`/aktie/${item.ticker_symbol}`}
                        className="flex items-center gap-3 p-3 bg-white/[0.04] rounded-xl hover:bg-white/[0.08] transition-all border border-white/[0.08] hover:border-white/[0.12] group"
                    >
                        {/* Rank */}
                        <span className={`text-sm font-black w-5 ${index === 0 ? "text-orange-400" :
                            index === 1 ? "text-white/60" :
                                index === 2 ? "text-amber-600" :
                                    "text-white/30"
                            }`}>
                            {index + 1}
                        </span>

                        {/* Ticker */}
                        <div className="flex-1 min-w-0">
                            <span className="font-bold text-white text-sm group-hover:text-emerald-400 transition-colors">
                                ${item.ticker_symbol}
                            </span>
                        </div>

                        {/* Sentiment indicator */}
                        <div className="flex items-center gap-2">
                            {item.sentiment_score !== 0 && (
                                <TrendingUp
                                    className={`w-3.5 h-3.5 ${item.sentiment_score > 0
                                        ? "text-emerald-400"
                                        : "text-rose-400 rotate-180"
                                        }`}
                                />
                            )}
                            <span className="flex items-center gap-1 text-xs text-white/40">
                                <MessageCircle className="w-3 h-3" />
                                {item.post_count}
                            </span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
