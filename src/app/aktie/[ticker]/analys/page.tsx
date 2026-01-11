"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { RightPanel } from "@/components/layout/RightPanel";
import Link from "next/link";
import { ArrowLeft, TrendingUp, TrendingDown, AlertTriangle, Zap, Loader2, Brain, ShieldCheck, ShieldAlert, ShieldQuestion } from "lucide-react";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";

interface DeepDiveData {
    ticker: string;
    name: string;
    price: number;
    currencySymbol: string;
    changePercent: number;
    bullCase: string[];
    bearCase: string[];
    catalysts: string[];
    verdict: string;
    verdictReason: string;
    riskLevel: string;
    generatedAt: string;
}

const verdictStyles: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    "STARK KÖPARE": { bg: "bg-emerald-500/20", text: "text-emerald-400", icon: <TrendingUp className="w-6 h-6" /> },
    "KÖPARE": { bg: "bg-emerald-500/10", text: "text-emerald-400", icon: <TrendingUp className="w-5 h-5" /> },
    "HÅLL": { bg: "bg-amber-500/10", text: "text-amber-400", icon: <ShieldQuestion className="w-5 h-5" /> },
    "SÄLJ": { bg: "bg-rose-500/10", text: "text-rose-400", icon: <TrendingDown className="w-5 h-5" /> },
    "STARK SÄLJARE": { bg: "bg-rose-500/20", text: "text-rose-400", icon: <TrendingDown className="w-6 h-6" /> },
};

const riskStyles: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    "Låg": { bg: "bg-emerald-500/10", text: "text-emerald-400", icon: <ShieldCheck className="w-4 h-4" /> },
    "Medel": { bg: "bg-amber-500/10", text: "text-amber-400", icon: <ShieldQuestion className="w-4 h-4" /> },
    "Hög": { bg: "bg-rose-500/10", text: "text-rose-400", icon: <ShieldAlert className="w-4 h-4" /> },
};

