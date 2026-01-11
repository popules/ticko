"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { RightPanel } from "@/components/layout/RightPanel";
import { DiscoveryCard } from "@/components/discovery/DiscoveryCard";
import type { StockData } from "@/lib/stocks-api";
import { Loader2, RefreshCw, Info, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DiscoveryPage() {
    const [stocks, setStocks] = useState<StockData[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const loadDiscovery = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/discovery");
            const data = await res.json();
            setStocks(data.stocks || []);
        } catch (error) {
            console.error("Failed to load discovery:", error);
            setStocks([]);
        }
        setCurrentIndex(0);
        setIsLoading(false);
    };

    useEffect(() => {
        loadDiscovery();
    }, []);

    const [toast, setToast] = useState<string | null>(null);

    const handleSwipe = async (direction: "left" | "right") => {
        const currentStock = stocks[currentIndex];

        if (direction === "right" && currentStock) {
            setToast(`Bevakar ${currentStock.symbol}`);
            setTimeout(() => setToast(null), 2000);

            try {
                await fetch("/api/watchlist", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ticker: currentStock.symbol }),
                });
            } catch (error) {
                console.error("Failed to add to watchlist on swipe:", error);
            }
        }

        if (currentIndex < stocks.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            setCurrentIndex(stocks.length);
        }
    };

    return (
        <div className="flex min-h-screen">
            <Sidebar />

            <main className="flex-1 border-r border-white/10 relative flex flex-col items-center justify-center p-6 overflow-hidden">
                {/* Background Decorations */}
                <div className="absolute inset-0 -z-10 pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-[120px]" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-[120px]" />
                </div>

                {/* Toast Notification */}
                <AnimatePresence>
                    {toast && (
                        <motion.div
                            initial={{ opacity: 0, y: 50, x: "-50%" }}
                            animate={{ opacity: 1, y: 0, x: "-50%" }}
                            exit={{ opacity: 0, y: 20, x: "-50%" }}
                            className="absolute bottom-10 left-1/2 z-50 px-6 py-3 bg-emerald-500 text-white font-bold rounded-2xl shadow-2xl shadow-emerald-500/20 flex items-center gap-2"
                        >
                            <Star className="w-4 h-4 fill-white" />
                            {toast}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Header Info */}
                <div className="absolute top-12 text-center space-y-2">
                    <h1 className="text-2xl font-black text-white tracking-widest uppercase">
                        Trendradarn
                    </h1>
                    <div className="flex items-center gap-2 justify-center text-white/40 text-xs font-medium uppercase tracking-widest">
                        <Info className="w-3.5 h-3.5" />
                        Svep höger för att bevaka • Svep vänster för nästa
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-10 h-10 animate-spin text-emerald-400" />
                        <p className="text-white/40 font-bold uppercase tracking-widest text-xs">
                            Kurerar trender...
                        </p>
                    </div>
                ) : (
                    <div className="relative w-full max-w-sm aspect-[3/4] perspective-1000">
                        <AnimatePresence mode="popLayout">
                            {currentIndex < stocks.length ? (
                                stocks.slice(currentIndex, currentIndex + 2).reverse().map((stock, idx) => (
                                    <DiscoveryCard
                                        key={stock.symbol}
                                        stock={stock}
                                        active={idx === 1} // Index 1 is the top card because of reverse()
                                        onSwipe={handleSwipe}
                                    />
                                ))
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="h-full flex flex-col items-center justify-center text-center p-8 bg-white/[0.04] backdrop-blur-3xl rounded-[2.5rem] border border-white/10"
                                >
                                    <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 flex items-center justify-center mb-6">
                                        <RefreshCw className="w-10 h-10 text-emerald-400" />
                                    </div>
                                    <h2 className="text-2xl font-black text-white mb-2">Du är uppdaterad!</h2>
                                    <p className="text-white/50 text-sm mb-8 leading-relaxed">
                                        Du har sett alla dagens hetaste trender. Kom tillbaka senare för nya AI-insikter.
                                    </p>
                                    <button
                                        onClick={loadDiscovery}
                                        className="px-8 py-4 btn-gradient text-white rounded-2xl font-bold text-sm"
                                    >
                                        Uppdatera flöde
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </main>

            <RightPanel />
        </div>
    );
}
