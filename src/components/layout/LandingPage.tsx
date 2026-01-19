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
                        <TickoLogo />
                    </div>

                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/60">
                        <Link href="#features" className="hover:text-white transition-colors">Funktioner</Link>
                        <Link href="#how-it-works" className="hover:text-white transition-colors">Hur det fungerar</Link>
                        <Link href="#community" className="hover:text-white transition-colors">Community</Link>
                        <Link href="/om-oss" className="hover:text-white transition-colors">Om oss</Link>
                    </div>

                    <div className="flex items-center gap-6">
                        <Link href="/logga-in" className="text-sm font-medium text-white/60 hover:text-white transition-colors hidden sm:block">
                            Logga in
                        </Link>
                        <Link
                            href="/registrera"
                            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-[#020617] rounded-full font-bold text-sm hover:shadow-[0_0_30px_-5px_rgba(16,185,129,0.5)] transition-all transform hover:-translate-y-0.5"
                        >
                            Bli Medlem — Gratis
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
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                            Paper Trading Utmaningen
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-6 leading-[1.1] max-w-4xl mx-auto"
                    >
                        <span className="block text-white">Här är 100 000 kr.</span>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                            Visa att du kan slå börsen.
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-base md:text-lg text-white/50 max-w-2xl font-medium leading-relaxed mb-12 mx-auto"
                    >
                        Handla aktier i realtid med virtuella pengar. Klättra på leaderboarden, bygg din streak och använd <span className="text-emerald-400">Ticko AI</span> för att hitta nästa vinnare. <span className="text-white">Helt gratis och utan risk.</span>
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="flex flex-col sm:flex-row items-center gap-4 mb-24"
                    >
                        <Link
                            href="/registrera"
                            className="group px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-[#020617] rounded-full font-bold text-base shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2 hover:scale-105"
                        >
                            Starta din utmaning nu
                            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                        </Link>
                        <a
                            href="#how-it-works"
                            className="group px-6 py-4 bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] text-white rounded-full font-bold text-sm backdrop-blur-lg transition-all flex items-center gap-2"
                        >
                            <Play className="w-4 h-4" />
                            Se hur det fungerar
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
                        <span className="text-xs font-medium">Scrolla för att läsa mer</span>
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
                        <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-4 block">Så här funkar det</span>
                        <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
                            Så här startar du din <span className="text-emerald-400">trading-utmaning</span>
                        </h2>
                        <p className="text-white/50 text-lg max-w-2xl mx-auto">Från nybörjare till verifierad investerare i tre enkla steg.</p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8 relative">
                        {/* Connecting line */}
                        <div className="hidden md:block absolute top-16 left-[16.66%] right-[16.66%] h-0.5 bg-gradient-to-r from-emerald-500/20 via-emerald-500/40 to-emerald-500/20" />

                        {[
                            {
                                step: "01",
                                title: "Få 100 000 kr direkt",
                                desc: "Skapa ditt gratis konto och få en portfölj fylld med 100 000 kr i virtuella pengar. Redo att användas på marknaden direkt.",
                                icon: Wallet
                            },
                            {
                                step: "02",
                                title: "Handla smart och rättvist",
                                desc: "Använd Ticko AI för research och lägg dina ordrar. Varje köp är låst i 30 minuter för att garantera en rättvis tävling utan arbitrage-fusk.",
                                icon: TrendingUp
                            },
                            {
                                step: "03",
                                title: "Bevisa din skicklighet",
                                desc: "Varje trade du gör bygger ditt track record. Visa communityt att du har vad som krävs.",
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
                                <div className="w-12 h-12 mx-auto mb-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-lg relative z-10">
                                    {item.step}
                                </div>
                                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                                    <item.icon className="w-7 h-7 text-emerald-400" />
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
                            href="/registrera"
                            className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-[#020617] rounded-full font-bold text-base shadow-lg shadow-emerald-500/25 transition-all hover:scale-105"
                        >
                            Starta min resa mot toppen — Gratis
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
                        <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-4 block">Verktygslådan</span>
                        <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
                            Verktygen som <span className="text-emerald-400">sätter dig i täten</span>
                        </h2>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {[
                            {
                                icon: TrendingUp,
                                title: "Realtidssentiment",
                                desc: "Se exakt vad communityt tror om varje aktie just nu. Bull eller Bear? Följ trenden.",
                                tag: "Live data"
                            },
                            {
                                icon: Bell,
                                title: "Smarta alerts",
                                desc: "Få notiser när aktier du följer diskuteras, trendar eller rör sig kraftigt.",
                                tag: "Push-notiser"
                            },
                            {
                                icon: Award,
                                title: "Tävla & Rankas",
                                desc: "XP och Levels visar vem som faktiskt är en skicklig investerare — och vem som bara pratar. Bygg ditt track record.",
                                tag: "Gamification"
                            },
                            {
                                icon: Brain,
                                title: "Ticko AI",
                                desc: "Ditt hemliga vapen i tävlingen. AI:n sammanfattar nyheter, analyserar sentiment och ger dig övertaget.",
                                tag: "Pro-verktyg"
                            },
                            {
                                icon: BarChart3,
                                title: "Watchlist & Portfolio",
                                desc: "Håll koll på dina aktier med live-priser, daglig utveckling och personliga alerts.",
                                tag: "Personligt"
                            },
                            {
                                icon: Shield,
                                title: "Veriferade track records",
                                desc: "Varje prediktion sparas. Du bygger ett synligt track record som andra kan se.",
                                tag: "Transparens"
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
                            Vad säger <span className="text-emerald-400">medlemmarna</span>?
                        </h2>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                quote: "Äntligen en svensk plattform där man kan diskutera aktier utan allt brus. Kvalitén på diskussionerna är helt annan nivå.",
                                name: "Erik L.",
                                title: "Privatinvesterare",
                                avatar: "E"
                            },
                            {
                                quote: "Jag älskar att man kan se andras track records. Det gör att man faktiskt kan lita på dem som ger tips.",
                                name: "Sofia K.",
                                title: "Daytrader",
                                avatar: "S"
                            },
                            {
                                quote: "Ticko AI är sjukt bra. Sparar mig timmar varje vecka på research. Plus att communityt alltid har insikter jag missar.",
                                name: "Marcus A.",
                                title: "Tech-investerare",
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
                            Varför gå med <span className="text-emerald-400">nu</span>?
                        </h2>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                emoji: "💬",
                                title: "Väx med communityt",
                                desc: "Diskutera strategier, dela analyser och lär dig av andra. Tillsammans blir vi bättre."
                            },
                            {
                                emoji: "🎯",
                                title: "100% riskfritt",
                                desc: "Handla med virtuella pengar och bygg ditt track record — utan att riskera en enda krona."
                            },
                            {
                                emoji: "🏆",
                                title: "Bygg ditt track record",
                                desc: "Ju tidigare du börjar dela analyser, desto mer imponerande blir din historik."
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
                            Vanliga <span className="text-emerald-400">frågor</span>
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
                                <span className="text-lg font-bold">Kan jag ta ut vinsten i riktiga pengar?</span>
                                <ChevronRight className="w-5 h-5 text-white/40 transition-transform group-open:rotate-90" />
                            </summary>
                            <div className="px-6 pb-6 text-white/60 leading-relaxed">
                                <strong className="text-white">Nej.</strong> De 100 000 kr du handlar med, och alla vinster du gör i utmaningen, är helt virtuella. Syftet är att bygga ett verifierat "track record" och tävla om äran och XP — utan ekonomisk risk.
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
                                <span className="text-lg font-bold">Kostar det något att vara med?</span>
                                <ChevronRight className="w-5 h-5 text-white/40 transition-transform group-open:rotate-90" />
                            </summary>
                            <div className="px-6 pb-6 text-white/60 leading-relaxed">
                                <strong className="text-white">Nej, det är 100% gratis</strong> att skapa konto, få startkapitalet och använda plattformen. Vi tror på att finansiell utbildning och community ska vara tillgängligt för alla.
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
                                <span className="text-lg font-bold">Är detta investeringsrådgivning?</span>
                                <ChevronRight className="w-5 h-5 text-white/40 transition-transform group-open:rotate-90" />
                            </summary>
                            <div className="px-6 pb-6 text-white/60 leading-relaxed">
                                <strong className="text-white">Nej!</strong> Ticko är en utbildnings- och diskussionsplattform. Ingen av informationen här utgör finansiell rådgivning. Gör alltid din egen research.
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
                                <span className="text-lg font-bold">Hur fungerar Ticko AI?</span>
                                <ChevronRight className="w-5 h-5 text-white/40 transition-transform group-open:rotate-90" />
                            </summary>
                            <div className="px-6 pb-6 text-white/60 leading-relaxed">
                                Ticko AI sammanfattar nyheter, analyserar sentiment och svarar på frågor om aktier. Den är ett <strong className="text-emerald-400">hjälpverktyg</strong>, inte en rådgivare.
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
                            Ge dig själv ett <span className="text-emerald-400">försprång</span>
                        </h2>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Users,
                                title: "Sluta gissa",
                                desc: "Följ diskussioner som faktiskt betyder något. På Ticko ser du direkt vilka teser som håller och vilka som bara är snack."
                            },
                            {
                                icon: Sparkles,
                                title: "Fokusera på rätt data",
                                desc: "Istället för att drunkna i nyheter använder du Ticko AI för att filtrera fram de viktigaste signalerna för din nästa trade."
                            },
                            {
                                icon: Shield,
                                title: "Verifierad kunskap",
                                desc: "Här räknas resultat, inte följare. Vår leaderboard visar svart på vitt vem som faktiskt slår börsen – ett track record du kan lita på."
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
                        Sluta vara <span className="text-white/40">ensam</span> med dina investeringar.
                    </h2>
                    <p className="text-lg text-white/50 mb-10 leading-relaxed">
                        Börja bygga ditt track record idag – helt gratis, helt utan risk. Det tar 30 sekunder.
                    </p>

                    <Link
                        href="/registrera"
                        className="group inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-[#020617] rounded-full font-black text-lg transition-all hover:scale-105 shadow-2xl shadow-emerald-500/20"
                    >
                        Skapa mitt gratis konto
                        <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
                    </Link>

                    <p className="text-white/30 text-sm mt-6">
                        Inga kreditkort. Inga bindningstider. 100% gratis.
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
                                Sveriges modernaste community för investerare. Diskutera aktier, följ sentiment och bygg ditt track record.
                            </p>
                            <a href="mailto:hello@ticko.se" className="text-emerald-400/80 hover:text-emerald-400 text-sm font-medium mt-4 block transition-colors">
                                hello@ticko.se
                            </a>
                        </div>

                        <div>
                            <h4 className="font-bold text-sm mb-4 text-white/60 uppercase tracking-wider">Kom igång</h4>
                            <div className="flex flex-col gap-3 text-sm text-white/40">
                                <Link href="/registrera" className="hover:text-white transition-colors">Skapa konto</Link>
                                <Link href="/logga-in" className="hover:text-white transition-colors">Logga in</Link>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold text-sm mb-4 text-white/60 uppercase tracking-wider">Företag</h4>
                            <div className="flex flex-col gap-3 text-sm text-white/40">
                                <Link href="/om-oss" className="hover:text-white transition-colors">Om oss</Link>
                                <Link href="/kontakt" className="hover:text-white transition-colors">Kontakt</Link>
                                <Link href="/villkor" className="hover:text-white transition-colors">Villkor</Link>
                                <Link href="/integritet" className="hover:text-white transition-colors">Integritet</Link>
                            </div>
                        </div>
                    </div>

                    {/* Legal Disclaimer */}
                    <div className="pt-8 border-t border-white/[0.03]">
                        <p className="text-[11px] text-white/20 leading-relaxed max-w-4xl">
                            <strong className="text-white/30">Disclaimer:</strong> Innehållet på Ticko, inklusive data och analyser från Ticko AI, utgör inte finansiell rådgivning eller köprekommendationer. Allt investerande innebär risk och historisk avkastning är ingen garanti för framtida resultat. Marknadsdata kan vara fördröjd. Åsikter som delas av användare är deras egna och representerar inte Ticko.
                        </p>
                    </div>

                    <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-white/20 font-medium">
                        <span>&copy; 2026 {APP_CONFIG.name}. Alla rättigheter förbehållna.</span>
                        <div className="flex items-center gap-2">
                            <Globe className="w-3.5 h-3.5" />
                            <span>Stockholm, Sverige 🇸🇪</span>
                        </div>
                    </div>
                </div>
            </footer >
        </div >
    );
}
