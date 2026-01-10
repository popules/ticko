"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { RightPanel } from "@/components/layout/RightPanel";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/lib/supabase/client";
import { Loader2, TrendingUp, MessageSquare, Star } from "lucide-react";
import { motion } from "framer-motion";

export default function ProfilePage() {
    const { user } = useAuth();
    const [profile, setProfile] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchProfile = async () => {
            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single();

            if (!error) {
                setProfile(data);
            }
            setIsLoading(false);
        };

        fetchProfile();
    }, [user]);

    if (!user) {
        return (
            <div className="flex min-h-screen items-center justify-center p-6 text-center">
                <div className="space-y-4">
                    <h1 className="text-2xl font-black text-white uppercase tracking-widest">Logga in för att se profil</h1>
                    <p className="text-white/50">Du måste vara inloggad för att se din personliga sida.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen">
            <Sidebar />

            <main className="flex-1 border-r border-white/10 p-8">
                {isLoading ? (
                    <div className="h-full flex flex-col items-center justify-center gap-4">
                        <Loader2 className="w-10 h-10 animate-spin text-emerald-400" />
                        <p className="text-white/40 font-bold uppercase tracking-widest text-xs">
                            Hämtar profil...
                        </p>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-5xl mx-auto space-y-8"
                    >
                        <ProfileHeader profile={profile} />

                        {/* Profile Tabs/Content */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Feed Column */}
                            <div className="md:col-span-2 space-y-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <MessageSquare className="w-5 h-5 text-emerald-400" />
                                    <h3 className="text-sm font-bold text-white uppercase tracking-widest">Dina Inlägg</h3>
                                </div>
                                <div className="p-12 rounded-[2rem] border border-white/5 bg-white/[0.02] text-center space-y-4">
                                    <p className="text-white/30 text-sm">Du har inte delat några tankar än.</p>
                                    <button className="text-emerald-400 font-bold text-sm hover:underline">
                                        Gör ditt första inlägg
                                    </button>
                                </div>
                            </div>

                            {/* Sidebar Column */}
                            <div className="space-y-8">
                                {/* Insights Card */}
                                <div className="p-6 rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/[0.08] to-transparent">
                                    <div className="flex items-center gap-2 mb-6">
                                        <TrendingUp className="w-5 h-5 text-blue-400" />
                                        <h3 className="text-sm font-bold text-white uppercase tracking-widest">Statistik</h3>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center p-3 rounded-xl bg-white/[0.04]">
                                            <span className="text-xs text-white/50">Vinstmål nådda</span>
                                            <span className="text-sm font-bold text-emerald-400">12</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 rounded-xl bg-white/[0.04]">
                                            <span className="text-xs text-white/50">Givna tips</span>
                                            <span className="text-sm font-bold text-white">45</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 rounded-xl bg-white/[0.04]">
                                            <span className="text-xs text-white/50">Rank</span>
                                            <span className="text-sm font-bold text-blue-400">Analytiker</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Watchlist Card */}
                                <div className="p-6 rounded-[2rem] border border-white/10 bg-white/[0.02]">
                                    <div className="flex items-center gap-2 mb-6">
                                        <Star className="w-5 h-5 text-yellow-400" />
                                        <h3 className="text-sm font-bold text-white uppercase tracking-widest">Bevakat</h3>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-xs text-white/30 italic">Här kommer dina favoritaktier att synas.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </main>

            <RightPanel />
        </div>
    );
}
