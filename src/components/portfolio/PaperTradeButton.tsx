"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { Gamepad2, X, Loader2, TrendingUp, AlertTriangle, Wallet, ArrowLeftRight, PartyPopper, Lock } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/lib/supabase/client";

// Constants
const STARTING_CAPITAL = 10000; // $10,000 USD
const USD_TO_SEK = 10.5; // Approximate exchange rate

interface PaperTradeButtonProps {
    symbol: string;
}

const Portal = ({ children }: { children: React.ReactNode }) => {
    if (typeof window === "undefined") return null;
    return createPortal(children, document.body);
};

export function PaperTradeButton({ symbol }: PaperTradeButtonProps) {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [tradeType, setTradeType] = useState<"buy" | "short">("buy"); // New Toggle
    const [inputMode, setInputMode] = useState<"shares" | "amount">("shares");
    const [inputValue, setInputValue] = useState("1");
    const [isLoading, setIsLoading] = useState(false);
    const [stockPrice, setStockPrice] = useState<number | null>(null);
    const [stockName, setStockName] = useState("");
    const [stockCurrency, setStockCurrency] = useState("USD");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    // User's paper trading balance
    const [cashBalance, setCashBalance] = useState(STARTING_CAPITAL);
    const [currentShares, setCurrentShares] = useState(0); // Track existing position
    const [isLoadingBalance, setIsLoadingBalance] = useState(true);

    // Fetch user's current paper trading balance & Position
    useEffect(() => {
        setMounted(true);
        if (!isOpen || !user || !supabase) return;

        const fetchBalance = async () => {
            setIsLoadingBalance(true);
            try {
                const { data: portfolio } = await (supabase as any)
                    .from("portfolio")
                    .select("shares, buy_price, currency, symbol")
                    .eq("user_id", user.id);

                // Calculate total invested (Cash Balance)
                let totalInvested = 0;
                let myPosition = 0;

                (portfolio || []).forEach((item: any) => {
                    const priceInSek = item.currency === "USD"
                        ? item.buy_price * USD_TO_SEK
                        : item.buy_price;
                    totalInvested += item.shares * priceInSek;

                    if (item.symbol === symbol) {
                        myPosition = item.shares;
                    }
                });

                setCashBalance(STARTING_CAPITAL - totalInvested);
                setCurrentShares(myPosition);

                // Auto-set mode based on position
                if (myPosition < 0) {
                    setTradeType("buy"); // Actually "Cover", but UI will handle label
                }
            } catch {
                setCashBalance(STARTING_CAPITAL);
            }
            setIsLoadingBalance(false);
        };

        fetchBalance();
    }, [isOpen, user, symbol]);

    const openModal = async () => {
        setIsOpen(true);
        setError("");
        setSuccess(false);
        setInputValue(inputMode === "shares" ? "1" : "1000");

        // Fetch current price
        try {
            const res = await fetch(`/api/stocks/${symbol}`);
            const data = await res.json();
            setStockPrice(data.price || 0);
            setStockName(data.name || symbol);
            const isSwedish = symbol.includes(".ST") || symbol.includes(".HE");
            setStockCurrency(isSwedish ? "SEK" : "USD");
        } catch {
            setStockPrice(100);
            setStockCurrency("USD");
        }
    };

    // Calculate shares and cost based on input mode
    const priceInSek = stockPrice
        ? (stockCurrency === "USD" ? stockPrice * USD_TO_SEK : stockPrice)
        : 0;

    let shares = 0;
    let totalCostSek = 0;

    if (inputMode === "shares") {
        shares = parseInt(inputValue) || 0;
        totalCostSek = shares * priceInSek;
    } else {
        const amountSek = parseFloat(inputValue) || 0;
        shares = Math.floor(amountSek / priceInSek);
        totalCostSek = shares * priceInSek;
    }

    const canAfford = totalCostSek <= cashBalance && shares > 0;

    // Derived UI State
    const isShortPosition = currentShares < 0;
    const isShorting = tradeType === "short";

    // Button Label Logic
    let actionLabel = "Buy (Arena)";
    let actionType = "buy";

    if (isShortPosition) {
        actionLabel = "Cover Short";
        actionType = "cover";
    } else if (isShorting) {
        actionLabel = "Short Sell";
        actionType = "short";
    }

    const handleTrade = async () => {
        if (!user || !stockPrice) return;

        if (shares < 1) {
            setError("You must trade at least 1 share");
            return;
        }

        if (!canAfford) {
            setError("Insufficient collateral/cash");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const res = await fetch("/api/portfolio/trade", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    symbol,
                    name: stockName,
                    type: actionType, // dynamic
                    shares: shares,
                    price: stockPrice,
                    currency: stockCurrency,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Trade failed");
            }

            // Trigger Challenge Progress
            try {
                await fetch("/api/challenges/progress", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ actionType: "trade" }),
                });
                queryClient.invalidateQueries({ queryKey: ["active-challenges"] });
            } catch (err) {
                console.error("Failed to update challenge progress", err);
            }

            setSuccess(true);
            setTimeout(() => {
                setIsOpen(false);
                setSuccess(false);
                setInputValue(inputMode === "shares" ? "1" : "1000");
            }, 2500);
        } catch (err: any) {
            setError(err.message || "Could not complete trade");
        } finally {
            setIsLoading(false);
        }
    };

    const toggleInputMode = () => {
        if (inputMode === "shares") {
            setInputMode("amount");
            setInputValue("10000");
        } else {
            setInputMode("shares");
            setInputValue("1");
        }
    };

    const themeColor = isShorting ? "rose" : "violet";

    return (
        <>
            <button
                onClick={openModal}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-violet-500/10 border border-violet-500/30 text-violet-400 text-sm font-bold hover:bg-violet-500/20 transition-all group"
            >
                <Gamepad2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">Trade (Arena)</span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <Portal>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
                            onClick={() => setIsOpen(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full max-w-md bg-[#0B0F17] border border-white/10 rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
                            >
                                {/* Header */}
                                <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between bg-[#0B0F17] sticky top-0 z-10">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${isShorting ? 'from-rose-500 to-red-600' : 'from-violet-400 to-fuchsia-600'} flex items-center justify-center`}>
                                            <Gamepad2 className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold text-white">Arena {isShorting ? "Short" : "Trade"}</h2>
                                            <p className="text-xs text-white/40">{isShorting ? "Bet against " : "Buy "}${symbol}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setIsOpen(false)} className="p-2 rounded-xl hover:bg-white/10 text-white/40 hover:text-white transition-colors">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Trade Type Toggle (Only if Neutral or Short) */}
                                {!currentShares && (
                                    <div className="p-4 pb-0 flex gap-2">
                                        <button
                                            onClick={() => setTradeType("buy")}
                                            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all border ${tradeType === "buy" ? 'bg-violet-500/20 border-violet-500 text-violet-400' : 'bg-white/5 border-transparent text-white/40'}`}
                                        >
                                            Buy (Long)
                                        </button>
                                        <button
                                            onClick={() => setTradeType("short")}
                                            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all border ${tradeType === "short" ? 'bg-rose-500/20 border-rose-500 text-rose-400' : 'bg-white/5 border-transparent text-white/40'}`}
                                        >
                                            Short (Sell)
                                        </button>
                                    </div>
                                )}
                                {isShortPosition && (
                                    <div className="mx-6 mt-4 p-2 bg-rose-500/10 border border-rose-500/20 rounded-lg text-center">
                                        <p className="text-xs text-rose-400 font-bold">You are Short {Math.abs(currentShares)} shares</p>
                                    </div>
                                )}

                                {/* Balance Display (Reuse existing) */}
                                <div className="mx-4 sm:mx-6 mt-4 p-3 sm:p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Wallet className="w-4 h-4 text-emerald-400" />
                                        <span className="text-xs sm:text-sm text-emerald-400/80">Available Cash</span>
                                    </div>
                                    {isLoadingBalance ? (
                                        <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                                    ) : (
                                        <span className="text-base sm:text-lg font-bold text-emerald-400 tabular-nums">
                                            ${cashBalance.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                                        </span>
                                    )}
                                </div>

                                {/* Content (Reuse existing inputs but update logic) */}
                                <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                                    {/* Stock Info (Reuse) */}
                                    <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-white/[0.04] border border-white/10">
                                        <div>
                                            <p className="font-bold text-white">${symbol}</p>
                                            <p className="text-xs text-white/40 truncate max-w-[150px]">{stockName}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-white tabular-nums">
                                                {stockCurrency === "SEK" ? "" : "$"}{stockPrice?.toFixed(2) || "..."}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Input Mode & Fields (Reuse existing) */}
                                    <button onClick={toggleInputMode} className="w-full flex items-center justify-center gap-2 p-2 rounded-lg bg-white/[0.02] border border-white/5 text-xs text-white/40 hover:text-white/60 transition-colors">
                                        <ArrowLeftRight className="w-3 h-3" />
                                        Switch to {inputMode === "shares" ? "Amount ($)" : "Shares"}
                                    </button>

                                    <div>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                min="1"
                                                value={inputValue}
                                                onChange={(e) => setInputValue(e.target.value)}
                                                className={`w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white text-lg font-bold tabular-nums focus:outline-none transition-colors pr-12 focus:border-${themeColor}-500/50`}
                                                placeholder={inputMode === "shares" ? "1" : "10000"}
                                            />
                                        </div>
                                        {/* Helper Text */}
                                        {inputMode === "amount" && shares > 0 && (
                                            <p className="text-xs text-white/40 mt-2">= {shares} shares</p>
                                        )}
                                    </div>

                                    {/* Total Cost */}
                                    <div className={`flex items-center justify-between p-3 sm:p-4 rounded-xl border ${canAfford ? `bg-${themeColor}-500/10 border-${themeColor}-500/20` : "bg-rose-500/10 border-rose-500/20"}`}>
                                        <span className="text-xs sm:text-sm text-white/60">
                                            {isShorting || isShortPosition ? "Margin Required" : "Total Cost"}
                                        </span>
                                        <span className={`text-lg sm:text-xl font-black tabular-nums ${canAfford ? `text-${themeColor}-400` : "text-rose-400"}`}>
                                            ${totalCostSek.toLocaleString("en-US", { maximumFractionDigits: 2 })}
                                        </span>
                                    </div>

                                    {/* Info Blurb for Shorting */}
                                    {isShorting && (
                                        <p className="text-[10px] text-rose-400/80 text-center">
                                            Profit when price falls. Unlimited loss potential.
                                        </p>
                                    )}

                                    {error && <p className="text-sm text-rose-400 text-center">{error}</p>}

                                    {/* Success Message (Reuse) */}
                                    {success && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-4">
                                            <h3 className="text-xl font-black text-white mb-2">Order Executed! 🚀</h3>
                                        </motion.div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="p-4 sm:p-6 pt-0 flex gap-3">
                                    <button onClick={() => setIsOpen(false)} className="flex-1 px-4 py-3 rounded-xl bg-white/[0.06] text-white/60 font-bold hover:bg-white/10 transition-colors">Cancel</button>
                                    <button
                                        onClick={handleTrade}
                                        disabled={isLoading || success || !canAfford || shares < 1}
                                        className={`flex-1 px-4 py-3 rounded-xl bg-gradient-to-r ${isShorting ? 'from-rose-500 to-red-600' : 'from-violet-500 to-fuchsia-500'} text-white font-bold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2`}
                                    >
                                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : actionLabel}
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    </Portal>
                )}
            </AnimatePresence>
        </>
    );
}
