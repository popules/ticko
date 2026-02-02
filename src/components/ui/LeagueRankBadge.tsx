"use client";

import { Shield, Trophy, Gem } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeagueRankBadgeProps {
    rating: number;
    size?: "xs" | "sm" | "md";
    showLabel?: boolean;
    className?: string;
}

/**
 * Get league info from MMR rating
 */
function getLeagueFromRating(rating: number) {
    if (rating >= 2500) return { name: "Diamond", tier: 5, icon: Gem, colors: "from-blue-400 to-purple-500 border-blue-400/50 text-blue-300" };
    if (rating >= 2000) return { name: "Platinum", tier: 4, icon: Trophy, colors: "from-cyan-300 to-blue-500 border-cyan-400/50 text-cyan-300" };
    if (rating >= 1500) return { name: "Gold", tier: 3, icon: Trophy, colors: "from-yellow-300 to-amber-500 border-yellow-400/50 text-yellow-300" };
    if (rating >= 1000) return { name: "Silver", tier: 2, icon: Shield, colors: "from-slate-300 to-slate-500 border-slate-400/50 text-slate-300" };
    return { name: "Bronze", tier: 1, icon: Shield, colors: "from-orange-600 to-amber-700 border-orange-500/50 text-orange-300" };
}

export function LeagueRankBadge({ rating, size = "xs", showLabel = false, className }: LeagueRankBadgeProps) {
    const league = getLeagueFromRating(rating);
    const Icon = league.icon;

    const sizeClasses = {
        xs: "w-4 h-4 text-[8px]",
        sm: "w-5 h-5 text-[9px]",
        md: "w-6 h-6 text-[10px]",
    };

    const iconSizes = {
        xs: "w-2.5 h-2.5",
        sm: "w-3 h-3",
        md: "w-3.5 h-3.5",
    };

    if (showLabel) {
        return (
            <span
                className={cn(
                    "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-gradient-to-r border",
                    league.colors,
                    className
                )}
                title={`${league.name} League (${rating} rating)`}
            >
                <Icon className={iconSizes[size]} />
                {league.name}
            </span>
        );
    }

    return (
        <span
            className={cn(
                "inline-flex items-center justify-center rounded bg-gradient-to-br border",
                sizeClasses[size],
                league.colors,
                className
            )}
            title={`${league.name} League (${rating} rating)`}
        >
            <Icon className={iconSizes[size]} />
        </span>
    );
}
