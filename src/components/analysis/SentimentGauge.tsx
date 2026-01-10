"use client";

import { TrendingUp, TrendingDown } from "lucide-react";

interface SentimentGaugeProps {
    bullishPercent: number;
    size?: "sm" | "md" | "lg";
    showLabels?: boolean;
}

export function SentimentGauge({
    bullishPercent,
    size = "md",
    showLabels = true,
}: SentimentGaugeProps) {
    const bearishPercent = 100 - bullishPercent;

    const heightClasses = {
        sm: "h-1.5",
        md: "h-3",
        lg: "h-4",
    };

    return (
        <div className="w-full">
            {/* Gauge bar */}
            <div
                className={`relative ${heightClasses[size]} bg-rose-500/30 rounded-full overflow-hidden`}
            >
                <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${bullishPercent}%` }}
                />
            </div>

            {/* Labels */}
            {showLabels && (
                <div className="flex justify-between mt-1.5 text-xs">
                    <span className="flex items-center gap-1 text-emerald-400">
                        <TrendingUp className="w-3 h-3" />
                        <span className="tabular-nums">{bullishPercent}%</span>
                    </span>
                    <span className="flex items-center gap-1 text-rose-400">
                        <span className="tabular-nums">{bearishPercent}%</span>
                        <TrendingDown className="w-3 h-3" />
                    </span>
                </div>
            )}
        </div>
    );
}
