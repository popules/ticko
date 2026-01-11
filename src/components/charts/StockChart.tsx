"use client";

import { useEffect, useRef } from "react";

interface StockChartProps {
    symbol: string;
    theme?: "dark" | "light";
    height?: number;
}

// Convert Yahoo Finance symbols to TradingView format
function convertToTradingViewSymbol(yahooSymbol: string): string {
    // Swedish stocks: SAAB-B.ST -> OMXSTO:SAAB_B
    if (yahooSymbol.endsWith('.ST')) {
        const base = yahooSymbol.replace('.ST', '');
        // Replace hyphens with underscores for TradingView
        const tvSymbol = base.replace('-', '_');
        return `OMXSTO:${tvSymbol}`;
    }

    // Copenhagen: .CO -> OMXCOP:
    if (yahooSymbol.endsWith('.CO')) {
        const base = yahooSymbol.replace('.CO', '').replace('-', '_');
        return `OMXCOP:${base}`;
    }

    // Helsinki: .HE -> OMXHEX:
    if (yahooSymbol.endsWith('.HE')) {
        const base = yahooSymbol.replace('.HE', '').replace('-', '_');
        return `OMXHEX:${base}`;
    }

    // London: .L -> LSE:
    if (yahooSymbol.endsWith('.L')) {
        const base = yahooSymbol.replace('.L', '');
        return `LSE:${base}`;
    }

    // Frankfurt: .F or .DE -> XETR:
    if (yahooSymbol.endsWith('.F') || yahooSymbol.endsWith('.DE')) {
        const base = yahooSymbol.replace('.F', '').replace('.DE', '');
        return `XETR:${base}`;
    }

    // Swiss: .SW -> SIX:
    if (yahooSymbol.endsWith('.SW')) {
        const base = yahooSymbol.replace('.SW', '');
        return `SIX:${base}`;
    }

    // Paris: .PA -> EURONEXT:
    if (yahooSymbol.endsWith('.PA')) {
        const base = yahooSymbol.replace('.PA', '');
        return `EURONEXT:${base}`;
    }

    // US stocks without suffix - default to NASDAQ (most common)
    // TradingView will auto-resolve if it's NYSE
    if (!yahooSymbol.includes('.')) {
        return `NASDAQ:${yahooSymbol}`;
    }

    // Fallback: just return as-is and let TradingView try to resolve
    return yahooSymbol;
}

export function StockChart({ symbol, theme = "dark", height = 400 }: StockChartProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const tradingViewSymbol = convertToTradingViewSymbol(symbol);

    useEffect(() => {
        if (!containerRef.current) return;

        // Clear previous widget
        containerRef.current.innerHTML = "";

        // Create TradingView widget script
        const script = document.createElement("script");
        script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
        script.type = "text/javascript";
        script.async = true;
        script.innerHTML = JSON.stringify({
            autosize: true,
            symbol: tradingViewSymbol,
            interval: "D",
            timezone: "Europe/Stockholm",
            theme: theme,
            style: "1",
            locale: "sv",
            enable_publishing: false,
            backgroundColor: theme === "dark" ? "rgba(11, 15, 23, 1)" : "rgba(255, 255, 255, 1)",
            gridColor: theme === "dark" ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.06)",
            hide_top_toolbar: false,
            hide_legend: false,
            save_image: false,
            calendar: false,
            hide_volume: false,
            support_host: "https://www.tradingview.com",
        });

        containerRef.current.appendChild(script);

        return () => {
            if (containerRef.current) {
                containerRef.current.innerHTML = "";
            }
        };
    }, [symbol, theme]);

    return (
        <div className="rounded-2xl overflow-hidden border border-white/10 bg-[#0B0F17]">
            <div
                ref={containerRef}
                className="tradingview-widget-container"
                style={{ height: `${height}px`, width: "100%" }}
            >
                <div className="tradingview-widget-container__widget" style={{ height: "100%", width: "100%" }} />
            </div>
        </div>
    );
}
