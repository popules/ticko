"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { RightPanel } from "@/components/layout/RightPanel";
import { PostCard } from "@/components/feed/PostCard";
import { CommentForm } from "@/components/feed/CommentForm";
import { CommentList } from "@/components/feed/CommentList";
import { supabase } from "@/lib/supabase/client";
import { Loader2, MoveLeft } from "lucide-react";
import Link from "next/link";

export default function PostPage() {
    const params = useParams();
    const id = params?.id as string;
    const [post, setPost] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshComments, setRefreshComments] = useState(0);

    useEffect(() => {
        if (!id) return;

        const fetchPost = async () => {
            setIsLoading(true);
            const { data, error } = await supabase
                .from("posts")
                .select(`
                    *,
                    profiles (*)
                `)
                .eq("id", id)
                .single();

            if (data) setPost(data);
            setIsLoading(false);
        };

        fetchPost();
    }, [id]);

    if (isLoading) {
        return (
            <div className="flex min-h-screen bg-[#020617]">
                <Sidebar />
                <main className="flex-1 flex items-center justify-center border-x border-white/5">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                </main>
                <RightPanel />
            </div>
        );
    }

    if (!post) {
        return (
            <div className="flex min-h-screen bg-[#020617]">
                <Sidebar />
                <main className="flex-1 flex flex-col items-center justify-center border-x border-white/5 p-8 text-center">
                    <h1 className="text-2xl font-bold text-white mb-2">Post not found</h1>
                    <Link href="/" className="text-emerald-400 hover:text-emerald-300 flex items-center gap-2">
                        <MoveLeft className="w-4 h-4" />
                        Back to feed
                    </Link>
                </main>
                <RightPanel />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-[#020617]">
            <Sidebar />

            <main className="flex-1 border-x border-white/5">
                <div className="sticky top-0 z-20 bg-[#020617]/80 backdrop-blur-xl border-b border-white/5 p-4 flex items-center gap-4">
                    <Link href="/" className="p-2 hover:bg-white/5 rounded-full text-white/60 hover:text-white transition-colors">
                        <MoveLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-lg font-bold text-white">Discussion</h1>
                </div>

                <div className="p-6">
                    <div className="mb-6">
                        <PostCard post={post} />
                    </div>

                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
                        <h3 className="text-sm font-bold text-white/40 uppercase tracking-widest mb-4">Replies</h3>
                        <CommentForm
                            postId={id}
                            onCommentAdded={() => setRefreshComments(prev => prev + 1)}
                        />
                        <CommentList postId={id} refreshTrigger={refreshComments} />
                    </div>
                </div>
            </main>

            <RightPanel />
        </div>
    );
}
