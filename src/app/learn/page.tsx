"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { GraduationCap, ChevronRight, CheckCircle2, Circle } from "lucide-react";
import { LEARN_CONTENT, TOTAL_LESSONS } from "@/lib/learn-content";
import { ProgressTracker } from "@/components/learn/ProgressTracker";
import { useLearnProgress } from "@/hooks/useLearnProgress";

export default function LearnPage() {
    const { completedCount, getModuleProgress, isLoaded } = useLearnProgress();

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
            >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 mb-4">
                    <GraduationCap className="w-8 h-8 text-emerald-400" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">
                    Ticko Academy
                </h1>
                <p className="text-white/60 max-w-md mx-auto">
                    Learn the basics of trading with bite-sized lessons.
                    No experience needed.
                </p>
            </motion.div>

            {/* Progress Tracker */}
            {isLoaded && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-8"
                >
                    <ProgressTracker
                        completedCount={completedCount}
                        totalCount={TOTAL_LESSONS}
                    />
                </motion.div>
            )}

            {/* Modules */}
            <div className="space-y-4">
                {LEARN_CONTENT.map((module, index) => {
                    const progress = getModuleProgress(
                        module.id,
                        module.lessons.length
                    );
                    const isModuleComplete = progress === 100;

                    return (
                        <motion.div
                            key={module.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + index * 0.1 }}
                        >
                            <Link
                                href={`/learn/${module.id}`}
                                className={`block p-5 rounded-2xl border transition-all group ${isModuleComplete
                                    ? "bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/40"
                                    : "bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.06]"
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="text-4xl">
                                        {module.emoji}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/50">
                                                Module {index + 1}
                                            </span>
                                            {isModuleComplete && (
                                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                            )}
                                        </div>
                                        <h2 className="text-lg font-semibold text-white mb-1">
                                            {module.title}
                                        </h2>
                                        <p className="text-sm text-white/60">
                                            {module.description}
                                        </p>
                                        {/* Module Progress Bar */}
                                        <div className="mt-3 h-1 bg-white/10 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-emerald-400 rounded-full transition-all duration-300"
                                                style={{
                                                    width: `${progress}%`,
                                                }}
                                            />
                                        </div>
                                        <p className="text-xs text-white/40 mt-1">
                                            {module.lessons.length} lessons
                                        </p>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-white/60 transition-colors" />
                                </div>
                            </Link>
                        </motion.div>
                    );
                })}
            </div>

            {/* Footer CTA */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-8 p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 text-center"
            >
                <p className="text-sm text-white/60 mb-2">
                    Ready to put your knowledge to practice?
                </p>
                <Link
                    href="/paper-trading"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-colors"
                >
                    Start Paper Trading
                    <ChevronRight className="w-4 h-4" />
                </Link>
            </motion.div>
        </div>
    );
}
