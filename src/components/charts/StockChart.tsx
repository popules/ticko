"use client";

import { useEffect, useRef } from "react";

interface StockChartProps {
    symbol: string;
    theme?: "dark" | "light";
    height?: number;
}

export function StockChart({ symbol, theme = "dark", height = 400 }: StockChartProps) {
    const containerRef = useRef<HTMLDivElement>(null);

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
            symbol: symbol.includes(".") ? symbol : `NASDAQ:${symbol}`,
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
