"use client";

import Link from "next/link";
import { ArrowLeft, Users, MessageCircle, TrendingUp, Zap, Shield, ArrowRight, Mail, Gavel, Target, Database, Award } from "lucide-react";
import { TickoLogo } from "@/components/ui/TickoLogo";
import { APP_CONFIG } from "@/config/app";

export default function OmOssPage() {
    const pillars = [
        {
            icon: Target,
            title: "Precisionsdrivet flöde",
            desc: "Inget brus, ingen spam. Med strikt $TICKER-taggning skapar vi ett sökbart bibliotek av marknadsinsikter som hjälper communityt att följa specifika bolagsresor över tid.",
            color: "text-emerald-400",
            bg: "bg-emerald-500/10"
        },
        {
            icon: Zap,
            title: "Ticko AI – Din personliga analytiker",
            desc: "Vi har integrerat nästa generations AI direkt i flödet. Den hjälper dig att snabbt bryta ner rapporter och extrahera kärndata för snabbare strategiska beslut.",
            color: "text-violet-400",
            bg: "bg-violet-500/10"
        },
        {
            icon: Database,
            title: "Öppen tillgång till data",
            desc: "Vi anser att finansiell infrastruktur ska vara tillgänglig. Därför aggregerar vi kurser, nyheter och nyckeltal helt utan kostnad för våra användare.",
            color: "text-blue-400",
            bg: "bg-blue-500/10"
        },
        {
            icon: Award,
            title: "En meritokratisk kultur",
            desc: "På Ticko är det substansen i din analys som avgör ditt inflytande. Vi främjar en kultur där transparens, logik och väl underbyggda argument väger tyngst.",
            color: "text-amber-400",
            bg: "bg-amber-500/10"
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
                            Om Ticko – <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Framtidens mötesplats för investerare</span>
                        </h1>

                        <div className="space-y-8">
                            <section>
                                <h2 className="text-2xl font-bold text-white mb-4">Vision: Ett smartare ekosystem</h2>
                                <p className="text-white/60 text-lg leading-relaxed">
                                    Ticko grundades ur en enkel observation: De bästa investeringsinsikterna föds sällan i isolering, utan i gränssnittet mellan data och diskussion. Vi bygger en modern infrastruktur för den nya generationens investerare – de som kräver tillgång till rådata, avancerad AI och ett genuint utbyte av idéer. Vi har ersatt stängda rum och dyra betalväggar med en öppen plattform där analysen får tala för sig själv.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-white mb-4">Mer än bara ett forum – en gemenskap</h2>
                                <p className="text-white/60 text-lg leading-relaxed mb-4">
                                    Vi ser Ticko som ett kollektivt analysverktyg. Genom att kombinera institutionell marknadsdata med kraften i en aktiv community skapar vi ett informationsövertag som tidigare varit förbehållet ett fåtal.
                                </p>
                                <p className="text-white/60 text-lg leading-relaxed">
                                    Här möts nybörjaren som precis köpt sin första Investor-aktie och den erfarne tradern som letar efter nästa tillväxtraket på de mindre listorna. På Ticko är gemenskapen motorn; genom att dela analyser, ifrågasätta teser och fira framgångar (och lära av motgångar) tillsammans, höjer vi lägstanivån för alla.
                                </p>
                            </section>
                        </div>
                    </div>

                    {/* Pillars Grid */}
                    <div className="mb-20">
                        <h2 className="text-2xl font-bold text-white mb-10 text-center">Kärnpelarna i Tickos community</h2>
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

                    {/* Swedish Focus Section */}
                    <div className="space-y-8 mb-20">
                        <div className="p-8 rounded-3xl bg-emerald-500/[0.03] border border-emerald-500/10">
                            <h2 className="text-2xl font-bold text-white mb-4 italic">Byggt i Sverige för nordiska förutsättningar</h2>
                            <p className="text-white/60 text-lg leading-relaxed">
                                Ticko är utvecklat i Sverige för att optimera bevakningen av allt från defensiva utdelningsbolag på Large Cap till de mest volatila tillväxtresorna på First North och Spotlight. Vi bygger den plattform vi själva saknade – en plats där analysen tas på allvar men där den mänskliga gemenskapen är fundamentet.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-white">Vi bygger detta tillsammans (Beta)</h2>
                            <p className="text-white/60 text-lg leading-relaxed">
                                Ticko är under ständig utveckling och vi bygger plattformen tillsammans med våra användare. Som tidig medlem är du inte bara en användare, du är en del av grunden. Vi prioriterar funktioner baserat på vad communityt faktiskt behöver och din feedback går direkt till våra utvecklare.
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
                        <h2 className="text-2xl md:text-3xl font-black mb-8">Redo att bli en del av gemenskapen?</h2>
                        <Link
                            href="/registrera"
                            className="group px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-[#020617] rounded-full font-bold text-lg shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 mx-auto w-fit hover:scale-105"
                        >
                            Skapa konto gratis
                            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-white/[0.05] bg-[#01040f]">
                <div className="max-w-4xl mx-auto px-6 py-12">
                    <p className="text-[11px] text-white/20 leading-relaxed max-w-4xl text-center">
                        <strong className="text-white/30">Disclaimer:</strong> Innehållet på Ticko, inklusive data och analyser från Ticko AI, utgör inte finansiell rådgivning eller köprekommendationer. Allt investerande innebär risk och historisk avkastning är ingen garanti för framtida resultat. Marknadsdata kan vara fördröjd. Åsikter som delas av användare är deras egna och representerar inte Ticko.
                    </p>
                    <p className="text-[10px] text-white/10 mt-6 text-center">
                        &copy; 2026 {APP_CONFIG.name}. Alla rättigheter förbehållna.
                    </p>
                </div>
            </footer>
        </div>
    );
}
