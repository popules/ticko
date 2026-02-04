"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/providers/AuthProvider";
import { AppLayout } from "@/components/layout/AppLayout";
import {
    Users,
    ArrowLeft,
    Loader2,
    Copy,
    Check,
    Share2,
    MessageCircle,
    Mail,
    Sparkles
} from "lucide-react";
import Link from "next/link";

export default function CreateLeaguePage() {
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth();

    const [name, setName] = useState("");
    const [durationDays, setDurationDays] = useState(14);
    const [maxMembers, setMaxMembers] = useState(10);
    const [createdLeague, setCreatedLeague] = useState<{
        id: string;
        name: string;
        invite_code: string;
        invite_url: string;
    } | null>(null);
    const [copied, setCopied] = useState(false);

    const createMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch("/api/leagues/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: name.trim(),
                    duration_days: durationDays,
                    max_members: maxMembers,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to create league");
            return data;
        },
        onSuccess: (data) => {
            setCreatedLeague(data);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim().length >= 2) {
            createMutation.mutate();
        }
    };

    const copyLink = async () => {
        if (createdLeague) {
            await navigator.clipboard.writeText(createdLeague.invite_url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const shareWhatsApp = () => {
        if (createdLeague) {
            const text = `Join my Ticko league "${createdLeague.name}"! Let's see who's the best trader 📈\n\n${createdLeague.invite_url}`;
            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
        }
    };

    const shareEmail = () => {
        if (createdLeague) {
            const subject = `Join my Ticko league: ${createdLeague.name}`;
            const body = `Hey!\n\nI created a trading league on Ticko and want you to join!\n\nLeague: ${createdLeague.name}\nJoin here: ${createdLeague.invite_url}\n\nLet's see who can grow their portfolio the most! 📈`;
            window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        }
    };

    // Redirect if not authenticated
    if (!authLoading && !user) {
        router.replace("/login");
        return null;
    }

    return (
        <AppLayout showRightPanel={false}>
            <div className="max-w-xl mx-auto pt-4 pb-20 px-4 pt-[max(1rem,env(safe-area-inset-top))]">
                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <Link
                        href="/leagues"
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-white/60" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-extrabold text-white tracking-tight">
                            Create League
                        </h1>
                        <p className="text-sm text-white/40">Challenge your friends</p>
                    </div>
                </div>

                {!createdLeague ? (
                    /* Create Form */
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* League Name */}
                        <div>
                            <label className="text-sm font-bold text-white/60 mb-2 block">
                                League Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. The Bois, Work Friends, Family..."
                                className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500/50 text-lg"
                                maxLength={30}
                                autoFocus
                            />
                            <p className="text-xs text-white/30 mt-1.5">
                                {name.length}/30 characters
                            </p>
                        </div>

                        {/* Duration */}
                        <div>
                            <label className="text-sm font-bold text-white/60 mb-3 block">
                                Competition Duration
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { days: 7, label: "1 Week" },
                                    { days: 14, label: "2 Weeks" },
                                    { days: 30, label: "1 Month" },
                                ].map((option) => (
                                    <button
                                        key={option.days}
                                        type="button"
                                        onClick={() => setDurationDays(option.days)}
                                        className={`py-3 px-4 rounded-xl font-bold text-sm transition-all ${durationDays === option.days
                                                ? "bg-violet-500/20 border-violet-500/50 text-violet-400 border"
                                                : "bg-white/[0.04] border border-white/10 text-white/60 hover:bg-white/[0.08]"
                                            }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Max Members */}
                        <div>
                            <label className="text-sm font-bold text-white/60 mb-3 block">
                                Max Players
                            </label>
                            <div className="grid grid-cols-4 gap-2">
                                {[5, 10, 15, 20].map((num) => (
                                    <button
                                        key={num}
                                        type="button"
                                        onClick={() => setMaxMembers(num)}
                                        className={`py-3 px-4 rounded-xl font-bold text-sm transition-all ${maxMembers === num
                                                ? "bg-violet-500/20 border-violet-500/50 text-violet-400 border"
                                                : "bg-white/[0.04] border border-white/10 text-white/60 hover:bg-white/[0.08]"
                                            }`}
                                    >
                                        {num}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Info */}
                        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                            <p className="text-sm text-emerald-400/80">
                                <strong>How it works:</strong> Everyone uses their same Ticko portfolio.
                                Your trades count toward all your leagues. Best P&L wins!
                            </p>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={name.trim().length < 2 || createMutation.isPending}
                            className="w-full py-4 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-bold text-lg hover:shadow-[0_0_30px_-5px_rgba(139,92,246,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {createMutation.isPending ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5" />
                                    Create League
                                </>
                            )}
                        </button>

                        {createMutation.isError && (
                            <p className="text-rose-400 text-sm text-center">
                                {createMutation.error?.message || "Failed to create league"}
                            </p>
                        )}
                    </form>
                ) : (
                    /* Success - Share Screen */
                    <div className="text-center">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center mx-auto mb-6">
                            <Check className="w-10 h-10 text-emerald-400" />
                        </div>

                        <h2 className="text-2xl font-bold text-white mb-2">League Created!</h2>
                        <p className="text-white/40 mb-8">
                            Now invite your friends to <strong className="text-white">"{createdLeague.name}"</strong>
                        </p>

                        {/* Invite Code */}
                        <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 mb-6">
                            <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Invite Code</p>
                            <p className="text-2xl font-mono font-bold text-violet-400 tracking-widest">
                                {createdLeague.invite_code}
                            </p>
                        </div>

                        {/* Share Buttons */}
                        <div className="space-y-3 mb-8">
                            <button
                                onClick={copyLink}
                                className="w-full py-3.5 px-4 rounded-xl bg-white/[0.06] border border-white/10 text-white font-bold flex items-center justify-center gap-2 hover:bg-white/[0.1] transition-colors"
                            >
                                {copied ? (
                                    <>
                                        <Check className="w-5 h-5 text-emerald-400" />
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-5 h-5" />
                                        Copy Invite Link
                                    </>
                                )}
                            </button>

                            <button
                                onClick={shareWhatsApp}
                                className="w-full py-3.5 px-4 rounded-xl bg-emerald-600/20 border border-emerald-600/30 text-emerald-400 font-bold flex items-center justify-center gap-2 hover:bg-emerald-600/30 transition-colors"
                            >
                                <MessageCircle className="w-5 h-5" />
                                Share on WhatsApp
                            </button>

                            <button
                                onClick={shareEmail}
                                className="w-full py-3.5 px-4 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-400 font-bold flex items-center justify-center gap-2 hover:bg-blue-500/30 transition-colors"
                            >
                                <Mail className="w-5 h-5" />
                                Share via Email
                            </button>
                        </div>

                        {/* Go to League */}
                        <Link
                            href={`/leagues/${createdLeague.id}`}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-bold hover:shadow-[0_0_30px_-5px_rgba(139,92,246,0.5)] transition-all"
                        >
                            <Users className="w-5 h-5" />
                            View League
                        </Link>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
