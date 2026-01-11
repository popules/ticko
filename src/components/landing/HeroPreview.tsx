"use client";

import { motion } from "framer-motion";
import { Trophy, TrendingUp, MessageCircle } from "lucide-react";

export function HeroPreview() {
    return (
        <div className="relative w-full max-w-5xl mx-auto -mt-10 mb-32 perspective-[2000px]">
            {/* Glow effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-emerald-500/20 blur-[120px] rounded-full" />

            <motion.div
                initial={{ rotateX: 20, y: 100, opacity: 0 }}
                animate={{ rotateX: 10, y: 0, opacity: 1 }}
                transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                className="relative bg-[#0B0F17] border border-white/10 rounded-2xl shadow-2xl overflow-hidden transform-style-3d rotate-x-12"
            >
                {/* Mock Browser Bar */}
                <div className="h-10 border-b border-white/10 bg-white/[0.02] flex items-center px-4 gap-2">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-rose-500/20 border border-rose-500/50" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                        <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50" />
                    </div>
                    <div className="ml-4 h-6 w-64 bg-white/5 rounded-md flex items-center px-3">
                        <span className="text-[10px] text-white/20">ticka.se</span>
                    </div>
                </div>

                {/* Mock Content */}
                <div className="p-6 grid grid-cols-12 gap-6 h-[500px] overflow-hidden opacity-80">
                    {/* Sidebar Mock */}
                    <div className="col-span-3 border-r border-white/10 pr-6 space-y-4">
                        <div className="h-8 w-8 bg-emerald-500/20 rounded-lg mb-8" />
                        <div className="space-y-2">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="h-10 w-full bg-white/5 rounded-xl" />
                            ))}
                        </div>
                    </div>

                    {/* Feed Mock */}
                    <div className="col-span-6 space-y-4">
                        <div className="h-20 w-full bg-emerald-500/5 border border-emerald-500/20 rounded-2xl mb-6 flex items-center p-4 gap-4">
                            <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div>
                                <div className="h-3 w-32 bg-emerald-500/20 rounded mb-2" />
                                <div className="h-2 w-48 bg-white/10 rounded" />
                            </div>
                        </div>

                        {[1, 2].map(i => (
                            <div key={i} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white/10" />
                                    <div className="space-y-1">
                                        <div className="h-3 w-24 bg-white/10 rounded" />
                                        <div className="h-2 w-16 bg-white/5 rounded" />
                                    </div>
                                </div>
                                <div className="h-16 w-full bg-white/5 rounded-xl" />
                            </div>
                        ))}
                    </div>

                    {/* Right Panel Mock */}
                    <div className="col-span-3 border-l border-white/10 pl-6 space-y-6">
                        <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                            <div className="flex items-center gap-2 mb-4">
                                <Trophy className="w-4 h-4 text-amber-500" />
                                <span className="text-xs font-bold text-white/60">TOPPLISTAN</span>
                            </div>
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex items-center gap-3 mb-3 last:mb-0">
                                    <div className="w-6 h-6 rounded-full bg-white/10" />
                                    <div className="h-2 w-16 bg-white/10 rounded" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
