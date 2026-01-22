"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/lib/supabase/client";
import { SmilePlus } from "lucide-react";

const REACTION_EMOJIS = ["🚀", "📈", "🔥", "💎", "🤔"] as const;

interface ReactionBarProps {
    postId?: string;
    commentId?: string;
    initialReactions?: Record<string, number>;
    userReactions?: string[];
    compact?: boolean; // For comments
}

export function ReactionBar({
    postId,
    commentId,
    initialReactions = {},
    userReactions = [],
    compact = false,
}: ReactionBarProps) {
    const { user } = useAuth();
    const [reactions, setReactions] = useState<Record<string, number>>(initialReactions);
    const [myReactions, setMyReactions] = useState<string[]>(userReactions);
    const [isOpen, setIsOpen] = useState(false);
    const [isAnimating, setIsAnimating] = useState<string | null>(null);
    const pickerRef = useRef<HTMLDivElement>(null);

    // Close picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

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
            const matchCondition = commentId
                ? { comment_id: commentId, user_id: user.id, emoji }
                : { post_id: postId, user_id: user.id, emoji };

            if (hasReacted) {
                await supabase.from("reactions").delete().match(matchCondition);
            } else {
                const insertData = commentId
                    ? { comment_id: commentId, user_id: user.id, emoji }
                    : { post_id: postId, user_id: user.id, emoji };
                await supabase.from("reactions").insert(insertData as never);
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

    // Count total reactions for display on the trigger button
    const totalReactions = Object.values(reactions).reduce((sum, count) => sum + count, 0);
    // Get top reaction emoji for display
    const topEmoji = Object.entries(reactions).sort((a, b) => b[1] - a[1])[0]?.[0];

    return (
        <div className={`relative inline-flex ${compact ? "mt-1" : "mt-4"}`} ref={pickerRef}>
            {/* Trigger Button */}
            <button
                onClick={() => user && setIsOpen(!isOpen)}
                className={`flex items-center gap-1.5 rounded-lg transition-all border ${totalReactions > 0
                        ? "bg-white/[0.06] border-white/10 text-white/80"
                        : "bg-white/[0.04] border-white/10 text-white/40 hover:text-white/60"
                    } ${compact ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm"}`}
                title={user ? "Add reaction" : "Log in to react"}
            >
                {topEmoji ? (
                    <span className={compact ? "text-sm" : "text-base"}>{topEmoji}</span>
                ) : (
                    <SmilePlus className={compact ? "w-3 h-3" : "w-4 h-4"} />
                )}
                {totalReactions > 0 && (
                    <span className="font-bold tabular-nums">{totalReactions}</span>
                )}
            </button>

            {/* Reaction Picker Popup */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 5 }}
                        transition={{ duration: 0.15 }}
                        className="absolute bottom-full mb-2 left-0 z-50 flex items-center gap-1 px-2 py-1.5 bg-[#0B0F17] border border-white/20 rounded-xl shadow-xl"
                    >
                        {REACTION_EMOJIS.map((emoji) => {
                            const isActive = myReactions.includes(emoji);
                            const count = reactions[emoji] || 0;

                            return (
                                <motion.button
                                    key={emoji}
                                    onClick={() => handleReaction(emoji)}
                                    whileTap={{ scale: 0.85 }}
                                    whileHover={{ scale: 1.2 }}
                                    className={`relative flex flex-col items-center px-2 py-1 rounded-lg transition-colors ${isActive
                                            ? "bg-emerald-500/20"
                                            : "hover:bg-white/10"
                                        }`}
                                >
                                    <motion.span
                                        animate={{ scale: isAnimating === emoji ? [1, 1.3, 1] : 1 }}
                                        transition={{ duration: 0.2 }}
                                        className="text-xl"
                                    >
                                        {emoji}
                                    </motion.span>
                                    {count > 0 && (
                                        <span className="text-[10px] font-bold text-white/60 tabular-nums">
                                            {count}
                                        </span>
                                    )}
                                </motion.button>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
