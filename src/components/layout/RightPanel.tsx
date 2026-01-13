"use client";

import { Plus, Eye, X, Loader2 } from "lucide-react";
import { fetchStockData } from "@/lib/stocks-api";
import { SentimentHeatmap } from "@/components/analysis/SentimentHeatmap";
import { TrendingTickers } from "@/components/discovery/TrendingTickers";
import { UI_STRINGS } from "@/config/app";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";

export function RightPanel() {
    const queryClient = useQueryClient();

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

    // Fetch live watchlist
    const { data: watchlistData, isLoading } = useQuery({
        queryKey: ["watchlist"],
        queryFn: async () => {
            const res = await fetch("/api/watchlist", { credentials: "include" });
            if (!res.ok) return [];
            const data = await res.json();
            return data.stocks || [];
        },
        refetchInterval: 60000, // Still refresh every minute
        staleTime: 0, // Consider stale immediately
        refetchOnMount: 'always', // Refresh when navigating back
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
        <aside className="w-80 h-screen sticky top-0 flex flex-col border-l border-white/10 bg-white/[0.02] backdrop-blur-xl overflow-y-auto scrollbar-hide">
            {/* Market Overview */}
            <div className="p-5 border-b border-white/10">
                <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-4">
                    {UI_STRINGS.marketOverview}
                </h3>
                <div className="space-y-2">
                    {(marketData || []).map((stat: any) => (
                        <div
                            key={stat.label}
                            className="flex items-center justify-between py-3 px-4 bg-white/[0.04] rounded-2xl border border-white/[0.08]"
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
                            <div key={i} className="h-12 bg-white/[0.02] animate-pulse rounded-2xl" />
                        ))
                    )}
                </div>
            </div>

            {/* Trending Tickers */}
            <TrendingTickers />

            {/* Watchlist */}
            <div className="flex-1 p-5">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                        {UI_STRINGS.watchlist}
                    </h3>
                    <Link
                        href="/upptack"
                        className="p-2 rounded-xl hover:bg-white/[0.06] text-white/50 hover:text-white transition-colors"
                        title="Upptäck aktier att bevaka"
                    >
                        <Plus className="w-4 h-4" />
                    </Link>
                </div>

                <div className="space-y-2">
                    {isLoading ? (
                        [1, 2, 3].map((i) => (
                            <div key={i} className="h-20 bg-white/[0.03] animate-pulse rounded-2xl border border-white/5" />
                        ))
                    ) : watchlistData && watchlistData.length > 0 ? (
                        watchlistData.map((item: any) => (
                            <div
                                key={item.symbol}
                                className="group flex items-center justify-between p-4 bg-white/[0.04] rounded-2xl hover:bg-white/[0.08] transition-all border border-white/[0.08] hover:border-white/[0.12]"
                            >
                                <Link href={`/aktie/${item.symbol}`} className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center border border-white/10 flex-shrink-0">
                                        <span className="text-xs font-bold text-white">
                                            {item.symbol.charAt(0)}
                                        </span>
                                    </div>
                                    <div className="min-w-0 overflow-hidden">
                                        <span className="font-semibold text-white text-sm block truncate">
                                            ${item.symbol.split('.')[0]}
                                        </span>
                                        <p className="text-[10px] tabular-nums text-white/50">
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
                        <div className="py-12 text-center rounded-2xl bg-white/[0.02] border border-dashed border-white/10">
                            <p className="text-xs text-white/30 uppercase tracking-widest leading-relaxed px-4">
                                Din bevakningslista är tom. Lägg till aktier för att följa dem live.
                            </p>
                        </div>
                    )}
                </div>

                {/* Quick action - links to full watchlist page */}
                <Link
                    href="/bevakningslista"
                    className="mt-5 w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/[0.04] hover:bg-white/[0.08] rounded-2xl text-sm text-white/60 hover:text-white transition-all border border-white/[0.08] hover:border-white/[0.12]"
                >
                    <Eye className="w-4 h-4" />
                    {UI_STRINGS.viewFullWatchlist}
                </Link>
            </div>
        </aside>
    );
}
