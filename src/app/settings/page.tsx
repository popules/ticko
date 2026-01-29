"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/lib/supabase/client";
import { AvatarUpload } from "@/components/profile/AvatarUpload";
import { Sidebar } from "@/components/layout/Sidebar";
import { RightPanel } from "@/components/layout/RightPanel";
import { Save, Loader2, LogOut, Lock, Trash2, AlertTriangle, MapPin } from "lucide-react";

export default function SettingsPage() {
    const { user, signOut } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [username, setUsername] = useState("");
    const [bio, setBio] = useState("");
    const [location, setLocation] = useState("");
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Password change state
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    // Delete account state
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) return;
            const { data, error } = await (supabase as any)
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single();

            if (data) {
                const profileData = data as any;
                setUsername(profileData.username || "");
                setBio(profileData.bio || "");
                setLocation(profileData.location || "");
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
                .update({
                    username: username.trim(),
                    bio: bio.trim(),
                    location: location.trim()
                })
                .eq("id", user.id);

            if (error) throw error;
            setMessage({ type: 'success', text: "Profile updated!" });
        } catch (error: any) {
            if (error.code === '23505') {
                setMessage({ type: 'error', text: "Username is already taken." });
            } else {
                setMessage({ type: 'error', text: error.message });
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match.' });
            return;
        }
        if (newPassword.length < 6) {
            setMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
            return;
        }

        setIsChangingPassword(true);
        setMessage(null);

        try {
            const { error } = await supabase!.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;

            setMessage({ type: 'success', text: 'Password changed!' });
            setNewPassword("");
            setConfirmPassword("");
            setShowPasswordForm(false);
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirmText !== username) {
            setMessage({ type: 'error', text: 'Please type your username correctly to confirm.' });
            return;
        }

        setIsDeleting(true);
        try {
            // Call API to delete account (needs server-side admin access)
            const res = await fetch('/api/account/delete', { method: 'DELETE' });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Could not delete account');
            }

            // Sign out and redirect
            signOut();
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
            setIsDeleting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen bg-[#020617]">
                <Sidebar />
                <main className="flex-1 flex items-center justify-center border-x border-white/5">
                    <Loader2 className="w-8 h-8 animate-spin text-white/40" />
                </main>
                <RightPanel />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-[#020617]">
            <Sidebar />
            <main className="flex-1 border-x border-white/5 overflow-y-auto">
                <div className="max-w-2xl mx-auto p-6 md:p-12 pb-24">
                    <h1 className="text-2xl font-extrabold text-white mb-8 tracking-tight">Settings</h1>

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
                                    Username
                                </label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-3 text-[15px] text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                                    placeholder="Your username"
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
                                    className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 text-[15px] text-white/40 cursor-not-allowed"
                                />
                                <p className="text-[10px] text-white/20 mt-1">Email cannot be changed.</p>
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
                                className="w-full flex items-center justify-center gap-2 py-3.5 btn-gradient text-white rounded-xl font-bold hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-[15px]"
                            >
                                {isSaving ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Save changes
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Password Change Section */}
                        <div className="mt-8 pt-8 border-t border-white/10">
                            <button
                                onClick={() => setShowPasswordForm(!showPasswordForm)}
                                className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm font-medium"
                            >
                                <Lock className="w-4 h-4" />
                                Change password
                            </button>

                            {showPasswordForm && (
                                <form onSubmit={handlePasswordChange} className="mt-4 space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">
                                            New password
                                        </label>
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-3 text-[15px] text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                                            placeholder="At least 6 characters"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">
                                            Confirm password
                                        </label>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-3 text-[15px] text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                                            placeholder="Repeat password"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isChangingPassword}
                                        className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] text-white rounded-xl font-medium transition-colors disabled:opacity-50"
                                    >
                                        {isChangingPassword ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            "Change password"
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>

                        {/* Logout */}
                        <div className="mt-8 pt-8 border-t border-white/10">
                            <button
                                onClick={() => signOut()}
                                className="w-full flex items-center justify-center gap-2 py-3.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-xl font-bold transition-all text-sm group"
                            >
                                <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                Log out from Ticko
                            </button>
                        </div>

                        {/* Delete Account Section */}
                        <div className="mt-8 pt-8 border-t border-white/10">
                            <button
                                onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
                                className="flex items-center gap-2 text-white/30 hover:text-rose-400 transition-colors text-xs font-medium"
                            >
                                <Trash2 className="w-3 h-3" />
                                Delete my account permanently
                            </button>

                            {showDeleteConfirm && (
                                <div className="mt-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
                                    <div className="flex items-start gap-3 mb-4">
                                        <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-rose-400">
                                                Are you sure? This cannot be undone.
                                            </p>
                                            <p className="text-xs text-white/40 mt-1">
                                                All your posts, comments, and reactions will be permanently deleted.
                                            </p>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-white/40 mb-2">
                                            Type <span className="text-rose-400 font-bold">{username}</span> to confirm
                                        </label>
                                        <input
                                            type="text"
                                            value={deleteConfirmText}
                                            onChange={(e) => setDeleteConfirmText(e.target.value)}
                                            className="w-full bg-white/[0.06] border border-rose-500/30 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500/50 transition-colors"
                                            placeholder={username}
                                        />
                                    </div>
                                    <button
                                        onClick={handleDeleteAccount}
                                        disabled={isDeleting || deleteConfirmText !== username}
                                        className="mt-4 flex items-center justify-center gap-2 px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isDeleting ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <>
                                                <Trash2 className="w-4 h-4" />
                                                Delete account permanently
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <RightPanel />
        </div>
    );
}
