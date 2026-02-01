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
        <div className="bg-[#020617]/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <h3 className="font-semibold text-white">Daily Quests</h3>
                </div>
                <span className="text-xs text-white/40">Resets in 12h</span>
            </div>

            <div className="divide-y divide-white/5">
                {data.map((item) => {
                    const progress = item.progress.current_count;
                    const target = item.target_count;
                    const percent = Math.min((progress / target) * 100, 100);
                    const isCompleted = item.progress.is_completed;

                    return (
                        <div key={item.id} className="p-4 hover:bg-white/[0.02] transition-colors group">
                            <div className="flex items-start gap-4">
                                <div className="mt-1">
                                    {isCompleted ? (
                                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                    ) : (
                                        <div className="w-5 h-5 rounded-full border-2 border-white/20 group-hover:border-white/40 transition-colors" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <h4 className={`text-sm font-medium ${isCompleted ? "text-white/50 line-through" : "text-white"}`}>
                                            {item.title}
                                        </h4>
                                        <div className="flex items-center gap-1 text-xs text-yellow-400">
                                            <span>+{item.xp_reward} XP</span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-white/50 mb-3 block truncate">
                                        {item.description}
                                    </p>

                                    {/* Progress Bar */}
                                    <div className="relative h-1.5 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${isCompleted ? "bg-emerald-500" : "bg-yellow-400"
                                                }`}
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>
                                    <div className="mt-1 flex justify-between text-[10px] text-white/40">
                                        <span>{progress} / {target}</span>
                                        {isCompleted && <span className="text-emerald-400 font-medium">Completed</span>}
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
