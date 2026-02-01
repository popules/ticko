import { Shield, Trophy, Crown, Gem, Sword } from "lucide-react";

interface LeagueBadgeProps {
    tier: string;
    className?: string;
    size?: "sm" | "md" | "lg" | "xl";
}

export function LeagueBadge({ tier, className = "", size = "md" }: LeagueBadgeProps) {
    const normalizedTier = tier?.toLowerCase() || "unranked";

    const sizeClasses = {
        sm: "w-8 h-8",
        md: "w-12 h-12",
        lg: "w-16 h-16",
        xl: "w-24 h-24"
    };

    const iconSize = {
        sm: "w-4 h-4",
        md: "w-6 h-6",
        lg: "w-8 h-8",
        xl: "w-12 h-12"
    };

    const getBadgeConfig = () => {
        switch (true) {
            case normalizedTier.includes("bronze"):
                return {
                    icon: Shield,
                    colors: "from-orange-700 to-amber-900 border-amber-800",
                    textColor: "text-amber-700",
                    glow: "shadow-amber-900/40",
                    iconColor: "text-amber-200"
                };
            case normalizedTier.includes("silver"):
                return {
                    icon: Shield,
                    colors: "from-slate-300 to-slate-500 border-slate-400",
                    textColor: "text-slate-300",
                    glow: "shadow-slate-400/40",
                    iconColor: "text-white"
                };
            case normalizedTier.includes("gold"):
                return {
                    icon: Trophy,
                    colors: "from-yellow-300 to-amber-500 border-yellow-400",
                    textColor: "text-yellow-400",
                    glow: "shadow-yellow-500/50",
                    iconColor: "text-yellow-100"
                };
            case normalizedTier.includes("platinum"):
                return {
                    icon: Trophy,
                    colors: "from-cyan-300 to-blue-500 border-cyan-400",
                    textColor: "text-cyan-400",
                    glow: "shadow-cyan-400/50",
                    iconColor: "text-white"
                };
            case normalizedTier.includes("diamond"):
                return {
                    icon: Gem,
                    colors: "from-blue-400 to-indigo-600 border-blue-400",
                    textColor: "text-blue-400",
                    glow: "shadow-blue-500/60",
                    iconColor: "text-blue-100"
                };
            case normalizedTier.includes("master"):
                return {
                    icon: Crown,
                    colors: "from-purple-400 to-fuchsia-600 border-purple-400",
                    textColor: "text-purple-400",
                    glow: "shadow-purple-500/60",
                    iconColor: "text-purple-100"
                };
            case normalizedTier.includes("legend"):
                return {
                    icon: Sword,
                    colors: "from-rose-500 to-orange-600 border-rose-500",
                    textColor: "text-rose-400",
                    glow: "shadow-rose-500/60",
                    iconColor: "text-rose-100"
                };

            default: // Unranked
                return {
                    icon: Shield,
                    colors: "from-slate-700 to-slate-800 border-slate-700",
                    textColor: "text-slate-600",
                    glow: "shadow-none",
                    iconColor: "text-slate-500"
                };
        }
    };

    const config = getBadgeConfig();
    const Icon = config.icon;

    return (
        <div className={`relative rounded-xl bg-gradient-to-br ${config.colors} p-[1px] shadow-lg ${config.glow} ${sizeClasses[size]} ${className} flex items-center justify-center`}>
            {/* Inner background */}
            <div className="w-full h-full rounded-[0.7rem] bg-[#0B0F17] flex items-center justify-center relative overflow-hidden">
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-50" />

                <Icon className={`${iconSize[size]} ${config.iconColor} drop-shadow-md relative z-10`} strokeWidth={2.5} />
            </div>
        </div>
    );
}
