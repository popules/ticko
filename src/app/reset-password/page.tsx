"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowRight, Loader2, CheckCircle } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { APP_CONFIG } from "@/config/app";
import { TickoLogo } from "@/components/ui/TickoLogo";

export default function ResetPasswordPage() {
    const { resetPassword } = useAuth();
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        const { error } = await resetPassword(email);

        if (error) {
            setError("Could not send recovery link. Check your email address.");
            setIsLoading(false);
        } else {
            setIsSuccess(true);
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            {/* Background gradients */}
            <div className="fixed inset-0 -z-10">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center justify-center">
                        <TickoLogo />
                    </Link>
                    <p className="text-sm text-white/60 mt-6">{APP_CONFIG.tagline}</p>
                </div>

                {/* Reset card */}
                <div className="bg-white/[0.04] backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
                    {isSuccess ? (
                        <div className="text-center py-4">
                            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8 text-emerald-400" />
                            </div>
                            <h1 className="text-2xl font-bold text-white mb-2">Check your inbox</h1>
                            <p className="text-white/50 mb-6">
                                We've sent a recovery link to <span className="text-white">{email}</span>
                            </p>
                            <Link
                                href="/login"
                                className="text-emerald-400 hover:text-emerald-300 font-medium"
                            >
                                ← Back to login
                            </Link>
                        </div>
                    ) : (
                        <>
                            <h1 className="text-2xl font-bold text-white mb-2">Reset password</h1>
                            <p className="text-white/50 mb-8">
                                Enter your email address and we'll send you a link to reset your password.
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium text-white/70 mb-2">
                                        Email
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="you@email.com"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                            required
                                        />
                                    </div>
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
                                    disabled={isLoading}
                                    className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.4)] transition-all"
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            Send recovery link
                                            <ArrowRight className="w-5 h-5" />
                                        </>
                                    )}
                                </button>
                            </form>

                            {/* Back to login */}
                            <p className="text-center text-white/50 mt-6">
                                <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-bold">
                                    ← Back to login
                                </Link>
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
