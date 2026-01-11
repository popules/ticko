"use client";

import { formatDistanceToNow } from "date-fns";
import { sv } from "date-fns/locale";
import { TrendingUp, TrendingDown, MessageCircle, Share2 } from "lucide-react";
import { renderWithCashtags } from "@/lib/cashtag";
import { UI_STRINGS } from "@/config/app";
import { ReactionButtons } from "./ReactionButtons";
import { ReactionBar } from "./ReactionBar";
import { CommentThread } from "./CommentThread";
import type { Post } from "@/types/database";
import Link from "next/link";

interface PostCardProps {
    post: Post & {
        profiles?: {
            username: string;
            avatar_url: string | null;
            reputation_score: number;
        };
    };
}

export function PostCard({ post }: PostCardProps) {
    const profile = post.profiles;
    const sentiment = post.sentiment;

    return (
        <article className="bg-white/[0.04] backdrop-blur-xl rounded-2xl p-5 border border-white/10 hover:bg-white/[0.06] transition-all">
            <div className="flex gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-semibold shadow-lg shadow-emerald-500/20">
                        {profile?.username?.charAt(0).toUpperCase() || "?"}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-2">
                        <Link
                            href={`/profil/${post.user_id}`}
                            className="font-semibold text-white truncate hover:text-emerald-400 transition-colors"
                        >
                            {profile?.username || "Anonym"}
                        </Link>
                        {profile?.reputation_score !== undefined && profile.reputation_score > 0 && (
                            <span className="text-xs text-white/60 bg-white/[0.08] px-2 py-0.5 rounded-full">
                                +{profile.reputation_score}
                            </span>
                        )}
                        <span className="text-white/30">·</span>
                        <span className="text-white/50 text-sm">
                            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: sv })}
                        </span>

                        {/* Sentiment badge */}
                        {sentiment && (
                            <span
                                className={`ml-auto flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${sentiment === "bull"
                                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                    : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                                    }`}
                            >
                                {sentiment === "bull" ? (
                                    <TrendingUp className="w-3 h-3" />
                                ) : (
                                    <TrendingDown className="w-3 h-3" />
                                )}
                                {sentiment === "bull" ? UI_STRINGS.bullish : UI_STRINGS.bearish}
                            </span>
                        )}
                    </div>

                    {/* Post content with cashtags */}
                    <p className="text-white whitespace-pre-wrap break-words leading-relaxed">
                        {renderWithCashtags(post.content)}
                    </p>

                    {/* GIF display */}
                    {post.gif_url && (
                        <div className="mt-3">
                            <img
                                src={post.gif_url}
                                alt="GIF"
                                className="max-h-64 rounded-xl"
                            />
                        </div>
                    )}

                    {/* Ticker tag if present */}
                    {post.ticker_symbol && (
                        <div className="mt-3">
                            <span className="text-xs bg-white/[0.06] text-white/60 px-3 py-1.5 rounded-full border border-white/[0.08]">
                                ${post.ticker_symbol}
                            </span>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between mt-4">
                        <ReactionButtons
                            postId={post.id}
                            upCount={post.up_count || 0}
                            downCount={post.down_count || 0}
                            userReaction={post.user_reaction}
                        />
                        <div className="flex items-center gap-4 text-white/40">
                            <button className="flex items-center gap-2 text-sm hover:text-white transition-colors">
                                <MessageCircle className="w-4 h-4" />
                            </button>
                            <button className="flex items-center gap-2 text-sm hover:text-white transition-colors">
                                <Share2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Emoji Reactions */}
                    <ReactionBar postId={post.id} />

                    {/* Comment Thread */}
                    <CommentThread postId={post.id} commentCount={0} />
                </div>
            </div>
        </article>
    );
}
