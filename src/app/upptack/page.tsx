"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { RightPanel } from "@/components/layout/RightPanel";
import { DiscoveryCard } from "@/components/discovery/DiscoveryCard";
import type { StockData } from "@/lib/stocks-api";
import { Loader2, RefreshCw, Info, Star, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";

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

    const queryClient = useQueryClient();
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    const handleSwipe = async (direction: "left" | "right") => {
        const currentStock = stocks[currentIndex];

        if (direction === "right" && currentStock) {
            // Optimistic UI update
            setToast({ message: `Bevakar ${currentStock.symbol}`, type: "success" });
            setTimeout(() => setToast(null), 2000);

            try {
                const res = await fetch("/api/watchlist", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ticker: currentStock.symbol }),
                });

                if (!res.ok) throw new Error("Failed to save");

                // Important: Update the global watchlist cache so it appears in the sidebar immediately
                queryClient.invalidateQueries({ queryKey: ["watchlist"] });

            } catch (error) {
                console.error("Failed to add to watchlist on swipe:", error);
                setToast({ message: "Kunde inte spara aktien", type: "error" });
                setTimeout(() => setToast(null), 3000);
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

            <main className="flex-1 flex flex-col items-center border-r border-white/10 relative overflow-y-auto overflow-x-hidden pt-12 pb-24 px-6 md:px-12">
                {/* Background Decorations */}
                <div className="fixed inset-0 -z-10 pointer-events-none">
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
                            className={`fixed bottom-10 left-1/2 z-50 px-6 py-3 font-bold rounded-2xl shadow-2xl flex items-center gap-2 ${toast.type === "error"
                                ? "bg-rose-500 text-white shadow-rose-500/20"
                                : "bg-emerald-500 text-white shadow-emerald-500/20"
                                }`}
                        >
                            {toast.type === "error" ? <AlertCircle className="w-4 h-4 text-white" /> : <Star className="w-4 h-4 fill-white" />}
                            {toast.message}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Header Info - Now in normal flow */}
                <div className="text-center space-y-2 mb-12 shrink-0">
                    <h1 className="text-2xl font-black text-white tracking-widest uppercase">
                        Trendradarn
                    </h1>
                    <div className="flex items-center gap-2 justify-center text-white/40 text-xs font-medium uppercase tracking-widest">
                        <Info className="w-3.5 h-3.5" />
                        Svep höger för att bevaka • Svep vänster för nästa
                    </div>
                </div>

                <div className="w-full max-w-sm flex-1 flex items-center justify-center min-h-[500px]">
                    {isLoading ? (
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 className="w-10 h-10 animate-spin text-emerald-400" />
                            <p className="text-white/40 font-bold uppercase tracking-widest text-xs">
                                Kurerar trender...
                            </p>
                        </div>
                    ) : (
                        <div className="relative w-full aspect-[3/4] perspective-1000">
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
                                        className="w-full h-full flex flex-col items-center justify-center text-center p-8 bg-white/[0.04] backdrop-blur-3xl rounded-[2.5rem] border border-white/10"
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
                </div>
            </main>

            <RightPanel />
        </div>
    );
}
