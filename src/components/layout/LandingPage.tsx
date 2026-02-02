"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import {
    TrendingUp, Users, MessageCircle, Bell, ArrowRight, Globe,
    Shield, Zap, BarChart3, Star, CheckCircle, Play, Sparkles,
    Target, Award, LineChart, Brain, Clock, ChevronDown, Quote, Wallet, ChevronRight
} from "lucide-react";
import { APP_CONFIG } from "@/config/app";
import { TickoLogo } from "@/components/ui/TickoLogo";
import { HeroPreview } from "@/components/landing/HeroPreview";
import { useRef } from "react";

// Animated counter component
function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
    return (
        <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
        >
            <motion.span
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                {value.toLocaleString()}{suffix}
            </motion.span>
        </motion.span>
    );
}

export function LandingPage() {
    const targetRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ["start start", "end start"]
    });

    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
    const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

    return (
        <div className="min-h-screen bg-[#020617] text-white selection:bg-emerald-500/30 overflow-x-hidden font-sans">
            {/* Background Gradients */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[1000px] h-[1000px] bg-indigo-900/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-emerald-900/10 rounded-full blur-[120px]" />
                <div className="absolute top-[40%] right-[20%] w-[600px] h-[600px] bg-violet-900/5 rounded-full blur-[100px]" />
            </div>

            {/* Nav */}
            <nav className="fixed top-0 w-full z-50 border-b border-white/[0.05] bg-[#020617]/70 backdrop-blur-xl transition-all">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/">
                            <TickoLogo />
                        </Link>
                    </div>

                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/60">
                        <Link href="#features" className="hover:text-white transition-colors">Features</Link>
                        <Link href="#how-it-works" className="hover:text-white transition-colors">How it works</Link>
                        <Link href="#community" className="hover:text-white transition-colors">Community</Link>
                        <Link href="/faq" className="hover:text-white transition-colors">FAQ</Link>
                        <Link href="/about" className="hover:text-white transition-colors">About</Link>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-6">
                        <Link href="/login" className="text-sm font-medium text-white/60 hover:text-white transition-colors">
                            Log in
                        </Link>
                        <Link
                            href="/register"
                            className="px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-[#020617] rounded-full font-bold text-xs sm:text-sm hover:shadow-[0_0_30px_-5px_rgba(16,185,129,0.5)] transition-all transform hover:-translate-y-0.5"
                        >
                            Join Free
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section ref={targetRef} className="relative pt-32 pb-20 px-6 flex flex-col items-center justify-center text-center z-10 min-h-[90vh]">
                <motion.div
                    style={{ opacity, scale }}
                    className="flex flex-col items-center w-full"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 mb-6 backdrop-blur-sm"
                    >
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400 hidden" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                            🏆 TICKO ARENA
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-6 leading-[1.1] max-w-4xl mx-auto"
                    >
                        <span className="block text-white">Here's $10,000.</span>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                            Prove you can beat the market.
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-base md:text-lg text-white/50 max-w-2xl font-medium leading-relaxed mb-12 mx-auto"
                    >
                        Trade stocks with virtual money in Ticko Arena. Climb the leaderboard, build your streak, and use <span className="text-emerald-400">Ticko AI</span> to find your next winner. <span className="text-white">100% free, zero risk.</span>
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="flex flex-col sm:flex-row items-center gap-4 mb-24"
                    >
                        <Link
                            href="/register"
                            className="group px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-[#020617] rounded-full font-bold text-base shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2 hover:scale-105"
                        >
                            Start your challenge now
                            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                        </Link>
                        <a
                            href="#how-it-works"
                            className="group px-6 py-4 bg-white/[0.04] border border-white/20 hover:bg-white/[0.08] text-white rounded-full font-bold text-sm backdrop-blur-lg transition-all flex items-center gap-2"
                        >
                            <Play className="w-4 h-4" />
                            See how it works
                        </a>
                    </motion.div>


                    <HeroPreview />

                    {/* Live Wins Ticker */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="mt-12 w-full max-w-2xl"
                    >
                        <div className="overflow-hidden rounded-2xl bg-white/[0.03] border border-white/10 p-3">
                            <div className="flex items-center gap-2 animate-marquee whitespace-nowrap">
                                {[
                                    { user: "Erik L.", ticker: "$HM-B", return: "+12.3%", emoji: "🚀" },
                                    { user: "Sofia K.", ticker: "$VOLV-B", return: "+8.7%", emoji: "🔥" },
                                    { user: "Marcus A.", ticker: "$TSLA", return: "+24.1%", emoji: "💎" },
                                    { user: "Anna S.", ticker: "$AAPL", return: "+5.2%", emoji: "📈" },
                                ].map((win, i) => (
                                    <span key={i} className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-sm">
                                        <span className="text-white/60">{win.user}</span>
                                        <span className="font-bold text-white">{win.ticker}</span>
                                        <span className="font-bold text-emerald-400">{win.return}</span>
                                        <span>{win.emoji}</span>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Scroll indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2"
                >
                    <a href="#problem" className="flex flex-col items-center gap-2 text-white/30 hover:text-white/60 transition-colors">
                        <span className="text-xs font-medium">Scroll to learn more</span>
                        <ChevronDown className="w-5 h-5 animate-bounce" />
                    </a>
                </motion.div>
            </section>

            {/* How it works */}
            <section id="how-it-works" className="px-6 py-32 border-t border-white/[0.05]">
                <div className="max-w-5xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-20"
                    >
                        <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-4 block">How it works</span>
                        <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
                            Start your <span className="text-emerald-400">trading challenge</span>
                        </h2>
                        <p className="text-white/50 text-lg max-w-2xl mx-auto">From beginner to verified trader in three simple steps.</p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8 relative">
                        {[
                            {
                                title: "Get $10,000 instantly",
                                desc: "Create your free account and get a portfolio filled with $10,000 in virtual money. Ready to use on the market right away.",
                                icon: Wallet
                            },
                            {
                                title: "Trade smart and fair",
                                desc: "Use Ticko AI for research and place your orders. Every buy is locked for 30 minutes to ensure a fair competition without arbitrage.",
                                icon: TrendingUp
                            },
                            {
                                title: "Prove your skills",
                                desc: "Every trade you make builds your track record. Show the community you have what it takes.",
                                icon: Award
                            }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.15 }}
                                className="text-center relative"
                            >
                                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                                    <item.icon className="w-8 h-8 text-emerald-400" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                                <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Bottom CTA */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mt-16"
                    >
                        <Link
                            href="/register"
                            className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-[#020617] rounded-full font-bold text-base shadow-lg shadow-emerald-500/25 transition-all hover:scale-105"
                        >
                            Start my journey to the top — Free
                            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Features Deep Dive */}
            <section id="features" className="px-6 py-32 bg-white/[0.01] border-y border-white/[0.05]">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-20"
                    >
                        <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-4 block">The Toolkit</span>
                        <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
                            Tools that <span className="text-emerald-400">put you ahead</span>
                        </h2>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {[
                            {
                                icon: TrendingUp,
                                title: "Real-time Sentiment",
                                desc: "See exactly what the community thinks about every stock right now. Bull or Bear? Follow the trend.",
                                tag: "Live data"
                            },
                            {
                                icon: Bell,
                                title: "Smart Alerts",
                                desc: "Get notified when stocks you follow are discussed, trending, or moving significantly.",
                                tag: "Push notifications"
                            },
                            {
                                icon: Award,
                                title: "Compete & Rank",
                                desc: "XP and Levels show who's actually a skilled trader — and who's just talking. Build your track record.",
                                tag: "Gamification"
                            },
                            {
                                icon: Brain,
                                title: "Ticko AI",
                                desc: "Your secret weapon in the competition. The AI summarizes news, analyzes sentiment, and gives you the edge.",
                                tag: "Pro Tool"
                            },
                            {
                                icon: BarChart3,
                                title: "Watchlist & Portfolio",
                                desc: "Keep track of your stocks with live prices, daily performance, and personal alerts.",
                                tag: "Personal"
                            },
                            {
                                icon: Shield,
                                title: "Verified Track Records",
                                desc: "Every prediction is saved. You build a visible track record that others can see.",
                                tag: "Transparency"
                            }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.05 }}
                                className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-emerald-500/20 transition-all group"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                        <item.icon className="w-6 h-6 text-emerald-400" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-lg font-bold">{item.title}</h3>
                                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                {item.tag}
                                            </span>
                                        </div>
                                        <p className="text-white/40 text-sm leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section >

            {/* Testimonials */}
            < section id="community" className="px-6 py-32" >
                <div className="max-w-5xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-4 block">Community</span>
                        <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
                            What do <span className="text-emerald-400">members</span> say?
                        </h2>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                quote: "Finally a platform where you can discuss stocks without all the noise. The quality of discussions is on another level.",
                                name: "Erik L.",
                                title: "Private Investor",
                                avatar: "E"
                            },
                            {
                                quote: "I love that you can see others' track records. It means you can actually trust people giving tips.",
                                name: "Sofia K.",
                                title: "Day Trader",
                                avatar: "S"
                            },
                            {
                                quote: "Ticko AI is incredibly good. Saves me hours every week on research. Plus the community always has insights I miss.",
                                name: "Marcus A.",
                                title: "Tech Investor",
                                avatar: "M"
                            }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05]"
                            >
                                <Quote className="w-8 h-8 text-yellow-400/30 mb-4" />
                                <p className="text-white/70 text-sm leading-relaxed mb-6">"{item.quote}"</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
                                        {item.avatar}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm">{item.name}</p>
                                        <p className="text-white/40 text-xs">{item.title}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section >

            {/* Why join now section - replaces fake stats */}
            < section className="px-6 py-24 border-t border-white/[0.05]" >
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-4">
                            Why join <span className="text-emerald-400">now</span>?
                        </h2>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                emoji: "💬",
                                title: "Grow with the community",
                                desc: "Discuss strategies, share analyses, and learn from others. Together we get better."
                            },
                            {
                                emoji: "🎯",
                                title: "100% risk-free",
                                desc: "Trade with virtual money and build your track record — without risking a single dollar."
                            },
                            {
                                emoji: "🏆",
                                title: "Build your track record",
                                desc: "The earlier you start sharing analyses, the more impressive your history becomes."
                            }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] text-center"
                            >
                                <span className="text-4xl mb-4 block">{item.emoji}</span>
                                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                                <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="px-6 py-24 border-t border-white/[0.05]">
                <div className="max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-2xl md:text-4xl font-black tracking-tight mb-4">
                            Frequently asked <span className="text-emerald-400">questions</span>
                        </h2>
                    </motion.div>

                    <div className="space-y-4">
                        <motion.details
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="group bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden"
                        >
                            <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-white/[0.02] transition-colors">
                                <span className="text-lg font-bold">Can I withdraw winnings as real money?</span>
                                <ChevronRight className="w-5 h-5 text-white/40 transition-transform group-open:rotate-90" />
                            </summary>
                            <div className="px-6 pb-6 text-white/60 leading-relaxed">
                                <strong className="text-white">No.</strong> The $10,000 you trade with, and all profits you make in the challenge, are entirely virtual. The purpose is to build a verified track record and compete for glory and XP — without financial risk.
                            </div>
                        </motion.details>

                        <motion.details
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="group bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden"
                        >
                            <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-white/[0.02] transition-colors">
                                <span className="text-lg font-bold">Does it cost anything?</span>
                                <ChevronRight className="w-5 h-5 text-white/40 transition-transform group-open:rotate-90" />
                            </summary>
                            <div className="px-6 pb-6 text-white/60 leading-relaxed">
                                <strong className="text-white">No, it's 100% free</strong> to create an account, get the starting capital, and use the platform. We believe financial education and community should be accessible to everyone.
                            </div>
                        </motion.details>

                        <motion.details
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="group bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden"
                        >
                            <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-white/[0.02] transition-colors">
                                <span className="text-lg font-bold">Is this investment advice?</span>
                                <ChevronRight className="w-5 h-5 text-white/40 transition-transform group-open:rotate-90" />
                            </summary>
                            <div className="px-6 pb-6 text-white/60 leading-relaxed">
                                <strong className="text-white">No!</strong> Ticko is an educational and discussion platform. None of the information here constitutes financial advice. Always do your own research.
                            </div>
                        </motion.details>

                        <motion.details
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                            className="group bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden"
                        >
                            <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-white/[0.02] transition-colors">
                                <span className="text-lg font-bold">How does Ticko AI work?</span>
                                <ChevronRight className="w-5 h-5 text-white/40 transition-transform group-open:rotate-90" />
                            </summary>
                            <div className="px-6 pb-6 text-white/60 leading-relaxed">
                                Ticko AI summarizes news, analyzes sentiment, and answers questions about stocks. It's a <strong className="text-emerald-400">tool to help you</strong>, not an advisor.
                            </div>
                        </motion.details>
                    </div>
                </div>
            </section>

            {/* Ge dig själv ett försprång Section */}
            <section id="edge" className="px-6 py-32 border-t border-white/[0.05]">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6">
                            Give yourself an <span className="text-emerald-400">edge</span>
                        </h2>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Users,
                                title: "Stop guessing",
                                desc: "Follow discussions that actually matter. On Ticko you see immediately which theses hold up and which are just talk."
                            },
                            {
                                icon: Sparkles,
                                title: "Focus on the right data",
                                desc: "Instead of drowning in news, use Ticko AI to filter out the most important signals for your next trade."
                            },
                            {
                                icon: Shield,
                                title: "Verified knowledge",
                                desc: "Results matter here, not followers. Our leaderboard shows in black and white who actually beats the market – a track record you can trust."
                            }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/10"
                            >
                                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4">
                                    <item.icon className="w-6 h-6 text-emerald-400" />
                                </div>
                                <h3 className="text-lg font-bold mb-2 text-emerald-100">{item.title}</h3>
                                <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="relative px-6 py-40 flex flex-col items-center text-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-emerald-950/20 to-[#020617] pointer-events-none" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-900/10 via-transparent to-transparent pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative z-10 max-w-2xl"
                >
                    <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6">
                        Stop being <span className="text-white/40">alone</span> with your investments.
                    </h2>
                    <p className="text-lg text-white/50 mb-10 leading-relaxed">
                        Start building your track record today – 100% free, zero risk. It takes 30 seconds.
                    </p>

                    <Link
                        href="/register"
                        className="group inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-[#020617] rounded-full font-black text-lg transition-all hover:scale-105 shadow-2xl shadow-emerald-500/20"
                    >
                        Create free account
                        <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
                    </Link>

                    <p className="text-white/30 text-sm mt-6">
                        No credit cards. No commitments. 100% free.
                    </p>
                </motion.div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/[0.05] bg-[#01040f]">
                <div className="max-w-7xl mx-auto px-6 py-16">
                    <div className="grid md:grid-cols-4 gap-12 mb-12">
                        <div className="md:col-span-2">
                            <TickoLogo />
                            <p className="text-white/40 text-sm max-w-sm mt-4 leading-relaxed">
                                The modern community for investors. Discuss stocks, follow sentiment, and build your track record.
                            </p>
                            <a href="mailto:hello@tickomarkets.com" className="text-emerald-400/80 hover:text-emerald-400 text-sm font-medium mt-4 block transition-colors">
                                hello@tickomarkets.com
                            </a>

                            {/* Social Media Links */}
                            <div className="flex items-center gap-4 mt-6">
                                <a
                                    href="https://x.com/TickoMarkets"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.1] hover:border-emerald-500/30 transition-all"
                                    aria-label="Follow us on X"
                                >
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                    </svg>
                                </a>
                                <a
                                    href="https://www.instagram.com/tickomarkets/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.1] hover:border-emerald-500/30 transition-all"
                                    aria-label="Follow us on Instagram"
                                >
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                    </svg>
                                </a>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold text-sm mb-4 text-white/60 uppercase tracking-wider">Get Started</h4>
                            <div className="flex flex-col gap-3 text-sm text-white/40">
                                <Link href="/register" className="hover:text-white transition-colors">Create account</Link>
                                <Link href="/login" className="hover:text-white transition-colors">Log in</Link>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold text-sm mb-4 text-white/60 uppercase tracking-wider">Company</h4>
                            <div className="flex flex-col gap-3 text-sm text-white/40">
                                <Link href="/about" className="hover:text-white transition-colors">About</Link>
                                <Link href="/wiki" className="hover:text-white transition-colors">Financial Wiki</Link>
                                <Link href="/faq" className="hover:text-white transition-colors">FAQ</Link>
                                <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
                                <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                                <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                            </div>
                        </div>
                    </div>

                    {/* Legal Disclaimer */}
                    <div className="pt-8 border-t border-white/[0.03]">
                        <p className="text-[11px] text-white/20 leading-relaxed max-w-4xl">
                            <strong className="text-white/30">Disclaimer:</strong> Content on Ticko, including data and analyses from Ticko AI, does not constitute financial advice or buy recommendations. All investing involves risk and past performance is no guarantee of future results. Market data may be delayed. Opinions shared by users are their own and do not represent Ticko.
                        </p>
                    </div>

                    <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-white/20 font-medium">
                        <span>&copy; 2026 {APP_CONFIG.name}. All rights reserved.</span>
                    </div>
                </div>
            </footer >
        </div >
    );
}
