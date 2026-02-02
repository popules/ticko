"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { User, Users, ChevronRight } from "lucide-react";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { FollowButton } from "@/components/social/FollowButton";
import { useAuth } from "@/providers/AuthProvider";
import Link from "next/link";
import { motion } from "framer-motion";

interface SuggestedUser {
    id: string;
    username: string;
    avatar_url: string | null;
    reputation_score: number;
    avatar_frame?: string | null;
}

export function SuggestedUsers() {
    const { user: currentUser } = useAuth();

    const { data: suggestedUsers, isLoading } = useQuery<SuggestedUser[]>({
        queryKey: ["suggested-users"],
        queryFn: async () => {
            const { data, error } = await (supabase as any)
                .from("profiles")
                .select("id, username, avatar_url, reputation_score, avatar_frame")
                .neq("id", currentUser?.id || "") // Exclude current user
                .order("reputation_score", { ascending: false })
                .limit(4);

            if (error) throw error;
            return data as SuggestedUser[];
        },
        enabled: !!currentUser,
    });

    if (isLoading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-white/[0.03] animate-pulse rounded-2xl border border-white/5" />
                ))}
            </div>
        );
    }

    if (!suggestedUsers || suggestedUsers.length === 0) return null;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-500" />
                    <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest">
                        Who to Follow
                    </h3>
                </div>
                <Link
                    href="/leaderboard"
                    className="text-[10px] font-bold text-emerald-500/60 hover:text-emerald-500 uppercase tracking-widest transition-colors flex items-center gap-0.5"
                >
                    View All <ChevronRight className="w-3 h-3" />
                </Link>
            </div>

            <div className="grid gap-2">
                {suggestedUsers.map((user, idx) => (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={user.id}
                        className="group flex items-center justify-between p-3 bg-white/[0.04] rounded-2xl hover:bg-white/[0.08] transition-all border border-white/[0.08]"
                    >
                        <Link href={`/profile/${user.username}`} className="flex items-center gap-3 flex-1 min-w-0">
                            <UserAvatar
                                src={user.avatar_url}
                                username={user.username}
                                frame={user.avatar_frame}
                                size="sm"
                            />
                            <div className="min-w-0">
                                <span className="font-bold text-white text-sm block truncate group-hover:text-emerald-400 transition-colors">
                                    @{user.username}
                                </span>
                                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                                    {user.reputation_score.toLocaleString()} Rep
                                </p>
                            </div>
                        </Link>

                        <div className="scale-75 origin-right">
                            <FollowButton targetUserId={user.id} />
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
