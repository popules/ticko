"use client";

import { useEffect, useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { PostCard } from "./PostCard";
import { PostComposer } from "./PostComposer";
import { WhatIsHappening } from "./WhatIsHappening";
import { Loader2, Radio } from "lucide-react";
import { UI_STRINGS } from "@/config/app";
import type { Post } from "@/types/database";

import { useAuth } from "@/providers/AuthProvider";

type PostWithProfile = Post & {
    profiles: {
        username: string;
        avatar_url: string | null;
        reputation_score: number;
    } | null;
    polls?: any[];
    comments?: { count: number }[];
    comment_count?: number;
};

interface FeedStreamProps {
    tickerFilter?: string;
}

export function FeedStream({ tickerFilter }: FeedStreamProps) {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [isLive, setIsLive] = useState(true);
    const [feedType, setFeedType] = useState<"global" | "following">("global");

    // Fetch posts
    const {
        data: posts,
        isLoading,
        error,
        refetch,
    } = useQuery<PostWithProfile[]>({
        queryKey: ["posts", tickerFilter, feedType, user?.id],
        enabled: isSupabaseConfigured,
        queryFn: async () => {
            if (!supabase) return [];

            let query = (supabase as any)
                .from("posts")
                .select(
                    `
                        *,
                        profiles (
                            username,
                            avatar_url,
                            reputation_score
                        ),
                        polls (*),
                        comments (count)
                    `
                );

            // Filter by ticker if provided
            // Include posts that have this ticker as primary OR mention it in content (cross-posting)
            if (tickerFilter) {
                // Use Supabase OR filter to include both:
                // 1. Posts where ticker_symbol matches
                // 2. Posts where content contains $TICKER cashtag
                query = query.or(`ticker_symbol.eq.${tickerFilter},content.ilike.%$${tickerFilter}%`);
            }

            // Filter by following if requested
            if (feedType === "following" && user) {
                // First get the list of people the user follows
                const { data: followedData } = await (supabase as any)
                    .from("follows")
                    .select("following_id")
                    .eq("follower_id", user.id);

                const followedIds = (followedData as any[])?.map(f => f.following_id) || [];

                // If following nobody, return empty or handle gracefully
                if (followedIds.length > 0) {
                    query = query.in("user_id", followedIds);
                } else {
                    return []; // Return empty if following nobody
                }
            }

            const { data, error } = await query
                .order("created_at", { ascending: false })
                .limit(50);

            if (error) throw error;

            // Map comment count from nested structure
            const posts = (data as any[])?.map(post => ({
                ...post,
                comment_count: post.comments?.[0]?.count || 0
            })) || [];

            return posts as PostWithProfile[];
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
                    const { data: newPost } = await (supabase as any)
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
                        // Check if ticker filter matches - include primary ticker OR content mention
                        const postData = newPost as PostWithProfile;
                        if (tickerFilter) {
                            const matchesPrimary = postData.ticker_symbol === tickerFilter;
                            const matchesContent = postData.content?.toLowerCase().includes(`$${tickerFilter.toLowerCase()}`);
                            if (!matchesPrimary && !matchesContent) return;
                        }

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
            {/* Trending & Activity Hub */}
            {user && !tickerFilter && <WhatIsHappening />}

            {/* Post composer */}
            <PostComposer onNewPost={handleNewPost} tickerFilter={tickerFilter} />

            {/* Feed Type Toggle */}
            {!tickerFilter && user && (
                <div className="flex p-1 bg-white/[0.04] rounded-2xl border border-white/10 w-fit">
                    <button
                        onClick={() => setFeedType("global")}
                        className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${feedType === "global"
                            ? "bg-white text-black shadow-lg"
                            : "text-white/40 hover:text-white"
                            }`}
                    >
                        Global
                    </button>
                    <button
                        onClick={() => setFeedType("following")}
                        className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${feedType === "following"
                            ? "bg-white text-black shadow-lg"
                            : "text-white/40 hover:text-white"
                            }`}
                    >
                        Följer
                    </button>
                </div>
            )}

            {/* Live indicator */}
            <div className="flex items-center justify-between px-2">
                <h2 className="text-lg font-semibold text-white">
                    {tickerFilter ? `$${tickerFilter}` : feedType === "global" ? UI_STRINGS.liveFeed : "Inlägg från personer du följer"}
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
