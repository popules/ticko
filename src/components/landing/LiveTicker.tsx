"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface TickerItem {
    symbol: string;
    price: string;
    change: string;
    up: boolean;
}

const SYMBOLS = ["^OMX", "SPY", "QQQ", "BTC-USD", "ETH-USD", "TSLA", "NVDA", "AAPL", "VOLV-B.ST", "HM-B.ST"];

const FALLBACK_ITEMS: TickerItem[] = [
    { symbol: "OMXS30", price: "—", change: "0.00%", up: true },
    { symbol: "S&P 500", price: "—", change: "0.00%", up: true },
    { symbol: "NASDAQ", price: "—", change: "0.00%", up: true },
    { symbol: "BTC", price: "—", change: "0.00%", up: true },
];

export function LiveTicker() {
    const [items, setItems] = useState<TickerItem[]>(FALLBACK_ITEMS);

    useEffect(() => {
        const fetchTickerData = async () => {
            try {
                const promises = SYMBOLS.map(async (sym) => {
                    try {
                        const res = await fetch(`/api/stocks/${sym}`);
                        if (!res.ok) return null;
                        const data = await res.json();
                        return {
                            symbol: data.symbol?.replace(".ST", "") || sym,
                            price: `${data.price?.toFixed(2)} ${data.currency}`,
                            change: `${data.changePercent >= 0 ? '+' : ''}${data.changePercent?.toFixed(2)}%`,
                            up: data.changePercent >= 0
                        };
                    } catch (e) {
                        return null;
                    }
                });

                const results = await Promise.all(promises);
                const validResults = results.filter(item => item !== null) as TickerItem[];

                if (validResults.length > 0) {
                    setItems(validResults);
                }
            } catch (error) {
                console.error("Ticker fetch error", error);
            }
        };

        fetchTickerData();
        // Refresh every 60s
        const interval = setInterval(fetchTickerData, 60000);
        return () => clearInterval(interval);
    }, []);

    // Duplicate list for infinite scroll effect (x3 for smooth loop)
    const displayItems = [...items, ...items, ...items];

    return (
        <div className="w-full bg-[#020617]/80 backdrop-blur-sm border-b border-white/[0.05] overflow-hidden flex whitespace-nowrap pointer-events-none sticky top-20 z-40">
            <motion.div
                className="flex items-center gap-12 py-3 px-6"
                animate={{ x: [0, -1000] }}
                transition={{
                    repeat: Infinity,
                    ease: "linear",
                    duration: 40,
                }}
            >
                {displayItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                        <span className="font-bold text-white/60 text-xs tracking-wider">{item.symbol}</span>
                        <div className="flex items-center gap-1.5">
                            <span className={`text-xs font-bold tabular-nums ${item.up ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {item.price}
                            </span>
                            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md ${item.up ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                {item.change}
                            </span>
                        </div>
                    </div>
                ))}
            </motion.div>
        </div>
    );
}
