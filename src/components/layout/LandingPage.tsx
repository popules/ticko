"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { TrendingUp, Users, MessageCircle, Bell, ArrowRight, Globe, Shield, Zap, BarChart3, Lock } from "lucide-react";
import { APP_CONFIG } from "@/config/app";

import { TickoLogo } from "@/components/ui/TickoLogo";
import { LiveTicker } from "@/components/landing/LiveTicker";
import { HeroPreview } from "@/components/landing/HeroPreview";

export function LandingPage() {
    return (
        <div className="min-h-screen bg-[#020617] text-white selection:bg-emerald-500/30 overflow-x-hidden font-sans">
            {/* Background Gradients */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[1000px] h-[1000px] bg-indigo-900/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-emerald-900/10 rounded-full blur-[120px]" />
            </div>

            {/* Nav */}
            <nav className="fixed top-0 w-full z-50 border-b border-white/[0.05] bg-[#020617]/70 backdrop-blur-xl transition-all">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <TickoLogo />
                    </div>

                    {/* Desktop Nav Links */}
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/60">
                        <Link href="#features" className="hover:text-white transition-colors">Varför Ticko?</Link>
                        <Link href="#community" className="hover:text-white transition-colors">Community</Link>
                        <Link href="/for-foretag" className="hover:text-white transition-colors">För Företag</Link>
                    </div>

                    <div className="flex items-center gap-6">
                        <Link href="/logga-in" className="text-sm font-medium text-white/60 hover:text-white transition-colors hidden sm:block">
                            Logga in
                        </Link>
                        <Link
                            href="/registrera"
                            className="px-6 py-3 bg-white text-black rounded-full font-bold text-sm hover:shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] transition-all transform hover:-translate-y-0.5"
                        >
                            Bli Medlem
                        </Link>
                    </div>
                </div>

                {/* Live Ticker integrated directly into Nav structure or just below */}
                <LiveTicker />
            </nav>

            {/* Hero Section */}
            <section className="relative pt-48 pb-10 px-6 flex flex-col items-center text-center z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-8 backdrop-blur-sm"
                >
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">
                        Framtidens Investeringsplattform
                    </span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                    className="text-5xl md:text-7xl font-black tracking-tighter mb-8 leading-[1.0] md:leading-[0.95] max-w-4xl"
                >
                    <span className="block text-white mb-2">SLUTA GISSA.</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-200 to-white">
                        BÖRJA VETA.
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-lg text-white/50 max-w-xl font-medium leading-relaxed mb-12"
                >
                    Få tillgång till marknadens vassaste analyser, realtidsdata och ett community som faktiskt levererar. <span className="text-white">Ditt övertag börjar här.</span>
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex flex-col sm:flex-row items-center gap-4 mb-20"
                >
                    <Link
                        href="/registrera"
                        className="group min-w-[200px] px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-[#020617] rounded-full font-bold text-lg shadow-[0_0_40px_-10px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2"
                    >
                        Skapa Konto
                        <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </Link>
                    <Link
                        href="/upptack"
                        className="min-w-[200px] px-8 py-4 bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] text-white rounded-full font-bold text-lg backdrop-blur-lg transition-all"
                    >
                        Se Demo
                    </Link>
                </motion.div>

                <HeroPreview />
            </section>

            {/* Value Proposition / "Why" Section */}
            <section id="features" className="px-6 py-32 bg-white/[0.01] border-y border-white/[0.05]">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-6">DÄRFÖR VÄLJER PROFFSEN TICKO</h2>
                        <p className="text-white/40 font-medium text-lg max-w-2xl mx-auto">
                            Vi har skalat bort bruset. Kvar är datan, verktygen och nätverket du behöver för att maximera din avkastning.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: BarChart3,
                                title: "AI-Driven Analys",
                                desc: "Låt våra modeller göra grovjobbet. Få omedelbara analyser av sentiment, risk och uppsida på tusentals aktier.",
                                color: "text-emerald-400",
                                bg: "bg-emerald-500/10"
                            },
                            {
                                icon: Users,
                                title: "Verifierat Community",
                                desc: "Inga bottar. Inga anonyma pump-and-dump konton. Bara verifierade profiler med synlig track-record.",
                                color: "text-violet-400",
                                bg: "bg-violet-500/10"
                            },
                            {
                                icon: Lock,
                                title: "Institutionella Verktyg",
                                desc: "Realtidsdata, avancerade grafer och portföljhantering som tidigare bara fanns hos dyra terminaler.",
                                color: "text-blue-400",
                                bg: "bg-blue-500/10"
                            }
                        ].map((item, i) => (
                            <div key={i} className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-all group">
                                <div className={`w-14 h-14 rounded-2xl ${item.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                    <item.icon className={`w-7 h-7 ${item.color}`} />
                                </div>
                                <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                                <p className="text-white/40 leading-relaxed font-medium">
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Social Proof / Stats */}
            <section className="px-6 py-24 border-b border-white/[0.05]">
                <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
                    {[
                        { label: "Aktiva Traders", value: "12,000+" },
                        { label: "Dagliga Analyser", value: "850+" },
                        { label: "Förvaltat Kapital", value: "2.4Mk" }, // Mock value
                        { label: "Länder", value: "4" }
                    ].map((stat, i) => (
                        <div key={i}>
                            <p className="text-4xl md:text-5xl font-black text-white mb-2">{stat.value}</p>
                            <p className="text-sm font-bold text-white/30 uppercase tracking-widest">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Final CTA */}
            <section className="relative px-6 py-40 flex flex-col items-center text-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-[#020617] to-emerald-900/20 pointer-events-none" />
                <div className="relative z-10 max-w-3xl">
                    <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-8">
                        REDO ATT TA NÄSTA STEG?
                    </h2>
                    <p className="text-xl text-white/50 mb-10 font-medium">
                        Det kostar inget att börja. Men det kan kosta att stå utanför.
                    </p>
                    <Link
                        href="/registrera"
                        className="px-10 py-5 bg-white text-black rounded-full font-bold text-xl hover:scale-105 transition-transform inline-flex items-center gap-2 shadow-2xl shadow-white/10"
                    >
                        Starta din resa nu <ArrowRight className="w-6 h-6" />
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/[0.05] bg-[#01040f]">
                <div className="max-w-7xl mx-auto px-6 py-12">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                        <div>
                            <div className="mb-4">
                                <TickoLogo />
                            </div>
                            <p className="text-white/40 text-sm max-w-sm">
                                Sveriges mest ambitiösa trading-community.
                            </p>
                        </div>

                        <div className="flex gap-8 text-sm font-medium text-white/40">
                            <Link href="#" className="hover:text-white transition-colors">För Företag</Link>
                            <Link href="#" className="hover:text-white transition-colors">Villkor</Link>
                            <Link href="#" className="hover:text-white transition-colors">Integritet</Link>
                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-white/[0.05] flex justify-between items-center text-xs text-white/20 font-medium uppercase tracking-wider">
                        <span>&copy; 2026 {APP_CONFIG.name}.</span>
                        <div className="flex gap-4">
                            <Globe className="w-4 h-4" />
                            <span>Stockholm, SE</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
