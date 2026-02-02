"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { RightPanel } from "@/components/layout/RightPanel";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { AchievementsDisplay } from "@/components/profile/AchievementsDisplay";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/lib/supabase/client";
import { Loader2, TrendingUp, MessageSquare, Star, Trophy, Target } from "lucide-react";
import { motion } from "framer-motion";
import { PostCard } from "@/components/feed/PostCard";
import Link from "next/link";

export default function ProfilePage() {
    const { user } = useAuth();
    const [profile, setProfile] = useState<any>(null);
    const [posts, setPosts] = useState<any[]>([]);
    const [watchlist, setWatchlist] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Fetch profile
                const { data: profileData } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", user.id)
                    .single();
                setProfile(profileData);

                // Fetch real posts
                const { data: postsData } = await supabase
                    .from("posts")
                    .select(`
                        *,
                        profiles (*)
                    `)
                    .eq("user_id", user.id)
                    .order("created_at", { ascending: false });
                setPosts(postsData || []);

                // Fetch watchlist
                const res = await fetch("/api/watchlist");
                const wData = await res.json();
                setWatchlist(wData.stocks || []);
            } catch (error) {
                console.error("Profile fetch error:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [user]);

    if (!user) {
        return (
            <div className="flex min-h-screen">
                <Sidebar />
                <main className="flex-1 flex items-center justify-center p-6 text-center">
                    <div className="space-y-4">
                        <h1 className="text-2xl font-black text-white uppercase tracking-widest">Log in to view profile</h1>
                        <p className="text-white/50">You must be logged in to view your personal page.</p>
                        <Link href="/login" className="btn-gradient px-6 py-2 rounded-xl text-white font-bold inline-block">
                            Log in
                        </Link>
                    </div>
                </main>
                <RightPanel />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen relative">
            {/* Sidebar Background Extensions - fills full page height on desktop */}
            <div className="hidden lg:block fixed left-0 top-0 bottom-0 w-64 bg-white/[0.02] border-r border-white/10 -z-10" />
            <div className="hidden lg:block fixed right-0 top-0 bottom-0 w-80 bg-white/[0.02] border-l border-white/10 -z-10" />
            
            <Sidebar />

            <main className="flex-1 border-r border-white/10 px-3 pt-16 pb-20 sm:px-8 sm:pt-20 md:pb-8">
                {isLoading ? (
                    <div className="h-full flex flex-col items-center justify-center gap-4">
                        <Loader2 className="w-10 h-10 animate-spin text-emerald-400" />
                        <p className="text-white/40 font-bold uppercase tracking-widest text-xs">
                            Loading profile...
                        </p>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-5xl mx-auto space-y-8"
                    >
                        {profile && <ProfileHeader profile={profile} />}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Feed Column */}
                            <div className="md:col-span-2 space-y-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <MessageSquare className="w-5 h-5 text-emerald-400" />
                                    <h3 className="text-sm font-bold text-white uppercase tracking-widest">Your Posts</h3>
                                </div>

                                {posts.length > 0 ? (
                                    <div className="space-y-4">
                                        {posts.map((post) => (
                                            <PostCard key={post.id} post={post} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-12 rounded-[2rem] border border-white/5 bg-white/[0.02] text-center space-y-4">
                                        <p className="text-white/30 text-sm">You haven't shared any thoughts yet.</p>
                                        <Link href="/discover" className="text-emerald-400 font-bold text-sm hover:underline block">
                                            Explore the market
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {/* Sidebar Column */}
                            <div className="space-y-8">
                                {/* Insights Card */}
                                <div className="p-6 rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/[0.08] to-transparent">
                                    <div className="flex items-center gap-2 mb-6">
                                        <TrendingUp className="w-5 h-5 text-blue-400" />
                                        <h3 className="text-sm font-bold text-white uppercase tracking-widest">Statistics</h3>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center p-3 rounded-xl bg-white/[0.04]">
                                            <span className="text-xs text-white/50">Posts</span>
                                            <span className="text-sm font-bold text-white">{posts.length}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 rounded-xl bg-white/[0.04]">
                                            <span className="text-xs text-white/50">Reputation</span>
                                            <span className="text-sm font-bold text-emerald-400">{posts.reduce((sum, post) => sum + (post.up_count || 0), 0)}</span>
                                        </div>
                                        {/* Prediction stats */}
                                        {(profile?.total_predictions || 0) > 0 && (
                                            <>
                                                <div className="flex justify-between items-center p-3 rounded-xl bg-white/[0.04]">
                                                    <span className="text-xs text-white/50 flex items-center gap-1">
                                                        <Target className="w-3 h-3" /> Accuracy
                                                    </span>
                                                    <span className="text-sm font-bold text-purple-400">
                                                        {Math.round(((profile?.correct_predictions || 0) / (profile?.total_predictions || 1)) * 100)}%
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center p-3 rounded-xl bg-white/[0.04]">
                                                    <span className="text-xs text-white/50">Predictions</span>
                                                    <span className="text-sm font-bold text-white">
                                                        {profile?.correct_predictions || 0}/{profile?.total_predictions || 0}
                                                    </span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Achievements Card */}
                                <div className="p-6 rounded-[2rem] border border-white/10 bg-white/[0.02]">
                                    {user && <AchievementsDisplay userId={user.id} />}
                                </div>

                                {/* Watchlist Card */}
                                <div className="p-6 rounded-[2rem] border border-white/10 bg-white/[0.02]">
                                    <div className="flex items-center gap-2 mb-6">
                                        <Star className="w-5 h-5 text-yellow-400" />
                                        <h3 className="text-sm font-bold text-white uppercase tracking-widest">Watched</h3>
                                    </div>
                                    <div className="space-y-2">
                                        {watchlist.length > 0 ? (
                                            watchlist.map((stock) => (
                                                <Link
                                                    key={stock.symbol}
                                                    href={`/stock/${stock.symbol}`}
                                                    className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10"
                                                >
                                                    <span className="text-sm font-bold text-white">${stock.symbol}</span>
                                                    <span className={`text-xs font-medium ${stock.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                        {stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                                                    </span>
                                                </Link>
                                            ))
                                        ) : (
                                            <p className="text-xs text-white/30 italic">Your favorite stocks will appear here.</p>
                                        )}
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
