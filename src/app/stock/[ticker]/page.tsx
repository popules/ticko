import { Sidebar } from "@/components/layout/Sidebar";
import { RightPanel } from "@/components/layout/RightPanel";
import { StockErrorBoundary } from "@/components/ui/StockErrorBoundary";
import { StockPageActions } from "@/components/stock/StockPageClient";
import { StockTabs } from "@/components/stock/StockTabs";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { fetchStockData } from "@/lib/stocks-api";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export async function generateMetadata({ params }: StockPageProps): Promise<Metadata> {
    const { ticker } = await params;
    const stock = await fetchStockData(ticker.toUpperCase());

    if (!stock) return { title: "Stock not found - Ticko" };

    return {
        title: `${stock.name} ($${stock.symbol}) - Analysis, sentiment, and discussion on Ticko`,
        description: `See latest news, AI analysis, and community sentiment for ${stock.name}. Discuss $${stock.symbol} with other investors on Ticko.`,
        alternates: {
            canonical: `/stock/${stock.symbol}`,
        },
        openGraph: {
            title: `${stock.name} ($${stock.symbol}) on Ticko`,
            description: `Join the discussion about ${stock.name}. AI insights and real-time data for retail investors.`,
            images: [
                {
                    url: `https://tickomarkets.com/api/og?ticker=${stock.symbol}&name=${encodeURIComponent(stock.name)}&price=${stock.price?.toFixed(2) || '0'}&change=${stock.changePercent?.toFixed(2) || '0'}`,
                    width: 1200,
                    height: 630,
                    alt: `${stock.name} on Ticko`,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: `${stock.name} ($${stock.symbol}) on Ticko`,
            description: `Discuss $${stock.symbol} with the smartest investors on Ticko.`,
            images: [`https://tickomarkets.com/api/og?ticker=${stock.symbol}&name=${encodeURIComponent(stock.name)}&price=${stock.price?.toFixed(2) || '0'}&change=${stock.changePercent?.toFixed(2) || '0'}`],
        },
    };
}

interface StockPageProps {
    params: Promise<{ ticker: string }>;
}

export default async function StockPage({ params }: StockPageProps) {
    const { ticker } = await params;
    const upperTicker = ticker.toUpperCase();

    // Fetch real-time data on the server
    const stock = await fetchStockData(upperTicker);

    if (!stock) {
        return notFound();
    }

    return (
        <div className="flex min-h-screen overflow-x-hidden">
            {/* Left Sidebar - Hidden on mobile */}
            <div className="hidden lg:block">
                <Sidebar />
            </div>

            {/* Main Content */}
            <main className="flex-1 lg:border-r border-white/10 overflow-x-hidden min-w-0">
                <StockErrorBoundary>
                    {/* Tabbed Content with Integrated Header */}
                    <StockTabs
                        ticker={upperTicker}
                        currencySymbol={stock.currencySymbol}
                        stock={{
                            volume: stock.volume,
                            marketCap: stock.marketCap,
                            pe: stock.pe,
                            week52Range: stock.week52Range,
                        }}
                        header={
                            <div className="px-4 md:px-6 py-4 md:py-5">
                                <div className="flex items-center gap-3 md:gap-4">
                                    <Link
                                        href="/"
                                        className="p-2 -ml-2 rounded-xl hover:bg-white/[0.06] text-white/60 hover:text-white transition-colors"
                                    >
                                        <ArrowLeft className="w-5 h-5" />
                                    </Link>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h1 className="text-lg md:text-xl font-bold text-white truncate">
                                                ${upperTicker}
                                            </h1>
                                            <span className="text-white/40 hidden sm:inline">·</span>
                                            <span className="text-white/60 text-sm md:text-base truncate hidden sm:inline">{stock.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2 md:gap-3 mt-0.5 md:mt-1">
                                            <span className="text-xl md:text-2xl font-bold tabular-nums text-white">
                                                {stock.currencySymbol === 'kr' ? `${(stock.price ?? 0).toFixed(2)} kr` : `${stock.currencySymbol}${(stock.price ?? 0).toFixed(2)}`}
                                            </span>
                                            <span
                                                className={`text-xs md:text-sm font-medium tabular-nums ${((stock.change ?? 0) >= 0) ? "text-emerald-400" : "text-rose-400"
                                                    }`}
                                            >
                                                {((stock.change ?? 0) >= 0) ? "+" : ""}
                                                {(stock.changePercent ?? 0).toFixed(2)}%
                                                <span className="opacity-50 ml-1 font-normal hidden sm:inline">today</span>
                                            </span>
                                        </div>
                                    </div>
                                    <StockPageActions symbol={upperTicker} />
                                </div>
                            </div>
                        }
                    />
                </StockErrorBoundary>
            </main>

            {/* Right Panel - Hidden on mobile */}
            <div className="hidden lg:block">
                <RightPanel />
            </div>
        </div>
    );
}
