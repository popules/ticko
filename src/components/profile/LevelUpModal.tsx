"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { getXpForLevel } from "@/lib/level-system";
import { X, Trophy, Share2 } from "lucide-react";

interface LevelUpModalProps {
    isOpen: boolean;
    level: number;
    onClose: () => void;
}

export function LevelUpModal({ isOpen, level, onClose }: LevelUpModalProps) {
    useEffect(() => {
        if (isOpen) {
            // Fire confetti from center
            const duration = 3000;
            const end = Date.now() + duration;

            const frame = () => {
                confetti({
                    particleCount: 5,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: ['#a78bfa', '#34d399', '#f472b6']
                });
                confetti({
                    particleCount: 5,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: ['#a78bfa', '#34d399', '#f472b6']
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            };

            frame();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.8, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.8, opacity: 0, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="relative w-full max-w-sm bg-[#0B0F17] border border-emerald-500/20 rounded-[2rem] overflow-hidden"
                >
                    {/* Background Effects */}
                    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-emerald-500/10 to-transparent" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-emerald-500/20 blur-[60px] rounded-full" />

                    <div className="relative p-8 flex flex-col items-center text-center space-y-6">
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 text-white/30 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Icon */}
                        <div className="relative">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 rounded-full border border-dashed border-emerald-500/30"
                            />
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-blue-600 flex items-center justify-center p-[2px] shadow-2xl shadow-emerald-500/20">
                                <div className="w-full h-full rounded-full bg-[#0B0F17] flex items-center justify-center">
                                    <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 to-blue-400">
                                        {level}
                                    </span>
                                </div>
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-black p-2 rounded-xl shadow-lg border-4 border-[#0B0F17]">
                                <Trophy className="w-5 h-5 fill-current" />
                            </div>
                        </div>

                        {/* Text */}
                        <div className="space-y-2">
                            <h2 className="text-3xl font-black text-white tracking-tighter">
                                LEVEL UP!
                            </h2>
                            <p className="text-white/60 text-sm">
                                Congratulations! You've reached Level {level}.
                                <br />
                                Keep trading to unlock more rewards.
                            </p>
                        </div>

                        {/* XP Info */}
                        <div className="w-full p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-2">
                            <div className="flex justify-between text-xs text-white/50">
                                <span>Next Level</span>
                                <span>{getXpForLevel(level + 1)} XP</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full w-[0%] bg-emerald-500" />
                            </div>
                        </div>

                        {/* Action */}
                        <button
                            onClick={onClose}
                            className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold transition-all shadow-lg shadow-emerald-500/20 transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                            Awesome!
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
