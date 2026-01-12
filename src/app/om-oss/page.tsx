"use client";

import Link from "next/link";
import { ArrowLeft, Users, MessageCircle, TrendingUp, Zap, Shield, ArrowRight, Mail, Gavel } from "lucide-react";
import { TickoLogo } from "@/components/ui/TickoLogo";
import { APP_CONFIG } from "@/config/app";

export default function OmOssPage() {
    const features = [
        {
            icon: Users,
            title: "Fokuserat Community",
            desc: "Här finns inget brus. Varje diskussion är kopplad till specifika instrument via $TICKER-taggar för maximal relevans och sökbarhet.",
            color: "text-emerald-400",
            bg: "bg-emerald-500/10"
        },
        {
            icon: Zap,
            title: "Ticko AI",
            desc: "Din intelligenta assistent som hjälper dig att sammanfatta rapporter, analysera sentiment och förklara finansiella nyckeltal på sekunder.",
            color: "text-violet-400",
            bg: "bg-violet-500/10"
        },
        {
            icon: TrendingUp,
            title: "Data för alla",
            desc: "Vi aggregerar marknadsdata och nyheter så att du har allt du behöver för att fatta välgrundade beslut på ett och samma ställe – helt utan betalväggar.",
            color: "text-blue-400",
            bg: "bg-blue-500/10"
        },
        {
            icon: Shield,
            title: "Byggt för transparens",
            desc: "Vi jobbar aktivt för att skapa en kultur där ärlighet och track-record väger tyngre än \"hype\".",
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
                            Om Ticko – <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Där svenska investerare möts</span>
                        </h1>

                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-white">Varför Ticko?</h2>
                            <p className="text-white/60 text-lg leading-relaxed">
                                Sverige har en av världens mest levande kulturer för småsparare och aktieintresserade. Trots det har vi länge varit hänvisade till forumlösningar som känns kvarlämnade i 90-talet eller brusiga sociala medier där seriösa analyser drunknar i memes och ovidkommande diskussioner.
                            </p>
                            <p className="text-white/60 text-lg leading-relaxed">
                                Ticko skapades för att ge det svenska investerarkollektivet det hem de förtjänar. Vi kombinerar modern teknik och realtidsdata med kraftfull AI för att skapa en plattform där kvalitet, transparens och gemenskap står i centrum.
                            </p>
                        </div>
                    </div>

                    {/* Vision Section */}
                    <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 mb-20 shadow-2xl">
                        <h2 className="text-2xl font-bold text-white mb-4">Vår Vision</h2>
                        <p className="text-white/60 leading-relaxed text-lg italic">
                            &quot;Vi vill demokratisera tillgången till finansiella insikter. Genom att integrera Ticko AI direkt i diskussionsflödet hjälper vi våra användare att snabbare förstå komplex marknadsdata, identifiera trender och ställa bättre frågor. Vi tror på kraften i &apos;Wisdom of the Crowds&apos; – när vi delar våra analyser och tankar öppet, blir vi alla bättre investerare.&quot;
                        </p>
                    </div>

                    {/* Features Grid */}
                    <div className="mb-20">
                        <h2 className="text-2xl font-bold text-white mb-10 text-center">Vad gör Ticko unikt?</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            {features.map((item, i) => (
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
                            <h2 className="text-2xl font-bold text-white mb-4 italic">Byggt i Sverige, för Sverige</h2>
                            <p className="text-white/60 text-lg leading-relaxed">
                                Ticko är skapat av svenska investerare som förstår den lokala marknaden. Vi vet hur det är att följa en småbolagsresa på First North eller att analysera utdelningsaristokrater på Large Cap. Plattformen utvecklas ständigt och vi bygger den tillsammans med dig.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-white">Vi är i Beta – Din röst räknas</h2>
                            <p className="text-white/60 text-lg leading-relaxed">
                                Ticko är under aktiv utveckling. Det betyder att du som tidig användare har en unik chans att påverka plattformens framtid. Vi älskar feedback, oavsett om det gäller en bugg du hittat eller en funktion du saknar.
                            </p>
                        </div>
                    </div>

                    {/* Contact & CTA Section */}
                    <div className="grid sm:grid-cols-2 gap-6 mb-20">
                        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col items-center text-center">
                            <Mail className="w-8 h-8 text-emerald-400 mb-4" />
                            <h3 className="text-lg font-bold mb-2">Frågor & Idéer</h3>
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
