"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { RightPanel } from "@/components/layout/RightPanel";
import { UI_STRINGS } from "@/config/app";
import { Loader2, TrendingUp, TrendingDown, Activity, Monitor, Landmark, Flame, HeartPulse, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";


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

type SectorFilter = "all" | "technology" | "financial" | "energy" | "healthcare" | "consumer";

// Helper to check if major markets are open
function getMarketStatus() {
    const now = new Date();
    const day = now.getUTCDay(); // 0 = Sunday
    const isWeekend = day === 0 || day === 6;

    // Get current hour in each timezone
    const getHourInTimezone = (tz: string) => {
        const time = new Date(now.toLocaleString("en-US", { timeZone: tz }));
        return { hour: time.getHours(), minute: time.getMinutes() };
    };

    const nyTime = getHourInTimezone("America/New_York");
    const londonTime = getHourInTimezone("Europe/London");
    const frankfurtTime = getHourInTimezone("Europe/Berlin");
    const tokyoTime = getHourInTimezone("Asia/Tokyo");
    const hkTime = getHourInTimezone("Asia/Hong_Kong");

    // Market hours (local time)
    const usOpen = !isWeekend && nyTime.hour >= 9 && nyTime.hour < 16; // NYSE 9:30-16:00
    const ukOpen = !isWeekend && londonTime.hour >= 8 && londonTime.hour < 16; // LSE 8:00-16:30
    const deOpen = !isWeekend && frankfurtTime.hour >= 9 && frankfurtTime.hour < 17; // XETRA 9:00-17:30
    const jpOpen = !isWeekend && tokyoTime.hour >= 9 && tokyoTime.hour < 15; // TSE 9:00-15:00
    const hkOpen = !isWeekend && hkTime.hour >= 9 && hkTime.hour < 16; // HKEX 9:30-16:00

    return [
        { label: "US", isOpen: usOpen },
        { label: "UK", isOpen: ukOpen },
        { label: "DE", isOpen: deOpen },
        { label: "JP", isOpen: jpOpen },
        { label: "HK", isOpen: hkOpen },
    ];
}

export default function MarketPage() {
    const router = useRouter();
    const [sectorFilter, setSectorFilter] = useState<SectorFilter>("all");
    const marketStatuses = getMarketStatus();

    // Fetch gainers/losers with sector filter
    const { data: moversData, isLoading: moversLoading } = useQuery({
        queryKey: ["marketMovers", sectorFilter],
        queryFn: async () => {
            if (sectorFilter === "all") {
                const res = await fetch(`/api/market/gainers-losers?market=us`);
                const data = await res.json();
                return { gainers: data.gainers || [], losers: data.losers || [] };
            } else {
                const res = await fetch(`/api/market/sector-movers?sector=${sectorFilter}`);
                const data = await res.json();
                return { gainers: data.gainers || [], losers: data.losers || [] };
            }
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

    // Only show full-page loading on initial load
    const isInitialLoading = !moversData && moversLoading;


    return (
        <div className="flex min-h-screen">
            <Sidebar />

            <main className="flex-1 border-r border-white/10 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="px-4 sm:px-8 py-4 sm:py-6 border-b border-white/10 bg-[#0B0F17]/50 backdrop-blur-xl">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-black text-white tracking-widest uppercase">
                                {UI_STRINGS.markets}
                            </h1>
                            <p className="text-xs font-bold text-white/30 tracking-widest uppercase mt-1">
                                Market Data • 15m Delay
                            </p>
                        </div>
                        <div className="hidden sm:flex items-center gap-2 flex-wrap">
                            {marketStatuses.map((market) => (
                                <div
                                    key={market.label}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${market.isOpen
                                        ? "bg-emerald-500/10 border-emerald-500/30"
                                        : "bg-white/[0.04] border-white/10"
                                        }`}
                                >
                                    <span className="text-[10px] font-black text-white/60 bg-white/10 px-1.5 py-0.5 rounded">{market.label}</span>
                                    <div className={`w-2 h-2 rounded-full ${market.isOpen ? "bg-emerald-500 animate-pulse" : "bg-white/30"}`} />
                                    <span className={`text-[10px] font-bold uppercase ${market.isOpen ? "text-emerald-400" : "text-white/40"}`}>
                                        {market.isOpen ? "Open" : "Closed"}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
                    {isInitialLoading ? (
                        <div className="h-96 flex flex-col items-center justify-center gap-4">
                            <Loader2 className="w-10 h-10 animate-spin text-emerald-400" />
                            <p className="text-white/40 font-bold uppercase tracking-widest text-[10px]">
                                Loading market data...
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* === GAINERS & LOSERS SECTION === */}
                            {/* Sector Filter Tabs */}
                            <div className="flex items-center gap-2 mb-6 flex-wrap">
                                <span className="text-xs font-bold text-white/40 uppercase tracking-widest mr-2">Sector:</span>
                                {[
                                    { id: "all" as const, label: "All", icon: <Activity className="w-3.5 h-3.5" /> },
                                    { id: "technology" as const, label: "Tech", icon: <Monitor className="w-3.5 h-3.5" /> },
                                    { id: "financial" as const, label: "Finance", icon: <Landmark className="w-3.5 h-3.5" /> },
                                    { id: "energy" as const, label: "Energy", icon: <Flame className="w-3.5 h-3.5" /> },
                                    { id: "healthcare" as const, label: "Health", icon: <HeartPulse className="w-3.5 h-3.5" /> },
                                    { id: "consumer" as const, label: "Consumer", icon: <ShoppingCart className="w-3.5 h-3.5" /> }
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setSectorFilter(tab.id)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${sectorFilter === tab.id
                                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                            : "bg-white/[0.04] text-white/60 border border-white/10 hover:bg-white/[0.08]"
                                            }`}
                                    >
                                        <div className={`flex items-center justify-center ${sectorFilter === tab.id ? "text-emerald-400" : "text-white/40"}`}>
                                            {tab.icon}
                                        </div>
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Gainers */}
                                <div className="rounded-3xl border border-white/10 bg-white/[0.02] overflow-hidden">
                                    <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-emerald-500/5">
                                        <div className="flex items-center gap-3">
                                            <TrendingUp className="w-5 h-5 text-emerald-400" />
                                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Today's Gainers</h3>
                                        </div>
                                        <span className="text-[10px] text-white/30 uppercase tracking-wider">
                                            {sectorFilter === "all" ? "Top 30 US Stocks" : `${sectorFilter.charAt(0).toUpperCase() + sectorFilter.slice(1)} Sector`}
                                        </span>
                                    </div>
                                    <div className="divide-y divide-white/5">
                                        {(moversData?.gainers || []).map((stock: StockMovement, i: number) => (
                                            <motion.button
                                                key={stock.symbol}
                                                whileHover={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
                                                onClick={() => router.push(`/stock/${stock.symbol}`)}
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
                                    <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-rose-500/5">
                                        <div className="flex items-center gap-3">
                                            <TrendingDown className="w-5 h-5 text-rose-400" />
                                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Today's Losers</h3>
                                        </div>
                                        <span className="text-[10px] text-white/30 uppercase tracking-wider">
                                            {sectorFilter === "all" ? "Top 30 US Stocks" : `${sectorFilter.charAt(0).toUpperCase() + sectorFilter.slice(1)} Sector`}
                                        </span>
                                    </div>
                                    <div className="divide-y divide-white/5">
                                        {(moversData?.losers || []).map((stock: StockMovement, i: number) => (
                                            <motion.button
                                                key={stock.symbol}
                                                whileHover={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
                                                onClick={() => router.push(`/stock/${stock.symbol}`)}
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

                            {/* === SENTIMENT RADAR (COMPACT) === */}
                            <section className="border border-white/10 rounded-3xl p-6 bg-white/[0.02]">
                                <h2 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    Ticko Sentiment Radar
                                </h2>
                                <p className="text-xs text-white/30 mb-6">
                                    Based on {sentimentData?.totalPosts || 0} posts in the last 24 hours.
                                </p>

                                <div className="flex items-center justify-center gap-8 py-8">
                                    <div className="text-center">
                                        <div className={`w-24 h-24 rounded-full bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center shadow-lg shadow-rose-500/30 ${sentimentData?.dominant === "fear" ? "ring-4 ring-rose-500/30" : ""
                                            }`}>
                                            <span className="text-2xl font-black text-white">{sentimentData?.fear || 30}%</span>
                                        </div>
                                        <p className={`text-xs font-bold uppercase tracking-widest mt-3 ${sentimentData?.dominant === "fear" ? "text-rose-400" : "text-white/40"
                                            }`}>Fear</p>
                                    </div>
                                    <div className="h-16 w-px bg-white/10" />
                                    <div className="text-center">
                                        <div className={`w-32 h-32 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-xl shadow-emerald-500/40 ${sentimentData?.dominant === "greed" ? "ring-4 ring-emerald-500/20" : ""
                                            }`}>
                                            <span className="text-4xl font-black text-white">{sentimentData?.greed || 50}%</span>
                                        </div>
                                        <p className={`text-xs font-bold uppercase tracking-widest mt-3 ${sentimentData?.dominant === "greed" ? "text-emerald-400" : "text-white/40"
                                            }`}>Greed</p>
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
            </main >

            <RightPanel />
        </div >
    );
}
