"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import type { ReactionType } from "@/types/database";

interface ReactionButtonsProps {
    postId: string;
    upCount: number;
    downCount: number;
    userReaction?: ReactionType | null;
}

export function ReactionButtons({
    postId,
    upCount: initialUpCount,
    downCount: initialDownCount,
    userReaction: initialUserReaction,
}: ReactionButtonsProps) {
    const { user } = useAuth();
    const [upCount, setUpCount] = useState(initialUpCount);
    const [downCount, setDownCount] = useState(initialDownCount);
    const [userReaction, setUserReaction] = useState<ReactionType | null>(
        initialUserReaction ?? null
    );
    const [isLoading, setIsLoading] = useState(false);

    const handleReaction = async (type: ReactionType) => {
        if (!user || !isSupabaseConfigured || !supabase || isLoading) return;

        setIsLoading(true);

        try {
            if (userReaction === type) {
                // Remove reaction
                await supabase
                    .from("reactions")
                    .delete()
                    .eq("post_id", postId)
                    .eq("user_id", user.id);

                if (type === "up") setUpCount((c) => c - 1);
                else setDownCount((c) => c - 1);
                setUserReaction(null);
            } else {
                // Add or change reaction
                if (userReaction) {
                    // Update existing
                    await supabase
                        .from("reactions")
                        .update({ reaction_type: type } as never)
                        .eq("post_id", postId)
                        .eq("user_id", user.id);

                    if (userReaction === "up") {
                        setUpCount((c) => c - 1);
                        setDownCount((c) => c + 1);
                    } else {
                        setUpCount((c) => c + 1);
                        setDownCount((c) => c - 1);
                    }
                } else {
                    // Insert new
                    await supabase.from("reactions").insert({
                        post_id: postId,
                        user_id: user.id,
                        reaction_type: type,
                    } as never);

                    if (type === "up") setUpCount((c) => c + 1);
                    else setDownCount((c) => c + 1);
                }
                setUserReaction(type);
            }
        } catch (error) {
            console.error("Reaction error:", error);
        }

        setIsLoading(false);
    };

    return (
        <div className="flex items-center gap-3">
            <button
                onClick={() => handleReaction("up")}
                disabled={!user || isLoading}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all ${userReaction === "up"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-white/[0.04] text-white/50 hover:bg-white/[0.08] hover:text-white border border-transparent"
                    } ${!user ? "opacity-50 cursor-not-allowed" : ""}`}
            >
                <ThumbsUp className="w-4 h-4" />
                <span className="tabular-nums">{upCount}</span>
            </button>
            <button
                onClick={() => handleReaction("down")}
                disabled={!user || isLoading}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all ${userReaction === "down"
                    ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                    : "bg-white/[0.04] text-white/50 hover:bg-white/[0.08] hover:text-white border border-transparent"
                    } ${!user ? "opacity-50 cursor-not-allowed" : ""}`}
            >
                <ThumbsDown className="w-4 h-4" />
                <span className="tabular-nums">{downCount}</span>
            </button>
        </div>
    );
}
