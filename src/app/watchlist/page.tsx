"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Star, X, TrendingUp, TrendingDown, Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";

export default function WatchlistPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!authLoading && !user) {
            router.replace("/login");
        }
    }, [user, authLoading, router]);

    const { data: watchlistData, isLoading, refetch } = useQuery({
        queryKey: ["watchlist"],
        queryFn: async () => {
            console.log('[Bevakningslista] Fetching watchlist...');
            const res = await fetch("/api/watchlist", { credentials: "include" });
            if (!res.ok) {
                console.log('[Bevakningslista] API returned not ok:', res.status);
                return { stocks: [], symbols: [] };
            }
            const data = await res.json();
            console.log('[Bevakningslista] Got watchlist data:', data);
            return data;
        },
        staleTime: 0, // Always consider data stale
        refetchOnMount: 'always', // Always refetch when component mounts
    });

    // Force refetch on mount
    useEffect(() => {
        console.log('[Bevakningslista] Component mounted, refetching...');
        refetch();
    }, [refetch]);

    // Debug log current state
    useEffect(() => {
        console.log('[Bevakningslista] Current watchlistData:', watchlistData);
        console.log('[Bevakningslista] stocks array:', watchlistData?.stocks);
    }, [watchlistData]);

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

    const stocks = watchlistData?.stocks || [];

    return (
        <AppLayout showRightPanel={true}>
            <div className="flex-1 min-w-0 p-4 md:p-8 pb-24 md:pb-8">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-black text-white mb-2">Watchlist</h1>
                            <p className="text-white/50">
                                {stocks.length} {stocks.length === 1 ? "stock" : "stocks"} in your list
                            </p>
                        </div>
                        <Link
                            href="/discover"
                            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all"
                        >
                            <Plus className="w-4 h-4" />
                            Add stocks
                        </Link>
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
                        </div>
                    ) : stocks.length === 0 ? (
                        <div className="text-center py-20 rounded-3xl bg-white/[0.02] border border-dashed border-white/10">
                            <Star className="w-12 h-12 text-white/20 mx-auto mb-4" />
                            <h2 className="text-xl font-bold text-white mb-2">Your watchlist is empty</h2>
                            <p className="text-white/40 mb-2">Go to a stock page and click the ⭐ star</p>
                            <p className="text-white/30 text-sm">or use the button above to find stocks.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {stocks.map((stock: any) => (
                                <div className="group flex items-center justify-between p-3 sm:p-5 bg-white/[0.04] rounded-2xl hover:bg-white/[0.08] transition-all border border-white/[0.08] hover:border-white/[0.12]">
                                    <Link href={`/stock/${stock.symbol}`} className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center border border-emerald-500/20 shrink-0">
                                            <Star className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 fill-emerald-400" />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-white text-base sm:text-lg truncate">${stock.symbol.split('.')[0]}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-white/40 text-xs sm:text-sm truncate max-w-[80px] sm:max-w-none">{stock.name}</span>
                                                <p className="text-xs sm:text-sm text-white/50 tabular-nums">
                                                    {stock.currencySymbol === 'kr'
                                                        ? `${(stock.price ?? 0).toFixed(2)} kr`
                                                        : `${stock.currencySymbol}${(stock.price ?? 0).toFixed(2)}`}
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                    <div className="flex items-center gap-2 sm:gap-4 pl-2">
                                        <div className="text-right">
                                            <span
                                                className={`flex items-center justify-end gap-1 text-sm sm:text-lg font-bold tabular-nums ${(stock.changePercent ?? 0) >= 0 ? "text-emerald-400" : "text-rose-400"
                                                    }`}
                                            >
                                                {(stock.changePercent ?? 0) >= 0 ? (
                                                    <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                                                ) : (
                                                    <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4" />
                                                )}
                                                <span className="hidden sm:inline">{(stock.changePercent ?? 0) >= 0 ? "+" : ""}</span>
                                                {(stock.changePercent ?? 0).toFixed(2)}%
                                            </span>
                                            <p className="text-[10px] sm:text-xs text-white/30">today</p>
                                        </div>
                                        <button
                                            onClick={() => toggleWatch.mutate(stock.symbol)}
                                            disabled={toggleWatch.isPending}
                                            className="p-2 sm:p-2.5 rounded-xl bg-white/[0.04] hover:bg-rose-500/20 text-white/40 hover:text-rose-400 transition-all border border-white/10 flex items-center justify-center shrink-0"
                                            title="Remove from watchlist"
                                        >
                                            <X className="w-3 h-3 sm:w-4 sm:h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
