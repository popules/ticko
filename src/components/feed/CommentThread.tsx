"use client";

import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { sv } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, Loader2 } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

interface Comment {
    id: string;
    content: string;
    created_at: string;
    profiles: {
        username: string;
        avatar_url: string | null;
    } | null;
}

interface CommentThreadProps {
    postId: string;
    commentCount?: number;
}

export function CommentThread({ postId, commentCount = 0 }: CommentThreadProps) {
    const { user } = useAuth();
    const [isExpanded, setIsExpanded] = useState(false);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [count, setCount] = useState(commentCount);

    useEffect(() => {
        if (!isExpanded || !isSupabaseConfigured || !supabase) return;

        const fetchComments = async () => {
            setIsLoading(true);
            const { data } = await (supabase as any)
                .from("comments")
                .select(`
                    id,
                    content,
                    created_at,
                    profiles (
                        username,
                        avatar_url
                    )
                `)
                .eq("post_id", postId)
                .order("created_at", { ascending: true });

            if (data) setComments(data as Comment[]);
            setIsLoading(false);
        };

        fetchComments();
    }, [isExpanded, postId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !newComment.trim() || !supabase) return;

        setIsSubmitting(true);

        const { data, error } = await (supabase as any)
            .from("comments")
            .insert({
                post_id: postId,
                user_id: user.id,
                content: newComment.trim(),
            })
            .select(`
                id,
                content,
                created_at,
                profiles (
                    username,
                    avatar_url
                )
            `)
            .single();

        if (!error && data) {
            setComments(prev => [...prev, data as Comment]);
            setCount(prev => prev + 1);
            setNewComment("");
        }

        setIsSubmitting(false);
    };

    return (
        <div className="mt-4 pt-4 border-t border-white/5">
            {/* Toggle Button */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
            >
                <MessageCircle className="w-4 h-4" />
                <span>{count} kommentarer</span>
            </button>

            {/* Comments Section */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="mt-4 space-y-3">
                            {isLoading ? (
                                <div className="flex justify-center py-4">
                                    <Loader2 className="w-5 h-5 animate-spin text-white/40" />
                                </div>
                            ) : (
                                <>
                                    {comments.map((comment) => (
                                        <motion.div
                                            key={comment.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex gap-3"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                                {comment.profiles?.username?.charAt(0).toUpperCase() || "?"}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-sm font-semibold text-white">
                                                        {comment.profiles?.username || "Anonym"}
                                                    </span>
                                                    <span className="text-xs text-white/30">
                                                        {formatDistanceToNow(new Date(comment.created_at), {
                                                            addSuffix: true,
                                                            locale: sv
                                                        })}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-white/80 break-words">
                                                    {comment.content}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}

                                    {comments.length === 0 && !isLoading && (
                                        <p className="text-sm text-white/30 text-center py-4">
                                            Inga kommentarer än. Var först!
                                        </p>
                                    )}
                                </>
                            )}

                            {/* New Comment Input */}
                            {user && (
                                <form onSubmit={handleSubmit} className="flex gap-2 mt-4">
                                    <input
                                        type="text"
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Skriv en kommentar..."
                                        className="flex-1 px-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50 transition-all"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newComment.trim() || isSubmitting}
                                        className="px-4 py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Send className="w-4 h-4" />
                                        )}
                                    </button>
                                </form>
                            )}

                            {!user && (
                                <p className="text-xs text-white/30 text-center py-2">
                                    Logga in för att kommentera
                                </p>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
