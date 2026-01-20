"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { UserPlus, UserMinus, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FollowButtonProps {
    targetUserId: string;
    onFollowChange?: (following: boolean) => void;
}

export function FollowButton({ targetUserId, onFollowChange }: FollowButtonProps) {
    const { user } = useAuth();
    const [isFollowing, setIsFollowing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isPending, setIsPending] = useState(false);

    useEffect(() => {
        if (!targetUserId) return;

        const checkStatus = async () => {
            try {
                const res = await fetch(`/api/follow?targetUserId=${targetUserId}${user ? `&userId=${user.id}` : ""}`);
                const data = await res.json();
                setIsFollowing(data.isFollowing);
            } catch (error) {
                console.error("Failed to check follow status:", error);
            } finally {
                setIsLoading(false);
            }
        };

        checkStatus();
    }, [targetUserId, user]);

    const handleFollow = async () => {
        if (!user || isPending) return;

        setIsPending(true);
        try {
            const res = await fetch("/api/follow", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ following_id: targetUserId }),
            });
            const data = await res.json();
            if (res.ok) {
                setIsFollowing(data.following);
                if (onFollowChange) onFollowChange(data.following);
            }
        } catch (error) {
            console.error("Follow action failed:", error);
        } finally {
            setIsPending(false);
        }
    };

    if (isLoading) return <Loader2 className="w-5 h-5 animate-spin text-white/20" />;
    if (user?.id === targetUserId) return null;

    return (
        <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleFollow}
            disabled={isPending}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${isFollowing
                ? "bg-white/[0.06] text-white/80 hover:bg-rose-500/10 hover:text-rose-400 border border-white/10"
                : "btn-gradient text-white shadow-lg shadow-emerald-500/20"
                } disabled:opacity-50`}
        >
            <AnimatePresence mode="wait">
                {isPending ? (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <Loader2 className="w-4 h-4 animate-spin" />
                    </motion.div>
                ) : isFollowing ? (
                    <motion.div
                        key="unfollow"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="flex items-center gap-2"
                    >
                        <UserMinus className="w-4 h-4" />
                        <span>Following</span>
                    </motion.div>
                ) : (
                    <motion.div
                        key="follow"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="flex items-center gap-2"
                    >
                        <UserPlus className="w-4 h-4" />
                        <span>Follow</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.button>
    );
}
