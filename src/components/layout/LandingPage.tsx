"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { TrendingUp, Users, MessageCircle, Bell, ArrowRight, Globe, Shield, Zap, BarChart3, Lock } from "lucide-react";
import { APP_CONFIG } from "@/config/app";

import { TickoLogo } from "@/components/ui/TickoLogo";
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
                        <Link href="#features" className="hover:text-white transition-colors">Om plattformen</Link>
                        <Link href="/om-oss" className="hover:text-white transition-colors">Om oss</Link>
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
            </nav>

            {/* Hero Section */}
            <section className="relative pt-40 pb-10 px-6 flex flex-col items-center text-center z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6 backdrop-blur-sm"
                >
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                        Nu i öppen beta
                    </span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                    className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-6 leading-[1.1] max-w-3xl"
                >
                    <span className="block text-white">Investera smartare.</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                        Tillsammans.
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-base md:text-lg text-white/50 max-w-lg font-medium leading-relaxed mb-10"
                >
                    Diskutera aktier, följ investerare du litar på och se vad marknaden faktiskt tycker. <span className="text-white">Helt gratis.</span>
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex flex-col sm:flex-row items-center gap-3 mb-16"
                >
                    <Link
                        href="/registrera"
                        className="group px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-[#020617] rounded-full font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 hover:scale-105"
                    >
                        Gå med gratis
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                    <Link
                        href="/upptack"
                        className="px-6 py-3 bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] text-white rounded-full font-bold text-sm backdrop-blur-lg transition-all"
                    >
                        Utforska communityt
                    </Link>
                </motion.div>

                <HeroPreview />
            </section>

            {/* Value Proposition / "Why" Section */}
            <section id="features" className="px-6 py-24 bg-white/[0.01] border-y border-white/[0.05]">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-2xl md:text-4xl font-black tracking-tight mb-4">Varför Ticko?</h2>
                        <p className="text-white/40 font-medium text-base max-w-xl mx-auto">
                            Vi bygger platsen där svenska investerare samlas för att diskutera, dela analyser och lära av varandra.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                icon: Users,
                                title: "Community först",
                                desc: "Dela dina tankar, följ investerare du litar på och bygg din egen track-record.",
                                color: "text-emerald-400",
                                bg: "bg-emerald-500/10"
                            },
                            {
                                icon: MessageCircle,
                                title: "Realtidsdiskussioner",
                                desc: "Se vad andra tycker om marknaden just nu. Öppet för alla, inga betalväggar.",
                                color: "text-violet-400",
                                bg: "bg-violet-500/10"
                            },
                            {
                                icon: TrendingUp,
                                title: "Följ sentimentet",
                                desc: "Se vilka aktier som trendar och vad communityt faktiskt tror på.",
                                color: "text-blue-400",
                                bg: "bg-blue-500/10"
                            }
                        ].map((item, i) => (
                            <div key={i} className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-all group">
                                <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                                    <item.icon className={`w-6 h-6 ${item.color}`} />
                                </div>
                                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                                <p className="text-white/40 leading-relaxed text-sm">
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Community Pitch */}
            <section className="px-6 py-20">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-4">
                        Byggt av investerare, för investerare 💪
                    </h2>
                    <p className="text-white/40 text-base leading-relaxed mb-8">
                        Vi tror på transparent diskussion och synliga track-records. Här är du inte anonym – du bygger ditt rykte genom att dela smarta analyser.
                    </p>
                    <div className="flex flex-wrap justify-center gap-3">
                        <span className="px-4 py-2 rounded-full bg-white/[0.04] border border-white/10 text-sm text-white/60">
                            💬 Aktiediskussioner
                        </span>
                        <span className="px-4 py-2 rounded-full bg-white/[0.04] border border-white/10 text-sm text-white/60">
                            📈 Följ sentimentet
                        </span>
                        <span className="px-4 py-2 rounded-full bg-white/[0.04] border border-white/10 text-sm text-white/60">
                            🏆 Topplista
                        </span>
                        <span className="px-4 py-2 rounded-full bg-white/[0.04] border border-white/10 text-sm text-white/60">
                            🔔 Bevakningar
                        </span>
                    </div>
                </div>
            </section>

            <section className="relative px-6 py-32 flex flex-col items-center text-center overflow-hidden border-t border-white/[0.05]">
                <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-emerald-900/5 to-emerald-900/10 pointer-events-none" />
                <div className="relative z-10 max-w-2xl">
                    <h2 className="text-2xl md:text-4xl font-black tracking-tight mb-4">
                        Bli en av de första 🚀
                    </h2>
                    <p className="text-base text-white/50 mb-8">
                        Vi är i tidig beta och letar efter passionerade investerare som vill vara med och forma framtidens plattform.
                    </p>
                    <Link
                        href="/registrera"
                        className="px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-[#020617] rounded-full font-bold text-sm transition-all inline-flex items-center gap-2 hover:scale-105"
                    >
                        Skapa konto gratis <ArrowRight className="w-4 h-4" />
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
                                Ett community för svenska investerare.
                            </p>
                        </div>

                        <div className="flex gap-8 text-sm font-medium text-white/40">
                            <Link href="/om-oss" className="hover:text-white transition-colors">Om oss</Link>
                            <Link href="/villkor" className="hover:text-white transition-colors">Villkor</Link>
                            <Link href="/integritet" className="hover:text-white transition-colors">Integritet</Link>
                        </div>
                    </div>

                    {/* Legal Disclaimer */}
                    <div className="mt-8 pt-6 border-t border-white/[0.03]">
                        <p className="text-[11px] text-white/20 leading-relaxed max-w-4xl">
                            <strong className="text-white/30">Disclaimer:</strong> Innehållet på Ticko utgör inte finansiell rådgivning. Alla investeringsbeslut fattas av dig själv och på egen risk. Åsikter som delas av användare är deras egna och representerar inte Tickos ståndpunkt. Historisk avkastning är ingen garanti för framtida resultat.
                        </p>
                    </div>

                    <div className="mt-6 pt-6 border-t border-white/[0.03] flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-white/20 font-medium">
                        <span>&copy; 2026 {APP_CONFIG.name}. Alla rättigheter förbehållna.</span>
                        <div className="flex items-center gap-2">
                            <Globe className="w-3.5 h-3.5" />
                            <span>Stockholm, Sverige</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
