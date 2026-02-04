"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/providers/AuthProvider";
import { AppLayout } from "@/components/layout/AppLayout";
import Link from "next/link";
import Image from "next/image";
import {
    Users,
    ArrowLeft,
    Trophy,
    Crown,
    Calendar,
    TrendingUp,
    TrendingDown,
    Copy,
    Check,
    Loader2,
    Share2,
    Clock,
    User,
    MessageCircle,
    Mail
} from "lucide-react";
import { useState } from "react";
import { LeagueRankBadge } from "@/components/ui/LeagueRankBadge";

interface LeagueDetail {
    league: {
        id: string;
        name: string;
        invite_code: string;
        invite_url: string;
        creator_id: string;
        is_creator: boolean;
        starting_capital: number;
        start_date: string;
        end_date: string | null;
        duration_days: number;
        max_members: number;
        members_count: number;
        is_active: boolean;
        days_remaining: number | null;
    };
    members: Array<{
        user_id: string;
        username: string;
        avatar_url: string | null;
        league_rating: number;
        rank: number;
        current_value: number;
        starting_value: number;
        pnl: number;
        pnl_percent: number;
        is_current_user: boolean;
    }>;
    is_member: boolean;
    my_rank: number | null;
}

export default function LeagueDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth();
    const queryClient = useQueryClient();
    const [copied, setCopied] = useState(false);

    // Fetch league details
    const { data, isLoading, error } = useQuery<LeagueDetail>({
        queryKey: ["league", id],
        queryFn: async () => {
            const res = await fetch(`/api/leagues/${id}`);
            if (!res.ok) throw new Error("Failed to fetch league");
            return res.json();
        },
        enabled: !!id,
    });

    const copyLink = async () => {
        if (data?.league.invite_url) {
            await navigator.clipboard.writeText(data.league.invite_url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const shareWhatsApp = () => {
        if (data) {
            const text = `Join my Ticko league "${data.league.name}"! Let's see who's the best trader 📈\n\n${data.league.invite_url}`;
            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
        }
    };

    if (isLoading) {
        return (
            <AppLayout showRightPanel={false}>
                <div className="flex items-center justify-center h-screen">
                    <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
                </div>
            </AppLayout>
        );
    }

    if (error || !data) {
        return (
            <AppLayout showRightPanel={false}>
                <div className="max-w-xl mx-auto pt-20 px-4 text-center">
                    <h2 className="text-xl font-bold text-white mb-2">League not found</h2>
                    <p className="text-white/40 mb-6">This league may have been deleted.</p>
                    <Link
                        href="/leagues"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white font-bold"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to My Leagues
                    </Link>
                </div>
            </AppLayout>
        );
    }

    const { league, members } = data;

    return (
        <AppLayout showRightPanel={false}>
            <div className="max-w-2xl mx-auto pt-4 pb-20 px-4 pt-[max(1rem,env(safe-area-inset-top))]">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <Link
                        href="/leagues"
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-white/60" />
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                            {league.name}
                            {league.is_creator && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-400 font-bold">
                                    Creator
                                </span>
                            )}
                        </h1>
                        <div className="flex items-center gap-3 text-sm text-white/40 mt-0.5">
                            <span className="flex items-center gap-1">
                                <Users className="w-3.5 h-3.5" />
                                {league.members_count}/{league.max_members} players
                            </span>
                            {league.days_remaining !== null && league.is_active && (
                                <span className="flex items-center gap-1 text-amber-400">
                                    <Clock className="w-3.5 h-3.5" />
                                    {league.days_remaining} days left
                                </span>
                            )}
                            {!league.is_active && (
                                <span className="text-rose-400">Ended</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Share Section */}
                {league.is_active && (
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20 mb-6">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <p className="text-sm font-bold text-white">Invite Friends</p>
                                <p className="text-xs text-white/40">Code: <span className="font-mono text-violet-400">{league.invite_code}</span></p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={copyLink}
                                className="flex-1 py-2.5 px-4 rounded-xl bg-white/[0.06] border border-white/10 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-white/[0.1] transition-colors"
                            >
                                {copied ? (
                                    <>
                                        <Check className="w-4 h-4 text-emerald-400" />
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-4 h-4" />
                                        Copy Link
                                    </>
                                )}
                            </button>
                            <button
                                onClick={shareWhatsApp}
                                className="py-2.5 px-4 rounded-xl bg-emerald-600/20 border border-emerald-600/30 text-emerald-400 font-bold text-sm flex items-center justify-center gap-2 hover:bg-emerald-600/30 transition-colors"
                            >
                                <MessageCircle className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Your Position */}
                {data.my_rank && (
                    <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 mb-6">
                        <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Your Position</p>
                        <div className="flex items-center justify-between">
                            <span className="text-3xl font-black text-white">#{data.my_rank}</span>
                            {members.find(m => m.is_current_user) && (
                                <div className="text-right">
                                    <div className={`font-bold text-lg tabular-nums ${members.find(m => m.is_current_user)!.pnl >= 0
                                            ? "text-emerald-400"
                                            : "text-rose-400"
                                        }`}>
                                        {members.find(m => m.is_current_user)!.pnl >= 0 ? "+" : ""}
                                        {members.find(m => m.is_current_user)!.pnl_percent.toFixed(1)}%
                                    </div>
                                    <div className="text-sm text-white/40 tabular-nums">
                                        ${members.find(m => m.is_current_user)!.current_value.toLocaleString()}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Leaderboard */}
                <div>
                    <h2 className="text-sm font-bold text-white/40 uppercase tracking-wider mb-3">
                        Leaderboard
                    </h2>
                    <div className="bg-white/[0.04] border border-white/10 rounded-2xl overflow-hidden">
                        {members.length === 0 ? (
                            <div className="p-8 text-center text-white/40">
                                No members yet. Invite your friends!
                            </div>
                        ) : (
                            members.map((member, index) => {
                                const isPositive = member.pnl >= 0;
                                const isTopThree = member.rank <= 3;

                                return (
                                    <Link
                                        key={member.user_id}
                                        href={`/u/${member.username}`}
                                        className={`flex items-center gap-3 p-4 hover:bg-white/[0.02] transition-colors ${index !== members.length - 1 ? "border-b border-white/5" : ""
                                            } ${member.is_current_user ? "bg-violet-500/5" : ""}`}
                                    >
                                        {/* Rank */}
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${member.rank === 1
                                                ? "bg-yellow-500/20 text-yellow-400"
                                                : member.rank === 2
                                                    ? "bg-slate-400/20 text-slate-300"
                                                    : member.rank === 3
                                                        ? "bg-orange-500/20 text-orange-400"
                                                        : "bg-white/5 text-white/40"
                                            }`}>
                                            {member.rank === 1 ? (
                                                <Crown className="w-4 h-4" />
                                            ) : (
                                                member.rank
                                            )}
                                        </div>

                                        {/* Avatar */}
                                        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-white/10">
                                            {member.avatar_url ? (
                                                <Image
                                                    src={member.avatar_url}
                                                    alt={member.username}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <User className="w-5 h-5 text-white/40" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Name */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5">
                                                <span className={`font-bold truncate ${member.is_current_user ? "text-violet-400" : "text-white"
                                                    }`}>
                                                    @{member.username}
                                                </span>
                                                {member.league_rating > 0 && (
                                                    <LeagueRankBadge rating={member.league_rating} size="xs" />
                                                )}
                                                {member.is_current_user && (
                                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-400 font-bold">
                                                        You
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-white/40 tabular-nums">
                                                ${member.current_value.toLocaleString()}
                                            </div>
                                        </div>

                                        {/* P&L */}
                                        <div className="text-right">
                                            <div className={`flex items-center gap-1 font-bold tabular-nums ${isPositive ? "text-emerald-400" : "text-rose-400"
                                                }`}>
                                                {isPositive ? (
                                                    <TrendingUp className="w-4 h-4" />
                                                ) : (
                                                    <TrendingDown className="w-4 h-4" />
                                                )}
                                                {isPositive ? "+" : ""}{member.pnl_percent.toFixed(1)}%
                                            </div>
                                            <div className={`text-xs tabular-nums ${isPositive ? "text-emerald-400/60" : "text-rose-400/60"
                                                }`}>
                                                {isPositive ? "+" : ""}${Math.abs(member.pnl).toLocaleString()}
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
