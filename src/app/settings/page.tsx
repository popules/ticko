"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/lib/supabase/client";
import { AvatarUpload } from "@/components/profile/AvatarUpload";
import { Save, Loader2 } from "lucide-react";

export default function SettingsPage() {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [username, setUsername] = useState("");
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) return;
            // Cast supabase to any to avoid type issues with .from().select() chain
            const { data, error } = await (supabase as any)
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single();

            if (data) {
                // Cast data to Profile type for better type safety
                const profileData = data as any;
                setUsername(profileData.username || "");
                setAvatarUrl(profileData.avatar_url);
            }
            setIsLoading(false);
        };

        fetchProfile();
    }, [user]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setIsSaving(true);
        setMessage(null);

        try {
            const { error } = await (supabase as any)
                .from("profiles")
                .update({ username })
                .eq("id", user.id);

            if (error) throw error;
            setMessage({ type: 'success', text: "Profil uppdaterad!" });
        } catch (error: any) {
            if (error.code === '23505') {
                setMessage({ type: 'error', text: "Användarnamnet är redan upptaget." });
            } else {
                setMessage({ type: 'error', text: error.message });
            }
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-white/40" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h1 className="text-2xl font-bold text-white mb-8">Inställningar</h1>

            <div className="bg-white/[0.04] backdrop-blur-xl rounded-3xl border border-white/10 p-8">
                {/* Avatar Section */}
                <div className="mb-10 pb-10 border-b border-white/10">
                    <AvatarUpload
                        currentUrl={avatarUrl}
                        onUploadComplete={(url) => setAvatarUrl(url)}
                    />
                </div>

                {/* Form */}
                <form onSubmit={handleSave} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">
                            Användarnamn
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                            placeholder="Ditt användarnamn"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            value={user?.email || ""}
                            disabled
                            className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 text-white/40 cursor-not-allowed"
                        />
                        <p className="text-[10px] text-white/20 mt-1">Email kan inte ändras.</p>
                    </div>

                    {message && (
                        <div className={`p-4 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}>
                            {message.text}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSaving}
                        className="w-full flex items-center justify-center gap-2 py-3 btn-gradient text-white rounded-xl font-bold hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSaving ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                Spara ändringar
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
