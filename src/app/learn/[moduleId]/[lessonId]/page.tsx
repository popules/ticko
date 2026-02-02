"use client";

import { notFound } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, CheckCircle2, ExternalLink } from "lucide-react";
import {
    getModuleById,
    getLessonById,
    getNextLesson,
    LEARN_CONTENT,
} from "@/lib/learn-content";
import { useLearnProgress } from "@/hooks/useLearnProgress";
import { use, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import confetti from "canvas-confetti";

interface LessonPageProps {
    params: Promise<{ moduleId: string; lessonId: string }>;
}

export default function LessonPage({ params }: LessonPageProps) {
    const { moduleId, lessonId } = use(params);
    const module = getModuleById(moduleId);
    const lesson = getLessonById(moduleId, lessonId);
    const { markLessonComplete, isLessonComplete, isLoaded, mutationData } = useLearnProgress();
    const [showCelebration, setShowCelebration] = useState(false);

    // Mark as complete when user views the lesson
    useEffect(() => {
        if (isLoaded && lesson && !isLessonComplete(moduleId, lessonId)) {
            // Small delay so user actually sees the content
            const timer = setTimeout(() => {
                markLessonComplete(moduleId, lessonId);
            }, 2000); // 2 seconds
            return () => clearTimeout(timer);
        }
    }, [isLoaded, lesson, moduleId, lessonId, markLessonComplete, isLessonComplete]);

    // Handle celebration when XP is awarded
    useEffect(() => {
        if (mutationData?.success && mutationData?.xpAwarded > 0) {
            setShowCelebration(true);
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ["#10b981", "#34d399", "#6ee7b7", "#ffffff"]
            });
            const timer = setTimeout(() => setShowCelebration(false), 4000);
            return () => clearTimeout(timer);
        }
    }, [mutationData]);

    if (!module || !lesson) {
        notFound();
    }

    const lessonIndex = module.lessons.findIndex((l) => l.id === lessonId);
    const prevLesson = lessonIndex > 0 ? module.lessons[lessonIndex - 1] : null;
    const nextLessonInfo = getNextLesson(moduleId, lessonId);
    const isComplete = isLessonComplete(moduleId, lessonId);

    return (
        <div className="max-w-2xl mx-auto px-4 py-8 relative">
            {/* XP Celebration Toast */}
            <AnimatePresence>
                {showCelebration && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: -20 }}
                        className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none"
                    >
                        <div className="bg-emerald-500 text-[#020617] px-6 py-3 rounded-2xl font-black shadow-2xl shadow-emerald-500/40 flex items-center gap-3">
                            <span className="text-xl">🎓</span>
                            <div className="flex flex-col">
                                <span className="text-xs uppercase tracking-widest opacity-70">Lesson Complete!</span>
                                <span className="text-lg">+10 XP Reputation</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Breadcrumb */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-6 flex items-center gap-2 text-sm"
            >
                <Link
                    href="/learn"
                    className="text-white/60 hover:text-white transition-colors"
                >
                    Academy
                </Link>
                <span className="text-white/30">/</span>
                <Link
                    href={`/learn/${moduleId}`}
                    className="text-white/60 hover:text-white transition-colors"
                >
                    {module.title}
                </Link>
                <span className="text-white/30">/</span>
                <span className="text-white">{lesson.title}</span>
            </motion.div>

            {/* Lesson Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="flex items-start gap-4 mb-4">
                    <div className="text-5xl">{lesson.emoji}</div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/50">
                                Lesson {lessonIndex + 1} of{" "}
                                {module.lessons.length}
                            </span>
                            {isComplete && (
                                <span className="flex items-center gap-1 text-xs text-emerald-400">
                                    <CheckCircle2 className="w-3 h-3" />
                                    Complete
                                </span>
                            )}
                        </div>
                        <h1 className="text-2xl font-bold text-white">
                            {lesson.title}
                        </h1>
                        <p className="text-white/60">{lesson.description}</p>
                    </div>
                </div>
            </motion.div>

            {/* Lesson Content */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="prose prose-invert prose-emerald max-w-none mb-8"
            >
                <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 prose prose-invert prose-emerald prose-p:text-white/80 prose-strong:text-white prose-li:text-white/80 max-w-none">
                    <ReactMarkdown>
                        {lesson.content}
                    </ReactMarkdown>
                </div>
            </motion.div>

            {/* CTA Button */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-8"
            >
                <Link
                    href={lesson.ctaLink}
                    className="flex items-center justify-center gap-2 w-full p-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold hover:opacity-90 transition-opacity"
                >
                    {lesson.ctaText}
                    <ExternalLink className="w-4 h-4" />
                </Link>
            </motion.div>

            {/* Navigation */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex justify-between gap-4"
            >
                {prevLesson ? (
                    <Link
                        href={`/learn/${moduleId}/${prevLesson.id}`}
                        className="flex-1 p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all group"
                    >
                        <div className="flex items-center gap-2 text-white/60 group-hover:text-white">
                            <ChevronLeft className="w-4 h-4" />
                            <span className="text-sm">Previous</span>
                        </div>
                        <p className="text-white font-medium truncate">
                            {prevLesson.title}
                        </p>
                    </Link>
                ) : (
                    <Link
                        href={`/learn/${moduleId}`}
                        className="flex-1 p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all group"
                    >
                        <div className="flex items-center gap-2 text-white/60 group-hover:text-white">
                            <ChevronLeft className="w-4 h-4" />
                            <span className="text-sm">Back to</span>
                        </div>
                        <p className="text-white font-medium truncate">
                            {module.title}
                        </p>
                    </Link>
                )}

                {nextLessonInfo ? (
                    <Link
                        href={`/learn/${nextLessonInfo.moduleId}/${nextLessonInfo.lessonId}`}
                        className="flex-1 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-500/40 transition-all group text-right"
                    >
                        <div className="flex items-center justify-end gap-2 text-emerald-400">
                            <span className="text-sm">Next Lesson</span>
                            <ChevronRight className="w-4 h-4" />
                        </div>
                        <p className="text-white font-medium truncate">
                            {getLessonById(
                                nextLessonInfo.moduleId,
                                nextLessonInfo.lessonId
                            )?.title}
                        </p>
                    </Link>
                ) : (
                    <Link
                        href="/learn"
                        className="flex-1 p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 hover:border-emerald-500/40 transition-all group text-right"
                    >
                        <div className="flex items-center justify-end gap-2 text-emerald-400">
                            <span className="text-sm">Finished!</span>
                            <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <p className="text-white font-medium">
                            Back to Academy
                        </p>
                    </Link>
                )}
            </motion.div>
        </div>
    );
}
