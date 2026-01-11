"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { RightPanel } from "@/components/layout/RightPanel";
import { useAuth } from "@/providers/AuthProvider";
import { Loader2, Star, TrendingUp, TrendingDown, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function WatchlistPage() {
    const { user, isLoading: authLoading } = useAuth();
    const [stocks, setStocks] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchWatchlist = async () => {
        try {
            const res = await fetch("/api/watchlist");
            const data = await res.json();
            setStocks(data.stocks || []);
        } catch (error) {
            console.error("Failed to fetch watchlist:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchWatchlist();
        } else if (!authLoading) {
            setIsLoading(false);
        }
    }, [user, authLoading]);

    const removeFromWatchlist = async (ticker: string) => {
        // Optimistic update
        setStocks(prev => prev.filter(s => s.symbol !== ticker));
        try {
            await fetch("/api/watchlist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ticker }),
            });
        } catch (error) {
            console.error("Failed to remove from watchlist:", error);
            fetchWatchlist(); // Revert on error
        }
    };

    if (authLoading || isLoading) {
        return (
            <div className="flex min-h-screen bg-[#020617]">
                <Sidebar />
                <main className="flex-1 flex items-center justify-center border-x border-white/5">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                </main>
                <RightPanel />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex min-h-screen bg-[#020617]">
                <Sidebar />
                <main className="flex-1 flex flex-col items-center justify-center p-6 text-center border-x border-white/5">
                    <Star className="w-12 h-12 text-white/10 mb-6" />
                    <h1 className="text-xl font-extrabold text-white mb-2">Bevakningslista</h1>
                    <p className="text-white/50 mb-8 max-w-sm">
                        Logga in för att spara och bevaka dina favoritaktier.
                    </p>
                    <Link href="/logga-in" className="px-8 py-3 bg-emerald-500 text-[#020617] font-bold rounded-xl hover:bg-emerald-400 transition-colors">
                        Logga in
                    </Link>
                </main>
                <RightPanel />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-[#020617]">
            <Sidebar />

            <main className="flex-1 border-x border-white/5">
                <div className="p-8 border-b border-white/5">
                    <h1 className="text-2xl font-extrabold text-white tracking-tight">Bevakningslista</h1>
                    <p className="text-[13px] text-white/40 font-medium mt-1">Håll koll på dina favoriter</p>
                </div>

                <div className="p-8">
                    {stocks.length > 0 ? (
                        <div className="grid gap-4">
                            <AnimatePresence mode="popLayout">
                                {stocks.map((stock) => (
                                    <motion.div
                                        key={stock.symbol}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="group relative p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all hover:bg-white/[0.04]"
                                    >
                                        <Link href={`/aktie/${stock.symbol}`} className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stock.change >= 0 ? 'bg-emerald-500/10' : 'bg-rose-500/10'
                                                    }`}>
                                                    {stock.change >= 0 ? (
                                                        <TrendingUp className="w-6 h-6 text-emerald-500" />
                                                    ) : (
                                                        <TrendingDown className="w-6 h-6 text-rose-500" />
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="text-base font-bold text-white">{stock.symbol}</h3>
                                                    <p className="text-xs text-white/40 font-medium">{stock.name || 'Aktie'}</p>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <p className="text-base font-bold text-white tabular-nums">
                                                    {stock.price.toFixed(2)} {stock.currency}
                                                </p>
                                                <p className={`text-xs font-bold tabular-nums flex items-center justify-end gap-1 ${stock.change >= 0 ? 'text-emerald-400' : 'text-rose-400'
                                                    }`}>
                                                    {stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                                                </p>
                                            </div>
                                        </Link>

                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                removeFromWatchlist(stock.symbol);
                                            }}
                                            className="absolute md:opacity-0 md:group-hover:opacity-100 right-4 top-1/2 -translate-y-1/2 p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-lg transition-all"
                                            title="Ta bort"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="text-center py-20 rounded-[3rem] bg-white/[0.02] border border-white/5 border-dashed">
                            <Star className="w-12 h-12 text-white/10 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-white mb-2">Din lista är tom</h3>
                            <p className="text-white/40 mb-6 max-w-sm mx-auto">
                                Sök upp aktier du är intresserad av och klicka på stjärnan för att lägga till dem här.
                            </p>
                            <Link href="/marknad" className="px-6 py-3 bg-white/[0.06] hover:bg-white/10 text-white rounded-xl font-bold transition-all">
                                Gå till Marknaden
                            </Link>
                        </div>
                    )}
                </div>
            </main>

            <RightPanel />
        </div>
    );
}
