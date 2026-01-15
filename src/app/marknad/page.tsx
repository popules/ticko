"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { RightPanel } from "@/components/layout/RightPanel";
import { UI_STRINGS } from "@/config/app";
import { Loader2, TrendingUp, TrendingDown, Activity, Zap, ArrowUpRight, ArrowDownRight, Globe, Flag } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";

interface IndexData {
    label: string;
    value: string;
    change: number;
    rawPrice: number;
}

interface StockMovement {
    symbol: string;
    displaySymbol: string;
    name: string;
    price: number;
    changePercent: number;
    currency: string;
}

interface TradedStock extends StockMovement {
    volume: number;
    volumeFormatted: string;
}

type MarketFilter = "all" | "us" | "se";

// Helper to check if markets are open
function getMarketStatus() {
    const now = new Date();
    const stockholmTime = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Stockholm" }));
    const hour = stockholmTime.getHours();
    const minute = stockholmTime.getMinutes();
    const day = stockholmTime.getDay(); // 0 = Sunday
    const isWeekend = day === 0 || day === 6;

    // OMX: 09:00-17:30 CET
    const swedenOpen = !isWeekend && hour >= 9 && (hour < 17 || (hour === 17 && minute <= 30));

    // NYSE/NASDAQ: 15:30-22:00 CET (09:30-16:00 EST)
    const usOpen = !isWeekend && ((hour === 15 && minute >= 30) || (hour > 15 && hour < 22));

    return { swedenOpen, usOpen, isWeekend };
}

