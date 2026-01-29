"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, ChevronRight } from "lucide-react";

interface LessonCardProps {
    moduleId: string;
    lessonId: string;
    title: string;
    description: string;
    emoji: string;
    isComplete: boolean;
    index: number;
}

export function LessonCard({
    moduleId,
    lessonId,
    title,
    description,
    emoji,
    isComplete,
    index,
}: LessonCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
        >
            <Link
                href={`/learn/${moduleId}/${lessonId}`}
                className={`block p-4 rounded-2xl border transition-all group ${isComplete
                        ? "bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/40"
                        : "bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.06]"
                    }`}
            >
                <div className="flex items-center gap-4">
                    <div className="text-3xl">{emoji}</div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white truncate">
                            {title}
                        </h3>
                        <p className="text-sm text-white/60 truncate">
                            {description}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {isComplete ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : (
                            <Circle className="w-5 h-5 text-white/30" />
                        )}
                        <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-white/60 transition-colors" />
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
