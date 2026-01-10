"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/lib/supabase/client";

const REACTION_EMOJIS = ["🚀", "📈", "🔥", "💎", "🤔"] as const;

interface ReactionBarProps {
    postId: string;
    initialReactions?: Record<string, number>;
    userReactions?: string[];
}

export function ReactionBar({ postId, initialReactions = {}, userReactions = [] }: ReactionBarProps) {
    const { user } = useAuth();
    const [reactions, setReactions] = useState<Record<string, number>>(initialReactions);
    const [myReactions, setMyReactions] = useState<string[]>(userReactions);
    const [isAnimating, setIsAnimating] = useState<string | null>(null);

    const handleReaction = async (emoji: string) => {
        if (!user) return;

        const hasReacted = myReactions.includes(emoji);

        // Optimistic update
        setIsAnimating(emoji);
        if (hasReacted) {
            setMyReactions(prev => prev.filter(e => e !== emoji));
            setReactions(prev => ({ ...prev, [emoji]: Math.max(0, (prev[emoji] || 0) - 1) }));
        } else {
            setMyReactions(prev => [...prev, emoji]);
            setReactions(prev => ({ ...prev, [emoji]: (prev[emoji] || 0) + 1 }));
        }

        // Persist to Supabase
        try {
            if (hasReacted) {
                await supabase
                    .from("reactions")
                    .delete()
                    .match({ post_id: postId, user_id: user.id, emoji });
            } else {
                await supabase
                    .from("reactions")
                    .insert({ post_id: postId, user_id: user.id, emoji } as never);
            }
        } catch (error) {
            // Revert on error
            if (hasReacted) {
                setMyReactions(prev => [...prev, emoji]);
                setReactions(prev => ({ ...prev, [emoji]: (prev[emoji] || 0) + 1 }));
            } else {
                setMyReactions(prev => prev.filter(e => e !== emoji));
                setReactions(prev => ({ ...prev, [emoji]: Math.max(0, (prev[emoji] || 0) - 1) }));
            }
        }

        setTimeout(() => setIsAnimating(null), 300);
    };

    return (
        <div className="flex items-center gap-1.5 mt-4">
            {REACTION_EMOJIS.map((emoji) => {
                const count = reactions[emoji] || 0;
                const isActive = myReactions.includes(emoji);

                return (
                    <motion.button
                        key={emoji}
                        onClick={() => handleReaction(emoji)}
                        whileTap={{ scale: 0.9 }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm transition-all border ${isActive
                            ? "bg-emerald-500/20 border-emerald-500/30 text-white"
                            : "bg-white/[0.04] border-white/10 text-white/60 hover:bg-white/[0.08] hover:text-white"
                            }`}
                    >
                        <AnimatePresence mode="wait">
                            <motion.span
                                key={isAnimating === emoji ? "animating" : "static"}
                                initial={{ scale: 1 }}
                                animate={{ scale: isAnimating === emoji ? [1, 1.4, 1] : 1 }}
                                transition={{ duration: 0.3 }}
                                className="text-base"
                            >
                                {emoji}
                            </motion.span>
                        </AnimatePresence>
                        {count > 0 && (
                            <motion.span
                                key={count}
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-xs font-bold tabular-nums"
                            >
                                {count}
                            </motion.span>
                        )}
                    </motion.button>
                );
            })}
        </div>
    );
}
