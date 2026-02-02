"use client";

import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, Trophy } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import Link from "next/link";

function getLeagueFromRating(rating: number) {
    if (rating >= 2500) return { name: "Diamond", color: "text-blue-400", bg: "bg-blue-500/20" };
    if (rating >= 2000) return { name: "Platinum", color: "text-cyan-400", bg: "bg-cyan-500/20" };
    if (rating >= 1500) return { name: "Gold", color: "text-yellow-400", bg: "bg-yellow-500/20" };
    if (rating >= 1000) return { name: "Silver", color: "text-slate-300", bg: "bg-slate-500/20" };
    return { name: "Bronze", color: "text-orange-400", bg: "bg-orange-500/20" };
}

export function QuickStats() {
    const { user } = useAuth();

    const { data: profile } = useQuery({
        queryKey: ["profile-stats", user?.id],
        queryFn: async () => {
            if (!user) return null;
            const { data } = await supabase
                .from("profiles")
                .select("paper_balance, paper_season_pnl, league_rating")
                .eq("id", user.id)
                .single();
            return data;
        },
        enabled: !!user,
    });

    if (!user || !profile) return null;

    const balance = profile.paper_balance || 10000;
    const seasonPnl = profile.paper_season_pnl || 0;
    const pnlPercent = ((balance - 10000) / 10000) * 100;
    const isUp = pnlPercent >= 0;
    const rating = profile.league_rating || 1000;
    const league = getLeagueFromRating(rating);

    return (
        <Link href="/arena" className="block w-full">
            <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.06] transition-colors">
                {/* League */}
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <Trophy className={`w-4 h-4 ${league.color}`} />
                        <span className={`text-xs font-bold ${league.color}`}>
                            {league.name}
                        </span>
                    </div>
                    <span className="text-[10px] text-white/30">
                        {rating} rating
                    </span>
                </div>

                {/* P&L */}
                <div className="flex items-center justify-between">
                    <span className="text-[10px] text-white/40 uppercase tracking-wider">
                        Season P&L
                    </span>
                    <div className={`flex items-center gap-1 text-sm font-bold ${isUp ? "text-emerald-400" : "text-rose-400"}`}>
                        {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {isUp ? "+" : ""}{pnlPercent.toFixed(1)}%
                    </div>
                </div>

                {/* Balance */}
                <div className="mt-1 text-right">
                    <span className="text-[10px] text-white/30">
                        ${balance.toLocaleString()}
                    </span>
                </div>
            </div>
        </Link>
    );
}
