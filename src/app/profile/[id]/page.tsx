"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/lib/supabase/client";
import { Loader2, MessageSquare, TrendingUp, Gamepad2 } from "lucide-react";
import { motion } from "framer-motion";
import { PostCard } from "@/components/feed/PostCard";
import { useParams, useRouter } from "next/navigation";
import { PaperTradingStats } from "@/components/portfolio/PaperTradingStats";
import { SeasonHistory } from "@/components/portfolio/SeasonHistory";

export default function PublicProfilePage() {
    const { user } = useAuth();
    const params = useParams();
    const router = useRouter();
    const userId = params.id as string;

    const [profile, setProfile] = useState<any>(null);
    const [posts, setPosts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!userId) return;

        // If visiting own ID, redirect to /profil
        if (user && userId === user.id) {
            router.push("/profil");
            return;
        }

        const fetchData = async () => {
            setIsLoading(true);
            try {
                // First try to fetch by UUID
                let profileData = null;
                const { data: byId } = await (supabase as any)
                    .from("profiles")
                    .select("*")
                    .eq("id", userId)
                    .single();

                if (byId) {
                    profileData = byId;
                } else {
                    // Try by username if UUID match fails
                    const { data: byUsername } = await (supabase as any)
                        .from("profiles")
                        .select("*")
                        .eq("username", userId)
                        .single();
                    profileData = byUsername;
                }

                setProfile(profileData);

                // Fetch posts using the actual profile ID
                if (profileData?.id) {
                    const { data: postsData } = await (supabase as any)
                        .from("posts")
                        .select(`
                            *,
                            profiles (*)
                        `)
                        .eq("user_id", profileData.id)
                        .order("created_at", { ascending: false });
                    setPosts(postsData || []);
                }

            } catch (error) {
                console.error("Profile fetch error:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [userId, user, router]);

    return (
        <AppLayout showRightPanel={true}>
            <div className="p-4 md:p-8">
                {isLoading ? (
                    <div className="h-full flex flex-col items-center justify-center gap-4">
                        <Loader2 className="w-10 h-10 animate-spin text-emerald-400" />
                        <p className="text-white/40 font-bold uppercase tracking-widest text-xs">
                            Loading profile...
                        </p>
                    </div>
                ) : !profile ? (
                    <div className="h-full flex flex-col items-center justify-center gap-4">
                        <h1 className="text-2xl font-black text-white">User not found</h1>
                        <p className="text-white/40">This profile doesn't seem to exist.</p>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-5xl mx-auto space-y-8"
                    >
                        <ProfileHeader profile={profile} isOwnProfile={false} />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Feed Column */}
                            <div className="md:col-span-2 space-y-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <MessageSquare className="w-5 h-5 text-emerald-400" />
                                    <h3 className="text-sm font-bold text-white uppercase tracking-widest">Posts</h3>
                                </div>

                                {posts.length > 0 ? (
                                    <div className="space-y-4">
                                        {posts.map((post) => (
                                            <PostCard key={post.id} post={post} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-12 rounded-[2rem] border border-white/5 bg-white/[0.02] text-center">
                                        <p className="text-white/30 text-sm">No posts yet.</p>
                                    </div>
                                )}
                            </div>

                            {/* Stats Card */}
                            <div className="space-y-6">
                                <div className="p-6 rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/[0.08] to-transparent">
                                    <div className="flex items-center gap-2 mb-6">
                                        <TrendingUp className="w-5 h-5 text-blue-400" />
                                        <h3 className="text-sm font-bold text-white uppercase tracking-widest">Activity</h3>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center p-3 rounded-xl bg-white/[0.04]">
                                            <span className="text-xs text-white/50">Reputation</span>
                                            <span className="text-sm font-bold text-emerald-400">{posts.reduce((sum, post) => sum + (post.up_count || 0), 0)}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 rounded-xl bg-white/[0.04]">
                                            <span className="text-xs text-white/50">Post count</span>
                                            <span className="text-sm font-bold text-white">{posts.length}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Paper Trading Stats - only shows if user has paper trades */}
                                {profile?.id && <PaperTradingStats userId={profile.id} />}

                                {/* Season History with Badges */}
                                {profile?.id && <SeasonHistory userId={profile.id} />}
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </AppLayout>
    );
}