export default function MarketPage() {
    const router = useRouter();
    const [marketFilter, setMarketFilter] = useState<MarketFilter>("all");
    const marketStatus = getMarketStatus();

    // Fetch indices
    const { data: indicesData, isLoading: indicesLoading } = useQuery({
        queryKey: ["marketIndices"],
        queryFn: async () => {
            const res = await fetch("/api/market/indices");
            const data = await res.json();
            return data.indices || [];
        },
        refetchInterval: 60000,
    });

    // Fetch gainers/losers with market filter
    const { data: moversData, isLoading: moversLoading } = useQuery({
        queryKey: ["marketMovers", marketFilter],
        queryFn: async () => {
            const res = await fetch(`/api/market/gainers-losers?market=${marketFilter}`);
            const data = await res.json();
            return { gainers: data.gainers || [], losers: data.losers || [] };
        },
        refetchInterval: 60000,
    });

    // Fetch most traded with market filter
    const { data: tradedData, isLoading: tradedLoading } = useQuery({
        queryKey: ["mostTraded", marketFilter],
        queryFn: async () => {
            const res = await fetch(`/api/market/most-traded?market=${marketFilter}`);
            const data = await res.json();
            return data.mostTraded || [];
        },
        refetchInterval: 60000,
    });

    // Fetch sentiment data
    const { data: sentimentData } = useQuery({
        queryKey: ["marketSentiment"],
        queryFn: async () => {
            const res = await fetch("/api/market/sentiment");
            const data = await res.json();
            return data;
        },
        refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
    });

    const isLoading = indicesLoading || moversLoading || tradedLoading;


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
                            Live Marknadsdata • Realtid
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Sweden market status */}
                        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${marketStatus.swedenOpen
                            ? "bg-emerald-500/10 border-emerald-500/30"
                            : "bg-white/[0.04] border-white/10"
                            }`}>
                            <span className="text-sm">🇸🇪</span>
                            <div className={`w-2 h-2 rounded-full ${marketStatus.swedenOpen ? "bg-emerald-500 animate-pulse" : "bg-white/30"}`} />
                            <span className={`text-[10px] font-bold uppercase ${marketStatus.swedenOpen ? "text-emerald-400" : "text-white/40"}`}>
                                {marketStatus.swedenOpen ? "Öppen" : "Stängd"}
                            </span>
                        </div>
                        {/* US market status */}
                        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${marketStatus.usOpen
                            ? "bg-emerald-500/10 border-emerald-500/30"
                            : "bg-white/[0.04] border-white/10"
                            }`}>
                            <span className="text-sm">🇺🇸</span>
                            <div className={`w-2 h-2 rounded-full ${marketStatus.usOpen ? "bg-emerald-500 animate-pulse" : "bg-white/30"}`} />
                            <span className={`text-[10px] font-bold uppercase ${marketStatus.usOpen ? "text-emerald-400" : "text-white/40"}`}>
                                {marketStatus.usOpen ? "Öppen" : "Stängd"}
                            </span>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
                    {isLoading ? (
                        <div className="h-96 flex flex-col items-center justify-center gap-4">
                            <Loader2 className="w-10 h-10 animate-spin text-emerald-400" />
                            <p className="text-white/40 font-bold uppercase tracking-widest text-[10px]">
                                Hämtar marknadsdata...
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* === INDEX HERO SECTION === */}
                            <section>
                                <h2 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Activity className="w-4 h-4" /> Index
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {(indicesData || []).map((index: IndexData) => (
                                        <motion.div
                                            key={index.label}
                                            whileHover={{ scale: 1.02, y: -4 }}
                                            className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10 hover:border-white/20 transition-all"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="text-sm font-semibold text-white/50">{index.label}</p>
                                                    <p className="text-3xl font-black text-white mt-1 tabular-nums">{index.value}</p>
                                                </div>
                                                <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-bold ${index.change >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                                                    {index.change >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                                                    {index.change >= 0 ? '+' : ''}{index.change.toFixed(2)}%
                                                </div>
                                            </div>
                                            {/* Decorative gradient */}
                                            <div className={`absolute -bottom-8 -right-8 w-32 h-32 rounded-full blur-3xl opacity-20 ${index.change >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                        </motion.div>
                                    ))}
                                </div>
                            </section>

                            {/* === GAINERS & LOSERS SECTION === */}
                            {/* Market Filter Tabs */}
                            <div className="flex items-center gap-2 mb-6">
                                <span className="text-xs font-bold text-white/40 uppercase tracking-widest mr-2">Marknad:</span>
                                {[
                                    { id: "all" as const, label: "Alla", flag: "🌍" },
                                    { id: "us" as const, label: "USA", flag: "🇺🇸" },
                                    { id: "se" as const, label: "Sverige", flag: "🇸🇪" }
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setMarketFilter(tab.id)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${marketFilter === tab.id
                                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                            : "bg-white/[0.04] text-white/60 border border-white/10 hover:bg-white/[0.08]"
                                            }`}
                                    >
                                        <span className="text-sm">{tab.flag}</span>
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Gainers */}
                                <div className="rounded-3xl border border-white/10 bg-white/[0.02] overflow-hidden">
                                    <div className="px-6 py-4 border-b border-white/10 flex items-center gap-3 bg-emerald-500/5">
                                        <TrendingUp className="w-5 h-5 text-emerald-400" />
                                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Dagens Vinnare</h3>
                                    </div>
                                    <div className="divide-y divide-white/5">
                                        {(moversData?.gainers || []).map((stock: StockMovement, i: number) => (
                                            <motion.button
                                                key={stock.symbol}
                                                whileHover={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
                                                onClick={() => router.push(`/aktie/${stock.symbol}`)}
                                                className="w-full px-6 py-4 flex items-center justify-between transition-all text-left"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <span className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-xs font-black text-emerald-400">
                                                        {i + 1}
                                                    </span>
                                                    <div>
                                                        <p className="font-bold text-white">${stock.displaySymbol}</p>
                                                        <p className="text-xs text-white/40 truncate max-w-[150px]">{stock.name}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-white tabular-nums">{stock.price.toFixed(2)}</p>
                                                    <p className="text-sm font-bold text-emerald-400 tabular-nums">+{stock.changePercent.toFixed(2)}%</p>
                                                </div>
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>

                                {/* Losers */}
                                <div className="rounded-3xl border border-white/10 bg-white/[0.02] overflow-hidden">
                                    <div className="px-6 py-4 border-b border-white/10 flex items-center gap-3 bg-rose-500/5">
                                        <TrendingDown className="w-5 h-5 text-rose-400" />
                                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Dagens Förlorare</h3>
                                    </div>
                                    <div className="divide-y divide-white/5">
                                        {(moversData?.losers || []).map((stock: StockMovement, i: number) => (
                                            <motion.button
                                                key={stock.symbol}
                                                whileHover={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
                                                onClick={() => router.push(`/aktie/${stock.symbol}`)}
                                                className="w-full px-6 py-4 flex items-center justify-between transition-all text-left"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <span className="w-8 h-8 rounded-xl bg-rose-500/20 flex items-center justify-center text-xs font-black text-rose-400">
                                                        {i + 1}
                                                    </span>
                                                    <div>
                                                        <p className="font-bold text-white">${stock.displaySymbol}</p>
                                                        <p className="text-xs text-white/40 truncate max-w-[150px]">{stock.name}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-white tabular-nums">{stock.price.toFixed(2)}</p>
                                                    <p className="text-sm font-bold text-rose-400 tabular-nums">{stock.changePercent.toFixed(2)}%</p>
                                                </div>
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>
                            </section>

                            {/* === MOST TRADED SECTION === */}
                            <section>
                                <h2 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Zap className="w-4 h-4" /> Mest Handlade
                                </h2>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {(tradedData || []).map((stock: TradedStock) => (
                                        <motion.button
                                            key={stock.symbol}
                                            whileHover={{ scale: 1.03, y: -4 }}
                                            whileTap={{ scale: 0.97 }}
                                            onClick={() => router.push(`/aktie/${stock.symbol}`)}
                                            className="relative rounded-2xl p-5 bg-white/[0.04] border border-white/10 hover:border-white/20 text-left transition-all overflow-hidden group"
                                        >
                                            <div className="flex justify-between items-start mb-3">
                                                <p className="text-lg font-black text-white">${stock.displaySymbol}</p>
                                                <span className={`text-xs font-bold px-2 py-1 rounded-lg ${stock.changePercent >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                                                    {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                                                </span>
                                            </div>
                                            <p className="text-xs text-white/40 truncate mb-3">{stock.name}</p>
                                            <div className="flex justify-between items-end">
                                                <div>
                                                    <p className="text-[10px] text-white/30 uppercase tracking-widest">Volym</p>
                                                    <p className="text-sm font-bold text-white/70">{stock.volumeFormatted}</p>
                                                </div>
                                                <p className="text-xl font-black text-white tabular-nums">{stock.price.toFixed(2)}</p>
                                            </div>
                                            {/* Hover effect */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                        </motion.button>
                                    ))}
                                </div>
                            </section>

                            {/* === SENTIMENT RADAR (COMPACT) === */}
                            <section className="border border-white/10 rounded-3xl p-6 bg-white/[0.02]">
                                <h2 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    Ticko Sentiment Radar
                                </h2>
                                <p className="text-xs text-white/30 mb-6">
                                    Baserat på {sentimentData?.totalPosts || 0} inlägg senaste 24 timmarna.
                                </p>

                                <div className="flex items-center justify-center gap-8 py-8">
                                    <div className="text-center">
                                        <div className={`w-24 h-24 rounded-full bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center shadow-lg shadow-rose-500/30 ${sentimentData?.dominant === "fear" ? "ring-4 ring-rose-500/30" : ""
                                            }`}>
                                            <span className="text-2xl font-black text-white">{sentimentData?.fear || 30}%</span>
                                        </div>
                                        <p className={`text-xs font-bold uppercase tracking-widest mt-3 ${sentimentData?.dominant === "fear" ? "text-rose-400" : "text-white/40"
                                            }`}>Rädsla</p>
                                    </div>
                                    <div className="h-16 w-px bg-white/10" />
                                    <div className="text-center">
                                        <div className={`w-32 h-32 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-xl shadow-emerald-500/40 ${sentimentData?.dominant === "greed" ? "ring-4 ring-emerald-500/20" : ""
                                            }`}>
                                            <span className="text-4xl font-black text-white">{sentimentData?.greed || 50}%</span>
                                        </div>
                                        <p className={`text-xs font-bold uppercase tracking-widest mt-3 ${sentimentData?.dominant === "greed" ? "text-emerald-400" : "text-white/40"
                                            }`}>Girighet</p>
                                    </div>
                                    <div className="h-16 w-px bg-white/10" />
                                    <div className="text-center">
                                        <div className={`w-24 h-24 rounded-full bg-gradient-to-br from-white/20 to-white/10 flex items-center justify-center shadow-lg ${sentimentData?.dominant === "neutral" ? "ring-4 ring-white/20" : ""
                                            }`}>
                                            <span className="text-2xl font-black text-white/70">{sentimentData?.neutral || 20}%</span>
                                        </div>
                                        <p className="text-xs font-bold text-white/40 uppercase tracking-widest mt-3">Neutral</p>
                                    </div>
                                </div>
                            </section>
                        </>
                    )}
                </div>
            </main>

            <RightPanel />
        </div>
    );
}
