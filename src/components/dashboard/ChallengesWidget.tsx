"use client";

import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Circle, Trophy, Zap } from "lucide-react";
import { Challenge, UserChallenge } from "@/types/database";

interface ChallengeWithProgress extends Challenge {
    progress: UserChallenge;
}

export function ChallengesWidget() {
    const { data, isLoading } = useQuery({
        queryKey: ["active-challenges"],
        queryFn: async () => {
            const res = await fetch("/api/challenges/active");
            if (!res.ok) throw new Error("Failed to fetch challenges");
            const json = await res.json();
            return json.challenges as ChallengeWithProgress[];
        },
    });

    if (isLoading || !data || data.length === 0) {
        return null; // Or skeleton
    }

    return (
        <div className="bg-[#020617]/50 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
            <div className="px-3 py-2.5 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <h3 className="text-xs font-semibold text-white">Daily Quests</h3>
                </div>
                <span className="text-[10px] text-white/40">{data.filter(d => d.progress.is_completed).length} / {data.length}</span>
            </div>

            <div className="divide-y divide-white/5">
                {data.map((item) => {
                    const progress = item.progress.current_count;
                    const target = item.target_count;
                    const percent = Math.min((progress / target) * 100, 100);
                    const isCompleted = item.progress.is_completed;

                    return (
                        <div key={item.id} className="px-3 py-2.5 hover:bg-white/[0.02] transition-colors group">
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5">
                                    {isCompleted ? (
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                    ) : (
                                        <div className="w-4 h-4 rounded-full border-2 border-white/20 group-hover:border-white/40 transition-colors" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-0.5">
                                        <h4 className={`text-xs font-medium ${isCompleted ? "text-white/50 line-through" : "text-white"}`}>
                                            {item.title}
                                        </h4>
                                        <span className="text-[10px] text-yellow-400">+{item.xp_reward}</span>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="relative h-1 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${isCompleted ? "bg-emerald-500" : "bg-yellow-400"
                                                }`}
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>
                                    <div className="mt-0.5 text-[9px] text-white/40">
                                        {progress} / {target}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
