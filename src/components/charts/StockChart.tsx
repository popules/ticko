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

    // US stocks without suffix - default to raw symbol (TradingView resolves it)
    if (!yahooSymbol.includes('.')) {
        return yahooSymbol;
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
            style: "3", // 3 = Area chart (cleaner look like Avanza), 1 = Candles
            locale: "en",
            enable_publishing: false,
            backgroundColor: "rgba(2, 6, 23, 1)", // Match app background
            gridColor: "rgba(255, 255, 255, 0.03)", // Subtle grid
            hide_top_toolbar: true, // Cleaner look
            hide_legend: false, // Show OHLC and % change
            hide_side_toolbar: true, // Cleaner look
            allow_symbol_change: false, // Lock to current symbol
            save_image: false,
            calendar: false,
            hide_volume: true, // Cleaner like Avanza
            withdateranges: true, // Date range selector
            support_host: "https://www.tradingview.com",
        });

        const currentContainer = containerRef.current;
        currentContainer.appendChild(script);

        return () => {
            if (currentContainer) {
                // Aggressively clean up script and content to prevent memory leaks
                while (currentContainer.firstChild) {
                    currentContainer.removeChild(currentContainer.firstChild);
                }
                currentContainer.innerHTML = "";
            }
        };
    }, [tradingViewSymbol, theme]);

    return (
        <div className="rounded-2xl overflow-hidden border border-white/10 bg-[#0B0F17] max-w-full">
            <div
                ref={containerRef}
                className="tradingview-widget-container overflow-hidden"
                style={{ height: `${height}px`, width: "100%", maxWidth: "100%" }}
            >
                <div className="tradingview-widget-container__widget" style={{ height: "100%", width: "100%" }} />
            </div>
        </div>
    );
}
