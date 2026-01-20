"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Crown, Trophy, Medal, Award, Star } from "lucide-react";

interface SeasonResult {
    id: string;
    season_id: string;
    final_value: number;
    final_rank: number;
    badges_earned: string[];
    season_name: string;
    season_end_date: string;
}

const BADGE_CONFIG: Record<string, { icon: typeof Crown; label: string; color: string }> = {
    season_winner: { icon: Crown, label: "Season Winner", color: "text-amber-400" },
    top_3: { icon: Trophy, label: "Top 3", color: "text-amber-300" },
    top_10: { icon: Medal, label: "Top 10", color: "text-violet-400" },
    top_100: { icon: Award, label: "Top 100", color: "text-blue-400" },
    survivor: { icon: Star, label: "Participant", color: "text-white/50" },
};

interface SeasonHistoryProps {
    userId: string;
}

export function SeasonHistory({ userId }: SeasonHistoryProps) {
    const [results, setResults] = useState<SeasonResult[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!supabase || !userId) return;

            try {
                // Get user's historical portfolios with season info
                const { data: history, error } = await (supabase as any)
                    .from("historical_portfolios")
                    .select(`
                        id,
                        season_id,
                        final_value,
                        final_rank,
                        badges_earned,
                        seasons (name, end_date)
                    `)
                    .eq("user_id", userId)
                    .order("created_at", { ascending: false });

                if (error) {
                    console.error("Error fetching season history:", error);
                    return;
                }

                const formatted: SeasonResult[] = (history || []).map((h: any) => ({
                    id: h.id,
                    season_id: h.season_id,
                    final_value: h.final_value,
                    final_rank: h.final_rank,
                    badges_earned: h.badges_earned || [],
                    season_name: h.seasons?.name || "Unknown Season",
                    season_end_date: h.seasons?.end_date || "",
                }));

                setResults(formatted);
            } catch (err) {
                console.error("Season history fetch error:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchHistory();
    }, [userId]);

    if (isLoading) {
        return (
            <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] animate-pulse">
                <div className="h-4 w-32 bg-white/10 rounded mb-4"></div>
                <div className="space-y-3">
                    <div className="h-12 bg-white/5 rounded-xl"></div>
                    <div className="h-12 bg-white/5 rounded-xl"></div>
                </div>
            </div>
        );
    }

    if (results.length === 0) {
        return null; // Don't show anything if no history
    }

    // Count total badges
    const allBadges = results.flatMap((r) => r.badges_earned);
    const badgeCounts: Record<string, number> = {};
    for (const badge of allBadges) {
        badgeCounts[badge] = (badgeCounts[badge] || 0) + 1;
    }

    // Best finish
    const bestRank = Math.min(...results.map((r) => r.final_rank));
    const wins = results.filter((r) => r.final_rank === 1).length;

    return (
        <div className="p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-amber-500/5 to-transparent">
            <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-widest">Season History</h3>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="p-3 rounded-xl bg-white/[0.04] text-center">
                    <p className="text-lg font-black text-white">{results.length}</p>
                    <p className="text-[10px] text-white/40 uppercase">Seasons</p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.04] text-center">
                    <p className="text-lg font-black text-amber-400">{wins}</p>
                    <p className="text-[10px] text-white/40 uppercase">Wins</p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.04] text-center">
                    <p className="text-lg font-black text-emerald-400">#{bestRank}</p>
                    <p className="text-[10px] text-white/40 uppercase">Best</p>
                </div>
            </div>

            {/* Badge Collection */}
            {Object.keys(badgeCounts).length > 0 && (
                <div className="mb-4">
                    <p className="text-xs text-white/40 mb-2 uppercase tracking-wider">Badges</p>
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(badgeCounts)
                            .filter(([badge]) => badge !== "survivor") // Hide survivor since everyone gets it
                            .map(([badge, count]) => {
                                const config = BADGE_CONFIG[badge];
                                if (!config) return null;
                                const Icon = config.icon;
                                return (
                                    <div
                                        key={badge}
                                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/10"
                                        title={config.label}
                                    >
                                        <Icon className={`w-3.5 h-3.5 ${config.color}`} />
                                        <span className="text-xs text-white/70">{config.label}</span>
                                        {count > 1 && (
                                            <span className="text-[10px] text-white/40">×{count}</span>
                                        )}
                                    </div>
                                );
                            })}
                    </div>
                </div>
            )}

            {/* Season Results */}
            <div className="space-y-2">
                {results.slice(0, 5).map((result) => (
                    <div
                        key={result.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5"
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${result.final_rank === 1 ? "bg-amber-500/20" :
                                result.final_rank <= 3 ? "bg-violet-500/20" :
                                    "bg-white/5"
                                }`}>
                                {result.final_rank === 1 ? (
                                    <Crown className="w-4 h-4 text-amber-400" />
                                ) : (
                                    <span className="text-sm font-bold text-white/60">#{result.final_rank}</span>
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white">{result.season_name}</p>
                                <p className="text-[10px] text-white/40">
                                    {result.season_end_date
                                        ? new Date(result.season_end_date).toLocaleDateString("en-US", { month: "short", year: "numeric" })
                                        : ""}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-bold text-emerald-400 tabular-nums">
                                {result.final_value.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
