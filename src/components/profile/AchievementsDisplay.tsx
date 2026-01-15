"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Sparkles, Lock } from "lucide-react";
import {
    ACHIEVEMENTS,
    Achievement,
    RARITY_COLORS,
    RARITY_NAMES,
    getUserAchievements
} from "@/lib/achievements";

interface AchievementsDisplayProps {
    userId: string;
    compact?: boolean;
}

export function AchievementsDisplay({ userId, compact = false }: AchievementsDisplayProps) {
    const [userAchievements, setUserAchievements] = useState<Achievement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAll, setShowAll] = useState(false);

    useEffect(() => {
        async function load() {
            setIsLoading(true);
            const achievements = await getUserAchievements(userId);
            setUserAchievements(achievements);
            setIsLoading(false);
        }
        load();
    }, [userId]);

    const allAchievements = Object.values(ACHIEVEMENTS);
    const unlockedKeys = new Set(userAchievements.map(a => a.key));

    // Sort: unlocked first, then by rarity
    const rarityOrder = { legendary: 0, epic: 1, rare: 2, uncommon: 3, common: 4 };
    const sortedAchievements = [...allAchievements].sort((a, b) => {
        const aUnlocked = unlockedKeys.has(a.key);
        const bUnlocked = unlockedKeys.has(b.key);
        if (aUnlocked !== bUnlocked) return aUnlocked ? -1 : 1;
        return rarityOrder[a.rarity] - rarityOrder[b.rarity];
    });

    const displayAchievements = showAll ? sortedAchievements : sortedAchievements.slice(0, compact ? 6 : 12);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (compact) {
        // Compact view for profile header
        return (
            <div className="flex flex-wrap gap-2">
                {userAchievements.slice(0, 5).map((achievement) => (
                    <motion.div
                        key={achievement.key}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={`px-2 py-1 rounded-lg border text-xs font-medium flex items-center gap-1 ${RARITY_COLORS[achievement.rarity]}`}
                        title={`${achievement.name}: ${achievement.description}`}
                    >
                        <span>{achievement.emoji}</span>
                        <span className="hidden sm:inline">{achievement.name}</span>
                    </motion.div>
                ))}
                {userAchievements.length > 5 && (
                    <span className="px-2 py-1 rounded-lg bg-white/5 text-white/40 text-xs font-medium">
                        +{userAchievements.length - 5}
                    </span>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-400" />
                    <h3 className="text-lg font-bold text-white">Prestationer</h3>
                    <span className="text-xs text-white/40">
                        {userAchievements.length}/{allAchievements.length}
                    </span>
                </div>
                {allAchievements.length > 12 && (
                    <button
                        onClick={() => setShowAll(!showAll)}
                        className="text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                    >
                        {showAll ? "Visa färre" : "Visa alla"}
                    </button>
                )}
            </div>

            {/* Progress bar */}
            <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(userAchievements.length / allAchievements.length) * 100}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                />
            </div>

            {/* Achievements grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                <AnimatePresence mode="popLayout">
                    {displayAchievements.map((achievement, index) => {
                        const isUnlocked = unlockedKeys.has(achievement.key);

                        return (
                            <motion.div
                                key={achievement.key}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`relative p-4 rounded-2xl border transition-all ${isUnlocked
                                        ? `${RARITY_COLORS[achievement.rarity]} hover:scale-105`
                                        : "bg-white/[0.02] border-white/5 opacity-40"
                                    }`}
                            >
                                {/* Locked overlay */}
                                {!isUnlocked && (
                                    <div className="absolute inset-0 flex items-center justify-center rounded-2xl">
                                        <Lock className="w-5 h-5 text-white/20" />
                                    </div>
                                )}

                                {/* Content */}
                                <div className={`${!isUnlocked ? "blur-[2px]" : ""}`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-2xl">{achievement.emoji}</span>
                                        {isUnlocked && (
                                            <Sparkles className="w-4 h-4 text-amber-400" />
                                        )}
                                    </div>
                                    <h4 className="text-sm font-bold text-white mb-1 truncate">
                                        {achievement.name}
                                    </h4>
                                    <p className="text-[10px] text-white/50 leading-tight line-clamp-2">
                                        {achievement.description}
                                    </p>
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-[9px] font-bold uppercase tracking-wider text-white/30">
                                            {RARITY_NAMES[achievement.rarity]}
                                        </span>
                                        <span className="text-[10px] font-bold text-emerald-400">
                                            +{achievement.points}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
}
