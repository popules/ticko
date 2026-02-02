import Link from "next/link";
import { ArrowRight, Trophy, TrendingUp, Shield, BarChart2 } from "lucide-react";
import { StockData } from "@/lib/stocks-api";

interface StockSEOContentProps {
    stock: StockData;
}

export function StockSEOContent({ stock }: StockSEOContentProps) {
    const { symbol, name, currencySymbol, price } = stock;
    const currentPrice = `${currencySymbol}${price?.toFixed(2)}`;

    return (
        <section className="mt-16 pt-12 border-t border-white/5 pb-20 px-4 md:px-0">
            <div className="max-w-4xl mx-auto space-y-12">
                {/* Header Section */}
                <div className="text-center space-y-4">
                    <h2 className="text-2xl md:text-3xl font-black text-white">
                        How to Paper Trade <span className="text-emerald-400">{name} ({symbol})</span>
                    </h2>
                    <p className="text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
                        Practice trading {symbol} stock risk-free on Ticko. Join thousands of investors analyzing {name} market data, sentiment, and AI signals.
                    </p>
                </div>

                {/* Key Benefits Grid */}
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4">
                            <TrendingUp className="w-5 h-5 text-emerald-400" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">Live {symbol} Data</h3>
                        <p className="text-sm text-white/50">
                            Get real-time price updates ({currentPrice}), volume, and market cap data for {name}. Analyze charts before you trade.
                        </p>
                    </div>

                    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4">
                            <BarChart2 className="w-5 h-5 text-purple-400" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">AI Analysis</h3>
                        <p className="text-sm text-white/50">
                            Use Ticko AI to summarize news and sentiment for {symbol}. Find out if the community is Bullish or Bearish.
                        </p>
                    </div>

                    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
                            <Trophy className="w-5 h-5 text-blue-400" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">Compete & Win</h3>
                        <p className="text-sm text-white/50">
                            Build your track record on {name}. Compete on the leaderboard to prove you can beat the market.
                        </p>
                    </div>
                </div>

                {/* FAQ Section (SEO Gold) */}
                <div className="prose prose-invert max-w-none">
                    <h3 className="text-xl font-bold text-white mb-6">Frequently Asked Questions about {symbol}</h3>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <h4 className="font-bold text-white mb-2">Can I short sell {symbol} on Ticko?</h4>
                            <p className="text-white/60 text-sm leading-relaxed mb-6">
                                Yes. Ticko's paper trading simulator allows you to both buy (go long) and short sell {name} stock. This lets you profit from both upward and downward price movements in {symbol} without risking real capital.
                            </p>

                            <h4 className="font-bold text-white mb-2">Is trading {symbol} on Ticko free?</h4>
                            <p className="text-white/60 text-sm leading-relaxed mb-6">
                                Absolutely. Ticko is a 100% free paper trading platform. You start with $10,000 in virtual currency to trade {symbol} and thousands of other stocks.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-bold text-white mb-2">What is the current price of {name}?</h4>
                            <p className="text-white/60 text-sm leading-relaxed mb-6">
                                As of the latest update, {name} ({symbol}) is trading at {currentPrice}. On Ticko, you see real-time market data to make informed practice trades.
                            </p>

                            <h4 className="font-bold text-white mb-2">How do I start trading {symbol}?</h4>
                            <p className="text-white/60 text-sm leading-relaxed mb-6">
                                1. Create a free Ticko account.<br />
                                2. Get your $10,000 virtual portfolio.<br />
                                3. Search for "{symbol}" and click Trade.<br />
                                4. Track your P/L on the leaderboard.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Final CTA */}
                <div className="text-center pt-8">
                    <Link
                        href={`/arena?trade=${symbol}`}
                        className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-all hover:scale-105 shadow-lg shadow-emerald-500/20"
                    >
                        Start Trading {symbol} Now
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                    <p className="mt-4 text-xs text-white/30">
                        Join 5,000+ traders practicing on Ticko today.
                    </p>
                </div>
            </div>
        </section>
    );
}
