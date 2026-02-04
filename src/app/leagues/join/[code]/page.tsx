"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/providers/AuthProvider";
import { AppLayout } from "@/components/layout/AppLayout";
import Link from "next/link";
import {
    Users,
    Loader2,
    Trophy,
    Calendar,
    Check,
    ArrowRight
} from "lucide-react";

interface LeaguePreview {
    id: string;
    name: string;
    creator_id: string;
    members_count: number;
    max_members: number;
    days_remaining: number | null;
    is_active: boolean;
}

export default function JoinLeaguePage({ params }: { params: Promise<{ code: string }> }) {
    const { code } = use(params);
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth();

    // Fetch league preview by invite code
    const { data: league, isLoading, error } = useQuery<LeaguePreview>({
        queryKey: ["league-preview", code],
        queryFn: async () => {
            // We'll fetch via the join endpoint with a preview flag
            // For now, we'll try to get basic info via a simple lookup
            const res = await fetch(`/api/leagues/preview/${code}`);
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "League not found");
            }
            return res.json();
        },
        enabled: !!code,
        retry: false,
    });

    // Join mutation
    const joinMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch("/api/leagues/join", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ invite_code: code }),
            });
            const data = await res.json();
            if (!res.ok) {
                if (data.already_member) {
                    return { ...data, already_member: true };
                }
                throw new Error(data.error || "Failed to join league");
            }
            return data;
        },
        onSuccess: (data) => {
            if (data.already_member) {
                router.push(`/leagues/${data.league_id}`);
            } else {
                router.push(`/leagues/${data.league_id}`);
            }
        },
    });

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!authLoading && !user) {
            // Store the invite code to redirect back after login
            sessionStorage.setItem("pendingLeagueJoin", code);
            router.push(`/login?redirect=/leagues/join/${code}`);
        }
    }, [user, authLoading, code, router]);

    // Check for pending join after auth
    useEffect(() => {
        if (user && sessionStorage.getItem("pendingLeagueJoin") === code) {
            sessionStorage.removeItem("pendingLeagueJoin");
            joinMutation.mutate();
        }
    }, [user, code]);

    if (authLoading || isLoading) {
        return (
            <AppLayout showRightPanel={false}>
                <div className="flex items-center justify-center h-screen">
                    <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
                </div>
            </AppLayout>
        );
    }

    if (error) {
        return (
            <AppLayout showRightPanel={false}>
                <div className="max-w-md mx-auto pt-20 px-4 text-center">
                    <div className="w-16 h-16 rounded-full bg-rose-500/20 flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-rose-400" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Invalid Invite</h2>
                    <p className="text-white/40 mb-6">
                        This invite link is invalid or the league no longer exists.
                    </p>
                    <Link
                        href="/leagues"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-colors"
                    >
                        Go to My Leagues
                    </Link>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout showRightPanel={false}>
            <div className="max-w-md mx-auto pt-16 px-4 text-center">
                {/* League Preview Card */}
                <div className="p-6 rounded-3xl bg-gradient-to-b from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20 mb-8">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center mx-auto mb-4">
                        <Trophy className="w-8 h-8 text-white" />
                    </div>

                    <h1 className="text-2xl font-bold text-white mb-2">
                        You're invited to join
                    </h1>
                    <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400 mb-4">
                        {league?.name || "Loading..."}
                    </h2>

                    <div className="flex items-center justify-center gap-4 text-sm text-white/50">
                        {league && (
                            <>
                                <span className="flex items-center gap-1">
                                    <Users className="w-4 h-4" />
                                    {league.members_count}/{league.max_members} players
                                </span>
                                {league.days_remaining !== null && league.is_active && (
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        {league.days_remaining}d left
                                    </span>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Join Button */}
                {league?.is_active ? (
                    <button
                        onClick={() => joinMutation.mutate()}
                        disabled={joinMutation.isPending}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-bold text-lg hover:shadow-[0_0_30px_-5px_rgba(139,92,246,0.5)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {joinMutation.isPending ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Joining...
                            </>
                        ) : (
                            <>
                                <Check className="w-5 h-5" />
                                Join League
                            </>
                        )}
                    </button>
                ) : (
                    <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                        This league has ended
                    </div>
                )}

                {joinMutation.isError && (
                    <p className="text-rose-400 text-sm mt-4">
                        {joinMutation.error?.message || "Failed to join league"}
                    </p>
                )}

                {/* Info */}
                <p className="text-sm text-white/30 mt-6">
                    You'll compete using your existing Ticko portfolio. Best P&L wins!
                </p>
            </div>
        </AppLayout>
    );
}
