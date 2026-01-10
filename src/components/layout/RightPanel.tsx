"use client";

import { Plus, Eye, X } from "lucide-react";
import { UI_STRINGS } from "@/config/app";

// Mock watchlist data
const watchlistItems = [
    { symbol: "TSLA", price: 245.50, change: 3.42 },
    { symbol: "AAPL", price: 178.25, change: 0.89 },
    { symbol: "NVDA", price: 495.00, change: 5.67 },
    { symbol: "VOLV-B", price: 265.40, change: -1.23 },
];

// Mock market stats
const marketStats = [
    { label: "S&P 500", value: "4,783.45", change: 0.42 },
    { label: "NASDAQ", value: "14,992.18", change: 0.68 },
    { label: "OMX 30", value: "2,156.78", change: -0.15 },
];

export function RightPanel() {
    return (
        <aside className="w-80 h-screen sticky top-0 flex flex-col border-l border-white/10 bg-white/[0.02] backdrop-blur-xl overflow-y-auto scrollbar-hide">
            {/* Market Overview */}
            <div className="p-5 border-b border-white/10">
                <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-4">
                    {UI_STRINGS.marketOverview}
                </h3>
                <div className="space-y-2">
                    {marketStats.map((stat) => (
                        <div
                            key={stat.label}
                            className="flex items-center justify-between py-3 px-4 bg-white/[0.04] rounded-2xl border border-white/[0.08]"
                        >
                            <span className="text-sm text-white">{stat.label}</span>
                            <div className="text-right">
                                <span className="text-sm font-medium tabular-nums text-white">
                                    {stat.value}
                                </span>
                                <span
                                    className={`text-xs tabular-nums ml-2 ${stat.change >= 0 ? "text-emerald-400" : "text-rose-400"
                                        }`}
                                >
                                    {stat.change >= 0 ? "+" : ""}
                                    {stat.change.toFixed(2)}%
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Watchlist */}
            <div className="flex-1 p-5">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                        {UI_STRINGS.watchlist}
                    </h3>
                    <button className="p-2 rounded-xl hover:bg-white/[0.06] text-white/50 hover:text-white transition-colors">
                        <Plus className="w-4 h-4" />
                    </button>
                </div>

                <div className="space-y-2">
                    {watchlistItems.map((item) => (
                        <div
                            key={item.symbol}
                            className="group flex items-center justify-between p-4 bg-white/[0.04] rounded-2xl hover:bg-white/[0.08] transition-all border border-white/[0.08] hover:border-white/[0.12]"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center border border-white/10">
                                    <span className="text-xs font-bold text-white">
                                        {item.symbol.charAt(0)}
                                    </span>
                                </div>
                                <div>
                                    <span className="font-semibold text-white text-sm">
                                        ${item.symbol}
                                    </span>
                                    <p className="text-xs tabular-nums text-white/50">
                                        ${item.price.toFixed(2)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span
                                    className={`text-sm font-medium tabular-nums ${item.change >= 0 ? "text-emerald-400" : "text-rose-400"
                                        }`}
                                >
                                    {item.change >= 0 ? "+" : ""}
                                    {item.change.toFixed(2)}%
                                </span>
                                <button className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-white/10 text-white/50 transition-all">
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quick action */}
                <button className="mt-5 w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/[0.04] hover:bg-white/[0.08] rounded-2xl text-sm text-white/60 hover:text-white transition-all border border-white/[0.08] hover:border-white/[0.12]">
                    <Eye className="w-4 h-4" />
                    {UI_STRINGS.viewFullWatchlist}
                </button>
            </div>
        </aside>
    );
}
