import { Sidebar } from "@/components/layout/Sidebar";
import { RightPanel } from "@/components/layout/RightPanel";
import { FeedStream } from "@/components/feed/FeedStream";
import { AIValuationCard } from "@/components/analysis/AIValuationCard";
import { AlertButton } from "@/components/alerts/AlertButton";
import { StockChart } from "@/components/charts/StockChart";
import { NewsFeed } from "@/components/news/NewsFeed";
import { ArrowLeft, ExternalLink, Star } from "lucide-react";
import Link from "next/link";
import { UI_STRINGS } from "@/config/app";
import { fetchStockData } from "@/lib/stocks-api";
import { notFound } from "next/navigation";

// Mock stock data removed - using centralized lib

interface AktiePageProps {
    params: Promise<{ ticker: string }>;
}

export default async function AktiePage({ params }: AktiePageProps) {
    const { ticker } = await params;
    const upperTicker = ticker.toUpperCase();

    // Fetch real-time data on the server
    const stock = await fetchStockData(upperTicker);

    if (!stock) {
        return notFound();
    }

    return (
        <div className="flex min-h-screen">
            {/* Left Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <main className="flex-1 border-r border-white/10">
                {/* Header with back button */}
                <header className="sticky top-0 z-10 backdrop-blur-xl bg-[#020617]/80 border-b border-white/10 px-6 py-5">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/"
                            className="p-2 -ml-2 rounded-xl hover:bg-white/[0.06] text-white/60 hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-bold text-white">
                                    ${upperTicker}
                                </h1>
                                <span className="text-white/40">·</span>
                                <span className="text-white/60">{stock.name}</span>
                            </div>
                            <div className="flex items-center gap-3 mt-1">
                                <span className="text-2xl font-bold tabular-nums text-white">
                                    {stock.currencySymbol === 'kr' ? `${stock.price.toFixed(2)} kr` : `${stock.currencySymbol}${stock.price.toFixed(2)}`}
                                </span>
                                <span
                                    className={`text-sm font-medium tabular-nums ${stock.change >= 0 ? "text-emerald-400" : "text-rose-400"
                                        }`}
                                >
                                    {stock.change >= 0 ? "+" : ""}
                                    {stock.changePercent.toFixed(2)}%
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <AlertButton
                                symbol={upperTicker}
                                currentPrice={stock.price}
                                currencySymbol={stock.currencySymbol}
                            />
                            <button className="p-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white/60 hover:text-white transition-colors border border-white/10">
                                <Star className="w-5 h-5" />
                            </button>
                            <button className="flex items-center gap-2 px-5 py-2.5 btn-gradient text-white rounded-xl font-semibold text-sm">
                                <ExternalLink className="w-4 h-4" />
                                {UI_STRINGS.trade}
                            </button>
                        </div>
                    </div>
                </header>

                {/* Stock overview */}
                <div className="p-6 border-b border-white/10">
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        <div className="bg-white/[0.04] backdrop-blur-xl rounded-2xl p-5 border border-white/10 relative overflow-hidden group">
                            <div className="relative z-10">
                                <p className="text-xs text-white/50 mb-1">{UI_STRINGS.volume}</p>
                                <p className="text-lg font-semibold tabular-nums text-white">
                                    {stock.volume}
                                </p>
                            </div>
                            {/* Decorative Mini Graph */}
                            <div className="absolute bottom-0 left-0 right-0 h-8 flex items-end gap-0.5 px-2 opacity-30 group-hover:opacity-50 transition-opacity">
                                {[35, 45, 30, 60, 40, 55, 70, 45, 60, 80, 50, 65].map((h, i) => (
                                    <div
                                        key={i}
                                        className="flex-1 bg-emerald-500/50 rounded-t-sm animate-in fade-in slide-in-from-bottom-1"
                                        style={{
                                            height: `${h}%`,
                                            transitionDelay: `${i * 50}ms`,
                                            animationDelay: `${i * 50}ms`
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="bg-white/[0.04] backdrop-blur-xl rounded-2xl p-5 border border-white/10">
                            <p className="text-xs text-white/50 mb-1">{UI_STRINGS.marketCap}</p>
                            <p className="text-lg font-semibold tabular-nums text-white">
                                {stock.marketCap}
                            </p>
                        </div>
                        <div className="bg-white/[0.04] backdrop-blur-xl rounded-2xl p-5 border border-white/10">
                            <p className="text-xs text-white/50 mb-1">{UI_STRINGS.peRatio}</p>
                            <p className="text-lg font-semibold tabular-nums text-white">
                                {stock.pe.toFixed(1)}
                            </p>
                        </div>
                        <div className="bg-white/[0.04] backdrop-blur-xl rounded-2xl p-5 border border-white/10">
                            <p className="text-xs text-white/50 mb-1">{UI_STRINGS.week52Range}</p>
                            <p className="text-lg font-semibold tabular-nums text-white">
                                {stock.week52Range}
                            </p>
                        </div>
                    </div>

                    {/* TradingView Chart */}
                    <div className="mb-6">
                        <h3 className="text-sm font-bold text-white/40 uppercase tracking-widest mb-4">Prisutveckling</h3>
                        <StockChart symbol={upperTicker} height={350} />
                    </div>

                    {/* AI Analysis Card */}
                    <AIValuationCard
                        ticker={upperTicker}
                        currencySymbol={stock.currencySymbol}
                    />
                </div>

                {/* News Section */}
                <div className="p-6 border-b border-white/10">
                    <h2 className="text-sm font-bold text-white/40 uppercase tracking-widest mb-4">
                        Senaste Nyheterna
                    </h2>
                    <NewsFeed symbol={upperTicker} />
                </div>

                {/* Stock-specific feed */}
                <div className="p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">
                        ${upperTicker} {UI_STRINGS.discussion}
                    </h2>
                    <FeedStream tickerFilter={upperTicker} />
                </div>
            </main>

            {/* Right Panel */}
            <RightPanel />
        </div>
    );
}
