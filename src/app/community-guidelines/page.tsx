"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { RightPanel } from "@/components/layout/RightPanel";
import { AppFooter } from "@/components/layout/AppFooter";
import { Shield, Heart, MessageSquare, AlertTriangle, ThumbsUp, Users } from "lucide-react";

const guidelines = [
    {
        icon: Heart,
        title: "Be Respectful",
        description: "Treat everyone with respect. Disagreements are fine, personal attacks are not. We're all here to learn and grow together.",
        color: "text-rose-400",
        bgColor: "bg-rose-500/10",
        borderColor: "border-rose-500/20",
    },
    {
        icon: MessageSquare,
        title: "Share Quality Content",
        description: "Post thoughtful analysis, not spam. Explain your reasoning. 'TSLA to the moon 🚀' without context doesn't help anyone.",
        color: "text-blue-400",
        bgColor: "bg-blue-500/10",
        borderColor: "border-blue-500/20",
    },
    {
        icon: Shield,
        title: "No Financial Advice",
        description: "Share your opinions and analysis, but never tell others what to buy or sell. Everyone is responsible for their own decisions.",
        color: "text-violet-400",
        bgColor: "bg-violet-500/10",
        borderColor: "border-violet-500/20",
    },
    {
        icon: AlertTriangle,
        title: "No Manipulation",
        description: "Don't coordinate pump-and-dumps, spread fake news, or try to manipulate markets. This will result in an immediate ban.",
        color: "text-amber-400",
        bgColor: "bg-amber-500/10",
        borderColor: "border-amber-500/20",
    },
    {
        icon: ThumbsUp,
        title: "Give Credit",
        description: "If you're sharing someone else's research or analysis, give them credit. Plagiarism isn't cool.",
        color: "text-emerald-400",
        bgColor: "bg-emerald-500/10",
        borderColor: "border-emerald-500/20",
    },
    {
        icon: Users,
        title: "Help Newcomers",
        description: "Everyone starts somewhere. If someone asks a basic question, help them out instead of mocking them.",
        color: "text-cyan-400",
        bgColor: "bg-cyan-500/10",
        borderColor: "border-cyan-500/20",
    },
];

export default function CommunityGuidelinesPage() {
    return (
        <div className="flex min-h-screen bg-[#020617]">
            <Sidebar />
            <main className="flex-1 border-x border-white/5 overflow-y-auto flex flex-col">
                <div className="max-w-2xl mx-auto p-6 md:p-12 pb-8 flex-1">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-500/30 mb-4">
                            <Shield className="w-8 h-8 text-violet-400" />
                        </div>
                        <h1 className="text-2xl font-extrabold text-white mb-2 tracking-tight">Community Guidelines</h1>
                        <p className="text-sm text-white/40">Rules to keep Ticko a great place for everyone</p>
                    </div>

                    {/* Guidelines */}
                    <div className="space-y-4">
                        {guidelines.map((guideline, index) => (
                            <div
                                key={index}
                                className={`p-5 rounded-2xl border bg-white/[0.02] ${guideline.borderColor}`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`p-2.5 rounded-xl ${guideline.bgColor}`}>
                                        <guideline.icon className={`w-5 h-5 ${guideline.color}`} />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-white mb-1">{guideline.title}</h3>
                                        <p className="text-sm text-white/50 leading-relaxed">{guideline.description}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Enforcement Note */}
                    <div className="mt-8 p-5 rounded-2xl bg-rose-500/5 border border-rose-500/10">
                        <h3 className="text-sm font-bold text-rose-400 mb-2">What happens if you break the rules?</h3>
                        <ul className="text-xs text-white/50 space-y-1">
                            <li>• <strong className="text-white/70">First offense:</strong> Warning</li>
                            <li>• <strong className="text-white/70">Second offense:</strong> 7-day suspension</li>
                            <li>• <strong className="text-white/70">Third offense:</strong> Permanent ban</li>
                            <li>• <strong className="text-rose-400">Severe violations:</strong> Immediate permanent ban</li>
                        </ul>
                    </div>

                    {/* Last Updated */}
                    <p className="text-center text-[10px] text-white/20 mt-8">
                        Last updated: January 2026
                    </p>
                </div>
                <AppFooter />
            </main>
            <RightPanel />
        </div>
    );
}
