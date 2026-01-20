"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Star, X, TrendingUp, TrendingDown, Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";

export default function BevakningslistaPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!authLoading && !user) {
            router.replace("/logga-in");
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
        <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-black text-white mb-2">Bevakningslista</h1>
                            <p className="text-white/50">
                                {stocks.length} {stocks.length === 1 ? "aktie" : "aktier"} i din lista
                            </p>
                        </div>
                        <Link
                            href="/upptack"
                            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all"
                        >
                            <Plus className="w-4 h-4" />
                            Lägg till aktier
                        </Link>
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
                        </div>
                    ) : stocks.length === 0 ? (
                        <div className="text-center py-20 rounded-3xl bg-white/[0.02] border border-dashed border-white/10">
                            <Star className="w-12 h-12 text-white/20 mx-auto mb-4" />
                            <h2 className="text-xl font-bold text-white mb-2">Din bevakningslista är tom</h2>
                            <p className="text-white/40 mb-2">Go to a stock page and click the ⭐ star</p>
                            <p className="text-white/30 text-sm">eller använd knappen ovan för att hitta aktier.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {stocks.map((stock: any) => (
                                <div
                                    key={stock.symbol}
                                    className="group flex items-center justify-between p-5 bg-white/[0.04] rounded-2xl hover:bg-white/[0.08] transition-all border border-white/[0.08] hover:border-white/[0.12]"
                                >
                                    <Link href={`/aktie/${stock.symbol}`} className="flex items-center gap-4 flex-1">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center border border-emerald-500/20">
                                            <Star className="w-5 h-5 text-emerald-400 fill-emerald-400" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-white text-lg">${stock.symbol.split('.')[0]}</span>
                                                <span className="text-white/40 text-sm">{stock.name}</span>
                                            </div>
                                            <p className="text-sm text-white/50 tabular-nums">
                                                {stock.currencySymbol === 'kr'
                                                    ? `${(stock.price ?? 0).toFixed(2)} kr`
                                                    : `${stock.currencySymbol}${(stock.price ?? 0).toFixed(2)}`}
                                            </p>
                                        </div>
                                    </Link>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <span
                                                className={`flex items-center gap-1 text-lg font-bold tabular-nums ${(stock.changePercent ?? 0) >= 0 ? "text-emerald-400" : "text-rose-400"
                                                    }`}
                                            >
                                                {(stock.changePercent ?? 0) >= 0 ? (
                                                    <TrendingUp className="w-4 h-4" />
                                                ) : (
                                                    <TrendingDown className="w-4 h-4" />
                                                )}
                                                {(stock.changePercent ?? 0) >= 0 ? "+" : ""}
                                                {(stock.changePercent ?? 0).toFixed(2)}%
                                            </span>
                                            <p className="text-xs text-white/30">idag</p>
                                        </div>
                                        <button
                                            onClick={() => toggleWatch.mutate(stock.symbol)}
                                            disabled={toggleWatch.isPending}
                                            className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-rose-500/20 text-white/40 hover:text-rose-400 transition-all border border-white/10"
                                            title="Ta bort från bevakningslista"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
