"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/lib/supabase/client";
import { awardXp } from "@/lib/achievements";
import { XP_PER_COMMENT } from "@/lib/level-system";

interface CommentFormProps {
    postId: string;
    postOwnerId?: string; // ID of the user who owns the post
    onCommentAdded?: () => void;
}

export function CommentForm({ postId, postOwnerId, onCommentAdded }: CommentFormProps) {
    const { user } = useAuth();
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || !user) return;

        setIsSubmitting(true);
        try {
            const { error } = await (supabase as any)
                .from("comments")
                .insert({
                    post_id: postId,
                    user_id: user.id,
                    content: content.trim()
                });

            if (error) throw error;

            // Create notification for post owner (if not commenting on own post)
            if (postOwnerId && postOwnerId !== user.id) {
                await (supabase as any)
                    .from("notifications")
                    .insert({
                        user_id: postOwnerId,
                        actor_id: user.id,
                        type: "comment",
                        post_id: postId
                    });
            }

            // Check for @mentions in the comment
            const mentions = content.match(/@(\w+)/g);
            if (mentions) {
                for (const mention of mentions) {
                    const username = mention.slice(1); // Remove @
                    const { data: mentionedUser } = await (supabase as any)
                        .from("profiles")
                        .select("id")
                        .eq("username", username)
                        .single();

                    if (mentionedUser && mentionedUser.id !== user.id) {
                        await (supabase as any)
                            .from("notifications")
                            .insert({
                                user_id: mentionedUser.id,
                                actor_id: user.id,
                                type: "mention",
                                post_id: postId
                            });
                    }
                }
            }

            // Award XP for commenting
            await awardXp(user.id, XP_PER_COMMENT);

            setContent("");
            onCommentAdded?.();
        } catch (error) {
            console.error("Failed to add comment:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!user) return null;

    return (
        <form onSubmit={handleSubmit} className="flex gap-3 py-4 border-b border-white/5">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm">
                {user.email?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
                <input
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Reply to post... (@username to mention)"
                    className="w-full bg-transparent border-none outline-none text-white placeholder:text-white/40 h-10 focus:ring-0"
                    disabled={isSubmitting}
                />
            </div>
            <button
                type="submit"
                disabled={!content.trim() || isSubmitting}
                className="text-emerald-400 disabled:text-white/20 hover:text-emerald-300 transition-colors"
            >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
        </form>
    );
}
