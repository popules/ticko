"use client";

import Link from "next/link";
import { ArrowLeft, Users, MessageCircle, TrendingUp, Zap, Shield, ArrowRight, Mail, Gavel, Target, Database, Award, Gamepad2, Brain, AlertTriangle } from "lucide-react";
import { TickoLogo } from "@/components/ui/TickoLogo";
import { APP_CONFIG } from "@/config/app";

export default function OmOssPage() {
    const pillars = [
        {
            icon: Gamepad2,
            title: "100k-utmaningen",
            desc: "Varje användare startar med 100 000 virtuella kronor. Visa vad du går för genom att bygga en portfölj och tävla mot andra — utan att riskera en enda krona.",
            color: "text-amber-400",
            bg: "bg-amber-500/10"
        },
        {
            icon: Award,
            title: "Track Records som bevisar sig",
            desc: "På Ticko är det dina resultat som räknas. Ditt XP och Level bygger på faktisk trading-performance, inte bara antal inlägg. Anonyma 'experter' avslöjas snabbt.",
            color: "text-emerald-400",
            bg: "bg-emerald-500/10"
        },
        {
            icon: Brain,
            title: "AI Copilot – Information, inte rådgivning",
            desc: "Vår AI sammanfattar nyheter och analyserar sentiment för att hjälpa dig fatta egna beslut snabbare. Den ger aldrig köp- eller säljråd.",
            color: "text-violet-400",
            bg: "bg-violet-500/10"
        },
        {
            icon: Users,
            title: "En meritokratisk kultur",
            desc: "Vi dödar den anonyma forumkulturen genom att koppla åsikter till verifierbara track records. Substans väger tyngre än hype.",
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
                        <span className="text-sm font-medium">Tillbaka</span>
                    </Link>
                    <TickoLogo />
                </div>
            </nav>

            <main className="pt-32 pb-24 px-6">
                <div className="max-w-3xl mx-auto">
                    {/* Hero Section */}
                    <div className="mb-20">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-8 leading-[1.1]">
                            Om Ticko – <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300">Utbildning genom simulering</span>
                        </h1>

                        <div className="space-y-8">
                            <section>
                                <h2 className="text-2xl font-bold text-white mb-4">Vision: Lär dig handla – utan risk</h2>
                                <p className="text-white/60 text-lg leading-relaxed">
                                    Ticko är en <strong className="text-white">utbildningsplattform</strong> och ett <strong className="text-white">socialt nätverk</strong> för människor som vill lära sig mer om aktier och trading. Vi erbjuder en riskfri miljö där du kan öva med virtuella pengar, diskutera strategier och bygga kunskap tillsammans med andra.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-white mb-4">Vad Ticko inte är</h2>
                                <p className="text-white/60 text-lg leading-relaxed">
                                    Ticko är <strong className="text-white">inte en finansiell tjänst</strong>. Vi är inte en mäklare, bank eller investeringsrådgivare. Vi hanterar inga riktiga pengar och ger inga köp- eller säljråd. All simulerad handel sker med virtuella medel utan koppling till verkliga marknader.
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
                                <h3 className="text-lg font-bold text-violet-400 mb-2">AI-disclaimer</h3>
                                <p className="text-white/60 leading-relaxed">
                                    Tickos AI-analyser ("Ticko AI", "AI Copilot") är automatiserade verktyg för att underlätta informationshämtning och sammanfattning av offentligt tillgänglig data. De utgör inte, och ska inte tolkas som, köp- eller säljråd eller finansiell rådgivning av något slag.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Pillars Grid */}
                    <div className="mb-20">
                        <h2 className="text-2xl font-bold text-white mb-10 text-center">Kärnpelarna i Ticko</h2>
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
                            <h2 className="text-2xl font-bold text-white mb-4">Vår vision: Döda den giftiga forumkulturen</h2>
                            <p className="text-white/60 text-lg leading-relaxed">
                                Vi tror att aktiediskussioner online har ett problem: anonymitet utan ansvar. Vem som helst kan ropa "köp!" eller "sälj!" utan konsekvenser. På Ticko kopplar vi varje användares åsikter till ett <strong className="text-emerald-400">verifierbart track record</strong> via simulerad handel. Resultat talar högre än ord.
                            </p>
                        </div>
                    </div>

                    {/* Contact Section */}
                    <div className="grid sm:grid-cols-2 gap-6 mb-20">
                        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col items-center text-center">
                            <Mail className="w-8 h-8 text-emerald-400 mb-4" />
                            <h3 className="text-lg font-bold mb-2">Feedback & Idéer</h3>
                            <a href="mailto:hej@ticko.se" className="text-emerald-400 hover:underline">hej@ticko.se</a>
                        </div>
                        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col items-center text-center">
                            <Gavel className="w-8 h-8 text-blue-400 mb-4" />
                            <h3 className="text-lg font-bold mb-2">Juridiska frågor</h3>
                            <a href="mailto:legal@ticko.se" className="text-blue-400 hover:underline">legal@ticko.se</a>
                        </div>
                    </div>

                    {/* Final CTA */}
                    <div className="text-center py-12 border-t border-white/10">
                        <h2 className="text-2xl md:text-3xl font-black mb-8">Redo att testa 100k-utmaningen?</h2>
                        <Link
                            href="/registrera"
                            className="group px-8 py-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-[#020617] rounded-full font-bold text-lg shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 mx-auto w-fit hover:scale-105"
                        >
                            Starta din utmaning
                            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-white/[0.05] bg-[#01040f]">
                <div className="max-w-4xl mx-auto px-6 py-12">
                    <p className="text-[11px] text-white/20 leading-relaxed max-w-4xl text-center">
                        <strong className="text-white/30">Disclaimer:</strong> Ticko är en utbildningsplattform med simulerad handel. Vi är inte en finansiell tjänst och erbjuder ingen investeringsrådgivning. All handel på Ticko sker med virtuella medel. AI-analyser är automatiserade verktyg och utgör inte finansiell rådgivning.
                    </p>
                    <p className="text-[10px] text-white/10 mt-6 text-center">
                        &copy; 2026 {APP_CONFIG.name}. Alla rättigheter förbehållna.
                    </p>
                </div>
            </footer>
        </div>
    );
}
