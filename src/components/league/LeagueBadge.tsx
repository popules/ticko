import { Trophy, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeagueBadgeProps {
    leagueName: string; // e.g. "Silver"
    tier: number; // e.g. 1, 2, 3
    rank?: number | null; // e.g. 12
    className?: string;
    showIcon?: boolean;
}

const LEAGUE_COLORS: Record<string, string> = {
    Bronze: "from-orange-700 to-orange-900 border-orange-800 text-orange-100",
    Silver: "from-slate-300 to-slate-500 border-slate-400 text-slate-100",
    Gold: "from-yellow-300 to-yellow-600 border-yellow-500 text-yellow-50",
    Platinum: "from-cyan-300 to-cyan-600 border-cyan-500 text-cyan-50",
    Diamond: "from-blue-400 to-purple-600 border-blue-400 text-white",
};

const LEAGUE_TEXT_COLORS: Record<string, string> = {
    Bronze: "text-orange-400",
    Silver: "text-slate-300",
    Gold: "text-yellow-400",
    Platinum: "text-cyan-400",
    Diamond: "text-purple-400",
};

export function LeagueBadge({ leagueName, tier, rank, className, showIcon = true }: LeagueBadgeProps) {
    const colorClass = LEAGUE_COLORS[leagueName] || LEAGUE_COLORS["Bronze"];
    const textClass = LEAGUE_TEXT_COLORS[leagueName] || LEAGUE_TEXT_COLORS["Bronze"];

    return (
        <div className={cn("flex items-center gap-2", className)}>
            {showIcon && (
                <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br border shadow-lg",
                    colorClass
                )}>
                    <Shield className="w-4 h-4" />
                </div>
            )}

            <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                    <span className={cn("font-bold text-sm uppercase tracking-wider", textClass)}>
                        {leagueName} {tier > 0 && "I".repeat(tier)}
                    </span>
                    {rank && rank <= 3 && (
                        <Trophy className={cn("w-3 h-3", textClass)} />
                    )}
                </div>
                {rank && (
                    <span className="text-xs text-white/50">
                        Rank #{rank}
                    </span>
                )}
            </div>
        </div>
    );
}
