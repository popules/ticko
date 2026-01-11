"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Trophy, Medal, TrendingUp, Shield } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

// Initialize existing client just for this page's data fetching if needed, 
// or use the hook/provider if preferred. Keeping it simple.
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LeaderboardPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            const { data, error } = await (supabase as any)
                .from("profiles")
                .select("*")
                .order("reputation_score", { ascending: false })
                .limit(20);

            if (!error && data) {
                setUsers(data as any[]);
            }
            setIsLoading(false);
        };

        fetchLeaderboard();
    }, []);

    const getRankIcon = (index: number) => {
        switch (index) {
            case 0: return <Trophy className="w-6 h-6 text-yellow-400 fill-yellow-400" />;
            case 1: return <Medal className="w-6 h-6 text-gray-300 fill-gray-300" />;
            case 2: return <Medal className="w-6 h-6 text-amber-600 fill-amber-600" />;
            default: return <span className="text-lg font-bold text-white/40">#{index + 1}</span>;
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <header className="mb-8 text-center">
                <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-amber-600/20 border border-yellow-500/30 mb-4 shadow-lg shadow-yellow-500/10">
                    <Trophy className="w-8 h-8 text-yellow-400" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">Topplistan</h1>
                <p className="text-white/60">Sveriges bästa aktieanalytiker just nu</p>
            </header>

            <div className="bg-white/[0.04] backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden">
                <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/10 text-xs font-bold text-white/40 uppercase tracking-widest">
                    <div className="col-span-2 text-center">Rank</div>
                    <div className="col-span-6">Användare</div>
                    <div className="col-span-4 text-right">Reputation Score</div>
                </div>

                <div className="divide-y divide-white/5">
                    {isLoading ? (
                        [1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="grid grid-cols-12 gap-4 p-4 items-center animate-pulse">
                                <div className="col-span-2 flex justify-center"><div className="w-8 h-8 rounded-full bg-white/5" /></div>
                                <div className="col-span-6 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white/5" />
                                    <div className="h-4 w-32 bg-white/5 rounded" />
                                </div>
                                <div className="col-span-4 flex justify-end"><div className="h-6 w-16 bg-white/5 rounded" /></div>
                            </div>
                        ))
                    ) : (
                        users.map((user, index) => (
                            <motion.div
                                key={user.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="group"
                            >
                                <Link
                                    href={`/profil/${user.id}`}
                                    className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/[0.04] transition-colors"
                                >
                                    {/* Rank */}
                                    <div className="col-span-2 flex justify-center items-center">
                                        {getRankIcon(index)}
                                    </div>

                                    {/* User */}
                                    <div className="col-span-6 flex items-center gap-4">
                                        <div className="relative">
                                            {user.avatar_url ? (
                                                <img
                                                    src={user.avatar_url}
                                                    alt={user.username}
                                                    className="w-10 h-10 rounded-full object-cover border-2 border-white/10 group-hover:border-emerald-500/50 transition-colors"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-bold text-sm border-2 border-white/10">
                                                    {user.username?.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            {index < 3 && (
                                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center border border-[#0B0F17]">
                                                    <StarIcon index={index} />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-white group-hover:text-emerald-400 transition-colors">
                                                {user.username}
                                            </p>
                                            <p className="text-xs text-white/40">
                                                Medlem sedan {new Date(user.created_at).getFullYear()}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Score */}
                                    <div className="col-span-4 text-right">
                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold font-mono">
                                            <Shield className="w-3 h-3" />
                                            {user.reputation_score} xp
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

function StarIcon({ index }: { index: number }) {
    if (index === 0) return <span className="text-[8px]">👑</span>;
    if (index === 1) return <span className="text-[8px]">🥈</span>;
    return <span className="text-[8px]">🥉</span>;
}
