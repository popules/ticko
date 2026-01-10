"use client";

import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, Brain, Activity, Loader2 } from "lucide-react";
import { UI_STRINGS } from "@/config/app";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

interface AIValuationCardProps {
    ticker: string;
    currencySymbol?: string;
}

interface AIAnalysisRes {
    ticker: string;
    fairValue: number;
    currentPrice: number;
    reasoning: string;
    sentiment: "bullish" | "bearish" | "neutral";
    confidence: number;
}

interface SentimentRes {
    bullish_count: number;
    bearish_count: number;
    bullish_percent: number;
    bearish_percent: number;
    total_posts: number;
}

export function AIValuationCard({ ticker, currencySymbol = "$" }: AIValuationCardProps) {
    // 1. Fetch AI Analysis from our OpenAI route
    const { data: aiData, isLoading: isAiLoading, error: aiError } = useQuery<AIAnalysisRes>({
        queryKey: ["ai-analysis", ticker],
        queryFn: async () => {
            const res = await fetch(`/api/analyze/${ticker}`);
            if (!res.ok) throw new Error("AI analysis failed");
            return res.json();
        },
        staleTime: 1000 * 60 * 10, // 10 minutes cache
    });

    // 2. Fetch real Community Sentiment from Supabase RPC
    const { data: sentimentData, isLoading: isSentimentLoading } = useQuery<SentimentRes[]>({
        queryKey: ["sentiment", ticker],
        enabled: isSupabaseConfigured,
        queryFn: async () => {
            if (!supabase) return [];
            const { data, error } = await (supabase.rpc as any)("get_ticker_sentiment", {
                ticker_symbol_param: ticker.toUpperCase(),
            });
            if (error) throw error;
            return data as SentimentRes[];
        },
        refetchInterval: 30000, // Refresh every 30s
    });

    const isLoading = isAiLoading || isSentimentLoading;

    if (isLoading) {
        return (
            <div className="bg-white/[0.04] backdrop-blur-xl rounded-2xl p-12 flex flex-col items-center justify-center border border-white/10">
                <Loader2 className="w-8 h-8 animate-spin text-violet-400 mb-4" />
                <p className="text-white/60">Analyserar ${ticker} med AI...</p>
            </div>
        );
    }

    if (aiError) {
        return (
            <div className="bg-white/[0.04] backdrop-blur-xl rounded-2xl p-8 border border-white/10 text-center">
                <p className="text-rose-400">Kunde inte utföra AI-analys</p>
                <p className="text-sm text-white/40 mt-2">Kontrollera OpenAI API-nyckel i .env.local</p>
            </div>
        );
    }

    const currentPrice = aiData?.currentPrice || 0;
    const fairValue = aiData?.fairValue || 0;
    const reasoning = aiData?.reasoning || "Ingen analys tillgänglig.";
    const bullishPercent = sentimentData?.[0]?.bullish_percent ?? 50;
    const bearishPercent = 100 - bullishPercent;
    const upside = currentPrice > 0 ? ((fairValue - currentPrice) / currentPrice) * 100 : 0;
    const isUndervalued = upside > 0;

    return (
        <div className="bg-white/[0.04] backdrop-blur-xl rounded-2xl p-5 space-y-5 border border-white/10 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-violet-500/20 to-violet-600/10 rounded-xl border border-violet-500/20">
                        <Brain className="w-5 h-5 text-violet-400" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-white">{UI_STRINGS.aiAnalysis}</h3>
                        <p className="text-xs text-white/50">${ticker}</p>
                    </div>
                </div>
                <span className="text-xs text-white/40 bg-white/[0.06] px-3 py-1.5 rounded-full">
                    {UI_STRINGS.updatedAgo} nu
                </span>
            </div>

            {/* Fair Value Estimate */}
            <div className="bg-white/[0.04] rounded-2xl p-5 border border-white/[0.08]">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-xs text-white/50 mb-1">{UI_STRINGS.currentPrice}</p>
                        <p className="text-2xl font-bold tabular-nums text-white">
                            {currencySymbol === 'kr' ? `${currentPrice.toFixed(2)} kr` : `${currencySymbol}${currentPrice.toFixed(2)}`}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-white/50 mb-1">{UI_STRINGS.fairValue}</p>
                        <p className="text-2xl font-bold tabular-nums text-emerald-400">
                            {currencySymbol === 'kr' ? `${fairValue.toFixed(2)} kr` : `${currencySymbol}${fairValue.toFixed(2)}`}
                        </p>
                    </div>
                </div>

                {/* Upside indicator */}
                <div
                    className={`flex items-center gap-2 text-sm font-semibold ${isUndervalued ? "text-emerald-400" : "text-rose-400"
                        }`}
                >
                    {isUndervalued ? (
                        <TrendingUp className="w-4 h-4" />
                    ) : (
                        <TrendingDown className="w-4 h-4" />
                    )}
                    <span className="tabular-nums">
                        {isUndervalued ? "+" : ""}
                        {upside.toFixed(1)}% {isUndervalued ? UI_STRINGS.upside : UI_STRINGS.downside}
                    </span>
                </div>
            </div>

            {/* AI Reasoning */}
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <Activity className="w-4 h-4 text-white/50" />
                    <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                        {UI_STRINGS.aiReasoning}
                    </span>
                </div>
                <p className="text-sm text-white/80 leading-relaxed italic">
                    "{reasoning}"
                </p>
            </div>

            {/* Sentiment Gauge */}
            <div>
                <div className="flex items-center justify-between mb-3 text-white/50">
                    <span className="text-xs font-semibold uppercase tracking-wider">
                        {UI_STRINGS.communitySentiment}
                    </span>
                    <span className="text-[10px] tabular-nums">
                        Baserat på {sentimentData?.[0]?.total_posts || 0} inlägg
                    </span>
                </div>

                {/* Gauge bar */}
                <div className="relative h-2.5 bg-rose-500/20 rounded-full overflow-hidden">
                    <div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${bullishPercent}%` }}
                    />
                </div>

                {/* Labels */}
                <div className="flex justify-between mt-3 text-xs">
                    <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                        <TrendingUp className="w-3 h-3" />
                        <span className="tabular-nums">{bullishPercent.toFixed(0)}%</span> {UI_STRINGS.bullish}
                    </span>
                    <span className="flex items-center gap-1.5 text-rose-400 font-medium">
                        {UI_STRINGS.bearish} <span className="tabular-nums">{bearishPercent.toFixed(0)}%</span>
                        <TrendingDown className="w-3 h-3" />
                    </span>
                </div>
            </div>
        </div>
    );
}
