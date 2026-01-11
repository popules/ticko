"use client";

import { useState, useEffect } from "react";
import { User, Shield, TrendingUp, Calendar, MapPin, Pencil, Share2 } from "lucide-react";
import { motion } from "framer-motion";
import { EditProfileModal } from "./EditProfileModal";

interface ProfileHeaderProps {
    profile: {
        id: string;
        username: string;
        bio?: string | null;
        location?: string | null;
        created_at: string;
        accuracy?: number;
    };
    isOwnProfile?: boolean;
}

import { FollowButton } from "../social/FollowButton";
import { useAuth } from "@/providers/AuthProvider";

export function ProfileHeader({ profile, isOwnProfile = true }: ProfileHeaderProps) {
    const { user } = useAuth();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentProfile, setCurrentProfile] = useState(profile);
    const [stats, setStats] = useState({ followers: 0, following: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            const res = await fetch(`/api/follow?targetUserId=${profile.id}${user ? `&userId=${user.id}` : ""}`);
            const data = await res.json();
            setStats({ followers: data.followers, following: data.following });
        };
        fetchStats();
    }, [profile.id, user]);

    const joinedDate = new Date(currentProfile.created_at).toLocaleDateString('sv-SE', {
        month: 'long',
        year: 'numeric'
    });

    const handleProfileUpdate = (updatedData: { username: string; bio: string; location: string }) => {
        setCurrentProfile(prev => ({
            ...prev,
            ...updatedData,
        }));
    };

    return (
        <>
            <div className="relative p-8 rounded-[2.5rem] bg-white/[0.04] border border-white/10 backdrop-blur-3xl overflow-hidden mb-8">
                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-[80px] -ml-24 -mb-24" />

                <div className="relative flex flex-col md:flex-row gap-8 items-start md:items-center">
                    {/* Avatar */}
                    <div className="relative group">
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-gradient-to-br from-emerald-400 to-blue-600 flex items-center justify-center p-[2px]">
                            <div className="w-full h-full rounded-[1.4rem] bg-[#0B0F17] flex items-center justify-center overflow-hidden">
                                <span className="text-4xl md:text-5xl font-black text-white/80">
                                    {currentProfile.username.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center border-4 border-[#0B0F17] shadow-lg">
                            <Shield className="w-4 h-4 text-white" />
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter mb-1">
                                    @{currentProfile.username}
                                </h1>
                                <div className="flex items-center gap-4 text-white/50 text-sm font-medium">
                                    <span className="flex items-center gap-1.5">
                                        <Calendar className="w-4 h-4" />
                                        Gick med {joinedDate}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <MapPin className="w-4 h-4" />
                                        {currentProfile.location || "Sverige"}
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
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setIsEditModalOpen(true)}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-white text-black rounded-xl font-bold text-sm hover:bg-white/90 transition-all shadow-xl shadow-white/5"
                                    >
                                        <Pencil className="w-4 h-4" />
                                        Redigera Profil
                                    </button>
                                    <button className="px-4 py-2.5 bg-white/[0.06] hover:bg-white/10 text-white rounded-xl border border-white/10 transition-all">
                                        <Share2 className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>

                        <p className="text-white/70 max-w-2xl text-lg leading-relaxed">
                            {currentProfile.bio || "Ingen biografi ännu. Investerare som älskar trender och AI-analyser."}
                        </p>

                        {/* Stats */}
                        <div className="flex gap-8 pt-4">
                            <div>
                                <p className="text-2xl font-black text-white">{stats.followers}</p>
                                <p className="text-xs font-bold text-white/30 uppercase tracking-widest">Följare</p>
                            </div>
                            <div>
                                <p className="text-2xl font-black text-white">{stats.following}</p>
                                <p className="text-xs font-bold text-white/30 uppercase tracking-widest">Följer</p>
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="text-2xl font-black text-emerald-400">{currentProfile.accuracy || 85}%</p>
                                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                                </div>
                                <p className="text-xs font-bold text-white/30 uppercase tracking-widest">Pricksäkerhet</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Profile Modal */}
            <EditProfileModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                currentProfile={currentProfile}
                onUpdate={handleProfileUpdate}
            />
        </>
    );
}
