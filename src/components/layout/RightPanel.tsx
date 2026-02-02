"use client";

import { Plus, Eye, X, Loader2 } from "lucide-react";
import { fetchStockData } from "@/lib/stocks-api";
import { SentimentHeatmap } from "@/components/analysis/SentimentHeatmap";
import { TrendingTickers } from "@/components/discovery/TrendingTickers";
import { SuggestedUsers } from "@/components/discovery/SuggestedUsers";
import { ChallengesWidget } from "@/components/dashboard/ChallengesWidget";
import { UI_STRINGS } from "@/config/app";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";

export function RightPanel() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    // Fetch live market indices
    const { data: marketData } = useQuery({
        queryKey: ["marketIndices"],
        queryFn: async () => {
            const res = await fetch("/api/market/indices");
            const data = await res.json();
            return data.indices || [];
        },
        refetchInterval: 60000, // Refresh every minute
    });

    // Fetch live watchlist - ONLY when user is logged in
    // This prevents empty responses from auth glitches replacing cached data
    const { data: watchlistData, isLoading } = useQuery({
        queryKey: ["watchlist", user?.id],  // Cache per user
        queryFn: async () => {
            if (!user) {
                // Don't fetch if no user - this should never happen due to enabled check
                throw new Error("No user");
            }
            const res = await fetch("/api/watchlist", { credentials: "include" });
            if (!res.ok) {
                throw new Error(`Watchlist fetch failed: ${res.status}`);
            }
            const data = await res.json();
            if (!data.stocks) {
                throw new Error("Invalid watchlist response");
            }
            return data.stocks || [];
        },
        enabled: !!user, // Only fetch when user is logged in!
        refetchInterval: user ? 60000 : false, // Only refetch if logged in
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    });

    const toggleWatch = useMutation({
        mutationFn: async (symbol: string) => {
            const res = await fetch("/api/watchlist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ticker: symbol }),
                credentials: "include",
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["watchlist"] });
        },
    });

    return (
        <aside className="hidden lg:flex w-80 h-screen sticky top-0 flex-col border-l border-white/10 bg-white/[0.02] backdrop-blur-xl">
            <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-4">
                {/* Daily Challenges */}
                <div>
                    <ChallengesWidget />
                </div>

                {/* Market Overview */}
                <div className="pb-4 border-b border-white/10">
                    <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">
                        {UI_STRINGS.marketOverview}
                    </h3>
                    <div className="space-y-2">
                        {(marketData || []).map((stat: any) => (
                            <div
                                key={stat.label}
                                className="flex items-center justify-between py-2.5 px-3 bg-white/[0.04] rounded-xl border border-white/[0.08]"
                            >
                                <span className="text-sm font-semibold text-white/80">{stat.label}</span>
                                <div className="text-right">
                                    <span className="text-sm font-bold tabular-nums text-white">
                                        {stat.value}
                                    </span>
                                    <span
                                        className={`text-xs font-bold tabular-nums ml-2 ${stat.change >= 0 ? "text-emerald-400" : "text-rose-400"
                                            }`}
                                    >
                                        {stat.change >= 0 ? "+" : ""}
                                        {stat.change.toFixed(2)}%
                                    </span>
                                </div>
                            </div>
                        ))}
                        {!marketData && (
                            [1, 2, 3].map(i => (
                                <div key={i} className="h-11 bg-white/[0.02] animate-pulse rounded-xl" />
                            ))
                        )}
                    </div>
                </div>

                {/* Suggested Users */}
                <SuggestedUsers />

                {/* Trending Tickers */}
                <TrendingTickers />

                {/* Watchlist */}
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                            {UI_STRINGS.watchlist}
                        </h3>
                        <Link
                            href="/discover"
                            className="p-2 rounded-xl hover:bg-white/[0.06] text-white/50 hover:text-white transition-colors"
                            title="Discover stocks to watch"
                        >
                            <Plus className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="space-y-2">
                        {isLoading ? (
                            [1, 2, 3].map((i) => (
                                <div key={i} className="h-16 bg-white/[0.03] animate-pulse rounded-xl border border-white/5" />
                            ))
                        ) : watchlistData && watchlistData.length > 0 ? (
                            watchlistData.map((item: any) => (
                                <div
                                    key={item.symbol}
                                    className="group flex items-center justify-between p-3 bg-white/[0.04] rounded-xl hover:bg-white/[0.08] transition-all border border-white/[0.08] hover:border-white/[0.12]"
                                >
                                    <Link href={`/stock/${item.symbol}`} className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center border border-white/10 flex-shrink-0">
                                            <span className="text-xs font-bold text-white">
                                                {item.symbol.charAt(0)}
                                            </span>
                                        </div>
                                        <div className="min-w-0 overflow-hidden">
                                            <span className="font-semibold text-white text-sm block truncate">
                                                ${item.symbol.split('.')[0]}
                                            </span>
                                            <p className="text-xs tabular-nums text-white/50">
                                                {item.currencySymbol === 'kr' ? `${(item.price ?? 0).toFixed(2)} kr` : `${item.currencySymbol}${(item.price ?? 0).toFixed(2)}`}
                                            </p>
                                        </div>
                                    </Link>
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`text-sm font-medium tabular-nums ${item.changePercent >= 0 ? "text-emerald-400" : "text-rose-400"
                                                }`}
                                        >
                                            {item.changePercent >= 0 ? "+" : ""}
                                            {(item.changePercent ?? 0).toFixed(2)}%
                                        </span>
                                        <button
                                            onClick={() => toggleWatch.mutate(item.symbol)}
                                            className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-white/10 text-white/50 transition-all"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-10 text-center rounded-xl bg-white/[0.02] border border-dashed border-white/10">
                                <p className="text-xs text-white/30 uppercase tracking-widest leading-relaxed px-4">
                                    Your watchlist is empty
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Quick action - links to full watchlist page */}
                    <Link
                        href="/watchlist"
                        className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/[0.04] hover:bg-white/[0.08] rounded-xl text-sm text-white/60 hover:text-white transition-all border border-white/[0.08] hover:border-white/[0.12]"
                    >
                        <Eye className="w-4 h-4" />
                        {UI_STRINGS.viewFullWatchlist}
                    </Link>
                </div>
            </div>
        </aside>
    );
}
