"use client";

import { useState } from "react";
import { FeedStream } from "@/components/feed/FeedStream";
import { NewsFeed } from "@/components/news/NewsFeed";
import { AIAnalysisSection, PerformanceMetricsSection } from "@/components/stock/StockPageClient";
import { AboutSection } from "@/components/stock/AboutSection";
import { StockChart } from "@/components/charts/StockChart";
import { Brain, Newspaper, BarChart3, Info } from "lucide-react";
import { UI_STRINGS } from "@/config/app";

type TabId = "overview" | "about" | "analysis" | "news";

interface Tab {
    id: TabId;
    label: string;
    icon: React.ReactNode;
}

const tabs: Tab[] = [
    { id: "overview", label: "Overview", icon: <BarChart3 className="w-4 h-4" /> },
    { id: "about", label: "About", icon: <Info className="w-4 h-4" /> },
    { id: "analysis", label: "Analysis", icon: <Brain className="w-4 h-4" /> },
    { id: "news", label: "News", icon: <Newspaper className="w-4 h-4" /> },
];

interface StockTabsProps {
    ticker: string;
    currencySymbol: string;
    stock: {
        volume: string;
        marketCap: string;
        pe: number | null;
        week52Range: string;
    };
    header?: React.ReactNode;
}

export function StockTabs({ ticker, currencySymbol, stock, header }: StockTabsProps) {
    const [activeTab, setActiveTab] = useState<TabId>("overview");

    return (
        <div className="flex flex-col overflow-x-hidden pb-24">
            {/* Sticky Container for Header + Tabs */}
            <div className="sticky top-0 z-20 bg-[#020617]/95 backdrop-blur-xl border-b border-white/10">
                {/* Optional Header (Mobile/Desktop consistent) */}
                {header}

                {/* Tab Bar */}
                <div className="flex overflow-x-auto scrollbar-hide px-4 md:px-6 gap-1 max-w-full">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-all relative
                                ${activeTab === tab.id
                                    ? "text-emerald-400"
                                    : "text-white/50 hover:text-white/80"
                                }`}
                        >
                            {tab.icon}
                            <span>{tab.label}</span>
                            {activeTab === tab.id && (
                                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-x-hidden">
                {activeTab === "overview" && (
                    <div className="p-4 md:p-6 space-y-6 animate-in fade-in duration-300 overflow-x-hidden">
                        {/* Key Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                            <div className="bg-white/[0.04] backdrop-blur-xl rounded-2xl p-4 md:p-5 border border-white/10">
                                <p className="text-xs text-white/50 mb-1">{UI_STRINGS.volume}</p>
                                <p className="text-base md:text-lg font-semibold tabular-nums text-white">
                                    {stock.volume}
                                </p>
                            </div>
                            <div className="bg-white/[0.04] backdrop-blur-xl rounded-2xl p-4 md:p-5 border border-white/10">
                                <p className="text-xs text-white/50 mb-1">{UI_STRINGS.marketCap}</p>
                                <p className="text-base md:text-lg font-semibold tabular-nums text-white">
                                    {stock.marketCap}
                                </p>
                            </div>
                            <div className="bg-white/[0.04] backdrop-blur-xl rounded-2xl p-4 md:p-5 border border-white/10">
                                <p className="text-xs text-white/50 mb-1">{UI_STRINGS.peRatio}</p>
                                <p className="text-base md:text-lg font-semibold tabular-nums text-white">
                                    {stock.pe ? stock.pe.toFixed(1) : "N/A"}
                                </p>
                            </div>
                            <div className="bg-white/[0.04] backdrop-blur-xl rounded-2xl p-4 md:p-5 border border-white/10">
                                <p className="text-xs text-white/50 mb-1">{UI_STRINGS.week52Range}</p>
                                <p className="text-base md:text-lg font-semibold tabular-nums text-white">
                                    {stock.week52Range}
                                </p>
                            </div>
                        </div>

                        {/* Chart */}
                        <div>
                            <h3 className="text-sm font-bold text-white/40 uppercase tracking-widest mb-4">
                                Price History
                            </h3>
                            <StockChart symbol={ticker} height={350} />
                        </div>

                        {/* Performance Metrics */}
                        <PerformanceMetricsSection symbol={ticker} />

                        {/* Discussion Section - Moved here from separate tab */}
                        <div>
                            <h3 className="text-sm font-bold text-white/40 uppercase tracking-widest mb-4">
                                {UI_STRINGS.discussion}
                            </h3>
                            <FeedStream tickerFilter={ticker} />
                        </div>
                    </div>
                )}

                {activeTab === "about" && (
                    <div className="p-4 md:p-6 animate-in fade-in duration-300">
                        <AboutSection ticker={ticker} />
                    </div>
                )}

                {activeTab === "analysis" && (
                    <div className="p-4 md:p-6 animate-in fade-in duration-300">
                        <AIAnalysisSection
                            ticker={ticker}
                            currencySymbol={currencySymbol}
                        />
                    </div>
                )}

                {activeTab === "news" && (
                    <div className="p-4 md:p-6 animate-in fade-in duration-300">
                        <h2 className="text-sm font-bold text-white/40 uppercase tracking-widest mb-4">
                            Latest News
                        </h2>
                        <NewsFeed symbol={ticker} />
                    </div>
                )}
            </div>
        </div>
    );
}
