"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, ArrowRight, Loader2, CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { APP_CONFIG } from "@/config/app";
import { TickoLogo } from "@/components/ui/TickoLogo";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";

export default function ChooseAliasPage() {
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth();
    const [username, setUsername] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isChecking, setIsChecking] = useState(false);
    const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

    // Redirect if not logged in
    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login");
        }
    }, [user, authLoading, router]);

    // Check username availability with debounce
    useEffect(() => {
        if (username.length < 3) {
            setIsAvailable(null);
            return;
        }

        const timer = setTimeout(async () => {
            setIsChecking(true);
            if (!supabase) return;

            const { data } = await supabase
                .from("profiles")
                .select("username")
                .eq("username", username.toLowerCase())
                .single();

            setIsAvailable(!data);
            setIsChecking(false);
        }, 500);

        return () => clearTimeout(timer);
    }, [username]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (username.length < 3) {
            setError("Username must be at least 3 characters");
            return;
        }

        if (!isAvailable) {
            setError("This username is already taken");
            return;
        }

        setIsLoading(true);

        if (!supabase || !user) {
            setError("You must be logged in");
            setIsLoading(false);
            return;
        }

        // Update the profile with the chosen username
        const { error: updateError } = await (supabase as any)
            .from("profiles")
            .update({
                username: username.toLowerCase(),
                display_name: username,
                updated_at: new Date().toISOString(),
            })
            .eq("id", user.id);

        if (updateError) {
            setError("Could not save username. Please try again.");
            setIsLoading(false);
        } else {
            // Also update auth metadata
            await supabase.auth.updateUser({
                data: { username: username.toLowerCase() }
            });

            // Send welcome email (fire and forget)
            if (user.email) {
                fetch("/api/email/welcome", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: user.email, username })
                }).catch(console.error);
            }

            router.push("/");
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            {/* Background gradients */}
            <div className="fixed inset-0 -z-10">
                <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl" />
                <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center justify-center">
                        <TickoLogo />
                    </Link>
                    <p className="text-sm text-white/60 mt-6">{APP_CONFIG.tagline}</p>
                </div>

                {/* Choose alias card */}
                <div className="bg-white/[0.04] backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
                    <h1 className="text-2xl font-bold text-white mb-2">Choose your alias</h1>
                    <p className="text-white/50 mb-8">
                        Other users will see you as this name on {APP_CONFIG.name}.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Username */}
                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-2">
                                Username
                            </label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))}
                                    placeholder="Choose an alias..."
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                    required
                                    maxLength={20}
                                />
                                {/* Availability indicator */}
                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                    {isChecking ? (
                                        <Loader2 className="w-5 h-5 animate-spin text-white/40" />
                                    ) : isAvailable === true ? (
                                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                                    ) : isAvailable === false ? (
                                        <XCircle className="w-5 h-5 text-rose-400" />
                                    ) : null}
                                </div>
                            </div>
                            <p className="text-xs text-white/40 mt-2">
                                Only letters, numbers, and underscores. 3-20 characters.
                            </p>
                        </div>

                        {/* Error message */}
                        {error && (
                            <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 text-rose-400 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Submit button */}
                        <button
                            type="submit"
                            disabled={isLoading || !isAvailable || username.length < 3}
                            className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.4)] transition-all"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Continue to {APP_CONFIG.name}
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
