"use client";

import Link from "next/link";
import { Shield, Database, Share2, Clock, UserCheck, Cookie, Eye, Trash2 } from "lucide-react";

export default function PrivacyPage() {
    const sections = [
        {
            icon: Database,
            title: "1. Data Collection and Legal Basis",
            content: "We process your personal data to fulfill our agreement with you or based on our legitimate interest in providing a secure service.",
            subsections: [
                { label: "Account Information", text: "Email and username (via Supabase)." },
                { label: "User Content", text: "Posts, comments, watchlists, and portfolio data that you choose to share." },
                { label: "Technical Data", text: "IP address, browser type, and device information for security analysis and spam prevention." }
            ]
        },
        {
            icon: Eye,
            title: "2. Public Data (Paper Trading)",
            highlight: true,
            content: "To enable leaderboard and community features, the following data is public by default:",
            list: [
                "Transactions in your paper portfolio (buy/sell)",
                "P&L (Profit & Loss) data and returns",
                "XP, Level, and Win Streak",
                "Your username and track record"
            ],
            footer: "This transparency is fundamental to Ticko's vision of verifiable track records. If you do not want your trading data to be visible, you should not use the Paper Trading function."
        },
        {
            icon: Shield,
            title: "3. Use of Data",
            content: "Your data is used to operate the platform, enable social interaction, and provide Ticko AI.",
            footer: "When using Ticko AI, only your specific query is sent to our sub-processor; we never share your personal profile or email with AI providers without your consent."
        },
        {
            icon: Share2,
            title: "4. Sharing with Third Parties",
            content: "We use sub-processors for operations:",
            list: [
                "Supabase (Database & Auth)",
                "Vercel (Hosting)",
                "OpenAI (AI Analysis)"
            ],
            footer: "When transferring data outside EU/EES, we ensure protection through standard contractual clauses."
        },
        {
            icon: Trash2,
            title: "5. Anonymization upon Deletion",
            content: "If you choose to delete your account:",
            list: [
                "All personal data (email, login credentials) is permanently deleted.",
                "Posts and comments may be retained in anonymized form to not destroy the context of forum threads.",
                "Anonymized posts show 'Deleted User' instead of your username."
            ],
            footer: "This ensures that discussions remain meaningful even after a user has left the platform."
        },
        {
            icon: Clock,
            title: "6. Storage",
            content: "We store your data as long as your account is active. Inactive accounts may be deleted automatically after 24 months of inactivity with prior notice via email."
        },
        {
            icon: Cookie,
            title: "7. Cookies and Tracking",
            highlight: true,
            content: "We use cookies for the following purposes:",
            list: [
                "Necessary cookies: To keep you logged in and ensure basic functionality.",
                "Analytics cookies: To understand how the competition and platform are used so we can improve the experience.",
                "No advertising cookies: We never sell your data to advertisers."
            ],
            footer: "You can manage cookies via your browser settings, but this may affect platform functionality."
        },
        {
            icon: UserCheck,
            title: "8. Your Rights (GDPR)",
            content: "You have the right to:",
            list: [
                "Registry Extract: Know what data we have about you.",
                "Correction: Correct incorrect information.",
                "Deletion ('Right to be forgotten'): Remove your account and personal data.",
                "Data Portability: Export your data.",
                "Objection: Object to certain processing."
            ],
            contact: "privacy@ticko.se"
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0A0E14] via-[#0D1117] to-[#0A0E14]">
            <div className="max-w-4xl mx-auto px-6 py-16">
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 mb-6">
                        <Shield className="w-8 h-8 text-blue-400" />
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy for Ticko</h1>
                    <p className="text-white/40 text-sm">Last updated: January 19, 2026</p>
                </div>

                {/* GDPR Summary Box */}
                <div className="bg-emerald-500/[0.05] border border-emerald-500/20 rounded-2xl p-6 mb-8">
                    <h2 className="text-lg font-bold text-emerald-400 mb-3">Summary</h2>
                    <p className="text-white/60 leading-relaxed">
                        Ticko collects email, username, and trading data. Your Paper Trading data is public to enable the leaderboard. We never sell your data. You can delete your account at any time.
                    </p>
                </div>

                {/* Sections */}
                <div className="space-y-6">
                    {sections.map((section, index) => (
                        <div
                            key={index}
                            className={`bg-white/[0.02] border rounded-2xl p-6 transition-all hover:bg-white/[0.03] ${section.highlight
                                ? 'border-emerald-500/30 bg-emerald-500/[0.02]'
                                : 'border-white/10'
                                }`}
                        >
                            <div className="flex items-start gap-4">
                                <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${section.highlight
                                    ? 'bg-emerald-500/10 border border-emerald-500/20'
                                    : 'bg-white/5 border border-white/10'
                                    }`}>
                                    <section.icon className={`w-5 h-5 ${section.highlight ? 'text-emerald-400' : 'text-white/40'}`} />
                                </div>
                                <div className="flex-1">
                                    <h2 className={`text-lg font-semibold mb-3 ${section.highlight ? 'text-emerald-400' : 'text-white'}`}>
                                        {section.title}
                                    </h2>

                                    {section.content && (
                                        <p className="text-white/60 leading-relaxed">{section.content}</p>
                                    )}

                                    {section.subsections && (
                                        <div className="space-y-3 mt-3">
                                            {section.subsections.map((sub, subIndex) => (
                                                <div key={subIndex} className="pl-4 border-l-2 border-white/10">
                                                    <span className="text-white/80 font-medium">{sub.label}:</span>{" "}
                                                    <span className="text-white/60">{sub.text}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {section.list && (
                                        <ul className="mt-3 space-y-2">
                                            {section.list.map((item, listIndex) => (
                                                <li key={listIndex} className="flex items-start gap-2 text-white/60">
                                                    <span className="text-blue-400 mt-1">•</span>
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}

                                    {section.footer && (
                                        <p className="mt-4 text-white/50 text-sm italic">{section.footer}</p>
                                    )}

                                    {section.contact && (
                                        <p className="mt-4 text-white/60">
                                            Contact us at{" "}
                                            <a href={`mailto:${section.contact}`} className="text-blue-400 hover:text-blue-300 transition-colors">
                                                {section.contact}
                                            </a>{" "}
                                            to exercise your rights.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="mt-12 flex justify-center gap-6 text-sm">
                    <Link
                        href="/terms"
                        className="text-white/40 hover:text-white/60 transition-colors"
                    >
                        Terms of Service
                    </Link>
                    <span className="text-white/20">|</span>
                    <Link
                        href="/"
                        className="text-white/40 hover:text-white/60 transition-colors"
                    >
                        ← Back to Ticko
                    </Link>
                </div>
            </div>
        </div>
    );
}
