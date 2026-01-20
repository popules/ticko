"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Camera, Loader2, MapPin } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentProfile: {
        username: string;
        bio?: string | null;
        avatar_url?: string | null;
        location?: string | null;
    };
    onUpdate: (profile: { username: string; bio: string; location: string }) => void;
}

export function EditProfileModal({
    isOpen,
    onClose,
    currentProfile,
    onUpdate,
}: EditProfileModalProps) {
    const { user } = useAuth();
    const [username, setUsername] = useState(currentProfile.username || "");
    const [bio, setBio] = useState(currentProfile.bio || "");
    const [location, setLocation] = useState(currentProfile.location || "");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsSubmitting(true);
        setError(null);

        try {
            const res = await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    username: username.trim(),
                    bio: bio.trim(),
                    location: location.trim(),
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to update profile');
            }

            onUpdate({ username, bio, location });
            onClose();
        } catch (err: any) {
            setError(err.message || "Could not update profile. Please try again.");
            console.error("Profile update error:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#0B0F17]/95 backdrop-blur-3xl p-8 rounded-[2rem] border border-white/20 shadow-2xl z-50"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-black text-white">Edit Profile</h2>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/10 text-white/40 hover:text-white transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Avatar Preview */}
                            <div className="flex justify-center">
                                <div className="relative">
                                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white text-3xl font-black shadow-xl">
                                        {username.charAt(0).toUpperCase() || "?"}
                                    </div>
                                    <button
                                        type="button"
                                        className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/60 border border-white/20 transition-all"
                                        title="Upload picture (coming soon)"
                                    >
                                        <Camera className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Username */}
                            <div>
                                <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">
                                    Username
                                </label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                                    required
                                    maxLength={30}
                                />
                            </div>

                            {/* Bio */}
                            <div>
                                <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">
                                    Bio
                                </label>
                                <textarea
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    rows={3}
                                    placeholder="Tell us a bit about yourself..."
                                    className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50 transition-all resize-none"
                                    maxLength={160}
                                />
                                <p className="text-xs text-white/30 mt-1 text-right">
                                    {bio.length}/160
                                </p>
                            </div>

                            {/* Location */}
                            <div>
                                <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">
                                    Location
                                </label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                    <input
                                        type="text"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        placeholder="New York, USA"
                                        className="w-full pl-10 pr-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50 transition-all"
                                        maxLength={50}
                                    />
                                </div>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <p className="text-rose-400 text-sm text-center">{error}</p>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isSubmitting || !username.trim()}
                                className="w-full py-4 btn-gradient text-white rounded-2xl font-bold text-sm shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Saving...
                                    </span>
                                ) : (
                                    "Save Changes"
                                )}
                            </button>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
