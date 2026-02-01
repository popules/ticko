"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { GraduationCap, Play, CheckCircle2, ArrowRight } from "lucide-react";
import { LEARN_CONTENT, Module, Lesson } from "@/lib/learn-content";
import { useLearnProgress } from "@/hooks/useLearnProgress";

export function DashboardAcademyCard() {
    const { isLessonComplete, isLoaded } = useLearnProgress();

    // Find the first incomplete lesson
    const nextLesson = useMemo(() => {
        if (!isLoaded) return null;

        for (const module of LEARN_CONTENT) {
            for (const lesson of module.lessons) {
                if (!isLessonComplete(module.id, lesson.id)) {
                    return { module, lesson };
                }
            }
        }
        return null; // All done
    }, [isLoaded, isLessonComplete]);

    if (!isLoaded) return null;

    // If all lessons are complete, maybe show nothing or a "You're a master!" card
    // For now, let's hide it to avoid clutter if they are done.
    if (!nextLesson) return null;

    const { module, lesson } = nextLesson;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-1 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30"
        >
            <div className="bg-[#020617]/80 backdrop-blur-md rounded-xl p-5 relative overflow-hidden group">
                {/* Background Decor */}
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors" />

                <div className="relative z-10 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">

                    <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                            <GraduationCap className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium text-emerald-400 uppercase tracking-wider">
                                    Up Next in Academy
                                </span>
                                <span className="text-xs px-1.5 py-0.5 rounded bg-white/10 text-white/50 border border-white/5">
                                    +10 XP
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-white mb-1">
                                {lesson.title}
                            </h3>
                            <p className="text-sm text-white/60 line-clamp-1">
                                {module.emoji} {module.title} • {lesson.description}
                            </p>
                        </div>
                    </div>

                    <Link
                        href={`/learn/${module.id}/${lesson.id}`}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                    >
                        <Play className="w-4 h-4 fill-current" />
                        Start Lesson
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}
