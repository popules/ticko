"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Shield, Calendar, MapPin, Pencil } from "lucide-react";
import { ShareButton } from "@/components/ui/ShareButton";
import { BASE_URL } from "@/config/app";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { BadgeRack } from "./BadgeRack";
import { getUserRank } from "@/lib/ranks";
import { getLevel, getProgressToNextLevel } from "@/lib/level-system";
import { FollowButton } from "../social/FollowButton";
import { useAuth } from "@/providers/AuthProvider";
import { ProBadgeInline } from "@/components/ui/ProBadge";
import { LeagueRankBadge } from "@/components/ui/LeagueRankBadge";

interface ProfileHeaderProps {
    profile: {
        id: string;
        username: string;
        bio?: string | null;
        location?: string | null;
        created_at: string;
        accuracy?: number;
        avatar_url?: string | null;
        is_pro?: boolean;
        league_rating?: number;
    };
    isOwnProfile?: boolean;
}

export function ProfileHeader({ profile, isOwnProfile = true }: ProfileHeaderProps) {
    const { user } = useAuth();
    const [currentProfile, setCurrentProfile] = useState(profile);
    const [stats, setStats] = useState({ followers: 0, following: 0 });

    if (!profile) return null;

    useEffect(() => {
        if (!profile?.id) return;
        const fetchStats = async () => {
            const res = await fetch(`/api/follow?targetUserId=${profile.id}${user ? `&userId=${user.id}` : ""}`);
            const data = await res.json();
            setStats({ followers: data.followers, following: data.following });
        };
        fetchStats();
    }, [profile?.id, user]);

    useEffect(() => {
        if (profile) {
            setCurrentProfile(profile);
        }
    }, [profile]);

    const joinedDate = new Date(currentProfile.created_at).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
    });

    return (
        <div className="relative p-8 rounded-[2.5rem] bg-white/[0.04] border border-white/10 backdrop-blur-3xl mb-8 overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-[80px] -ml-24 -mb-24" />

            <div className="relative flex flex-col md:flex-row gap-8 items-start md:items-center">
                {/* Avatar */}
                <div className="relative group shrink-0">
                    <UserAvatar
                        src={currentProfile.avatar_url}
                        username={currentProfile.username}
                        frame={(currentProfile as any).avatar_frame}
                        size="2xl"
                    />
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center border-4 border-[#0B0F17] shadow-lg">
                        <Shield className="w-4 h-4 text-white" />
                    </div>
                </div>

                {/* Info */}
                <div className="flex-1 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h1 className="text-2xl md:text-3xl font-black text-white tracking-tighter">
                                    {currentProfile.username}
                                </h1>
                                {(currentProfile as any).league_rating > 0 && (
                                    <LeagueRankBadge rating={(currentProfile as any).league_rating} size="sm" showLabel />
                                )}
                                {(currentProfile as any).is_pro && <ProBadgeInline />}
                            </div>
                            <div className="flex items-center gap-4 text-white/50 text-sm font-medium">
                                <span className="flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4" />
                                    Joined {joinedDate}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <MapPin className="w-4 h-4" />
                                    {currentProfile.location || "Unknown"}
                                </span>
                            </div>
                        </div>

                        {!isOwnProfile && (
                            <FollowButton
                                targetUserId={profile.id}
                                onFollowChange={(following) => {
                                    setStats(prev => ({
                                        ...prev,
                                        followers: following ? prev.followers + 1 : prev.followers - 1
                                    }));
                                }}
                            />
                        )}

                        {isOwnProfile && (
                            <div className="flex items-center gap-3">
                                <ShareButton
                                    url={`${BASE_URL}/u/${currentProfile.username}`}
                                    title={`${currentProfile.username} on Ticko`}
                                    iconOnly={false}
                                />
                                <Link
                                    href="/settings"
                                    className="flex items-center gap-2 px-6 py-2.5 bg-white text-black rounded-xl font-bold text-sm hover:bg-white/90 transition-all shadow-xl shadow-white/5"
                                >
                                    <Pencil className="w-4 h-4" />
                                    Edit Profile
                                </Link>
                            </div>
                        )}
                    </div>

                    <p className="text-white/70 max-w-2xl text-[15px] leading-relaxed">
                        {currentProfile.bio || "No bio yet. Investor who loves trends and AI analysis."}
                    </p>

                    <BadgeRack userId={profile.id} />

                    {/* Stats */}
                    <div className="flex gap-8 pt-4">
                        <div>
                            <p className="text-xl font-black text-white">{stats.followers}</p>
                            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Followers</p>
                        </div>
                        <div>
                            <p className="text-xl font-black text-white">{stats.following}</p>
                            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Following</p>
                        </div>
                        <div>
                            {(() => {
                                const score = (currentProfile as any).reputation_score || 0;
                                const rank = getUserRank(score);
                                const level = getLevel(score);
                                const progress = getProgressToNextLevel(score);

                                return (
                                    <div className="flex flex-col items-start gap-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl">{rank.emoji}</span>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-xl font-black ${rank.color}`}>{rank.name}</span>
                                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold border border-white/20 bg-white/5 text-white/50">
                                                        Lvl {level}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Progress Bar */}
                                        <div className="w-full max-w-[120px] h-1.5 bg-white/10 rounded-full overflow-hidden mt-1">
                                            <div
                                                style={{ width: `${progress}%` }}
                                                className={`h-full ${rank.color.replace('text-', 'bg-')}`}
                                            />
                                        </div>
                                        <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-0.5">
                                            {progress}% to next level
                                        </p>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
