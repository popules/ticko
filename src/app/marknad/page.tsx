"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { RightPanel } from "@/components/layout/RightPanel";
import { UI_STRINGS } from "@/config/app";
import { Loader2, Info, Maximize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Default stock symbols to analyze
const TRACKED_SYMBOLS = [
    { symbol: "TSLA", name: "Tesla" },
    { symbol: "AAPL", name: "Apple" },
    { symbol: "NVDA", name: "NVIDIA" },
    { symbol: "VOLV-B.ST", name: "Volvo" },
    { symbol: "SAAB-B.ST", name: "Saab" },
    { symbol: "MSFT", name: "Microsoft" },
    { symbol: "SPOT", name: "Spotify" },
    { symbol: "AMZN", name: "Amazon" },
    { symbol: "META", name: "Meta" },
    { symbol: "HM-B.ST", name: "H&M" },
    { symbol: "ERIC-B.ST", name: "Ericsson" },
    { symbol: "GOOGL", name: "Alphabet" },
];

interface SentimentData {
    symbol: string;
    name: string;
    sentiment: number;
    upside: number;
    summary?: string;
    confidence?: string;
}

export default function MarketPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [selectedBubble, setSelectedBubble] = useState<SentimentData | null>(null);
    const [sentimentData, setSentimentData] = useState<SentimentData[]>([]);

    useEffect(() => {
        const fetchSentiment = async () => {
            setIsLoading(true);

            // Fetch sentiment for all symbols in parallel
            const results = await Promise.all(
                TRACKED_SYMBOLS.map(async ({ symbol, name }) => {
                    try {
                        const res = await fetch(`/api/sentiment/${symbol}`);
                        const data = await res.json();
                        return {
                            symbol: symbol.replace(".ST", ""),
                            name,
                            sentiment: data.sentiment || 50,
                            upside: data.upside || 0,
                            summary: data.summary,
                            confidence: data.confidence,
                        };
                    } catch {
                        return { symbol: symbol.replace(".ST", ""), name, sentiment: 50, upside: 0 };
                    }
                })
            );

            setSentimentData(results);
            setIsLoading(false);
        };

        fetchSentiment();
    }, []);

    const getSentimentColor = (score: number) => {
        if (score >= 70) return "from-emerald-400 to-emerald-600 shadow-emerald-500/40";
        if (score >= 50) return "from-emerald-300/60 to-emerald-500/40 shadow-emerald-400/20";
        if (score >= 40) return "from-white/20 to-white/10 shadow-white/5";
        if (score >= 20) return "from-rose-400/60 to-rose-600/40 shadow-rose-500/20";
        return "from-rose-500 to-rose-700 shadow-rose-600/40";
    };

    return (
        <div className="flex min-h-screen">
            <Sidebar />

            <main className="flex-1 border-r border-white/10 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="px-8 py-6 border-b border-white/10 flex items-center justify-between bg-[#0B0F17]/50 backdrop-blur-xl">
                    <div>
                        <h1 className="text-2xl font-black text-white tracking-widest uppercase">
                            {UI_STRINGS.markets}
                        </h1>
                        <p className="text-xs font-bold text-white/30 tracking-widest uppercase mt-1">
                            Ticko Sentiment Heatmap • Live
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/10">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-bold text-white/60 uppercase">Live Index</span>
                        </div>
                        <button className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/10 text-white/40 hover:text-white transition-all">
                            <Maximize2 className="w-4 h-4" />
                        </button>
                    </div>
                </header>

                <div className="flex-1 relative overflow-hidden p-8">
                    {isLoading ? (
                        <div className="h-full flex flex-col items-center justify-center gap-4">
                            <Loader2 className="w-10 h-10 animate-spin text-emerald-400" />
                            <p className="text-white/40 font-bold uppercase tracking-widest text-[10px]">
                                Beräknar marknadssentiment...
                            </p>
                        </div>
                    ) : (
                        <div className="relative w-full h-full">
                            {/* Heatmap Legend */}
                            <div className="absolute bottom-4 left-4 z-10 p-4 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-rose-500" />
                                    <span className="text-[10px] font-bold text-white/40 uppercase">Rädsla</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-white/20" />
                                    <span className="text-[10px] font-bold text-white/40 uppercase">Neutral</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                    <span className="text-[10px] font-bold text-white/40 uppercase">Girighet</span>
                                </div>
                            </div>

                            {/* Bubble Grid (Responsive CSS Grid variant of Heatmap) */}
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 h-fit max-h-full overflow-y-auto pr-4 scrollbar-hide">
                                {sentimentData.map((stock: SentimentData) => (
                                    <motion.button
                                        key={stock.symbol}
                                        whileHover={{ scale: 1.03, y: -4 }}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={() => router.push(`/aktie/${stock.symbol}`)}
                                        className={`group relative aspect-[4/3] rounded-3xl p-5 bg-gradient-to-br border border-white/10 text-left flex flex-col justify-between transition-all duration-300 shadow-xl hover:shadow-2xl ${getSentimentColor(stock.sentiment)}`}
                                    >
                                        <div className="flex justify-between items-start w-full">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-xl font-black text-white tracking-tight">
                                                    {stock.name}
                                                </span>
                                                <span className="text-[11px] font-semibold text-white/50 tracking-wide">
                                                    ${stock.symbol}
                                                </span>
                                            </div>
                                            <div
                                                className="p-1.5 rounded-xl bg-white/20 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedBubble(stock);
                                                }}
                                            >
                                                <Info className="w-4 h-4 text-white" />
                                            </div>
                                        </div>

                                        <div className="mt-auto">
                                            <p className="text-sm font-bold text-white/80 leading-snug">
                                                Ticko ser {stock.upside >= 0 ? "+" : ""}{stock.upside}% {stock.upside >= 0 ? "uppsida" : "nedsida"}
                                            </p>
                                        </div>

                                        {/* Subtle pattern overlay */}
                                        <div className="absolute inset-0 opacity-5 pointer-events-none overflow-hidden rounded-3xl">
                                            <div className="absolute top-0 right-0 w-24 h-24 border-4 border-white/50 rounded-full -mr-12 -mt-12" />
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quick Insight Popover */}
                    <AnimatePresence>
                        {selectedBubble && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 bg-[#0B0F17]/95 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-white/20 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] z-50 text-center"
                            >
                                <button
                                    onClick={() => setSelectedBubble(null)}
                                    className="absolute top-6 right-6 text-white/30 hover:text-white transition-colors"
                                >
                                    Stäng
                                </button>
                                <div className={`w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br flex items-center justify-center mb-6 shadow-2xl ${getSentimentColor(selectedBubble.sentiment)}`}>
                                    <span className="text-2xl font-black text-white">${selectedBubble.symbol}</span>
                                </div>
                                <h3 className="text-2xl font-black text-white mb-2">Ticko Analys</h3>
                                <p className="text-white/60 text-sm leading-relaxed mb-8">
                                    {selectedBubble.sentiment > 70
                                        ? `Ticko ser starkt momentum och positiva signaler. Vår modell förutspår en fortsatt upptrend med ${Math.abs(selectedBubble.upside)}% uppsida.`
                                        : selectedBubble.sentiment < 30
                                            ? `Ticko varnar för svaga makrosignaler och hög kortsiktig risk. Vi ser en potentiell ${Math.abs(selectedBubble.upside)}% nedsida.`
                                            : `Ticko ser blandade signaler. Marknaden avvaktar nästa rapport—vi estimerar ${selectedBubble.upside >= 0 ? "+" : ""}${selectedBubble.upside}% rörelse.`}
                                </p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/5">
                                        <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">Påverkan</p>
                                        <p className="text-lg font-black text-white">Hög</p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/5">
                                        <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">Volym</p>
                                        <p className="text-lg font-black text-white">8.4M</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            <RightPanel />
        </div>
    );
}
