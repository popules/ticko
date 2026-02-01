"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { getLevel, getProgressToNextLevel, getLevelColor, getXpForLevel } from "@/lib/level-system";
import { Sparkles, Trophy } from "lucide-react";

interface XPBarProps {
    xp: number;
    showLevelUp?: boolean;
    onLevelUp?: (newLevel: number) => void;
}

export function XPBar({ xp, showLevelUp = true, onLevelUp }: XPBarProps) {
    const level = getLevel(xp);
    const progress = getProgressToNextLevel(xp);
    const prevLevelRef = useRef(level);
    const isFirstRender = useRef(true);

    // Handle Level Up
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            prevLevelRef.current = level;
            return;
        }

        if (level > prevLevelRef.current && showLevelUp) {
            if (onLevelUp) {
                onLevelUp(level);
            }
            prevLevelRef.current = level;
        }
    }, [level, showLevelUp, onLevelUp]);

    const levelColor = getLevelColor(level);

    return (
        <div className="w-full">
            {/* Level Badge & XP Text */}
            <div className="flex justify-between items-end mb-1.5">
                <div className="flex items-center gap-2">
                    <div className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${levelColor} shadow-[0_0_10px_-3px_currentColor]`}>
                        Lvl {level}
                    </div>
                    <span className="text-xs font-bold text-white/90">
                        Rookie
                    </span>
                </div>
                <div className="text-[10px] text-white/40 font-mono">
                    {progress}%
                </div>
            </div>

            {/* Progress Bar Track */}
            <div className="h-2 w-full bg-white/[0.06] rounded-full overflow-hidden border border-white/5 relative">
                {/* Progress Fill */}
                <motion.div
                    className="h-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-emerald-400 absolute left-0 top-0"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ type: "spring", bounce: 0, duration: 1 }}
                />

                {/* Shimmer Effect */}
                <motion.div
                    className="absolute top-0 bottom-0 right-0 w-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                    initial={{ x: "-100%" }}
                    animate={{ x: "200%" }}
                    transition={{
                        repeat: Infinity,
                        duration: 2,
                        repeatDelay: 3,
                        ease: "linear"
                    }}
                />
            </div>

            <div className="mt-1 text-[9px] text-white/30 text-right">
                Next level: {getXpForLevel(level + 1)} XP
            </div>
        </div>
    );
}
