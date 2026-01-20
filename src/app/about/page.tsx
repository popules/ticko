"use client";

import Link from "next/link";
import { ArrowLeft, Users, MessageCircle, TrendingUp, Zap, Shield, ArrowRight, Mail, Gavel, Target, Database, Award, Gamepad2, Brain, AlertTriangle } from "lucide-react";
import { TickoLogo } from "@/components/ui/TickoLogo";
import { APP_CONFIG } from "@/config/app";

export default function OmOssPage() {
    const pillars = [
        {
            icon: Gamepad2,
            title: "$10k Challenge",
            desc: "Every user starts with 10,000 virtual dollars. Show what you're made of by building a portfolio and competing against others — without risking a single dollar.",
            color: "text-amber-400",
            bg: "bg-amber-500/10"
        },
        {
            icon: Award,
            title: "Track Records that Prove It",
            desc: "At Ticko, your results count. Your XP and Level are based on actual trading performance, not just number of posts. Anonymous 'experts' are quickly exposed.",
            color: "text-emerald-400",
            bg: "bg-emerald-500/10"
        },
        {
            icon: Brain,
            title: "Ticko AI – Information, Not Advice",
            desc: "Our AI helps you make faster decisions by summarizing news and analyzing sentiment. It provides intelligence, never buy or sell advice.",
            color: "text-violet-400",
            bg: "bg-violet-500/10"
        },
        {
            icon: Users,
            title: "A Meritocratic Culture",
            desc: "We kill the anonymous forum culture by linking opinions to verifiable track records. Substance weighs heavier than hype.",
            color: "text-blue-400",
            bg: "bg-blue-500/10"
        }
    ];

    return (
        <div className="min-h-screen bg-[#020617] text-white selection:bg-emerald-500/30 overflow-x-hidden font-sans">
            {/* Nav */}
            <nav className="fixed top-0 w-full z-50 border-b border-white/[0.05] bg-[#020617]/70 backdrop-blur-xl">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm font-medium">Back</span>
                    </Link>
                    <TickoLogo />
                </div>
            </nav>

            <main className="pt-32 pb-24 px-6">
                <div className="max-w-3xl mx-auto">
                    {/* Hero Section */}
                    <div className="mb-20">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-8 leading-[1.1]">
                            About Ticko – <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300">Master the Markets. Zero Risk.</span>
                        </h1>

                        <div className="space-y-8">
                            <section>
                                <h2 className="text-2xl font-bold text-white mb-4">Learn to Trade. Prove Your Skills.</h2>
                                <p className="text-white/60 text-lg leading-relaxed">
                                    Ticko is an <strong className="text-white">educational platform</strong> and a <strong className="text-white">social network</strong> for people who want to learn more about stocks and trading. We offer a risk-free environment where you can practice with virtual money, discuss strategies, and build knowledge together with others.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-white mb-4">What Ticko Is Not</h2>
                                <p className="text-white/60 text-lg leading-relaxed">
                                    Ticko is <strong className="text-white">not a financial service</strong>. We are not a broker, bank, or investment advisor. We do not handle real money and do not give buy or sell advice. All simulated trading takes place with virtual funds with no connection to real markets.
                                </p>
                            </section>
                        </div>
                    </div>

                    {/* AI Disclaimer Box */}
                    <div className="mb-12 p-6 rounded-2xl bg-violet-500/[0.05] border border-violet-500/20">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0">
                                <AlertTriangle className="w-6 h-6 text-violet-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-violet-400 mb-2">AI Disclaimer</h3>
                                <p className="text-white/60 leading-relaxed">
                                    Ticko's AI analyses ("Ticko AI") are automated tools to facilitate information retrieval and summarization of publicly available data. They do not constitute, and should not be interpreted as, buy or sell advice or financial advice of any kind.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Pillars Grid */}
                    <div className="mb-20">
                        <h2 className="text-2xl font-bold text-white mb-10 text-center">The Pillars of Ticko</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            {pillars.map((item, i) => (
                                <div key={i} className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-all group">
                                    <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                                        <item.icon className={`w-6 h-6 ${item.color}`} />
                                    </div>
                                    <h3 className="text-lg font-bold mb-3">{item.title}</h3>
                                    <p className="text-white/50 leading-relaxed text-sm">
                                        {item.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Vision Statement */}
                    <div className="space-y-8 mb-20">
                        <div className="p-8 rounded-3xl bg-emerald-500/[0.03] border border-emerald-500/10">
                            <h2 className="text-2xl font-bold text-white mb-4">Our Vision: Kill the Toxic Forum Culture</h2>
                            <p className="text-white/60 text-lg leading-relaxed">
                                We believe online stock discussions have a problem: anonymity without accountability. Anyone can shout "buy!" or "sell!" without consequences. At Ticko, we link every user's opinions to a <strong className="text-emerald-400">verifiable track record</strong>. Results speak louder than words.
                            </p>
                        </div>
                    </div>

                    {/* Contact Section */}
                    <div className="grid sm:grid-cols-2 gap-6 mb-20">
                        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col items-center text-center">
                            <Mail className="w-8 h-8 text-emerald-400 mb-4" />
                            <h3 className="text-lg font-bold mb-2">Feedback & Ideas</h3>
                            <a href="mailto:hello@ticko.se" className="text-emerald-400 hover:underline">hello@ticko.se</a>
                        </div>
                        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col items-center text-center">
                            <Gavel className="w-8 h-8 text-blue-400 mb-4" />
                            <h3 className="text-lg font-bold mb-2">Legal Questions</h3>
                            <a href="mailto:legal@ticko.se" className="text-blue-400 hover:underline">legal@ticko.se</a>
                        </div>
                    </div>

                    {/* Final CTA */}
                    <div className="text-center py-12 border-t border-white/10">
                        <h2 className="text-2xl md:text-3xl font-black mb-8">Ready to try the $10k Challenge?</h2>
                        <Link
                            href="/register"
                            className="group px-8 py-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-[#020617] rounded-full font-bold text-lg shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 mx-auto w-fit hover:scale-105"
                        >
                            Start your challenge
                            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-white/[0.05] bg-[#01040f]">
                <div className="max-w-4xl mx-auto px-6 py-12">
                    <p className="text-[11px] text-white/20 leading-relaxed max-w-4xl text-center">
                        <strong className="text-white/30">Disclaimer:</strong> Ticko is an educational platform with simulated trading. We are not a financial service and offer no investment advice. All trading on Ticko involves virtual funds. AI analyses are automated tools and do not constitute financial advice.
                    </p>
                    <p className="text-[10px] text-white/10 mt-6 text-center">
                        &copy; 2026 {APP_CONFIG.name}. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
