"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
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
    "STRONG BUY": { bg: "bg-emerald-500/20", text: "text-emerald-400", icon: <TrendingUp className="w-6 h-6" /> },
    "BUY": { bg: "bg-emerald-500/10", text: "text-emerald-400", icon: <TrendingUp className="w-5 h-5" /> },
    "HOLD": { bg: "bg-amber-500/10", text: "text-amber-400", icon: <ShieldQuestion className="w-5 h-5" /> },
    "SELL": { bg: "bg-rose-500/10", text: "text-rose-400", icon: <TrendingDown className="w-5 h-5" /> },
    "STRONG SELL": { bg: "bg-rose-500/20", text: "text-rose-400", icon: <TrendingDown className="w-6 h-6" /> },
};

const riskStyles: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    "Low": { bg: "bg-emerald-500/10", text: "text-emerald-400", icon: <ShieldCheck className="w-4 h-4" /> },
    "Medium": { bg: "bg-amber-500/10", text: "text-amber-400", icon: <ShieldQuestion className="w-4 h-4" /> },
    "High": { bg: "bg-rose-500/10", text: "text-rose-400", icon: <ShieldAlert className="w-4 h-4" /> },
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
                setError("Could not fetch analysis. Please try again later.");
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAnalysis();
    }, [ticker]);

    const verdictStyle = data?.verdict ? verdictStyles[data.verdict] || verdictStyles["HOLD"] : verdictStyles["HOLD"];
    const riskStyle = data?.riskLevel ? riskStyles[data.riskLevel] || riskStyles["Medium"] : riskStyles["Medium"];

    return (
        <AppLayout showRightPanel={true}>
            <div className="flex-1 overflow-y-auto h-full scrollbar-hide">
                {/* Header */}
                <header className="sticky top-0 z-10 backdrop-blur-xl bg-[#020617]/80 border-b border-white/10 px-6 py-5">
                    <div className="flex items-center gap-4">
                        <Link
                            href={`/stock/${ticker}`}
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
                                    Generated: {new Date(data.generatedAt).toLocaleString("en-US")}
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
                                AI analyzing {ticker}...
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
                                        <p className="text-xs text-white/40 uppercase tracking-widest mb-2">AI's Final Assessment</p>
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
                                    <h3 className="text-sm font-bold text-amber-400 uppercase tracking-widest">Upcoming Catalysts</h3>
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
                                    This analysis is AI-generated and does not constitute financial advice. Always do your own research.
                                </p>
                            </div>
                        </motion.div>
                    ) : null}
                </div>
            </div>
        </AppLayout>
    );
}
