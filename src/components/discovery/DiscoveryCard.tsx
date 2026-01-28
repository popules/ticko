"use client";

import { motion, PanInfo } from "framer-motion";
import { TrendingUp, TrendingDown, Sparkles, Activity, Target } from "lucide-react";
import { StockData } from "@/lib/stocks-api";
import { UI_STRINGS } from "@/config/app";
import Link from "next/link";

interface DiscoveryCardProps {
    stock: StockData;
    onSwipe: (direction: "left" | "right") => void;
    active: boolean;
}

export function DiscoveryCard({ stock, onSwipe, active }: DiscoveryCardProps) {
    const handleDragEnd = (_: any, info: PanInfo) => {
        if (info.offset.x > 100) onSwipe("right");
        else if (info.offset.x < -100) onSwipe("left");
    };

    const isPositive = stock.change >= 0;

    return (
        <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            animate={{
                scale: active ? 1 : 0.9,
                rotate: active ? 0 : 2,
                opacity: active ? 1 : 0.5,
                y: active ? 0 : 20,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`absolute w-full max-w-sm aspect-[3/4] rounded-[2.5rem] p-8 border border-white/10 backdrop-blur-2xl shadow-2xl cursor-grab active:cursor-grabbing select-none overflow-hidden ${active ? "z-20" : "z-10"
                }`}
            style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)",
            }}
        >
            {/* Background Gradient Glow */}
            <div className={`absolute -top-24 -right-24 w-64 h-64 blur-[100px] opacity-20 rounded-full ${isPositive ? "bg-emerald-500" : "bg-rose-500"
                }`} />

            <div className="relative h-full flex flex-col justify-between">
                {/* Header */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                                {stock.performanceCue || "Alpha Signal"}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/10">
                            <Activity className="w-3.5 h-3.5 text-white/40" />
                            <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
                                {UI_STRINGS.volume} {stock.volume}
                            </span>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-4xl font-black text-white tracking-tighter mb-1">
                            ${stock.symbol}
                        </h2>
                        <p className="text-white/60 font-medium truncate">{stock.name}</p>
                    </div>
                </div>

                {/* Ticko Discovery Hook Card */}
                <div className="bg-gradient-to-br from-violet-500/20 to-fuchsia-500/10 rounded-[1.5rem] p-6 border border-violet-500/20 shadow-inner relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Sparkles className="w-12 h-12 text-white" />
                    </div>

                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-violet-400" />
                            <span className="text-[10px] font-black text-violet-400 uppercase tracking-widest">
                                TICKO INSIGHT
                            </span>
                        </div>
                        {stock.bullishPercent && (
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">
                                    {stock.bullishPercent}% Bullish
                                </span>
                            </div>
                        )}
                    </div>
                    <p className="text-lg font-semibold text-white leading-snug italic">
                        "{stock.discoveryHook}"
                    </p>
                </div>

                {/* Footer Stats */}
                <div className="space-y-6">
                    <div className="flex items-end justify-between">
                        <div>
                            <p className="text-xs text-white/40 mb-1">{UI_STRINGS.currentPrice}</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-black text-white tabular-nums">
                                    {(stock.currencySymbol || '$') === 'kr' ? `${stock.price.toFixed(2)} kr` : `${stock.currencySymbol || '$'}${stock.price.toFixed(2)}`}
                                </span>
                            </div>
                        </div>
                        <div className={`flex items-center gap-1 px-4 py-2 rounded-2xl font-black text-sm tabular-nums ${isPositive ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                            }`}>
                            {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                            {isPositive ? "+" : ""}{stock.changePercent.toFixed(2)}%
                        </div>
                    </div>

                    <Link
                        href={`/stock/${stock.symbol}`}
                        className="w-full flex items-center justify-center gap-2 py-4 btn-gradient text-white rounded-[1.25rem] font-bold text-sm shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        View Analysis
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}
