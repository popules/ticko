"use client";

import { useQuery } from "@tanstack/react-query";
import { Flame, MessageCircle, TrendingUp, Eye, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import { motion } from "framer-motion";

interface TrendingStock {
    ticker_symbol: string;
    post_count: number;
    sentiment_score: number;
    latest_comment?: string;
    latest_user?: string;
}

interface WatchlistActivity {
    symbol: string;
    comment_count: number;
    latest_activity?: string;
}

export function WhatIsHappening() {
    const { user } = useAuth();

    // Fetch trending stocks with latest activity
    const { data: trendingData, isLoading: isTrendingLoading } = useQuery<TrendingStock[]>({
        queryKey: ["trending-happening"],
        enabled: isSupabaseConfigured,
        queryFn: async () => {
            if (!supabase) return [];

            const hotTimeWindow = new Date();
            hotTimeWindow.setHours(hotTimeWindow.getHours() - 4); // Last 4 hours for "Hot right now"

            // Get posts with comments from last 24h
            const { data, error } = await (supabase as any)
                .from("posts")
                .select(`
                    ticker_symbol,
                    sentiment,
                    content,
                    profiles (username)
                `)
                .not("ticker_symbol", "is", null)
                .gte("created_at", hotTimeWindow.toISOString())
                .order("created_at", { ascending: false })
                .limit(100);

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

                // Keep the latest comment/user
                if (!existing.latestComment && post.content) {
                    existing.latestComment = post.content.substring(0, 80);
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
                    latest_comment: stats.latestComment,
                    latest_user: stats.latestUser,
                }))
                .sort((a, b) => b.post_count - a.post_count)
                .slice(0, 4);
        },
        refetchInterval: 60000,
    });

    // Fetch watchlist activity (if logged in)
    const { data: watchlistData, isLoading: isWatchlistLoading } = useQuery<WatchlistActivity[]>({
        queryKey: ["watchlist-activity", user?.id],
        enabled: isSupabaseConfigured && !!user,
        queryFn: async () => {
            if (!supabase || !user) return [];

            // Get user's watchlist
            const { data: watchlist } = await (supabase as any)
                .from("watchlists")
                .select("ticker")
                .eq("user_id", user.id)
                .limit(5);

            if (!watchlist || watchlist.length === 0) return [];

            const tickers = watchlist.map((w: any) => w.ticker);

            // Get recent posts for those tickers
            const oneDayAgo = new Date();
            oneDayAgo.setHours(oneDayAgo.getHours() - 24);

            const { data: posts } = await (supabase as any)
                .from("posts")
                .select("ticker_symbol, content")
                .in("ticker_symbol", tickers)
                .gte("created_at", oneDayAgo.toISOString())
                .order("created_at", { ascending: false });

            // Count by ticker
            const activityMap = new Map<string, { count: number; latest?: string }>();

            posts?.forEach((post: any) => {
                const existing = activityMap.get(post.ticker_symbol) || { count: 0 };
                existing.count++;
                if (!existing.latest) existing.latest = post.content?.substring(0, 60);
                activityMap.set(post.ticker_symbol, existing);
            });

            return tickers.map((ticker: string) => ({
                symbol: ticker,
                comment_count: activityMap.get(ticker)?.count || 0,
                latest_activity: activityMap.get(ticker)?.latest,
            }));
        },
        refetchInterval: 60000,
    });

    const isLoading = isTrendingLoading || (user && isWatchlistLoading);
    const hasTrending = trendingData && trendingData.length > 0;
    const hasWatchlist = watchlistData && watchlistData.some(w => w.comment_count > 0);

    // Show component while loading or if there's ANY content to display
    // Always show if loading trending data
    const showTrending = isTrendingLoading || hasTrending;
    const showWatchlist = user && hasWatchlist;

    // Don't show if absolutely nothing to display and not loading
    if (!isTrendingLoading && !hasTrending && !hasWatchlist) {
        // Show a placeholder message instead of returning null
        // This prevents the flash-then-disappear behavior
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 space-y-4"
        >
            {/* Trending Stocks Section - Always show */}
            <div className="relative p-5 rounded-[2rem] border border-white/10 bg-gradient-to-br from-orange-500/5 via-transparent to-rose-500/5 backdrop-blur-xl overflow-hidden group">
                {/* Background glow */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/10 blur-[80px] rounded-full -mr-20 -mt-20" />

                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-orange-500/20 border border-orange-500/20">
                            <Flame className="w-4 h-4 text-orange-400" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-white uppercase tracking-wide">🔥 Hett just nu</h3>
                            <p className="text-[10px] text-white/40">Aktier som diskuteras mest</p>
                        </div>
                    </div>
                    <Link
                        href="/upptack"
                        className="flex items-center gap-1 text-xs text-white/40 hover:text-white transition-colors"
                    >
                        Visa alla <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>

                {/* Trending Grid */}
                {isTrendingLoading ? (
                    <div className="grid grid-cols-2 gap-3">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-20 bg-white/[0.03] animate-pulse rounded-xl" />
                        ))}
                    </div>
                ) : hasTrending ? (
                    <div className="grid grid-cols-2 gap-3">
                        {trendingData?.map((stock, index) => (
                            <Link
                                key={stock.ticker_symbol}
                                href={`/stock/${stock.ticker_symbol}`}
                                className="p-3 bg-white/[0.04] rounded-xl border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/[0.15] transition-all group/card"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs font-bold ${index === 0 ? "text-orange-400" : "text-white/40"
                                            }`}>
                                            #{index + 1}
                                        </span>
                                        <span className="font-bold text-white group-hover/card:text-emerald-400 transition-colors">
                                            ${stock.ticker_symbol}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {stock.sentiment_score !== 0 && (
                                            <TrendingUp className={`w-3 h-3 ${stock.sentiment_score > 0
                                                ? "text-emerald-400"
                                                : "text-rose-400 rotate-180"
                                                }`} />
                                        )}
                                    </div>
                                </div>

                                {/* Latest activity preview */}
                                {stock.latest_comment && (
                                    <p className="text-[11px] text-white/40 leading-snug truncate">
                                        {stock.latest_user && (
                                            <span className="text-white/60">@{stock.latest_user}: </span>
                                        )}
                                        {stock.latest_comment}
                                    </p>
                                )}

                                <div className="flex items-center gap-1 mt-2 text-[10px] text-white/30">
                                    <MessageCircle className="w-3 h-3" />
                                    {stock.post_count} posts
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    /* Empty state when no trending stocks */
                    <div className="py-6 text-center">
                        <p className="text-white/40 text-sm">No trending stocks right now</p>
                        <p className="text-white/20 text-xs mt-1">Start discussing to appear here!</p>
                    </div>
                )}
            </div>

            {/* Watchlist Activity Section */}
            {user && hasWatchlist && (
                <div className="relative p-5 rounded-[2rem] border border-white/10 bg-gradient-to-br from-emerald-500/5 via-transparent to-blue-500/5 backdrop-blur-xl overflow-hidden">
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 blur-[60px] rounded-full -ml-16 -mb-16" />

                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/20">
                                <Eye className="w-4 h-4 text-emerald-400" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-white uppercase tracking-wide">👀 Din watchlist</h3>
                                <p className="text-[10px] text-white/40">Aktivitet på aktier du bevakar</p>
                            </div>
                        </div>
                        <Link
                            href="/bevakningslista"
                            className="flex items-center gap-1 text-xs text-white/40 hover:text-white transition-colors"
                        >
                            Se alla <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>

                    <div className="space-y-2">
                        {watchlistData?.filter(w => w.comment_count > 0).slice(0, 3).map((item) => (
                            <Link
                                key={item.symbol}
                                href={`/stock/${item.symbol}`}
                                className="flex items-center justify-between p-3 bg-white/[0.04] rounded-xl border border-white/[0.08] hover:bg-white/[0.08] transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="font-bold text-white">${item.symbol}</span>
                                    {item.latest_activity && (
                                        <span className="text-xs text-white/30 truncate max-w-[200px]">
                                            "{item.latest_activity}..."
                                        </span>
                                    )}
                                </div>
                                <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                                    <MessageCircle className="w-3 h-3" />
                                    +{item.comment_count} new
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </motion.div>
    );
}
