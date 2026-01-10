"use client";

import { User, Shield, TrendingUp, Calendar, MapPin } from "lucide-react";
import { motion } from "framer-motion";

interface ProfileHeaderProps {
    profile: {
        username: string;
        bio?: string;
        created_at: string;
        accuracy?: number;
        followers_count?: number;
        following_count?: number;
    };
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
    const joinedDate = new Date(profile.created_at).toLocaleDateString('sv-SE', {
        month: 'long',
        year: 'numeric'
    });

    return (
        <div className="relative p-8 rounded-[2.5rem] bg-white/[0.04] border border-white/10 backdrop-blur-3xl overflow-hidden mb-8">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-[80px] -ml-24 -mb-24" />

            <div className="relative flex flex-col md:flex-row gap-8 items-start md:items-center">
                {/* Avatar */}
                <div className="relative group">
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-gradient-to-br from-emerald-400 to-blue-600 flex items-center justify-center p-[2px]">
                        <div className="w-full h-full rounded-[1.4rem] bg-[#0B0F17] flex items-center justify-center overflow-hidden">
                            <User className="w-12 h-12 md:w-16 md:h-16 text-white/20" />
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
                                @{profile.username}
                            </h1>
                            <div className="flex items-center gap-4 text-white/50 text-sm font-medium">
                                <span className="flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4" />
                                    Gick med {joinedDate}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <MapPin className="w-4 h-4" />
                                    Sverige
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button className="px-6 py-2.5 bg-white text-black rounded-xl font-bold text-sm hover:bg-white/90 transition-all shadow-xl shadow-white/5">
                                Redigera Profil
                            </button>
                            <button className="px-4 py-2.5 bg-white/[0.06] hover:bg-white/10 text-white rounded-xl border border-white/10 transition-all">
                                Dela
                            </button>
                        </div>
                    </div>

                    <p className="text-white/70 max-w-2xl text-lg leading-relaxed">
                        {profile.bio || "Ingen biografi ännu. Investerare som älskar trender och AI-analyser."}
                    </p>

                    {/* Stats */}
                    <div className="flex gap-8 pt-4">
                        <div>
                            <p className="text-2xl font-black text-white">{profile.followers_count || 0}</p>
                            <p className="text-xs font-bold text-white/30 uppercase tracking-widest">Följare</p>
                        </div>
                        <div>
                            <p className="text-2xl font-black text-white">{profile.following_count || 0}</p>
                            <p className="text-xs font-bold text-white/30 uppercase tracking-widest">Följer</p>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <p className="text-2xl font-black text-emerald-400">{profile.accuracy || 85}%</p>
                                <TrendingUp className="w-5 h-5 text-emerald-400" />
                            </div>
                            <p className="text-xs font-bold text-white/30 uppercase tracking-widest">Pricksäkerhet</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
