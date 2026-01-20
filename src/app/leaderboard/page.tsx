"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { Trophy, Medal, TrendingUp, TrendingDown, User, Crown, Loader2, Gamepad2, RotateCcw, Calendar, Clock, ChevronDown, History } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Sidebar } from "@/components/layout/Sidebar";
import { RightPanel } from "@/components/layout/RightPanel";
import { useState } from "react";
import { useAuth } from "@/providers/AuthProvider";

interface Leader {
    id: string;
    username: string;
    avatar_url: string | null;
    reputation_score: number;
    paper_total_pnl?: number;
    paper_season_pnl?: number;
    paper_reset_count?: number;
    paper_season_number?: number;
    is_pro?: boolean;
}

interface Season {
    id: string;
    name: string;
    start_date: string;
    end_date: string | null;
    is_active: boolean;
}

interface SeasonWinner {
    season_id: string;
    season_name: string;
    winner_username: string;
    winner_avatar_url: string | null;
    final_value: number;
    final_rank: number;
    ended_at: string;
}

type LeaderboardTab = "reputation" | "paper";
type PaperTimeframe = "season" | "alltime";

export default function LeaderboardPage() {
    const [activeTab, setActiveTab] = useState<LeaderboardTab>("reputation");
    const [paperTimeframe, setPaperTimeframe] = useState<PaperTimeframe>("season");

    // Reputation leaderboard
    const { data: reputationLeaders, isLoading: isRepLoading } = useQuery<Leader[]>({
        queryKey: ["leaderboard-reputation"],
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

    // Paper trading leaderboard (all-time)
    const { data: paperAllTimeLeaders, isLoading: isPaperAllTimeLoading } = useQuery<Leader[]>({
        queryKey: ["leaderboard-paper-alltime"],
        queryFn: async () => {
            const { data, error } = await (supabase as any)
                .from("profiles")
                .select("id, username, avatar_url, paper_total_pnl, paper_reset_count, is_pro")
                .not("paper_total_pnl", "is", null)
                .order("paper_total_pnl", { ascending: false })
                .limit(50);

            if (error) throw error;
            return data as Leader[];
        },
    });

    // Paper trading leaderboard (current season)
    const { data: paperSeasonLeaders, isLoading: isPaperSeasonLoading } = useQuery<Leader[]>({
        queryKey: ["leaderboard-paper-season"],
        queryFn: async () => {
            const { data, error } = await (supabase as any)
                .from("profiles")
                .select("id, username, avatar_url, paper_season_pnl, paper_season_number, paper_reset_count, is_pro")
                .order("paper_season_pnl", { ascending: false })
                .limit(50);

            if (error) throw error;
            return data as Leader[];
        },
    });

    // Current active season
    const { data: currentSeason } = useQuery<Season | null>({
        queryKey: ["current-season"],
        queryFn: async () => {
            const { data, error } = await (supabase as any)
                .from("seasons")
                .select("*")
                .eq("is_active", true)
                .single();

            if (error) return null;
            return data as Season;
        },
    });

    // Hall of Fame: Past season winners from historical_portfolios
    const { data: seasonWinners } = useQuery<SeasonWinner[]>({
        queryKey: ["season-winners"],
        queryFn: async () => {
            // Get past (non-active) seasons
            const { data: pastSeasons, error: seasonError } = await (supabase as any)
                .from("seasons")
                .select("id, name, end_date")
                .eq("is_active", false)
                .order("end_date", { ascending: false })
                .limit(10);

            if (seasonError || !pastSeasons || pastSeasons.length === 0) return [];

            // Get winners for each past season
            const winners: SeasonWinner[] = [];
            for (const season of pastSeasons) {
                const { data: winner } = await (supabase as any)
                    .from("historical_portfolios")
                    .select("final_value, final_rank, user_id")
                    .eq("season_id", season.id)
                    .eq("final_rank", 1)
                    .single();

                if (winner) {
                    // Get username
                    const { data: profile } = await (supabase as any)
                        .from("profiles")
                        .select("username, avatar_url")
                        .eq("id", winner.user_id)
                        .single();

                    winners.push({
                        season_id: season.id,
                        season_name: season.name,
                        winner_username: profile?.username || "Okänd",
                        winner_avatar_url: profile?.avatar_url || null,
                        final_value: winner.final_value,
                        final_rank: 1,
                        ended_at: season.end_date,
                    });
                }
            }
            return winners;
        },
    });



    const [showSeasonHistory, setShowSeasonHistory] = useState(false);

    const isLoading = activeTab === "reputation"
        ? isRepLoading
        : (paperTimeframe === "season" ? isPaperSeasonLoading : isPaperAllTimeLoading);

    const leaders = activeTab === "reputation"
        ? reputationLeaders
        : (paperTimeframe === "season" ? paperSeasonLeaders : paperAllTimeLeaders);

    const currentSeasonName = currentSeason?.name || "Säsong 1: Genesis";

    // Calculate days until end of month reset
    const now = new Date();
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const daysUntilReset = lastDayOfMonth - now.getDate();

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

    const getScoreDisplay = (user: Leader) => {
        if (activeTab === "reputation") {
            return `${user.reputation_score} p`;
        }
        const pnl = paperTimeframe === "season" ? (user.paper_season_pnl || 0) : (user.paper_total_pnl || 0);
        const prefix = pnl >= 0 ? "+" : "";
        return `${prefix}${pnl.toLocaleString("en-US", { maximumFractionDigits: 0 })} kr`;
    };

    const getScoreColor = (user: Leader, position: number) => {
        if (activeTab === "reputation") {
            if (position === 0) return "text-yellow-400";
            if (position === 1) return "text-slate-400";
            if (position === 2) return "text-orange-400";
            return "text-white";
        }
        const pnl = paperTimeframe === "season" ? (user.paper_season_pnl || 0) : (user.paper_total_pnl || 0);
        return pnl >= 0 ? "text-emerald-400" : "text-rose-400";
    };

    return (
        <div className="flex min-h-screen bg-[#020617]">
            <Sidebar />
            <main className="flex-1 border-x border-white/5 overflow-y-auto">
                <div className="max-w-2xl mx-auto pt-8 pb-20 px-4">
                    {/* Header */}
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 mb-4 shadow-[0_0_30px_-10px_rgba(234,179,8,0.3)]">
                            <Trophy className="w-8 h-8 text-yellow-400" />
                        </div>
                        <h1 className="text-2xl font-extrabold text-white mb-2 tracking-tight">Topplistan</h1>
                        <p className="text-sm text-white/40">The best stock analysts in the world</p>
                    </div>

                    {/* Tab Selector */}
                    <div className="flex gap-2 mb-4 p-1 bg-white/[0.04] rounded-xl border border-white/10">
                        <button
                            onClick={() => setActiveTab("reputation")}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold text-sm transition-all ${activeTab === "reputation"
                                ? "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 border border-yellow-500/30"
                                : "text-white/40 hover:text-white/60"
                                }`}
                        >
                            <Medal className="w-4 h-4" />
                            Rykte
                        </button>
                        <button
                            onClick={() => setActiveTab("paper")}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold text-sm transition-all ${activeTab === "paper"
                                ? "bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 text-violet-400 border border-violet-500/30"
                                : "text-white/40 hover:text-white/60"
                                }`}
                        >
                            <Gamepad2 className="w-4 h-4" />
                            Paper Trading
                        </button>
                    </div>

                    {/* Paper Trading Sub-tabs */}
                    {activeTab === "paper" && (
                        <div className="mb-6 space-y-4">
                            {/* Season/All-time Toggle */}
                            <div className="flex gap-2 p-1 bg-white/[0.02] rounded-lg border border-white/5">
                                <button
                                    onClick={() => setPaperTimeframe("season")}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-bold transition-all ${paperTimeframe === "season"
                                        ? "bg-violet-500/20 text-violet-400 border border-violet-500/20"
                                        : "text-white/40 hover:text-white/60"
                                        }`}
                                >
                                    <Calendar className="w-3 h-3" />
                                    {currentSeasonName}
                                </button>
                                <button
                                    onClick={() => setPaperTimeframe("alltime")}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-bold transition-all ${paperTimeframe === "alltime"
                                        ? "bg-violet-500/20 text-violet-400 border border-violet-500/20"
                                        : "text-white/40 hover:text-white/60"
                                        }`}
                                >
                                    <Trophy className="w-3 h-3" />
                                    All-time
                                </button>
                            </div>

                            {/* Season Info Banner */}
                            {paperTimeframe === "season" && (
                                <div className="p-4 rounded-xl bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-bold text-white">{currentSeasonName}</p>
                                            <p className="text-xs text-white/40">Who takes the crown?</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                                                <Clock className="w-3 h-3" />
                                                {daysUntilReset} dag{daysUntilReset !== 1 ? "ar" : ""} kvar
                                            </div>
                                            <p className="text-[10px] text-white/30">Reset varje månad</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Last Season Winner */}
                            {seasonWinners && seasonWinners.length > 0 && paperTimeframe === "season" && (
                                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Crown className="w-5 h-5 text-amber-400" />
                                            <div>
                                                <p className="text-xs text-amber-400/60 uppercase tracking-wider">Förra säsongen</p>
                                                <p className="text-sm font-bold text-white">@{seasonWinners[0].winner_username}</p>
                                            </div>
                                        </div>
                                        <span className="text-emerald-400 font-bold text-sm">
                                            {seasonWinners[0].final_value?.toLocaleString("en-US", { maximumFractionDigits: 0 })} kr
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Season History (Collapsible) */}
                            {seasonWinners && seasonWinners.length > 1 && paperTimeframe === "season" && (
                                <div className="rounded-xl border border-white/10 overflow-hidden">
                                    <button
                                        onClick={() => setShowSeasonHistory(!showSeasonHistory)}
                                        className="w-full p-3 flex items-center justify-between bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                                    >
                                        <div className="flex items-center gap-2 text-white/50">
                                            <History className="w-4 h-4" />
                                            <span className="text-xs font-bold">Hall of Fame</span>
                                            <span className="text-[10px] text-white/30">({seasonWinners.length} säsonger)</span>
                                        </div>
                                        <ChevronDown className={`w-4 h-4 text-white/30 transition-transform ${showSeasonHistory ? "rotate-180" : ""}`} />
                                    </button>

                                    {showSeasonHistory && (
                                        <div className="border-t border-white/5">
                                            {seasonWinners.map((winner, idx) => (
                                                <div
                                                    key={winner.season_id}
                                                    className={`flex items-center justify-between p-3 ${idx !== seasonWinners.length - 1 ? "border-b border-white/5" : ""}`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center">
                                                            <Crown className="w-3 h-3 text-amber-400" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-white/40">{winner.season_name}</p>
                                                            <p className="text-sm font-bold text-white">@{winner.winner_username}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-emerald-400 font-bold text-sm tabular-nums">
                                                            {winner.final_value?.toLocaleString("en-US", { maximumFractionDigits: 0 })} kr
                                                        </p>
                                                        <p className="text-[10px] text-white/30">
                                                            {winner.ended_at ? new Date(winner.ended_at).toLocaleDateString("en-US") : ""}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Top 3 Podium */}
                    {showPodium && leaders && (
                        <div className="grid grid-cols-3 gap-4 items-end mb-12">
                            {/* 2nd Place */}
                            <Link href={`/profile/${leaders[1].username}`} className="order-1 group">
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
                                        <div className="flex items-center justify-center gap-1">
                                            <p className="font-bold text-white text-sm truncate max-w-full">@{leaders[1].username}</p>
                                            {leaders[1].is_pro && <span className="text-amber-400 text-xs">👑</span>}
                                        </div>
                                        <p className={`text-xs font-medium ${getScoreColor(leaders[1], 1)}`}>
                                            {getScoreDisplay(leaders[1])}
                                        </p>
                                    </div>
                                </div>
                            </Link>

                            {/* 1st Place */}
                            <Link href={`/profile/${leaders[0].username}`} className="order-2 group z-10 -mt-8">
                                <div className="relative flex flex-col items-center">
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-yellow-400 animate-bounce">
                                        <Crown className="w-8 h-8 fill-yellow-400/20" />
                                    </div>
                                    <div className="relative mb-3 transition-transform group-hover:-translate-y-2 duration-300">
                                        <div className={`w-24 h-24 rounded-full p-1 shadow-[0_0_50px_-10px_rgba(234,179,8,0.4)] ${activeTab === "paper"
                                            ? "bg-gradient-to-b from-violet-300 via-violet-400 to-fuchsia-500"
                                            : "bg-gradient-to-b from-yellow-300 via-yellow-400 to-orange-500"
                                            }`}>
                                            <div className="w-full h-full rounded-full overflow-hidden bg-[#020617] relative">
                                                {leaders[0].avatar_url ? (
                                                    <Image src={leaders[0].avatar_url} alt={leaders[0].username} fill className="object-cover" />
                                                ) : (
                                                    <div className={`w-full h-full flex items-center justify-center ${activeTab === "paper" ? "bg-violet-400/20" : "bg-yellow-400/20"
                                                        }`}>
                                                        <User className={`w-10 h-10 ${activeTab === "paper" ? "text-violet-400" : "text-yellow-400"}`} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 w-9 h-9 rounded-full border-2 border-[#020617] flex items-center justify-center text-sm font-bold shadow-lg ${activeTab === "paper" ? "bg-violet-500 text-white" : "bg-yellow-500 text-[#020617]"
                                            }`}>
                                            1
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <p className="font-bold text-white text-base truncate max-w-full">@{leaders[0].username}</p>
                                            {leaders[0].is_pro && <span className="text-amber-400">👑</span>}
                                        </div>
                                        <p className={`text-sm font-bold ${getScoreColor(leaders[0], 0)}`}>
                                            {getScoreDisplay(leaders[0])}
                                        </p>
                                    </div>
                                </div>
                            </Link>

                            {/* 3rd Place */}
                            <Link href={`/profile/${leaders[2].username}`} className="order-3 group">
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
                                        <div className="flex items-center justify-center gap-1">
                                            <p className="font-bold text-white text-sm truncate max-w-full">@{leaders[2].username}</p>
                                            {leaders[2].is_pro && <span className="text-amber-400 text-xs">👑</span>}
                                        </div>
                                        <p className={`text-xs font-medium ${getScoreColor(leaders[2], 2)}`}>
                                            {getScoreDisplay(leaders[2])}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    )}

                    {/* List View */}
                    <div className="bg-white/[0.04] border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl">
                        {leaders?.slice(listStartIndex).map((user, index) => {
                            const rank = listStartIndex + index + 1;
                            const pnl = paperTimeframe === "season" ? (user.paper_season_pnl || 0) : (user.paper_total_pnl || 0);

                            return (
                                <Link
                                    href={`/profile/${user.username}`}
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
                                        <div className="flex items-center gap-1">
                                            <h3 className="font-bold text-white text-sm truncate">@{user.username}</h3>
                                            {user.is_pro && <span className="text-amber-400 text-xs">👑</span>}
                                        </div>
                                        {activeTab === "paper" && user.paper_reset_count && user.paper_reset_count > 0 && (
                                            <span className="text-[10px] text-amber-400/60 flex items-center gap-1">
                                                <RotateCcw className="w-2.5 h-2.5" /> {user.paper_reset_count} resets
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-right flex items-center gap-1">
                                        {activeTab === "paper" && (
                                            pnl >= 0
                                                ? <TrendingUp className="w-4 h-4 text-emerald-400" />
                                                : <TrendingDown className="w-4 h-4 text-rose-400" />
                                        )}
                                        <span className={`font-bold text-sm ${activeTab === "reputation"
                                            ? "text-white"
                                            : pnl >= 0 ? "text-emerald-400" : "text-rose-400"
                                            }`}>
                                            {getScoreDisplay(user)}
                                        </span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>

                    {(!leaders || leaders.length === 0) && (
                        <div className="text-center py-12 text-white/40">
                            {activeTab === "paper"
                                ? "Ingen har paper tradat ännu. Bli först!"
                                : "Inga användare hittades."}
                        </div>
                    )}
                </div>
            </main>
            <RightPanel />
        </div>
    );
}
