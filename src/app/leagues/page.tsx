"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/providers/AuthProvider";
import { AppLayout } from "@/components/layout/AppLayout";
import Link from "next/link";
import Image from "next/image";
import {
    Users,
    Plus,
    Trophy,
    Crown,
    Calendar,
    TrendingUp,
    TrendingDown,
    Copy,
    Check,
    Loader2,
    ChevronRight,
    Sparkles,
    User
} from "lucide-react";

interface League {
    id: string;
    name: string;
    invite_code: string;
    is_creator: boolean;
    rank_in_league: number;
    members_count: number;
    max_members: number;
    current_value: number;
    starting_value: number;
    pnl: number;
    pnl_percent: number;
    days_remaining: number | null;
    end_date: string | null;
    is_active: boolean;
    joined_at: string;
}

export default function LeaguesPage() {
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth();
    const queryClient = useQueryClient();
    const [joinCode, setJoinCode] = useState("");
    const [copiedCode, setCopiedCode] = useState<string | null>(null);
    const [joinError, setJoinError] = useState<string | null>(null);

    // Fetch user's leagues
    const { data: leagues, isLoading } = useQuery<League[]>({
        queryKey: ["my-leagues"],
        queryFn: async () => {
            const res = await fetch("/api/leagues/my");
            if (!res.ok) throw new Error("Failed to fetch leagues");
            return res.json();
        },
        enabled: !!user,
    });

    // Join league mutation
    const joinMutation = useMutation({
        mutationFn: async (code: string) => {
            const res = await fetch("/api/leagues/join", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ invite_code: code }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to join league");
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["my-leagues"] });
            setJoinCode("");
            setJoinError(null);
            router.push(`/leagues/${data.league_id}`);
        },
        onError: (error: Error) => {
            setJoinError(error.message);
        },
    });

    const handleJoin = (e: React.FormEvent) => {
        e.preventDefault();
        if (joinCode.trim()) {
            joinMutation.mutate(joinCode.trim());
        }
    };

    const copyInviteCode = async (code: string) => {
        const url = `${window.location.origin}/leagues/join/${code}`;
        await navigator.clipboard.writeText(url);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    // Redirect if not authenticated
    if (!authLoading && !user) {
        router.replace("/login");
        return null;
    }

    const activeLeagues = leagues?.filter(l => l.is_active) || [];
    const endedLeagues = leagues?.filter(l => !l.is_active) || [];

    return (
        <AppLayout showRightPanel={true}>
            <div className="max-w-3xl mx-auto pt-4 pb-20 px-4 pt-[max(1rem,env(safe-area-inset-top))]">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                            <Users className="w-7 h-7 text-violet-400" />
                            My Leagues
                        </h1>
                        <p className="text-sm text-white/40 mt-1">Compete with friends</p>
                    </div>
                    <Link
                        href="/leagues/create"
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-bold text-sm hover:shadow-[0_0_20px_-5px_rgba(139,92,246,0.5)] transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        Create League
                    </Link>
                </div>

                {/* Join League Form */}
                <form onSubmit={handleJoin} className="mb-8">
                    <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10">
                        <label className="text-sm font-bold text-white/60 mb-2 block">
                            Join a league with invite code
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={joinCode}
                                onChange={(e) => {
                                    setJoinCode(e.target.value.toUpperCase());
                                    setJoinError(null);
                                }}
                                placeholder="Enter invite code (e.g. ABC12345)"
                                className="flex-1 px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500/50 font-mono uppercase"
                                maxLength={10}
                            />
                            <button
                                type="submit"
                                disabled={!joinCode.trim() || joinMutation.isPending}
                                className="px-6 py-3 rounded-xl bg-violet-500/20 border border-violet-500/30 text-violet-400 font-bold hover:bg-violet-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {joinMutation.isPending ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    "Join"
                                )}
                            </button>
                        </div>
                        {joinError && (
                            <p className="text-rose-400 text-sm mt-2">{joinError}</p>
                        )}
                    </div>
                </form>

                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
                    </div>
                ) : leagues && leagues.length === 0 ? (
                    /* Empty State */
                    <div className="text-center py-16 px-6">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center mx-auto mb-6">
                            <Sparkles className="w-10 h-10 text-violet-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No leagues yet</h3>
                        <p className="text-white/40 mb-8 max-w-md mx-auto">
                            Create a league and invite your friends to compete. See who can grow their portfolio the most!
                        </p>
                        <Link
                            href="/leagues/create"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-bold hover:shadow-[0_0_30px_-5px_rgba(139,92,246,0.5)] transition-all"
                        >
                            <Plus className="w-5 h-5" />
                            Create Your First League
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Active Leagues */}
                        {activeLeagues.length > 0 && (
                            <div className="mb-8">
                                <h2 className="text-sm font-bold text-white/40 uppercase tracking-wider mb-3">
                                    Active Leagues
                                </h2>
                                <div className="space-y-3">
                                    {activeLeagues.map((league) => (
                                        <LeagueCard
                                            key={league.id}
                                            league={league}
                                            onCopy={() => copyInviteCode(league.invite_code)}
                                            isCopied={copiedCode === league.invite_code}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Ended Leagues */}
                        {endedLeagues.length > 0 && (
                            <div>
                                <h2 className="text-sm font-bold text-white/40 uppercase tracking-wider mb-3">
                                    Past Leagues
                                </h2>
                                <div className="space-y-3 opacity-60">
                                    {endedLeagues.map((league) => (
                                        <LeagueCard
                                            key={league.id}
                                            league={league}
                                            onCopy={() => { }}
                                            isCopied={false}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </AppLayout>
    );
}

function LeagueCard({
    league,
    onCopy,
    isCopied
}: {
    league: League;
    onCopy: () => void;
    isCopied: boolean;
}) {
    const isPositive = league.pnl >= 0;

    return (
        <Link
            href={`/leagues/${league.id}`}
            className="block p-4 rounded-2xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.06] hover:border-white/20 transition-all group"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Rank Badge */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${league.rank_in_league === 1
                            ? "bg-yellow-500/20 text-yellow-400"
                            : league.rank_in_league === 2
                                ? "bg-slate-400/20 text-slate-300"
                                : league.rank_in_league === 3
                                    ? "bg-orange-500/20 text-orange-400"
                                    : "bg-white/10 text-white/60"
                        }`}>
                        {league.rank_in_league === 1 ? <Crown className="w-5 h-5" /> : `#${league.rank_in_league}`}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-white truncate">{league.name}</h3>
                            {league.is_creator && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-400 font-bold">
                                    Creator
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-white/40 mt-0.5">
                            <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {league.members_count}/{league.max_members}
                            </span>
                            {league.days_remaining !== null && (
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {league.days_remaining}d left
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* P&L */}
                    <div className="text-right">
                        <div className={`font-bold tabular-nums ${isPositive ? "text-emerald-400" : "text-rose-400"}`}>
                            {isPositive ? "+" : ""}{league.pnl_percent.toFixed(1)}%
                        </div>
                        <div className="text-xs text-white/40 tabular-nums">
                            ${league.current_value.toLocaleString()}
                        </div>
                    </div>

                    {/* Copy/Arrow */}
                    {league.is_active && (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onCopy();
                            }}
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                            title="Copy invite link"
                        >
                            {isCopied ? (
                                <Check className="w-4 h-4 text-emerald-400" />
                            ) : (
                                <Copy className="w-4 h-4 text-white/40" />
                            )}
                        </button>
                    )}

                    <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-white/40 transition-colors" />
                </div>
            </div>
        </Link>
    );
}
