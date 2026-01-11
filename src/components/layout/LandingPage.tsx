"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { TrendingUp, Users, MessageCircle, Bell, ArrowRight, Globe, Shield, Zap } from "lucide-react";
import { APP_CONFIG } from "@/config/app";

import { TickoLogo } from "@/components/ui/TickoLogo";

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
                        <Link href="#community" className="hover:text-white transition-colors">Community</Link>
                        <Link href="#om-oss" className="hover:text-white transition-colors">Om oss</Link>
                        <Link href="/for-foretag" className="hover:text-white transition-colors">För Företag</Link>
                    </div>

                    <div className="flex items-center gap-6">
                        <Link href="/logga-in" className="text-sm font-medium text-white/60 hover:text-white transition-colors hidden sm:block">
                            Logga in
                        </Link>
                        <Link
                            href="/registrera"
                            className="px-6 py-3 bg-white text-black rounded-full font-bold text-sm hover:shadow-lg hover:shadow-white/20 transition-all transform hover:-translate-y-0.5"
                        >
                            Bli Medlem
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-40 pb-32 px-6 flex flex-col items-center text-center z-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-8 backdrop-blur-sm"
                >
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">
                        Sveriges nya trading-community
                    </span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                    className="text-5xl md:text-7xl font-black tracking-tighter mb-8 leading-[1.0] md:leading-[1.0]"
                >
                    <span className="block text-white mb-[-10px] md:mb-[-15px]">BÖRSEN</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-200 to-white">
                        ÄR BÄTTRE TILLSAMMANS
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-lg text-white/50 max-w-xl font-medium leading-relaxed mb-10"
                >
                    Sluta gissa. Börja samarbeta. <br className="hidden md:block" /> Anslut dig till tusentals investerare och hitta din edge i bruset.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex flex-col sm:flex-row items-center gap-4"
                >
                    <Link
                        href="/registrera"
                        className="group px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-[#020617] rounded-full font-bold text-lg shadow-[0_0_40px_-10px_rgba(16,185,129,0.3)] transition-all flex items-center gap-2"
                    >
                        Gå med gratis
                        <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </Link>
                    <Link
                        href="/upptack"
                        className="px-8 py-4 bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] text-white rounded-full font-bold text-lg backdrop-blur-lg transition-all"
                    >
                        Utforska community
                    </Link>
                </motion.div>
            </section>

            {/* How it works Section */}
            <section className="px-6 py-20 max-w-7xl mx-auto border-t border-white/[0.05]">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-4">SÅ FUNKAR TICKO</h2>
                    <p className="text-white/40 font-medium">Tre enkla steg till bättre affärer</p>
                </div>
                <div className="grid md:grid-cols-3 gap-12">
                    {[
                        { step: "01", title: "Svep", desc: "Bläddra igenom dagens mest intressanta case med vår intuitiva feed." },
                        { step: "02", title: "Analysera", desc: "Se vad communityt och AI tycker. Få djupdykningar i larm och sentiment." },
                        { step: "03", title: "Vinn", desc: "Ta beslut baserat på data och massans visdom. Bygg din track-record." }
                    ].map((item, idx) => (
                        <div key={idx} className="relative p-8 rounded-[2rem] bg-white/[0.02] border border-white/[0.05] backdrop-blur-md">
                            <span className="absolute -top-6 -left-4 text-6xl font-black text-white/5 italic">
                                {item.step}
                            </span>
                            <h3 className="text-2xl font-bold mb-4 z-10 relative uppercase tracking-tight">{item.title}</h3>
                            <p className="text-white/40 leading-relaxed font-medium relative z-10">
                                {item.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Om oss Section */}
            <section id="om-oss" className="px-6 py-32 bg-white/[0.01] border-y border-white/[0.05]">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="inline-block p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-8"
                    >
                        <Zap className="w-6 h-6 text-indigo-400" />
                    </motion.div>
                    <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-8 italic">VÅR VISION</h2>
                    <p className="text-xl text-white/60 leading-[1.6] font-medium mb-8">
                        Ticko skapades ur frustration. Varför ska det vara så svårt att hitta bra investeringsmöjligheter? Vi tror på kraften i att dela med sig. Genom att sammanföra tusentals hjärnor skapar vi ett kollektivt medvetande som slår marknadens brus.
                    </p>
                    <p className="text-white/40 italic">"Demokratisering av kapitalmarknaden börjar med information."</p>
                </div>
            </section>

            {/* För Företag Section */}
            <section id="for-foretag" className="px-6 py-32 max-w-7xl mx-auto">
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-8">PARTNERSKAP <br /> <span className="text-white/20">& TILLVÄXT</span></h2>
                        <p className="text-lg text-white/50 font-medium leading-relaxed mb-8">
                            Vi hjälper banker, mäklare och fintech-bolag att nå nästa generations investerare. Genom våra smarta integrationer och affiliate-program kan ni bygga en närvaro där samtalet faktiskt sker.
                        </p>
                        <ul className="space-y-4 mb-10">
                            {[
                                "Native affiliate-integrationer",
                                "Data-driven räckvidd",
                                "Premium brand positioning",
                                "Direkt access till unga investerare"
                            ].map((li, i) => (
                                <li key={i} className="flex items-center gap-3 text-white/80 font-bold">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    {li}
                                </li>
                            ))}
                        </ul>
                        <Link href="/for-foretag" className="px-8 py-4 bg-white text-black rounded-full font-bold inline-flex items-center gap-2 hover:scale-105 transition-all">
                            Kontakta oss för partnerskap <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-0 bg-emerald-500/20 blur-[100px] rounded-full" />
                        <div className="relative p-1 rounded-[3rem] bg-gradient-to-br from-white/20 to-transparent">
                            <div className="bg-[#020617] rounded-[2.9rem] p-12 text-center border border-white/10">
                                <MessageCircle className="w-16 h-16 text-emerald-400 mx-auto mb-8" />
                                <h3 className="text-3xl font-black mb-4">REDA ATT SCALA?</h3>
                                <p className="text-white/40 font-medium">Skräddarsydda lösningar för era affärsmål.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Community Features Section */}
            <section id="community" className="px-6 py-20 max-w-7xl mx-auto">
                <div className="grid md:grid-cols-3 gap-6">
                    {[
                        {
                            icon: Users,
                            color: "text-emerald-400",
                            bg: "bg-emerald-500/10",
                            title: "Starkt Community",
                            desc: "Diskutera case med Sveriges vassaste traders. Dela idéer och validera dina teser."
                        },
                        {
                            icon: Bell,
                            color: "text-violet-400",
                            bg: "bg-violet-500/10",
                            title: "Smarta Larm",
                            desc: "Missa aldrig en rörelse. Få notiser när communityt agerar eller när sentimentet vänder."
                        },
                        {
                            icon: Shield,
                            color: "text-blue-400",
                            bg: "bg-blue-500/10",
                            title: "Verifierade Profiler",
                            desc: "Bygg ditt rykte. Tävla på topplistor och visa upp din track-record."
                        }
                    ].map((feature, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/[0.05] backdrop-blur-md hover:bg-white/[0.04] transition-all group"
                        >
                            <div className={`w-14 h-14 rounded-2xl ${feature.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                <feature.icon className={`w-7 h-7 ${feature.color}`} />
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-white/90">{feature.title}</h3>
                            <p className="text-white/40 leading-relaxed font-medium">
                                {feature.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer className="mt-32 border-t border-white/[0.05] bg-[#01040f]">
                <div className="max-w-7xl mx-auto px-6 py-12">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                        <div>
                            <div className="mb-4">
                                <TickoLogo />
                            </div>
                            <p className="text-white/40 text-sm max-w-sm">
                                Sveriges mötesplats för aktieintresserade.
                            </p>
                        </div>

                        <div className="flex gap-8 text-sm font-medium text-white/40">
                            <Link href="#" className="hover:text-white transition-colors">För Företag & Partners</Link>
                            <Link href="#" className="hover:text-white transition-colors">Integritet</Link>
                            <Link href="#" className="hover:text-white transition-colors">Om oss</Link>
                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-white/[0.05] flex justify-between items-center text-xs text-white/20 font-medium uppercase tracking-wider">
                        <span>&copy; 2026 {APP_CONFIG.name}.</span>
                        <div className="flex gap-4">
                            <Globe className="w-4 h-4" />
                            <span>Sverige</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
