"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    DollarSign, X, Loader2, TrendingUp, TrendingDown,
    AlertTriangle, Sparkles, PartyPopper
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { checkPaperTradingAchievements } from "@/lib/achievements";

const USD_TO_SEK = 10.5;

interface PortfolioItem {
    id: string;
    symbol: string;
    name: string;
    shares: number;
    buy_price: number;
    currency: string;
    current_price?: number;
}

interface PaperSellModalProps {
    item: PortfolioItem;
    userId: string;
    onClose: () => void;
    onSold: (id: string, sharesSold: number, proceeds: number, realizedPnl: number) => void;
}

const Portal = ({ children }: { children: React.ReactNode }) => {
    if (typeof window === "undefined") return null;
    return createPortal(children, document.body);
};

export function PaperSellModal({ item, userId, onClose, onSold }: PaperSellModalProps) {
    const [sharesToSell, setSharesToSell] = useState(item.shares);
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [realizedPnl, setRealizedPnl] = useState(0);

    const isSek = item.currency === "SEK";
    const rate = isSek ? 1 : USD_TO_SEK;
    const currentPrice = item.current_price || item.buy_price;

    // Calculate values
    const currentPricePerShareSek = currentPrice * rate;
    const buyPricePerShareSek = item.buy_price * rate;
    const totalProceeds = sharesToSell * currentPricePerShareSek;
    const totalCost = sharesToSell * buyPricePerShareSek;
    const pnl = totalProceeds - totalCost;
    const pnlPercent = ((pnl / totalCost) * 100);
    const isProfit = pnl >= 0;

    const handleSell = async () => {
        if (!supabase || sharesToSell < 1) return;
        setIsLoading(true);

        try {
            // Log transaction
            await (supabase as any).from("transactions").insert({
                user_id: userId,
                symbol: item.symbol,
                name: item.name,
                type: "sell",
                shares: sharesToSell,
                price: currentPrice,
                currency: item.currency,
                total_sek: totalProceeds,
                realized_pnl: pnl,
            });

            // Update or delete portfolio row
            if (sharesToSell >= item.shares) {
                // Sell all - delete row
                await supabase.from("portfolio").delete().eq("id", item.id);
            } else {
                // Partial sell - update shares
                await (supabase as any).from("portfolio")
                    .update({ shares: item.shares - sharesToSell })
                    .eq("id", item.id);
            }

            setRealizedPnl(pnl);
            setShowSuccess(true);

            // Check for paper trading achievements (fire and forget)
            // totalProceeds is approximate new portfolio value, good enough for check
            checkPaperTradingAchievements(userId, totalProceeds + 100000, pnl).catch(console.error);

            // Notify parent after animation
            setTimeout(() => {
                onSold(item.id, sharesToSell, totalProceeds, pnl);
                onClose();
            }, 2000);

        } catch (err) {
            console.error("Sell error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Portal>
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-md bg-[#0B0F17] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
                    >
                        {showSuccess ? (
                            // Success State
                            <div className="p-8 text-center">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", damping: 10 }}
                                    className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${realizedPnl >= 0
                                        ? "bg-gradient-to-br from-emerald-400 to-green-600"
                                        : "bg-gradient-to-br from-rose-400 to-red-600"
                                        }`}
                                >
                                    {realizedPnl >= 0 ? (
                                        <PartyPopper className="w-10 h-10 text-white" />
                                    ) : (
                                        <TrendingDown className="w-10 h-10 text-white" />
                                    )}
                                </motion.div>

                                <motion.h2
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-2xl font-black text-white mb-2"
                                >
                                    {realizedPnl >= 0 ? "Katching! 💰" : "Sålt!"}
                                </motion.h2>

                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className={`text-3xl font-black tabular-nums ${realizedPnl >= 0 ? "text-emerald-400" : "text-rose-400"
                                        }`}
                                >
                                    {realizedPnl >= 0 ? "+" : ""}{realizedPnl.toLocaleString("sv-SE", { maximumFractionDigits: 0 })} kr
                                </motion.p>

                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-white/40 text-sm mt-2"
                                >
                                    Realiserad {realizedPnl >= 0 ? "vinst" : "förlust"}
                                </motion.p>
                            </div>
                        ) : (
                            // Sell Form
                            <>
                                {/* Header */}
                                <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between bg-[#0B0F17] sticky top-0 z-10">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isProfit
                                            ? "bg-gradient-to-br from-emerald-400 to-green-600"
                                            : "bg-gradient-to-br from-rose-400 to-red-600"
                                            }`}>
                                            <DollarSign className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold text-white">Sälj ${item.symbol}</h2>
                                            <p className="text-xs text-white/40">{item.name}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="p-2 rounded-xl hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Content */}
                                <div className="p-4 sm:p-6 space-y-4">
                                    {/* Current Holdings */}
                                    <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-white/40 text-sm">Ditt innehav</span>
                                            <span className="text-white font-bold">{item.shares} st</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-white/40 text-sm">Nuvarande pris</span>
                                            <span className="text-white font-bold tabular-nums">
                                                {currentPricePerShareSek.toLocaleString("sv-SE", { maximumFractionDigits: 2 })} kr/st
                                            </span>
                                        </div>
                                    </div>

                                    {/* Shares Slider */}
                                    <div>
                                        <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-3">
                                            Antal att sälja
                                        </label>
                                        <div className="space-y-3">
                                            <input
                                                type="range"
                                                min={1}
                                                max={item.shares}
                                                value={sharesToSell}
                                                onChange={(e) => setSharesToSell(parseInt(e.target.value))}
                                                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-violet-500"
                                            />
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="number"
                                                    min={1}
                                                    max={item.shares}
                                                    value={sharesToSell}
                                                    onChange={(e) => setSharesToSell(Math.min(item.shares, Math.max(1, parseInt(e.target.value) || 1)))}
                                                    className="w-24 px-3 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-white text-center font-bold tabular-nums focus:border-violet-500/50 focus:outline-none"
                                                />
                                                <span className="text-white/40 text-sm">av {item.shares} st</span>
                                                <button
                                                    onClick={() => setSharesToSell(item.shares)}
                                                    className="ml-auto px-3 py-1.5 rounded-lg bg-violet-500/20 text-violet-400 text-xs font-bold hover:bg-violet-500/30 transition-colors"
                                                >
                                                    Sälj allt
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* P&L Preview */}
                                    <div className={`p-4 rounded-xl border ${isProfit
                                        ? "bg-emerald-500/10 border-emerald-500/20"
                                        : "bg-rose-500/10 border-rose-500/20"
                                        }`}>
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-white/60 text-sm">Du får</span>
                                            <span className="text-xl font-black text-white tabular-nums">
                                                {totalProceeds.toLocaleString("sv-SE", { maximumFractionDigits: 0 })} kr
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-white/60 text-sm">Realiserad vinst/förlust</span>
                                            <div className={`flex items-center gap-1.5 font-bold tabular-nums ${isProfit ? "text-emerald-400" : "text-rose-400"
                                                }`}>
                                                {isProfit ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                                {isProfit ? "+" : ""}{pnl.toLocaleString("sv-SE", { maximumFractionDigits: 0 })} kr
                                                <span className="text-xs opacity-60">({isProfit ? "+" : ""}{pnlPercent.toFixed(1)}%)</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Warning for selling at loss */}
                                    {!isProfit && (
                                        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2">
                                            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                                            <p className="text-xs text-amber-400/80">
                                                Du säljer med förlust. Är du säker?
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="p-4 sm:p-6 pt-0 flex gap-3">
                                    <button
                                        onClick={onClose}
                                        className="flex-1 px-4 py-3 rounded-xl bg-white/[0.06] text-white/60 font-bold hover:bg-white/10 transition-colors"
                                    >
                                        Avbryt
                                    </button>
                                    <button
                                        onClick={handleSell}
                                        disabled={isLoading || sharesToSell < 1}
                                        className={`flex-1 px-4 py-3 rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${isProfit
                                            ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:opacity-90"
                                            : "bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30"
                                            }`}
                                    >
                                        {isLoading ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                <DollarSign className="w-4 h-4" />
                                                Sälj {sharesToSell} st
                                            </>
                                        )}
                                    </button>
                                </div>
                            </>
                        )}
                    </motion.div>
                </motion.div>
            </AnimatePresence>
        </Portal>
    );
}
