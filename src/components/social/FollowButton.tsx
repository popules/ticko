"use client";

import { useState, useEffect } from "react";
import { UserPlus, UserCheck, Loader2 } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

interface FollowButtonProps {
    targetUserId: string;
    initialIsFollowing?: boolean;
}

export function FollowButton({ targetUserId, initialIsFollowing = false }: FollowButtonProps) {
    const { user } = useAuth();
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
    const [isLoading, setIsLoading] = useState(false);

    // Check if already following on mount
    useEffect(() => {
        if (!user || !isSupabaseConfigured || !supabase || user.id === targetUserId) return;

        const checkFollow = async () => {
            const { data } = await supabase
                .from("follows")
                .select("*")
                .eq("follower_id", user.id)
                .eq("following_id", targetUserId)
                .single();

            setIsFollowing(!!data);
        };

        checkFollow();
    }, [user, targetUserId]);

    const handleToggleFollow = async () => {
        if (!user || !supabase || isLoading || user.id === targetUserId) return;

        setIsLoading(true);

        try {
            if (isFollowing) {
                // Unfollow
                await supabase
                    .from("follows")
                    .delete()
                    .eq("follower_id", user.id)
                    .eq("following_id", targetUserId);
                setIsFollowing(false);
            } else {
                // Follow
                await supabase
                    .from("follows")
                    .insert({
                        follower_id: user.id,
                        following_id: targetUserId,
                    } as never);
                setIsFollowing(true);
            }
        } catch (error) {
            console.error("Follow error:", error);
        }

        setIsLoading(false);
    };

    // Don't show button for own profile or if not logged in
    if (!user || user.id === targetUserId) return null;

    return (
        <button
            onClick={handleToggleFollow}
            disabled={isLoading}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${isFollowing
                    ? "bg-white/[0.06] text-white/80 hover:bg-rose-500/20 hover:text-rose-400 border border-white/10"
                    : "btn-gradient text-white shadow-lg shadow-emerald-500/20"
                } disabled:opacity-50`}
        >
            {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : isFollowing ? (
                <>
                    <UserCheck className="w-4 h-4" />
                    Följer
                </>
            ) : (
                <>
                    <UserPlus className="w-4 h-4" />
                    Följ
                </>
            )}
        </button>
    );
}
