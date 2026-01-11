"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";

export function SentimentHeatmap() {
    // Re-use the trending endpoint for data
    const { data: stocks } = useQuery({
        queryKey: ["trending-stocks"],
        queryFn: async () => {
            const res = await fetch("/api/stocks/trending");
            const data = await res.json();
            return data.stocks || [];
        },
    });

    if (!stocks || stocks.length === 0) return null;

    // Calculate total market sentiment
    const totalBullish = stocks.reduce((acc: number, s: any) => acc + (s.bullishPercent || 50), 0) / stocks.length;

    return (
        <div className="mb-6">
            <h3 className="text-white/50 text-xs font-bold uppercase tracking-widest mb-3">Community Vibe</h3>

            {/* Main Bar */}
            <div className="h-4 bg-white/10 rounded-full overflow-hidden flex relative mb-2">
                <motion.div
                    initial={{ width: "50%" }}
                    animate={{ width: `${totalBullish}%` }}
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.5)]"
                />
            </div>
            <div className="flex justify-between text-[10px] font-medium">
                <span className="text-emerald-400">{Math.round(totalBullish)}% Bullish</span>
                <span className="text-rose-400">{Math.round(100 - totalBullish)}% Bearish</span>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-4 gap-1 mt-4">
                {stocks.slice(0, 8).map((s: any) => (
                    <div
                        key={s.symbol}
                        className={`aspect-square rounded-md p-1 flex flex-col items-center justify-center text-[8px] font-bold border border-black/20 ${(s.bullishPercent || 50) > 50 ? "bg-emerald-500/80 text-black" : "bg-rose-500/80 text-white"
                            }`}
                        style={{ opacity: Math.max(0.4, (s.bullishPercent > 50 ? s.bullishPercent : 100 - s.bullishPercent) / 100) }}
                    >
                        <span>${s.symbol.split('.')[0]}</span>
                        <span>{(s.bullishPercent || 50) > 50 ? "BULL" : "BEAR"}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
