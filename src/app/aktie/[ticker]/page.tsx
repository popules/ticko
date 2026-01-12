import { Sidebar } from "@/components/layout/Sidebar";
import { RightPanel } from "@/components/layout/RightPanel";
import { FeedStream } from "@/components/feed/FeedStream";
import { AIValuationCard } from "@/components/analysis/AIValuationCard";
import { AITickerSummary } from "@/components/analysis/AITickerSummary";
import { AlertButton } from "@/components/alerts/AlertButton";
import { StockChart } from "@/components/charts/StockChart";
import { NewsFeed } from "@/components/news/NewsFeed";
import { PortfolioButton } from "@/components/portfolio/PortfolioButton";
import { WatchButton } from "@/components/watchlist/WatchButton";
import { ArrowLeft, Star, Brain } from "lucide-react";
import Link from "next/link";
import { UI_STRINGS } from "@/config/app";
import { fetchStockData } from "@/lib/stocks-api";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export async function generateMetadata({ params }: AktiePageProps): Promise<Metadata> {
    const { ticker } = await params;
    const stock = await fetchStockData(ticker.toUpperCase());

    if (!stock) return { title: "Aktie hittades inte - Ticko" };

    return {
        title: `${stock.name} ($${stock.symbol}) - Analys, sentiment och diskussion på Ticko`,
        description: `Se senaste nytt, AI-analys och community-sentiment för ${stock.name}. Diskutera $${stock.symbol} med andra småsparare på Ticko.`,
        openGraph: {
            title: `${stock.name} ($${stock.symbol}) på Ticko`,
            description: `Häng med i snacket kring ${stock.name}. AI-insikter och realtidsdata för svenska småsparare.`,
        }
    };
}

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
                                    {stock.currencySymbol === 'kr' ? `${(stock.price ?? 0).toFixed(2)} kr` : `${stock.currencySymbol}${(stock.price ?? 0).toFixed(2)}`}
                                </span>
                                <span
                                    className={`text-sm font-medium tabular-nums ${((stock.change ?? 0) >= 0) ? "text-emerald-400" : "text-rose-400"
                                        }`}
                                >
                                    {((stock.change ?? 0) >= 0) ? "+" : ""}
                                    {(stock.changePercent ?? 0).toFixed(2)}%
                                    <span className="opacity-50 ml-1 font-normal">idag</span>
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <AlertButton
                                symbol={upperTicker}
                                currentPrice={stock.price ?? 0}
                                currencySymbol={stock.currencySymbol}
                            />
                            <WatchButton symbol={upperTicker} />
                            <PortfolioButton
                                symbol={upperTicker}
                                name={stock.name}
                                currentPrice={stock.price ?? 0}
                                currencySymbol={stock.currencySymbol}
                            />
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
                                {stock.pe ? stock.pe.toFixed(1) : 'N/A'}
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
                        <StockChart symbol={upperTicker} height={450} />
                    </div>

                    {/* AI Analysis Card */}
                    <div className="space-y-4">
                        <AIValuationCard
                            ticker={upperTicker}
                            currencySymbol={stock.currencySymbol}
                        />
                        <Link
                            href={`/aktie/${upperTicker}/analys`}
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
                    </div>
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
