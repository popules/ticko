"use client";

import Link from "next/link";
import { ArrowLeft, Heart, Users, Target } from "lucide-react";
import { TickoLogo } from "@/components/ui/TickoLogo";

export default function OmOssPage() {
    return (
        <div className="min-h-screen bg-[#020617] text-white">
            {/* Simple Nav */}
            <nav className="border-b border-white/[0.05] bg-[#020617]/90 backdrop-blur-xl">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm font-medium">Tillbaka</span>
                    </Link>
                    <TickoLogo />
                </div>
            </nav>

            {/* Content */}
            <main className="max-w-2xl mx-auto px-6 py-16">
                <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-6">
                    Om Ticko
                </h1>

                <div className="prose prose-invert prose-sm max-w-none">
                    <p className="text-white/60 text-lg leading-relaxed mb-8">
                        Ticko är ett community för svenska investerare som vill diskutera aktier,
                        följa marknaden och lära av varandra – helt gratis och utan betalväggar.
                    </p>

                    <div className="grid gap-6 mb-12">
                        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                    <Target className="w-5 h-5 text-emerald-400" />
                                </div>
                                <h3 className="text-base font-bold">Vår vision</h3>
                            </div>
                            <p className="text-white/50 text-sm leading-relaxed">
                                Vi vill skapa Sveriges bästa plats för investerare att diskutera och dela kunskap.
                                En plats där transparens och synliga track-records är normen.
                            </p>
                        </div>

                        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                                    <Users className="w-5 h-5 text-violet-400" />
                                </div>
                                <h3 className="text-base font-bold">Community-drivet</h3>
                            </div>
                            <p className="text-white/50 text-sm leading-relaxed">
                                Ticko byggs tillsammans med våra användare. Vi lyssnar på feedback och
                                prioriterar funktioner som communityt faktiskt vill ha.
                            </p>
                        </div>

                        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
                                    <Heart className="w-5 h-5 text-rose-400" />
                                </div>
                                <h3 className="text-base font-bold">Byggt i Sverige</h3>
                            </div>
                            <p className="text-white/50 text-sm leading-relaxed">
                                Ticko är skapat av svenska investerare, för svenska investerare.
                                Vi förstår den svenska marknaden och pratar samma språk som du.
                            </p>
                        </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                        <p className="text-white/60 text-sm leading-relaxed mb-4">
                            <strong className="text-white">Vi är i beta.</strong> Det betyder att vi aktivt
                            utvecklar plattformen och älskar att höra vad du tycker. Har du feedback eller idéer?
                            Hör av dig!
                        </p>
                        <a
                            href="mailto:hej@ticko.se"
                            className="inline-flex items-center gap-2 text-sm font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                        >
                            hej@ticko.se
                        </a>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-white/[0.05] mt-16">
                <div className="max-w-2xl mx-auto px-6 py-8">
                    <p className="text-xs text-white/20 leading-relaxed">
                        <strong className="text-white/30">Disclaimer:</strong> Innehållet på Ticko utgör inte finansiell rådgivning.
                        Alla investeringsbeslut fattas av dig själv och på egen risk.
                    </p>
                </div>
            </footer>
        </div>
    );
}
