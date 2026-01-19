"use client";

import { useState } from "react";
import { Brain, Loader2, Sparkles, RefreshCw, TrendingUp, Target, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TradingInsightsProps {
    userId: string;
}

interface InsightData {
    insight: string | null;
    message?: string;
    stats?: {
        totalTrades: number;
        winRate: string;
        totalPnl: number;
        avgHoldDays: string;
        bestTrade: string;
        worstTrade: string;
    };
}

export function TradingInsights({ userId }: TradingInsightsProps) {
    const [data, setData] = useState<InsightData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [hasRequested, setHasRequested] = useState(false);

    const fetchInsights = async () => {
        setIsLoading(true);
        setHasRequested(true);

        try {
            const response = await fetch("/api/ai/trading-insights", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId }),
            });

            const result = await response.json();
            setData(result);
        } catch (error) {
            console.error("Failed to fetch insights:", error);
            setData({
                insight: null,
                message: "Kunde inte hämta insikter just nu. Försök igen senare.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 sm:p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-violet-500/5 via-transparent to-fuchsia-500/5">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                        <Brain className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white">AI Trading Coach</h3>
                        <p className="text-[10px] text-white/40">Personliga insikter</p>
                    </div>
                </div>

                {hasRequested && data?.insight && (
                    <button
                        onClick={fetchInsights}
                        disabled={isLoading}
                        className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors"
                        title="Uppdatera"
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                    </button>
                )}
            </div>

            <AnimatePresence mode="wait">
                {!hasRequested ? (
                    <motion.div
                        key="cta"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center py-6"
                    >
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center">
                            <Sparkles className="w-8 h-8 text-violet-400" />
                        </div>
                        <p className="text-white/60 text-sm mb-4 max-w-xs mx-auto">
                            Få AI-driven analys av dina trading-mönster. Vad gör du bra? Vad kan förbättras?
                        </p>
                        <button
                            onClick={fetchInsights}
                            disabled={isLoading}
                            className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-bold text-sm hover:opacity-90 transition-opacity flex items-center gap-2 mx-auto"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Analyserar...
                                </>
                            ) : (
                                <>
                                    <Brain className="w-4 h-4" />
                                    Analysera min trading
                                </>
                            )}
                        </button>
                    </motion.div>
                ) : isLoading ? (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center py-8"
                    >
                        <Loader2 className="w-8 h-8 animate-spin text-violet-400 mx-auto mb-3" />
                        <p className="text-white/40 text-sm">AI:n gräver i din historik...</p>
                    </motion.div>
                ) : data?.insight ? (
                    <motion.div
                        key="insight"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="space-y-4"
                    >
                        {/* Stats Summary */}
                        {data.stats && (
                            <div className="grid grid-cols-3 gap-2 mb-4">
                                <div className="p-3 rounded-xl bg-white/[0.04] text-center">
                                    <div className="flex items-center justify-center gap-1 mb-1">
                                        <Target className="w-3 h-3 text-emerald-400" />
                                    </div>
                                    <p className="text-lg font-black text-emerald-400">{data.stats.winRate}%</p>
                                    <p className="text-[10px] text-white/40">Win Rate</p>
                                </div>
                                <div className="p-3 rounded-xl bg-white/[0.04] text-center">
                                    <div className="flex items-center justify-center gap-1 mb-1">
                                        <TrendingUp className="w-3 h-3 text-violet-400" />
                                    </div>
                                    <p className={`text-lg font-black ${data.stats.totalPnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                                        {data.stats.totalPnl >= 0 ? "+" : ""}{data.stats.totalPnl.toLocaleString("sv-SE")}
                                    </p>
                                    <p className="text-[10px] text-white/40">Total P&L</p>
                                </div>
                                <div className="p-3 rounded-xl bg-white/[0.04] text-center">
                                    <div className="flex items-center justify-center gap-1 mb-1">
                                        <Clock className="w-3 h-3 text-blue-400" />
                                    </div>
                                    <p className="text-lg font-black text-white">{data.stats.avgHoldDays}d</p>
                                    <p className="text-[10px] text-white/40">Snitt hålltid</p>
                                </div>
                            </div>
                        )}

                        {/* AI Insight */}
                        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                            <p className="text-sm text-white/80 leading-relaxed whitespace-pre-line">
                                {data.insight}
                            </p>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="message"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center py-6"
                    >
                        <p className="text-white/50 text-sm">{data?.message}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
