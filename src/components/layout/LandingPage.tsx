"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import {
    TrendingUp, Users, MessageCircle, Bell, ArrowRight, Globe,
    Shield, Zap, BarChart3, Star, CheckCircle, Play, Sparkles,
    Target, Award, LineChart, Brain, Clock, ChevronDown, Quote
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
                            className="px-6 py-3 bg-white text-black rounded-full font-bold text-sm hover:shadow-[0_0_30px_-5px_rgba(255,255,255,0.4)] transition-all transform hover:-translate-y-0.5"
                        >
                            Bli Medlem — Gratis
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section ref={targetRef} className="relative pt-40 pb-10 px-6 flex flex-col items-center text-center z-10 min-h-screen">
                <motion.div style={{ opacity, scale }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 mb-6 backdrop-blur-sm"
                    >
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                            Nu live — Gå med gratis
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
                        className="flex flex-col sm:flex-row items-center gap-4 mb-8"
                    >
                        <Link
                            href="/registrera"
                            className="group px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-[#020617] rounded-full font-bold text-base shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2 hover:scale-105"
                        >
                            Skapa konto på 30 sekunder
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

                    {/* Social proof bar */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/40 mb-16"
                    >
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-emerald-400 font-semibold">Early Beta</span>
                        </div>
                        <div className="hidden sm:block w-px h-4 bg-white/10" />
                        <span>🇸🇪 Byggt i Stockholm</span>
                        <div className="hidden sm:block w-px h-4 bg-white/10" />
                        <span>🚀 Gratis för alltid</span>
                    </motion.div>

                    <HeroPreview />
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

            {/* Problem Section */}
            <section id="problem" className="px-6 py-32 border-t border-white/[0.05]">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <span className="text-xs font-bold uppercase tracking-widest text-rose-400 mb-4 block">Problemet</span>
                        <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6">
                            Att investera ensam är <span className="text-rose-400">svårt</span>.
                        </h2>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                emoji: "🤔",
                                title: "Ingen att fråga",
                                desc: "Du hittar en aktie som ser intressant ut. Men vem ska du diskutera med? Reddit är kaos och Twitter är mest hype."
                            },
                            {
                                emoji: "📊",
                                title: "Information överallt",
                                desc: "Nyheter, rapporter, analyser... Det finns för mycket att hålla koll på. Du missar viktiga signaler."
                            },
                            {
                                emoji: "🎭",
                                title: "Anonyma \"experter\"",
                                desc: "Alla påstår sig vara proffs online. Men ingen har track record. Vem kan du faktiskt lita på?"
                            }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="p-6 rounded-2xl bg-rose-500/5 border border-rose-500/10"
                            >
                                <span className="text-4xl mb-4 block">{item.emoji}</span>
                                <h3 className="text-lg font-bold mb-2 text-rose-100">{item.title}</h3>
                                <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Solution Section */}
            <section className="px-6 py-32 bg-gradient-to-b from-[#020617] via-emerald-950/10 to-[#020617]">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-4 block">Lösningen</span>
                        <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6">
                            Ticko: Din <span className="text-emerald-400">edge</span> på marknaden.
                        </h2>
                        <p className="text-lg text-white/50 max-w-2xl mx-auto">
                            En plats där du ser vad tusentals andra investerare faktiskt tror — i realtid. Inget mer gissande.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Users,
                                title: "Real community",
                                desc: "Diskutera med riktiga investerare. Ställ frågor, få svar, lär dig.",
                                color: "emerald"
                            },
                            {
                                icon: Target,
                                title: "Track records",
                                desc: "Se vem som faktiskt har rätt. Varje prediktion sparas och utvärderas.",
                                color: "teal"
                            },
                            {
                                icon: Brain,
                                title: "AI-assistans",
                                desc: "Vår AI sammanfattar sentiment, nyheter och hjälper dig förstå snabbare.",
                                color: "cyan"
                            }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-emerald-500/30 transition-all group"
                            >
                                <div className={`w-12 h-12 rounded-xl bg-${item.color}-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                    <item.icon className={`w-6 h-6 text-${item.color}-400`} />
                                </div>
                                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                                <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
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
                        <span className="text-xs font-bold uppercase tracking-widest text-violet-400 mb-4 block">Hur det fungerar</span>
                        <h2 className="text-3xl md:text-5xl font-black tracking-tight">
                            Kom igång på <span className="text-violet-400">3 steg</span>
                        </h2>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8 relative">
                        {/* Connecting line */}
                        <div className="hidden md:block absolute top-16 left-[16.66%] right-[16.66%] h-0.5 bg-gradient-to-r from-violet-500/20 via-violet-500/40 to-violet-500/20" />

                        {[
                            {
                                step: "01",
                                title: "Skapa konto",
                                desc: "Tar 30 sekunder. Inga kreditkort, inga betalväggar.",
                                icon: Zap
                            },
                            {
                                step: "02",
                                title: "Bygg din watchlist",
                                desc: "Lägg till aktier du följer. Få sentiment och diskussioner direkt.",
                                icon: LineChart
                            },
                            {
                                step: "03",
                                title: "Delta i diskussionen",
                                desc: "Dela dina tankar, följ andra och bygg ditt track record.",
                                icon: MessageCircle
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
                                <div className="w-12 h-12 mx-auto mb-6 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-violet-400 font-black text-lg relative z-10">
                                    {item.step}
                                </div>
                                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-violet-500/10 flex items-center justify-center">
                                    <item.icon className="w-7 h-7 text-violet-400" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                                <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
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
                        <span className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-4 block">Funktioner</span>
                        <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
                            Allt du behöver. <span className="text-blue-400">Inget du inte gör.</span>
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
                                title: "Leaderboard",
                                desc: "Topp-investerarna rankas efter träffsäkerhet. Följ de bästa, lär av experterna.",
                                tag: "Gamification"
                            },
                            {
                                icon: Brain,
                                title: "AI Copilot",
                                desc: "Fråga vår AI vad som helst om en aktie. Den sammanfattar nyheter, sentiment och analyser.",
                                tag: "AI-driven"
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
                                className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-blue-500/20 transition-all group"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                        <item.icon className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-lg font-bold">{item.title}</h3>
                                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
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
            </section>

            {/* Testimonials */}
            <section id="community" className="px-6 py-32">
                <div className="max-w-5xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <span className="text-xs font-bold uppercase tracking-widest text-yellow-400 mb-4 block">Community</span>
                        <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
                            Vad säger <span className="text-yellow-400">medlemmarna</span>?
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
                                quote: "AI-copiloten är sjukt bra. Sparar mig timmar varje vecka på research. Plus att communityt alltid har insikter jag missar.",
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
            </section>

            {/* Why join now section - replaces fake stats */}
            <section className="px-6 py-24 border-t border-white/[0.05]">
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
                                emoji: "🌱",
                                title: "Tidig åtkomst",
                                desc: "Bli en av de första att forma hur plattformen utvecklas. Din feedback spelar roll."
                            },
                            {
                                emoji: "🎁",
                                title: "Gratis för alltid",
                                desc: "Grundfunktionerna kommer alltid vara gratis. Premium kommer senare — men du är inte tvungen."
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

            {/* FAQ Preview */}
            <section className="px-6 py-32 bg-white/[0.01] border-t border-white/[0.05]">
                <div className="max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">
                            Vanliga frågor
                        </h2>
                    </motion.div>

                    <div className="space-y-4">
                        {[
                            {
                                q: "Kostar det något?",
                                a: "Nej, Ticko är helt gratis att använda. Vi planerar premium-funktioner i framtiden, men grundplattformen kommer alltid vara gratis."
                            },
                            {
                                q: "Vem kan se mina inlägg?",
                                a: "Alla medlemmar kan se dina publika inlägg och ditt track record. Du bygger transparens och trovärdighet."
                            },
                            {
                                q: "Är detta investeringsrådgivning?",
                                a: "Nej! Ticko är en diskussionsplattform. Ingen av informationen här utgör finansiell rådgivning. Gör alltid din egen research."
                            },
                            {
                                q: "Hur fungerar AI-copiloten?",
                                a: "Vår AI sammanfattar nyheter, analyserar sentiment och svarar på frågor om aktier. Den är ett hjälpverktyg, inte en rådgivare."
                            }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.05 }}
                                className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05]"
                            >
                                <h3 className="font-bold mb-2">{item.q}</h3>
                                <p className="text-white/50 text-sm leading-relaxed">{item.a}</p>
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
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-8">
                        <Clock className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm font-medium text-emerald-400">Tidig åtkomst — begränsat antal platser</span>
                    </div>

                    <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6">
                        Sluta vara <span className="text-white/40">ensam</span> med dina investeringar.
                    </h2>
                    <p className="text-lg text-white/50 mb-10 leading-relaxed">
                        Gå med tusentals svenska investerare som redan diskuterar, delar och lär av varandra på Ticko. Det tar 30 sekunder.
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
            </footer>
        </div>
    );
}
