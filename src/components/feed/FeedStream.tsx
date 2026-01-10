"use client";

import { useEffect, useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { PostCard } from "./PostCard";
import { PostComposer } from "./PostComposer";
import { Loader2, Radio } from "lucide-react";
import { UI_STRINGS } from "@/config/app";
import type { Post } from "@/types/database";

type PostWithProfile = Post & {
    profiles: {
        username: string;
        avatar_url: string | null;
        reputation_score: number;
    } | null;
};

interface FeedStreamProps {
    tickerFilter?: string;
}

export function FeedStream({ tickerFilter }: FeedStreamProps) {
    const queryClient = useQueryClient();
    const [isLive, setIsLive] = useState(true);

    // Fetch posts
    const {
        data: posts,
        isLoading,
        error,
        refetch,
    } = useQuery<PostWithProfile[]>({
        queryKey: ["posts", tickerFilter],
        enabled: isSupabaseConfigured,
        queryFn: async () => {
            if (!supabase) return [];
            let query = supabase
                .from("posts")
                .select(
                    `
          *,
          profiles (
            username,
            avatar_url,
            reputation_score
          )
        `
                )
                .order("created_at", { ascending: false })
                .limit(50);

            if (tickerFilter) {
                query = query.eq("ticker_symbol", tickerFilter);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data as PostWithProfile[];
        },
    });

    // Real-time subscription
    useEffect(() => {
        if (!isLive || !isSupabaseConfigured || !supabase) return;

        const channel = supabase
            .channel("posts-realtime")
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "posts",
                },
                async (payload) => {
                    const insertedPost = payload.new as { id: string };
                    // Fetch the full post with profile data
                    const { data: newPost } = await supabase
                        .from("posts")
                        .select(
                            `
              *,
              profiles (
                username,
                avatar_url,
                reputation_score
              )
            `
                        )
                        .eq("id", insertedPost.id)
                        .single();

                    if (newPost) {
                        // Check if ticker filter matches
                        const postData = newPost as PostWithProfile;
                        if (tickerFilter && postData.ticker_symbol !== tickerFilter) return;

                        // Add to the beginning of the posts array
                        queryClient.setQueryData<PostWithProfile[]>(
                            ["posts", tickerFilter],
                            (old) => {
                                if (!old) return [postData];
                                return [postData, ...old];
                            }
                        );
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [isLive, tickerFilter, queryClient]);

    // Handle new post created
    const handleNewPost = useCallback(() => {
        // Refetch to ensure we have the latest
        refetch();
    }, [refetch]);

    if (error) {
        return (
            <div className="bg-white/[0.04] backdrop-blur-xl rounded-2xl p-6 text-center border border-white/10">
                <p className="text-rose-400">Kunde inte ladda flödet</p>
                <p className="text-sm text-white/40 mt-1">
                    {error instanceof Error ? error.message : "Okänt fel"}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Post composer */}
            <PostComposer onNewPost={handleNewPost} tickerFilter={tickerFilter} />

            {/* Live indicator */}
            <div className="flex items-center justify-between px-2">
                <h2 className="text-lg font-semibold text-white">
                    {tickerFilter ? `$${tickerFilter}` : UI_STRINGS.liveFeed}
                </h2>
                <button
                    onClick={() => setIsLive(!isLive)}
                    className={`flex items-center gap-2 text-sm px-4 py-2 rounded-full transition-all border ${isLive
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                            : "bg-white/[0.06] text-white/60 border-white/10"
                        }`}
                >
                    <Radio className={`w-3.5 h-3.5 ${isLive ? "animate-pulse" : ""}`} />
                    {isLive ? UI_STRINGS.live : UI_STRINGS.paused}
                </button>
            </div>

            {/* Loading state */}
            {isLoading && (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-white/40" />
                </div>
            )}

            {/* Posts list */}
            {posts && posts.length > 0 && (
                <div className="space-y-3">
                    {posts.map((post) => (
                        <PostCard key={post.id} post={post} />
                    ))}
                </div>
            )}

            {/* Empty state */}
            {posts && posts.length === 0 && (
                <div className="bg-white/[0.04] backdrop-blur-xl rounded-2xl p-12 text-center border border-white/10">
                    <p className="text-white/60">{UI_STRINGS.noPosts}</p>
                    <p className="text-sm text-white/40 mt-2">{UI_STRINGS.beFirst}</p>
                </div>
            )}
        </div>
    );
}
