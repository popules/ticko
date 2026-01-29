"use client";

import { motion } from "framer-motion";
import { Trophy } from "lucide-react";

interface ProgressTrackerProps {
    completedCount: number;
    totalCount: number;
}

export function ProgressTracker({
    completedCount,
    totalCount,
}: ProgressTrackerProps) {
    const percentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
    const isComplete = completedCount === totalCount && totalCount > 0;

    return (
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    {isComplete ? (
                        <Trophy className="w-5 h-5 text-yellow-400" />
                    ) : (
                        <span className="text-lg">📖</span>
                    )}
                    <span className="font-medium text-white">
                        {isComplete ? "Course Complete!" : "Your Progress"}
                    </span>
                </div>
                <span className="text-sm text-white/60">
                    {completedCount}/{totalCount} lessons
                </span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className={`h-full rounded-full ${isComplete
                            ? "bg-gradient-to-r from-yellow-400 to-amber-500"
                            : "bg-gradient-to-r from-emerald-400 to-cyan-400"
                        }`}
                />
            </div>
        </div>
    );
}
