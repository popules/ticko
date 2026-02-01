"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2, User, Crown, TrendingUp, TrendingDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Database } from "@/types/database";
import { LeagueBadge } from "./LeagueBadge";

type LeagueLeaderboardItem = Database['public']['Tables']['league_placements']['Row'] & {
    profiles: {
        username: string;
        avatar_url: string | null;
        reputation_score: number;
    } | null;
};

interface LeagueLeaderboardProps {
    leagueId: string;
    leagueName: string;
    leagueTier: number;
    currentUserId?: string;
}

export function LeagueLeaderboard({ leagueId, leagueName, leagueTier, currentUserId }: LeagueLeaderboardProps) {
    const { data: leaders, isLoading } = useQuery<LeagueLeaderboardItem[]>({
        queryKey: ["league-leaderboard", leagueId],
        queryFn: async () => {
            const res = await fetch(`/api/league/${leagueId}/leaderboard`);
            if (!res.ok) throw new Error("Failed to fetch league leaderboard");
            return res.json();
        },
    });

    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
        );
    }

    if (!leaders || leaders.length === 0) {
        return (
            <div className="text-center py-12 text-white/40 bg-white/[0.02] rounded-xl border border-white/5">
                No players in this league yet. Be the first!
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* League Header */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <LeagueBadge
                        leagueName={leagueName}
                        tier={leagueTier}
                        className="scale-125 origin-left"
                    />
                    <div className="h-8 w-px bg-white/10 mx-2" />
                    <div>
                        <p className="text-sm text-white/50">Top 3 Promote</p>
                        <p className="text-xs text-emerald-400 font-medium">To {getNextLeagueName(leagueName)}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-sm text-white/50">Bottom 3 Demote</p>
                </div>
            </div>

            {/* List */}
            <div className="bg-white/[0.04] border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl">
                {leaders.map((placement, index) => {
                    if (!placement.profiles) return null;

                    const rank = index + 1;
                    const isCurrentUser = placement.user_id === currentUserId;
                    const isPromoting = rank <= 3;
                    const isDemoting = rank > leaders.length - 3 && leaders.length > 5; // simplified logic

                    return (
                        <Link
                            href={`/profile/${placement.profiles.username}`}
                            key={placement.id}
                            className={`flex items-center gap-4 p-4 border-b border-white/5 transition-colors last:border-0 ${isCurrentUser ? "bg-emerald-500/10 hover:bg-emerald-500/20" : "hover:bg-white/[0.02]"
                                }`}
                        >
                            <div className="w-8 text-center flex flex-col items-center justify-center">
                                <span className={`font-bold ${rank === 1 ? "text-yellow-400 text-lg" :
                                        rank === 2 ? "text-slate-400 text-lg" :
                                            rank === 3 ? "text-orange-400 text-lg" :
                                                "text-white/30"
                                    }`}>
                                    {rank}
                                </span>
                                {isPromoting && rank <= 3 && <TrendingUp className="w-3 h-3 text-emerald-400 mt-1" />}
                                {isDemoting && <TrendingDown className="w-3 h-3 text-rose-400 mt-1" />}
                            </div>

                            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-white/10">
                                {placement.profiles.avatar_url ? (
                                    <Image src={placement.profiles.avatar_url} alt={placement.profiles.username} fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <User className="w-5 h-5 text-white/40" />
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h3 className={`font-bold text-sm truncate ${isCurrentUser ? "text-emerald-400" : "text-white"}`}>
                                        @{placement.profiles.username}
                                    </h3>
                                    {isCurrentUser && (
                                        <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                                            YOU
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-white/40">
                                    {placement.profiles.reputation_score} Reputation
                                </p>
                            </div>

                            {/* Status Indicator */}
                            <div className="text-right">
                                {isPromoting ? (
                                    <span className="text-xs font-bold text-emerald-400">Promotion Zone</span>
                                ) : isDemoting ? (
                                    <span className="text-xs font-bold text-rose-400">Demotion Zone</span>
                                ) : (
                                    <span className="text-xs text-white/20">Safe</span>
                                )}
                            </div>
                        </Link>
                    )
                })}
            </div>
        </div>
    );
}

function getNextLeagueName(current: string): string {
    const sequence = ["Bronze", "Silver", "Gold", "Platinum", "Diamond"];
    const idx = sequence.indexOf(current);
    return idx >= 0 && idx < sequence.length - 1 ? sequence[idx + 1] : "Champion";
}
