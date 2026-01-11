"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/lib/supabase/client";

interface CommentFormProps {
    postId: string;
    onCommentAdded?: () => void;
}

export function CommentForm({ postId, onCommentAdded }: CommentFormProps) {
    const { user } = useAuth();
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || !user) return;

        setIsSubmitting(true);
        try {
            const { error } = await supabase
                .from("comments")
                .insert({
                    post_id: postId,
                    user_id: user.id,
                    content: content.trim()
                } as any);

            if (error) throw error;

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
                    placeholder="Svara på inlägget..."
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
