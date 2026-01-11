"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { Trophy, Medal, TrendingUp, User, Crown, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Sidebar } from "@/components/layout/Sidebar";
import { RightPanel } from "@/components/layout/RightPanel";

interface Leader {
    id: string;
    username: string;
    avatar_url: string | null;
    reputation_score: number;
}

export default function LeaderboardPage() {
    const { data: leaders, isLoading } = useQuery<Leader[]>({
        queryKey: ["leaderboard"],
        queryFn: async () => {
            const { data, error } = await (supabase as any)
                .from("profiles")
                .select("id, username, avatar_url, reputation_score")
                .order("reputation_score", { ascending: false })
                .limit(50);

            if (error) throw error;
            return data as Leader[];
        },
    });

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

    const showPodium = leaders && leaders.length >= 3;
    const listStartIndex = showPodium ? 3 : 0;

    return (
        <div className="flex min-h-screen bg-[#020617]">
            <Sidebar />
            <main className="flex-1 border-x border-white/5 overflow-y-auto">
                <div className="max-w-2xl mx-auto pt-8 pb-20 px-4">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 mb-4 shadow-[0_0_30px_-10px_rgba(234,179,8,0.3)]">
                            <Trophy className="w-8 h-8 text-yellow-400" />
                        </div>
                        <h1 className="text-2xl font-extrabold text-white mb-2 tracking-tight">Topplistan</h1>
                        <p className="text-sm text-white/40">Sveriges vassaste aktieanalytiker just nu</p>
                    </div>

                    {/* Top 3 Podium (Visual) */}
                    {showPodium && leaders && (
                        <div className="grid grid-cols-3 gap-4 items-end mb-12">
                            {/* 2nd Place */}
                            <Link href={`/profil/${leaders[1].username}`} className="order-1 group">
                                <div className="relative flex flex-col items-center">
                                    <div className="relative mb-3 transition-transform group-hover:-translate-y-2 duration-300">
                                        <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-b from-slate-300 to-slate-500">
                                            <div className="w-full h-full rounded-full overflow-hidden bg-[#020617] relative">
                                                {leaders[1].avatar_url ? (
                                                    <Image src={leaders[1].avatar_url} alt={leaders[1].username} fill className="object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-slate-400/20">
                                                        <User className="w-8 h-8 text-slate-400" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-slate-700 border-2 border-[#020617] flex items-center justify-center text-xs font-bold text-white shadow-lg">
                                            2
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <p className="font-bold text-white text-sm truncate max-w-full">
                                            @{leaders[1].username}
                                        </p>
                                        <p className="text-xs text-slate-400 font-medium">{leaders[1].reputation_score} p</p>
                                    </div>
                                </div>
                            </Link>

                            {/* 1st Place */}
                            <Link href={`/profil/${leaders[0].username}`} className="order-2 group z-10 -mt-8">
                                <div className="relative flex flex-col items-center">
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-yellow-400 animate-bounce">
                                        <Crown className="w-8 h-8 fill-yellow-400/20" />
                                    </div>
                                    <div className="relative mb-3 transition-transform group-hover:-translate-y-2 duration-300">
                                        <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-b from-yellow-300 via-yellow-400 to-orange-500 shadow-[0_0_50px_-10px_rgba(234,179,8,0.4)]">
                                            <div className="w-full h-full rounded-full overflow-hidden bg-[#020617] relative">
                                                {leaders[0].avatar_url ? (
                                                    <Image src={leaders[0].avatar_url} alt={leaders[0].username} fill className="object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-yellow-400/20">
                                                        <User className="w-10 h-10 text-yellow-400" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-yellow-500 border-2 border-[#020617] flex items-center justify-center text-sm font-bold text-[#020617] shadow-lg">
                                            1
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <p className="font-bold text-white text-base truncate max-w-full">
                                            @{leaders[0].username}
                                        </p>
                                        <p className="text-sm text-yellow-400 font-bold">{leaders[0].reputation_score} p</p>
                                    </div>
                                </div>
                            </Link>

                            {/* 3rd Place */}
                            <Link href={`/profil/${leaders[2].username}`} className="order-3 group">
                                <div className="relative flex flex-col items-center">
                                    <div className="relative mb-3 transition-transform group-hover:-translate-y-2 duration-300">
                                        <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-b from-orange-400 to-amber-700">
                                            <div className="w-full h-full rounded-full overflow-hidden bg-[#020617] relative">
                                                {leaders[2].avatar_url ? (
                                                    <Image src={leaders[2].avatar_url} alt={leaders[2].username} fill className="object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-orange-400/20">
                                                        <User className="w-8 h-8 text-orange-400" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-amber-800 border-2 border-[#020617] flex items-center justify-center text-xs font-bold text-white shadow-lg">
                                            3
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <p className="font-bold text-white text-sm truncate max-w-full">
                                            @{leaders[2].username}
                                        </p>
                                        <p className="text-xs text-orange-400 font-medium">{leaders[2].reputation_score} p</p>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    )}

                    {/* List View (Rest of the users) */}
                    <div className="bg-white/[0.04] border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl">
                        {leaders?.slice(listStartIndex).map((user, index) => {
                            const rank = listStartIndex + index + 1;
                            return (
                                <Link
                                    href={`/profil/${user.username}`}
                                    key={user.id}
                                    className="flex items-center gap-4 p-4 border-b border-white/5 hover:bg-white/[0.02] transition-colors last:border-0"
                                >
                                    <div className="w-8 font-bold text-white/30 text-center">
                                        {rank}
                                    </div>
                                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-white/10">
                                        {user.avatar_url ? (
                                            <Image src={user.avatar_url} alt={user.username} fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <User className="w-5 h-5 text-white/40" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-white text-sm truncate">@{user.username}</h3>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-bold text-white text-sm">{user.reputation_score}</span>
                                        <span className="text-xs text-white/30 ml-1">p</span>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>

                    {(!leaders || leaders.length === 0) && (
                        <div className="text-center py-12 text-white/40">
                            Inga användare hittades.
                        </div>
                    )}
                </div>
            </main>
            <RightPanel />
        </div>
    );
}
