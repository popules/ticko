import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Trophy, TrendingUp, Shield, Calendar, Award } from "lucide-react";
import { LeagueRankBadge } from "@/components/ui/LeagueRankBadge";
import { Profile } from "@/types/database";

interface PublicProfileProps {
    params: Promise<{ username: string }>;
}

interface ProfileWithLeague extends Profile {
    league_placements: {
        rank_in_league: number | null;
        leagues: {
            name: string;
            tier: number;
        };
    }[];
}

export async function generateMetadata({ params }: PublicProfileProps): Promise<Metadata> {
    const { username } = await params;
    const supabase = await createSupabaseServerClient();

    // Fetch basic profile info
    const { data } = await supabase
        .from("profiles")
        .select("reputation_score, created_at")
        .eq("username", username)
        .single();

    const profile = data as unknown as Profile; // Cast for metadata fetch


    if (!profile) return { title: "Trader Not Found - Ticko" };

    const title = `${username}'s Trading Profile - Ticko Markets`;
    const description = `Check out ${username}'s trading stats on Ticko. Rank: ${calculateRank(profile.reputation_score)}. Joined ${new Date(profile.created_at).toLocaleDateString()}.`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: "profile",
            username: username,
        },
        twitter: {
            card: "summary",
            title,
            description,
        }
    };
}

export default async function PublicProfilePage({ params }: PublicProfileProps) {
    const { username } = await params;
    const supabase = await createSupabaseServerClient();

    // 1. Fetch Profile + League Placement
    const { data: rawProfile, error } = await supabase
        .from("profiles")
        .select(`
            *,
            league_placements(
                rank_in_league,
                leagues(
                    name,
                    tier
                )
            )
        `)
        .eq("username", username)
        .single();

    const profile = rawProfile as unknown as ProfileWithLeague;

    if (error || !profile) {
        notFound();
    }

    // Safely extract league info
    const placement = profile.league_placements?.[0];
    const leagueName = placement?.leagues?.name || "Unranked";
    const leagueRank = placement?.rank_in_league || "-";
    const rankTitle = calculateRank(profile.reputation_score || 0);

    return (
        <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-4">

            {/* Background Glow */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[120px]" />
            </div>

            <main className="relative z-10 w-full max-w-md">
                {/* The "Player Card" */}
                <div className="bg-[#0B1221] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">

                    {/* Header Banner */}
                    <div className="h-32 bg-gradient-to-r from-emerald-900/40 to-cyan-900/40 relative">
                        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-30" />
                    </div>

                    <div className="px-8 pb-8 -mt-16 text-center">
                        {/* Avatar */}
                        <div className="relative inline-block">
                            <div className="w-32 h-32 rounded-full border-4 border-[#0B1221] bg-[#020617] flex items-center justify-center text-4xl font-black text-white overflow-hidden shadow-xl">
                                {profile.avatar_url ? (
                                    <img src={profile.avatar_url} alt={username} className="w-full h-full object-cover" />
                                ) : (
                                    username.charAt(0).toUpperCase()
                                )}
                            </div>
                            {/* Pro Badge */}
                            {profile.is_pro && (
                                <div className="absolute bottom-1 right-1 bg-gradient-to-r from-amber-400 to-orange-500 text-[#020617] text-xs font-black px-2 py-0.5 rounded-full border-2 border-[#0B1221]">
                                    PRO
                                </div>
                            )}
                        </div>

                        {/* Name & Title */}
                        <h1 className="text-3xl font-black mt-4 mb-1">{username}</h1>
                        <p className="text-emerald-400 font-bold uppercase tracking-widest text-xs mb-6">
                            {rankTitle}
                        </p>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-3 mb-8">
                            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                                <div className="flex justify-center mb-2">
                                    <Trophy className="w-6 h-6 text-yellow-400" />
                                </div>
                                <div className="text-2xl font-black text-white">{profile.reputation_score || 0}</div>
                                <div className="text-xs text-white/40 uppercase font-bold">Reputation</div>
                            </div>
                            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                                <div className="flex justify-center mb-2">
                                    <Award className="w-6 h-6 text-purple-400" />
                                </div>
                                <div className="text-lg font-bold text-white truncate px-1">
                                    {leagueName}
                                </div>
                                <div className="text-xs text-white/40 uppercase font-bold">
                                    Rank #{leagueRank}
                                </div>
                            </div>
                        </div>

                        {/* "Ego Bait" Context */}
                        <p className="text-white/60 text-sm mb-8 leading-relaxed">
                            {username} is trading risk-free on Ticko. Check out their track record and compete against them in the Arena.
                        </p>

                        {/* CTA */}
                        <Link
                            href="/register"
                            className="block w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-bold text-lg shadow-lg shadow-emerald-500/20 transition-all transform hover:scale-[1.02]"
                        >
                            Beat {username} on Ticko
                        </Link>

                        <div className="mt-4">
                            <Link href="/login" className="text-sm text-white/30 hover:text-white transition-colors">
                                Already have an account? Log in
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Footer Brand */}
                <div className="text-center mt-8">
                    <Link href="/" className="text-white/20 font-black tracking-tighter text-xl hover:text-white/40 transition-colors">
                        TICKO.
                    </Link>
                </div>
            </main>
        </div>
    );
}

// Helper to calculate rank title based on reputation (approximate logic)
function calculateRank(reputation: number): string {
    if (reputation < 100) return "Novice Trader";
    if (reputation < 500) return "Apprentice";
    if (reputation < 1000) return "Market Maker";
    if (reputation < 5000) return "Portfolio Manager";
    return "Market Wizard";
}
