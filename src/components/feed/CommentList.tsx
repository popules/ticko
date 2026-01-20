"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { enUS } from "date-fns/locale";
import { Trash2 } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";

interface Comment {
    id: string;
    content: string;
    created_at: string;
    user_id: string;
    profiles: {
        username: string;
        avatar_url: string;
        reputation_score: number;
    };
}

interface CommentListProps {
    postId: string;
    refreshTrigger?: number; // Prop to force refresh
}

export function CommentList({ postId, refreshTrigger }: CommentListProps) {
    const { user } = useAuth();
    const [comments, setComments] = useState<Comment[]>([]);

    useEffect(() => {
        const fetchComments = async () => {
            const { data } = await supabase
                .from("comments")
                .select(`
                    *,
                    profiles (
                        username,
                        avatar_url,
                        reputation_score
                    )
                `)
                .eq("post_id", postId)
                .order("created_at", { ascending: true });

            if (data) setComments(data as any);
        };

        fetchComments();
    }, [postId, refreshTrigger]);

    const handleDelete = async (commentId: string) => {
        const { error } = await supabase.from("comments").delete().eq("id", commentId);
        if (!error) {
            setComments(prev => prev.filter(c => c.id !== commentId));
        }
    };

    return (
        <div className="space-y-4 pt-4">
            {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3 group">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {comment.profiles.avatar_url ? (
                            <img src={comment.profiles.avatar_url} alt={comment.profiles.username} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-white/60 text-xs font-bold">
                                {comment.profiles.username?.charAt(0).toUpperCase()}
                            </span>
                        )}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-baseline gap-2">
                            <span className="font-bold text-white text-sm">@{comment.profiles.username}</span>
                            <span className="text-white/30 text-xs">
                                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: enUS })}
                            </span>
                            {comment.profiles.reputation_score > 50 && (
                                <span className="px-1.5 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500 text-[10px] font-bold">PRO</span>
                            )}
                        </div>
                        <p className="text-white/80 text-sm mt-0.5 leading-relaxed">{comment.content}</p>
                    </div>

                    {user?.id === comment.user_id && (
                        <button
                            onClick={() => handleDelete(comment.id)}
                            className="text-white/10 opacity-0 group-hover:opacity-100 hover:text-rose-400 transition-all"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
}
