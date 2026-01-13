"use client";

import { useAuth } from "@/providers/AuthProvider";
import { PremiumGate } from "@/components/ui/PremiumGate";
import { AIValuationCard } from "@/components/analysis/AIValuationCard";
import { PerformanceMetrics } from "@/components/stock/PerformanceMetrics";
import { AlertButton } from "@/components/alerts/AlertButton";
import { WatchButton } from "@/components/watchlist/WatchButton";
import { PortfolioButton } from "@/components/portfolio/PortfolioButton";
import { Brain, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface StockPageActionsProps {
    symbol: string;
    name: string;
    price: number;
    currencySymbol: string;
}

export function StockPageActions({ symbol, name, price, currencySymbol }: StockPageActionsProps) {
    const { user } = useAuth();

    if (!user) {
        return (
            <Link
                href="/registrera"
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all"
            >
                Registrera för att bevaka
            </Link>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <AlertButton
                symbol={symbol}
                currentPrice={price}
                currencySymbol={currencySymbol}
            />
            <WatchButton symbol={symbol} />
            <PortfolioButton
                symbol={symbol}
                name={name}
                currentPrice={price}
                currencySymbol={currencySymbol}
            />
        </div>
    );
}

interface AIAnalysisSectionProps {
    ticker: string;
    currencySymbol: string;
}

export function AIAnalysisSection({ ticker, currencySymbol }: AIAnalysisSectionProps) {
    return (
        <div className="space-y-4">
            <PremiumGate
                featureName="AI-värdering"
                description="Få AI-genererade riktkurser och fundamental analys. Gratis för registrerade användare."
            >
                <AIValuationCard
                    ticker={ticker}
                    currencySymbol={currencySymbol}
                />
            </PremiumGate>

            <PremiumGate
                featureName="Deep Dive-analys"
                description="Djupgående AI-driven analys av bull/bear case och katalysatorer."
            >
                <Link
                    href={`/aktie/${ticker}/analys`}
                    className="flex items-center justify-between p-5 rounded-2xl bg-gradient-to-br from-violet-500/10 to-violet-600/5 border border-violet-500/20 hover:border-violet-500/40 transition-all group"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-violet-500/20 rounded-lg group-hover:scale-110 transition-transform">
                            <Brain className="w-5 h-5 text-violet-400" />
                        </div>
                        <div>
                            <h4 className="font-bold text-white text-sm">Gör en Deep Dive</h4>
                            <p className="text-xs text-white/40">Få en djupgående AI-analys av bull/bear case och katalysatorer</p>
                        </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-violet-500/20 transition-colors">
                        <ArrowLeft className="w-4 h-4 text-white rotate-180" />
                    </div>
                </Link>
            </PremiumGate>
        </div>
    );
}

interface PerformanceMetricsSectionProps {
    symbol: string;
}

export function PerformanceMetricsSection({ symbol }: PerformanceMetricsSectionProps) {
    return (
        <PremiumGate
            featureName="Historisk avkastning"
            description="Se YTD, 1-års och 5-års avkastning. Gratis för registrerade användare."
        >
            <PerformanceMetrics symbol={symbol} />
        </PremiumGate>
    );
}
