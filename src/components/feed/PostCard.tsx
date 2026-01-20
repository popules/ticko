"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { enUS } from "date-fns/locale";
import { TrendingUp, TrendingDown, Flag, Trash2, Loader2, Gem } from "lucide-react";
import { ShareButton } from "@/components/ui/ShareButton";
import { renderWithCashtags } from "@/lib/cashtag";
import { UI_STRINGS } from "@/config/app";
import { getLevel, getLevelColor } from "@/lib/level-system";
import { ReactionButtons } from "./ReactionButtons";
import { ReactionBar } from "./ReactionBar";
import { PollView } from "./PollView";
import { CommentThread } from "./CommentThread";
import { ReportModal } from "./ReportModal";
import { useAuth } from "@/providers/AuthProvider";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import type { Post } from "@/types/database";

interface PostCardProps {
    post: Post & {
        profiles?: {
            username: string;
            avatar_url: string | null;
            reputation_score: number;
        };
        polls?: any[];
        comment_count?: number;
    };
    authorOwnsStock?: boolean;
}

export function PostCard({ post, authorOwnsStock }: PostCardProps) {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const profile = post.profiles;
    const sentiment = post.sentiment;
    const isOwnPost = user?.id === post.user_id;

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this post?")) return;

        setIsDeleting(true);
        try {
            const res = await fetch(`/api/posts/${post.id}`, { method: 'DELETE' });
            if (res.ok) {
                // Remove post from cache
                queryClient.invalidateQueries({ queryKey: ['posts'] });
            }
        } catch (error) {
            console.error('Failed to delete post:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <article className="bg-white/[0.04] backdrop-blur-xl rounded-2xl p-5 border border-white/10 hover:bg-white/[0.06] transition-all">
            <div className="flex gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                    <Link href={`/profile/${post.user_id}`}>
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-semibold shadow-lg shadow-emerald-500/20 hover:scale-105 transition-transform cursor-pointer">
                            {profile?.username?.charAt(0).toUpperCase() || "?"}
                        </div>
                    </Link>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-2">
                        <Link
                            href={`/profile/${post.user_id}`}
                            className="text-[15px] font-bold text-white truncate hover:text-emerald-400 transition-colors"
                        >
                            {profile?.username || "Anonymous"}
                        </Link>

                        {/* Level Badge */}
                        {profile?.reputation_score !== undefined && (
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${getLevelColor(getLevel(profile.reputation_score))}`}>
                                Lvl {getLevel(profile.reputation_score)}
                            </span>
                        )}

                        <span className="text-white/30">·</span>
                        <span className="text-white/50 text-[12px] font-medium">
                            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: enUS })}
                        </span>

                        {/* Skin in the Game Badge */}
                        {authorOwnsStock && post.ticker_symbol && (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" title={`Owns ${post.ticker_symbol}`}>
                                <Gem className="w-3 h-3" />
                                Owner
                            </span>
                        )}

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
                    <p className="text-white text-[15px] whitespace-pre-wrap break-words leading-relaxed">
                        {renderWithCashtags(post.content)}
                    </p>

                    {/* Stock Prediction Box */}
                    {post.is_prediction && post.ticker_symbol && (
                        <div className="mt-4 p-4 rounded-2xl bg-white/[0.06] border border-white/10 overflow-hidden relative group/prediction flex flex-wrap gap-4 items-center">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-[40px] rounded-full -mr-8 -mt-8" />

                            <div className="flex items-center gap-3 pr-4 border-r border-white/10">
                                <div className={`p-2 rounded-xl bg-opacity-20 border transition-colors ${post.sentiment === "bull" ? "bg-emerald-500 text-emerald-400 border-emerald-500/30" : "bg-rose-500 text-rose-400 border-rose-500/30"
                                    }`}>
                                    {post.sentiment === "bull" ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-white/40 uppercase font-black tracking-widest">Type</span>
                                    <span className={`text-xs font-bold uppercase ${post.sentiment === "bull" ? "text-emerald-400" : "text-rose-400"}`}>
                                        {post.sentiment === "bull" ? "Bull Prediction" : "Bear Prediction"}
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col pr-4 border-r border-white/10">
                                <span className="text-[10px] text-white/40 uppercase font-black tracking-widest">Entry</span>
                                <span className="text-sm font-bold text-white">
                                    {post.prediction_price ? `${post.prediction_price.toFixed(2)}` : "—"}
                                </span>
                            </div>

                            <div className="flex flex-col pr-4 border-r border-white/10">
                                <span className="text-[10px] text-white/40 uppercase font-black tracking-widest">Target</span>
                                <span className="text-sm font-bold text-white">
                                    {post.target_date ? formatDistanceToNow(new Date(post.target_date), { locale: enUS }) : "—"}
                                </span>
                            </div>

                            <div className="ml-auto flex items-center gap-3">
                                {post.prediction_status === 'pending' && post.target_date && new Date(post.target_date) < new Date() && (
                                    <button
                                        onClick={async () => {
                                            const res = await fetch(`/api/ai/evaluate-prediction/${post.id}`, { method: 'POST' });
                                            if (res.ok) window.location.reload(); // Simple refresh to see update
                                        }}
                                        className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-500 text-white hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20"
                                    >
                                        Verify Outcome
                                    </button>
                                )}
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-lg ${post.prediction_status === 'pending' ? "bg-white/10 text-white/60 border-white/10" :
                                    post.prediction_status === 'correct' ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" :
                                        "bg-rose-500/20 text-rose-400 border-rose-500/30"
                                    }`}>
                                    {post.prediction_status === 'pending' ? 'Pending' :
                                        post.prediction_status === 'correct' ? 'Success' : 'Failed'}
                                </span>
                            </div>
                        </div>
                    )}

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

                    {/* Poll Display */}
                    {post.polls && post.polls.length > 0 && (
                        <PollView poll={post.polls[0]} />
                    )}

                    {/* Ticker tag if present - now clickable */}
                    {post.ticker_symbol && (
                        <div className="mt-3">
                            <Link
                                href={`/stock/${post.ticker_symbol}`}
                                className="inline-block text-xs bg-white/[0.06] text-emerald-400 px-3 py-1.5 rounded-full border border-white/[0.08] hover:bg-white/[0.1] hover:border-emerald-500/30 transition-all"
                            >
                                ${post.ticker_symbol}
                            </Link>
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
                        <div className="flex items-center gap-3">
                            {/* Delete button - only for own posts */}
                            {isOwnPost && (
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="flex items-center gap-2 text-sm text-white/20 hover:text-rose-400 transition-colors disabled:opacity-50"
                                    title="Delete post"
                                >
                                    {isDeleting ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Trash2 className="w-4 h-4" />
                                    )}
                                </button>
                            )}
                            {/* Share button */}
                            <ShareButton
                                url={`https://www.ticko.se/post/${post.id}`}
                                title={`Post by ${profile?.username || 'Anonymous'} on Ticko`}
                            />
                            {/* Report button */}
                            <button
                                onClick={() => setIsReportModalOpen(true)}
                                className="flex items-center gap-2 text-sm text-white/20 hover:text-rose-400 transition-colors"
                                title="Report post"
                            >
                                <Flag className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Emoji Reactions */}
                    <ReactionBar postId={post.id} />

                    {/* Comment Thread */}
                    <CommentThread postId={post.id} commentCount={post.comment_count || 0} />

                    {/* Report Modal */}
                    <ReportModal
                        isOpen={isReportModalOpen}
                        onClose={() => setIsReportModalOpen(false)}
                        postId={post.id}
                    />


                </div>
            </div>
        </article>
    );
}