export default function DeepDiveAnalysisPage() {
    const params = useParams();
    const ticker = (params.ticker as string)?.toUpperCase();

    const [data, setData] = useState<DeepDiveData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!ticker) return;

        const fetchAnalysis = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const res = await fetch(`/api/analyze/deep-dive/${ticker}`);
                if (!res.ok) throw new Error("Failed to fetch analysis");
                const result = await res.json();
                setData(result);
            } catch (err) {
                setError("Kunde inte hämta analys. Försök igen senare.");
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAnalysis();
    }, [ticker]);

    const verdictStyle = data?.verdict ? verdictStyles[data.verdict] || verdictStyles["HÅLL"] : verdictStyles["HÅLL"];
    const riskStyle = data?.riskLevel ? riskStyles[data.riskLevel] || riskStyles["Medel"] : riskStyles["Medel"];

    return (
        <div className="flex min-h-screen">
            <Sidebar />

            <main className="flex-1 border-r border-white/10 overflow-y-auto h-screen scrollbar-hide">
                {/* Header */}
                <header className="sticky top-0 z-10 backdrop-blur-xl bg-[#020617]/80 border-b border-white/10 px-6 py-5">
                    <div className="flex items-center gap-4">
                        <Link
                            href={`/aktie/${ticker}`}
                            className="p-2 -ml-2 rounded-xl hover:bg-white/[0.06] text-white/60 hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <Brain className="w-5 h-5 text-violet-400" />
                                <h1 className="text-xl font-bold text-white">AI Deep Dive</h1>
                                <span className="text-white/40">·</span>
                                <span className="text-white/60">${ticker}</span>
                            </div>
                            {data && (
                                <p className="text-xs text-white/30 mt-1">
                                    Genererad: {new Date(data.generatedAt).toLocaleString("sv-SE")}
                                </p>
                            )}
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="p-6 space-y-8">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                            <div className="relative">
                                <div className="absolute inset-0 bg-violet-500/20 rounded-full blur-xl animate-pulse" />
                                <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center">
                                    <Brain className="w-10 h-10 text-white animate-pulse" />
                                </div>
                            </div>
                            <p className="text-white/50 font-bold uppercase tracking-widest text-xs">
                                AI analyserar {ticker}...
                            </p>
                            <Loader2 className="w-6 h-6 animate-spin text-violet-400" />
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                            <AlertTriangle className="w-16 h-16 text-rose-400" />
                            <p className="text-white/50">{error}</p>
                        </div>
                    ) : data ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-8"
                        >
                            {/* Verdict Card */}
                            <div className={`p-8 rounded-[2rem] border border-white/10 ${verdictStyle.bg}`}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-white/40 uppercase tracking-widest mb-2">AI:s Slutgiltiga Bedömning</p>
                                        <div className="flex items-center gap-3">
                                            <span className={`${verdictStyle.text}`}>{verdictStyle.icon}</span>
                                            <h2 className={`text-3xl font-black ${verdictStyle.text}`}>{data.verdict}</h2>
                                        </div>
                                        <p className="text-white/60 mt-2 max-w-lg">{data.verdictReason}</p>
                                    </div>
                                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${riskStyle.bg}`}>
                                        {riskStyle.icon}
                                        <span className={`text-xs font-bold uppercase tracking-widest ${riskStyle.text}`}>Risk: {data.riskLevel}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Bull & Bear Cases */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Bull Case */}
                                <div className="p-6 rounded-[2rem] bg-emerald-500/5 border border-emerald-500/10">
                                    <div className="flex items-center gap-2 mb-4">
                                        <TrendingUp className="w-5 h-5 text-emerald-400" />
                                        <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-widest">Bull Case</h3>
                                    </div>
                                    <ul className="space-y-3">
                                        {data.bullCase.map((item, idx) => (
                                            <li key={idx} className="flex items-start gap-3">
                                                <span className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs font-bold text-emerald-400 flex-shrink-0">{idx + 1}</span>
                                                <span className="text-white/80 text-sm leading-relaxed">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Bear Case */}
                                <div className="p-6 rounded-[2rem] bg-rose-500/5 border border-rose-500/10">
                                    <div className="flex items-center gap-2 mb-4">
                                        <TrendingDown className="w-5 h-5 text-rose-400" />
                                        <h3 className="text-sm font-bold text-rose-400 uppercase tracking-widest">Bear Case</h3>
                                    </div>
                                    <ul className="space-y-3">
                                        {data.bearCase.map((item, idx) => (
                                            <li key={idx} className="flex items-start gap-3">
                                                <span className="w-6 h-6 rounded-full bg-rose-500/20 flex items-center justify-center text-xs font-bold text-rose-400 flex-shrink-0">{idx + 1}</span>
                                                <span className="text-white/80 text-sm leading-relaxed">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Catalysts */}
                            <div className="p-6 rounded-[2rem] bg-amber-500/5 border border-amber-500/10">
                                <div className="flex items-center gap-2 mb-4">
                                    <Zap className="w-5 h-5 text-amber-400" />
                                    <h3 className="text-sm font-bold text-amber-400 uppercase tracking-widest">Kommande Katalysatorer</h3>
                                </div>
                                <ul className="space-y-3">
                                    {data.catalysts.map((item, idx) => (
                                        <li key={idx} className="flex items-start gap-3">
                                            <span className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-xs font-bold text-amber-400 flex-shrink-0">
                                                <Zap className="w-3 h-3" />
                                            </span>
                                            <span className="text-white/80 text-sm leading-relaxed">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Disclaimer */}
                            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
                                <p className="text-[10px] text-white/30 uppercase tracking-widest">
                                    Denna analys är AI-genererad och utgör inte finansiell rådgivning. Gör alltid din egen research.
                                </p>
                            </div>
                        </motion.div>
                    ) : null}
                </div>
            </main>

            <RightPanel />
        </div>
    );
}
