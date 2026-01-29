"use client";

import { notFound } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getModuleById, LEARN_CONTENT } from "@/lib/learn-content";
import { LessonCard } from "@/components/learn/LessonCard";
import { useLearnProgress } from "@/hooks/useLearnProgress";
import { use } from "react";

interface ModulePageProps {
    params: Promise<{ moduleId: string }>;
}

export default function ModulePage({ params }: ModulePageProps) {
    const { moduleId } = use(params);
    const module = getModuleById(moduleId);
    const { isLessonComplete, getModuleProgress, isLoaded } = useLearnProgress();

    if (!module) {
        notFound();
    }

    const moduleIndex = LEARN_CONTENT.findIndex((m) => m.id === moduleId);
    const prevModule = moduleIndex > 0 ? LEARN_CONTENT[moduleIndex - 1] : null;
    const nextModule =
        moduleIndex < LEARN_CONTENT.length - 1
            ? LEARN_CONTENT[moduleIndex + 1]
            : null;

    const progress = getModuleProgress(moduleId, module.lessons.length);

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            {/* Back Link */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-6"
            >
                <Link
                    href="/learn"
                    className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Back to Academy
                </Link>
            </motion.div>

            {/* Module Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="flex items-center gap-4 mb-4">
                    <div className="text-5xl">{module.emoji}</div>
                    <div>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/50">
                            Module {moduleIndex + 1}
                        </span>
                        <h1 className="text-2xl font-bold text-white mt-1">
                            {module.title}
                        </h1>
                        <p className="text-white/60">{module.description}</p>
                    </div>
                </div>

                {/* Progress Bar */}
                {isLoaded && (
                    <div className="bg-white/[0.03] rounded-xl p-3 border border-white/10">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-white/60">Progress</span>
                            <span className="text-emerald-400 font-medium">
                                {Math.round(progress)}%
                            </span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                                className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full"
                            />
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Lessons */}
            <div className="space-y-3 mb-8">
                {module.lessons.map((lesson, index) => (
                    <LessonCard
                        key={lesson.id}
                        moduleId={moduleId}
                        lessonId={lesson.id}
                        title={lesson.title}
                        description={lesson.description}
                        emoji={lesson.emoji}
                        isComplete={isLessonComplete(moduleId, lesson.id)}
                        index={index}
                    />
                ))}
            </div>

            {/* Navigation */}
            <div className="flex justify-between gap-4">
                {prevModule ? (
                    <Link
                        href={`/learn/${prevModule.id}`}
                        className="flex-1 p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all group"
                    >
                        <div className="flex items-center gap-2 text-white/60 group-hover:text-white">
                            <ChevronLeft className="w-4 h-4" />
                            <span className="text-sm">Previous</span>
                        </div>
                        <p className="text-white font-medium truncate">
                            {prevModule.title}
                        </p>
                    </Link>
                ) : (
                    <div className="flex-1" />
                )}

                {nextModule ? (
                    <Link
                        href={`/learn/${nextModule.id}`}
                        className="flex-1 p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all group text-right"
                    >
                        <div className="flex items-center justify-end gap-2 text-white/60 group-hover:text-white">
                            <span className="text-sm">Next</span>
                            <ChevronRight className="w-4 h-4" />
                        </div>
                        <p className="text-white font-medium truncate">
                            {nextModule.title}
                        </p>
                    </Link>
                ) : (
                    <div className="flex-1" />
                )}
            </div>
        </div>
    );
}
