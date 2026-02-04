"use client";

import { Shield, Trophy, Gem, Medal, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeagueRankBadgeProps {
    rating: number;
    size?: "xs" | "sm" | "md" | "lg";
    showLabel?: boolean;
    className?: string;
}

/**
 * Get league info from MMR rating with enhanced styling
 */
function getLeagueFromRating(rating: number) {
    if (rating >= 2500) return { 
        name: "Diamond", 
        tier: 5, 
        icon: Gem, 
        colors: "from-violet-400 via-blue-400 to-cyan-400 border-blue-400/60",
        textColor: "text-blue-300",
        glow: "shadow-[0_0_12px_rgba(96,165,250,0.5)]",
        bgGlow: "bg-blue-500/10"
    };
    if (rating >= 2000) return { 
        name: "Platinum", 
        tier: 4, 
        icon: Crown, 
        colors: "from-cyan-200 via-cyan-400 to-teal-500 border-cyan-400/60",
        textColor: "text-cyan-300",
        glow: "shadow-[0_0_10px_rgba(34,211,238,0.4)]",
        bgGlow: "bg-cyan-500/10"
    };
    if (rating >= 1500) return { 
        name: "Gold", 
        tier: 3, 
        icon: Trophy, 
        colors: "from-yellow-300 via-amber-400 to-orange-500 border-yellow-500/60",
        textColor: "text-yellow-300",
        glow: "shadow-[0_0_8px_rgba(234,179,8,0.4)]",
        bgGlow: "bg-yellow-500/10"
    };
    if (rating >= 1000) return { 
        name: "Silver", 
        tier: 2, 
        icon: Medal, 
        colors: "from-slate-200 via-slate-400 to-slate-600 border-slate-400/60",
        textColor: "text-slate-300",
        glow: "",
        bgGlow: "bg-slate-500/5"
    };
    return { 
        name: "Bronze", 
        tier: 1, 
        icon: Shield, 
        colors: "from-orange-500 via-amber-600 to-orange-800 border-orange-600/60",
        textColor: "text-orange-300",
        glow: "",
        bgGlow: "bg-orange-500/5"
    };
}

export function LeagueRankBadge({ rating, size = "xs", showLabel = false, className }: LeagueRankBadgeProps) {
    const league = getLeagueFromRating(rating);
    const Icon = league.icon;

    const sizeClasses = {
        xs: "w-5 h-5",
        sm: "w-6 h-6",
        md: "w-7 h-7",
        lg: "w-9 h-9",
    };

    const iconSizes = {
        xs: "w-3 h-3",
        sm: "w-3.5 h-3.5",
        md: "w-4 h-4",
        lg: "w-5 h-5",
    };

    const labelSizes = {
        xs: "text-[10px] px-1.5 py-0.5 gap-1",
        sm: "text-[11px] px-2 py-1 gap-1.5",
        md: "text-xs px-2.5 py-1 gap-1.5",
        lg: "text-sm px-3 py-1.5 gap-2",
    };

    if (showLabel) {
        return (
            <span
                className={cn(
                    "inline-flex items-center rounded-md font-bold bg-gradient-to-r border",
                    labelSizes[size],
                    league.colors,
                    league.glow,
                    league.textColor,
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
                "inline-flex items-center justify-center rounded-md bg-gradient-to-br border",
                sizeClasses[size],
                league.colors,
                league.glow,
                league.textColor,
                className
            )}
            title={`${league.name} League (${rating} rating)`}
        >
            <Icon className={iconSizes[size]} />
        </span>
    );
}
