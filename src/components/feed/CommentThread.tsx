"use client";

import { useState, useEffect, useCallback } from "react";
import { formatDistanceToNow } from "date-fns";
import { sv } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, Loader2, Reply, ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

interface Comment {
    id: string;
    content: string;
    created_at: string;
    parent_id: string | null;
    profiles: {
        username: string;
        avatar_url: string | null;
    } | null;
    replies?: Comment[];
}

interface CommentThreadProps {
    postId: string;
    commentCount?: number;
}

// Recursive component to render a single comment and its nested replies
function CommentItem({
    comment,
    depth,
    onReply,
    replyingTo,
    replyContent,
    setReplyContent,
    isSubmitting,
    handleSubmitReply,
    user,
}: {
    comment: Comment;
    depth: number;
    onReply: (commentId: string) => void;
    replyingTo: string | null;
    replyContent: string;
    setReplyContent: (content: string) => void;
    isSubmitting: boolean;
    handleSubmitReply: (parentId: string) => void;
    user: any;
}) {
    const [showReplies, setShowReplies] = useState(true);
    const hasReplies = comment.replies && comment.replies.length > 0;
    const maxDepth = 4; // Max nesting level to prevent infinite indentation

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="group"
        >
            <div className={`flex gap-3 ${depth > 0 ? 'ml-6 pl-3 border-l border-white/10' : ''}`}>
                {/* Avatar */}
                <div className={`${depth === 0 ? 'w-8 h-8' : 'w-6 h-6'} rounded-lg bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                    {comment.profiles?.username?.charAt(0).toUpperCase() || "?"}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`${depth === 0 ? 'text-sm' : 'text-xs'} font-semibold text-white`}>
                            {comment.profiles?.username || "Anonym"}
                        </span>
                        <span className="text-xs text-white/30">
                            {formatDistanceToNow(new Date(comment.created_at), {
                                addSuffix: true,
                                locale: sv
                            })}
                        </span>
                    </div>
                    <p className={`${depth === 0 ? 'text-sm' : 'text-xs'} text-white/80 break-words`}>
                        {comment.content}
                    </p>

                    {/* Reply button */}
                    {user && depth < maxDepth && (
                        <button
                            onClick={() => onReply(comment.id)}
                            className="flex items-center gap-1 mt-2 text-xs text-white/40 hover:text-emerald-400 transition-colors"
                        >
                            <Reply className="w-3 h-3" />
                            Svara
                        </button>
                    )}

                    {/* Reply input */}
                    {replyingTo === comment.id && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="mt-3"
                        >
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    placeholder={`Svara @${comment.profiles?.username || 'Anonym'}...`}
                                    className="flex-1 px-3 py-2 bg-white/[0.04] border border-white/10 rounded-lg text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50 transition-all"
                                    autoFocus
                                />
                                <button
                                    onClick={() => handleSubmitReply(comment.id)}
                                    disabled={!replyContent.trim() || isSubmitting}
                                    className="px-3 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg transition-all disabled:opacity-50"
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                        <Send className="w-3 h-3" />
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Toggle replies */}
                    {hasReplies && (
                        <button
                            onClick={() => setShowReplies(!showReplies)}
                            className="flex items-center gap-1 mt-2 text-xs text-white/40 hover:text-white transition-colors"
                        >
                            {showReplies ? (
                                <ChevronUp className="w-3 h-3" />
                            ) : (
                                <ChevronDown className="w-3 h-3" />
                            )}
                            {comment.replies!.length} {comment.replies!.length === 1 ? 'svar' : 'svar'}
                        </button>
                    )}
                </div>
            </div>

            {/* Nested replies */}
            {hasReplies && showReplies && (
                <div className="mt-3 space-y-3">
                    {comment.replies!.map((reply) => (
                        <CommentItem
                            key={reply.id}
                            comment={reply}
                            depth={depth + 1}
                            onReply={onReply}
                            replyingTo={replyingTo}
                            replyContent={replyContent}
                            setReplyContent={setReplyContent}
                            isSubmitting={isSubmitting}
                            handleSubmitReply={handleSubmitReply}
                            user={user}
                        />
                    ))}
                </div>
            )}
        </motion.div>
    );
}

// Helper function to build nested comment tree
function buildCommentTree(comments: Comment[]): Comment[] {
    const commentMap = new Map<string, Comment>();
    const roots: Comment[] = [];

    // First pass: create map of all comments
    comments.forEach(comment => {
        commentMap.set(comment.id, { ...comment, replies: [] });
    });

    // Second pass: build tree structure
    comments.forEach(comment => {
        const node = commentMap.get(comment.id)!;
        if (comment.parent_id && commentMap.has(comment.parent_id)) {
            const parent = commentMap.get(comment.parent_id)!;
            parent.replies = parent.replies || [];
            parent.replies.push(node);
        } else {
            roots.push(node);
        }
    });

    return roots;
}

export function CommentThread({ postId, commentCount = 0 }: CommentThreadProps) {
    const { user } = useAuth();
    const [isExpanded, setIsExpanded] = useState(false);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [replyContent, setReplyContent] = useState("");
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [count, setCount] = useState(commentCount);

    const fetchComments = useCallback(async () => {
        if (!isSupabaseConfigured || !supabase) return;

        setIsLoading(true);
        const { data } = await (supabase as any)
            .from("comments")
            .select(`
                id,
                content,
                created_at,
                parent_id,
                profiles (
                    username,
                    avatar_url
                )
            `)
            .eq("post_id", postId)
            .order("created_at", { ascending: true });

        if (data) {
            const tree = buildCommentTree(data as Comment[]);
            setComments(tree);
        }
        setIsLoading(false);
    }, [postId]);

    useEffect(() => {
        if (!isExpanded) return;
        fetchComments();
    }, [isExpanded, fetchComments]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !newComment.trim() || !supabase) return;

        setIsSubmitting(true);

        const { error } = await (supabase as any)
            .from("comments")
            .insert({
                post_id: postId,
                user_id: user.id,
                content: newComment.trim(),
                parent_id: null,
            });

        if (!error) {
            setCount(prev => prev + 1);
            setNewComment("");
            fetchComments(); // Refetch to get updated tree
        }

        setIsSubmitting(false);
    };

    const handleSubmitReply = async (parentId: string) => {
        if (!user || !replyContent.trim() || !supabase) return;

        setIsSubmitting(true);

        const { error } = await (supabase as any)
            .from("comments")
            .insert({
                post_id: postId,
                user_id: user.id,
                content: replyContent.trim(),
                parent_id: parentId,
            });

        if (!error) {
            setCount(prev => prev + 1);
            setReplyContent("");
            setReplyingTo(null);
            fetchComments(); // Refetch to get updated tree
        }

        setIsSubmitting(false);
    };

    const handleReply = (commentId: string) => {
        if (replyingTo === commentId) {
            setReplyingTo(null);
            setReplyContent("");
        } else {
            setReplyingTo(commentId);
            setReplyContent("");
        }
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
                        <div className="mt-4 space-y-4">
                            {isLoading ? (
                                <div className="flex justify-center py-4">
                                    <Loader2 className="w-5 h-5 animate-spin text-white/40" />
                                </div>
                            ) : (
                                <>
                                    {comments.map((comment) => (
                                        <CommentItem
                                            key={comment.id}
                                            comment={comment}
                                            depth={0}
                                            onReply={handleReply}
                                            replyingTo={replyingTo}
                                            replyContent={replyContent}
                                            setReplyContent={setReplyContent}
                                            isSubmitting={isSubmitting}
                                            handleSubmitReply={handleSubmitReply}
                                            user={user}
                                        />
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
                                <form onSubmit={handleSubmit} className="flex gap-2 mt-4 pt-4 border-t border-white/5">
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
