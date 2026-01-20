"use client";

import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, Users, Activity } from "lucide-react";

interface SentimentData {
    greed: number;
    fear: number;
    neutral: number;
    dominant: "greed" | "fear" | "neutral";
    totalPosts: number;
    period: string;
}

export function CommunitySentiment() {
    const { data, isLoading } = useQuery<SentimentData>({
        queryKey: ["market-sentiment"],
        queryFn: async () => {
            const res = await fetch("/api/market/sentiment");
            return res.json();
        },
        refetchInterval: 60000, // Refresh every minute
    });

    if (isLoading) {
        return (
            <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] animate-pulse">
                <div className="h-4 w-32 bg-white/10 rounded mb-4"></div>
                <div className="h-24 bg-white/5 rounded-xl"></div>
            </div>
        );
    }

    const greed = data?.greed ?? 50;
    const fear = data?.fear ?? 30;
    const totalPosts = data?.totalPosts ?? 0;
    const dominant = data?.dominant ?? "neutral";

    // Calculate position on the gauge (0-100)
    const sentimentScore = Math.round(greed - fear + 50); // Range: 0-100
    const clampedScore = Math.max(0, Math.min(100, sentimentScore));

    const getLabel = () => {
        if (clampedScore >= 75) return "Extrem Girighet";
        if (clampedScore >= 55) return "Girighet";
        if (clampedScore >= 45) return "Neutral";
        if (clampedScore >= 25) return "Rädsla";
        return "Extrem Rädsla";
    };

    const getColor = () => {
        if (clampedScore >= 75) return "text-emerald-400";
        if (clampedScore >= 55) return "text-emerald-300";
        if (clampedScore >= 45) return "text-white/60";
        if (clampedScore >= 25) return "text-rose-300";
        return "text-rose-400";
    };

    const getGradient = () => {
        if (clampedScore >= 55) return "from-emerald-500/20 to-transparent";
        if (clampedScore >= 45) return "from-white/5 to-transparent";
        return "from-rose-500/20 to-transparent";
    };

    return (
        <div className={`p-4 rounded-2xl border border-white/10 bg-gradient-to-br ${getGradient()}`}>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-violet-400" />
                    <span className="text-xs font-bold text-white/50 uppercase tracking-wider">
                        Community Sentiment
                    </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-white/30">
                    <Users className="w-3 h-3" />
                    {totalPosts} posts (24h)
                </div>
            </div>

            {/* Gauge */}
            <div className="relative mb-4">
                {/* Background Bar */}
                <div className="h-3 rounded-full bg-gradient-to-r from-rose-500/30 via-white/10 to-emerald-500/30 overflow-hidden">
                    {/* Indicator */}
                    <div
                        className="absolute top-0 h-3 w-1 bg-white rounded-full shadow-lg shadow-white/50 transition-all duration-500"
                        style={{ left: `calc(${clampedScore}% - 2px)` }}
                    />
                </div>

                {/* Labels */}
                <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-rose-400 flex items-center gap-1">
                        <TrendingDown className="w-3 h-3" /> Rädsla
                    </span>
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                        Girighet <TrendingUp className="w-3 h-3" />
                    </span>
                </div>
            </div>

            {/* Score Display */}
            <div className="text-center">
                <p className={`text-2xl font-black ${getColor()}`}>{clampedScore}</p>
                <p className="text-xs text-white/40">{getLabel()}</p>
            </div>

            {/* Breakdown */}
            <div className="grid grid-cols-3 gap-2 mt-4">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-center">
                    <p className="text-xs font-bold text-emerald-400">{greed}%</p>
                    <p className="text-[10px] text-white/40">Bullish</p>
                </div>
                <div className="p-2 rounded-lg bg-white/5 text-center">
                    <p className="text-xs font-bold text-white/60">{data?.neutral ?? 20}%</p>
                    <p className="text-[10px] text-white/40">Neutral</p>
                </div>
                <div className="p-2 rounded-lg bg-rose-500/10 text-center">
                    <p className="text-xs font-bold text-rose-400">{fear}%</p>
                    <p className="text-[10px] text-white/40">Bearish</p>
                </div>
            </div>
        </div>
    );
}
