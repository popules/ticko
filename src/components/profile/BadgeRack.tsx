"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { Sparkles, Pen, Eye, Heart, Trophy, Shield } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const ICON_MAP: Record<string, any> = {
    Sparkles,
    Pen,
    Eye,
    Heart,
    Trophy,
    Shield
};

const COLOR_MAP: Record<string, string> = {
    common: "bg-slate-500/20 text-slate-400 border-slate-500/20",
    rare: "bg-blue-500/20 text-blue-400 border-blue-500/20",
    epic: "bg-purple-500/20 text-purple-400 border-purple-500/20",
    legendary: "bg-amber-500/20 text-amber-400 border-amber-500/20",
};

export function BadgeRack({ userId }: { userId: string }) {
    const { data: badges } = useQuery({
        queryKey: ["badges", userId],
        queryFn: async () => {
            const { data } = await supabase
                .from("user_achievements")
                .select(`
                    id,
                    achievements (
                        name,
                        description,
                        icon_name,
                        rarity
                    )
                `)
                .eq("user_id", userId);

            return data?.map((d: any) => d.achievements) || [];
        },
    });

    if (!badges || badges.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-2 mt-4">
            {badges.map((badge: any, i: number) => {
                const Icon = ICON_MAP[badge.icon_name] || Trophy;
                const style = COLOR_MAP[badge.rarity] || COLOR_MAP.common;

                return (
                    <div key={i} className="group relative">
                        <div className={`p-2 rounded-lg border ${style} backdrop-blur-sm transition-transform hover:scale-105 cursor-help`}>
                            <Icon className="w-4 h-4" />
                        </div>

                        {/* Custom Tooltip (Simple CSS hover for speed) */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-[#020617] border border-white/10 rounded-xl text-center opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl">
                            <p className="font-bold text-xs text-white mb-1">{badge.name}</p>
                            <p className="text-[10px] text-white/50 leading-tight">{badge.description}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
