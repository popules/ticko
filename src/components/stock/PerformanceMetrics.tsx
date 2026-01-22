"use client";

import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, Loader2 } from "lucide-react";

interface PerformanceMetricsProps {
    symbol: string;
}

export function PerformanceMetrics({ symbol }: PerformanceMetricsProps) {
    const { data, isLoading, error } = useQuery({
        queryKey: ["performance", symbol],
        queryFn: async () => {
            const res = await fetch(`/api/stock/performance?symbol=${encodeURIComponent(symbol)}`);
            if (!res.ok) throw new Error("Failed to fetch");
            return res.json();
        },
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    });

    if (isLoading) {
        return (
            <div className="flex items-center gap-4 py-2">
                <Loader2 className="w-4 h-4 animate-spin text-white/40" />
                <span className="text-xs text-white/40">Loading performance...</span>
            </div>
        );
    }

    if (error || !data?.performance) {
        return null; // Fail silently
    }

    const periods = [
        { label: "YTD", value: data.performance.YTD },
        { label: "1Y", value: data.performance["1Y"] },
        { label: "5Y", value: data.performance["5Y"] },
    ];

    return (
        <div className="flex items-center gap-3 flex-wrap">
            {periods.map(({ label, value }) => {
                if (value === null) return null;
                const isPositive = value >= 0;
                return (
                    <div
                        key={label}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold tabular-nums ${isPositive
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            }`}
                    >
                        {isPositive ? (
                            <TrendingUp className="w-3 h-3" />
                        ) : (
                            <TrendingDown className="w-3 h-3" />
                        )}
                        <span className="text-white/60 font-medium">{label}:</span>
                        {isPositive ? "+" : ""}{value.toFixed(1)}%
                    </div>
                );
            })}
        </div>
    );
}
