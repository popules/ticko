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
    const [isLoadingBalance, setIsLoadingBalance] = useState(true);

    // Fetch user's current paper trading balance
    useEffect(() => {
        setMounted(true);
        if (!isOpen || !user || !supabase) return;

        const fetchBalance = async () => {
            setIsLoadingBalance(true);
            try {
                const { data: portfolio } = await (supabase as any)
                    .from("portfolio")
                    .select("shares, buy_price, currency")
                    .eq("user_id", user.id);

                // Calculate total invested
                let totalInvested = 0;
                (portfolio || []).forEach((item: any) => {
                    const priceInSek = item.currency === "USD"
                        ? item.buy_price * USD_TO_SEK
                        : item.buy_price;
                    totalInvested += item.shares * priceInSek;
                });

                setCashBalance(STARTING_CAPITAL - totalInvested);
            } catch {
                setCashBalance(STARTING_CAPITAL);
            }
            setIsLoadingBalance(false);
        };

        fetchBalance();
    }, [isOpen, user]);

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
            // Detect currency from symbol
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
        // Buy by amount - calculate how many full shares we can afford
        const amountSek = parseFloat(inputValue) || 0;
        shares = Math.floor(amountSek / priceInSek);
        totalCostSek = shares * priceInSek;
    }

    const canAfford = totalCostSek <= cashBalance && shares > 0;

    const handleBuy = async () => {
        if (!user || !stockPrice) return;

        if (shares < 1) {
            setError("You must buy at least 1 share");
            return;
        }

        if (!canAfford) {
            setError("You don't have enough virtual dollars");
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
                    type: "buy",
                    shares: shares,
                    price: stockPrice, // Only for UI/fallback logic, server verifies this
                    currency: stockCurrency,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Purchase failed");
            }

            // Trigger Challenge Progress (Action: 'trade')
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
            // Keep modal open for 2.5 seconds to show success state
            setTimeout(() => {
                setIsOpen(false);
                setSuccess(false);
                setInputValue(inputMode === "shares" ? "1" : "1000");
            }, 2500);
        } catch (err: any) {
            setError(err.message || "Could not complete purchase");
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
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-400 to-fuchsia-600 flex items-center justify-center">
                                            <Gamepad2 className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold text-white">Arena Trade</h2>
                                            <p className="text-xs text-white/40">Buy ${symbol}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="p-2 rounded-xl hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                {/* Gradient Line under header */}
                                <div className="h-[1px] w-full bg-gradient-to-r from-violet-500/50 to-fuchsia-500/50 -mt-[1px] relative z-20" />

                                {/* Balance Display */}
                                <div className="mx-4 sm:mx-6 mt-4 sm:mt-6 p-3 sm:p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Wallet className="w-4 h-4 text-emerald-400" />
                                        <span className="text-xs sm:text-sm text-emerald-400/80">Available balance</span>
                                    </div>
                                    {isLoadingBalance ? (
                                        <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                                    ) : (
                                        <span className="text-base sm:text-lg font-bold text-emerald-400 tabular-nums">
                                            ${cashBalance.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                                        </span>
                                    )}
                                </div>

                                {/* Warning */}
                                <div className="mx-4 sm:mx-6 mt-3 p-2 sm:p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2">
                                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                                    <div className="text-[10px] sm:text-xs text-amber-400/80">
                                        <p>Simulation with virtual money. No real transactions.</p>
                                        <p className="mt-1 text-white/40">⏱️ <strong>Fair Play:</strong> Prices are ~15 min delayed. Min holding time 30 min.</p>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                                    {/* Stock Info */}
                                    <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-white/[0.04] border border-white/10">
                                        <div>
                                            <p className="font-bold text-white">${symbol}</p>
                                            <p className="text-xs text-white/40 truncate max-w-[150px]">{stockName}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-white tabular-nums">
                                                {stockCurrency === "SEK" ? "" : "$"}{stockPrice?.toFixed(2) || "..."}
                                                {stockCurrency === "SEK" ? " kr" : ""}
                                            </p>
                                            <p className="text-[10px] text-white/30">
                                                {stockCurrency === "USD" && `≈ ${priceInSek.toFixed(2)} kr`}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Input Mode Toggle */}
                                    <button
                                        onClick={toggleInputMode}
                                        className="w-full flex items-center justify-center gap-2 p-2 rounded-lg bg-white/[0.02] border border-white/5 text-xs text-white/40 hover:text-white/60 hover:bg-white/[0.04] transition-colors"
                                    >
                                        <ArrowLeftRight className="w-3 h-3" />
                                        {inputMode === "shares"
                                            ? "Switch to buy by amount ($)"
                                            : "Switch to buy by shares"}
                                    </button>

                                    {/* Input */}
                                    <div>
                                        <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">
                                            {inputMode === "shares" ? "Number of shares" : "Amount in $"}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                min={inputMode === "shares" ? "1" : "100"}
                                                step={inputMode === "shares" ? "1" : "100"}
                                                value={inputValue}
                                                onChange={(e) => setInputValue(e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white text-lg font-bold tabular-nums focus:border-violet-500/50 focus:outline-none transition-colors pr-12"
                                                placeholder={inputMode === "shares" ? "1" : "10000"}
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 text-sm">
                                                {inputMode === "shares" ? "pcs" : "$"}
                                            </span>
                                        </div>
                                        {inputMode === "amount" && shares > 0 && (
                                            <p className="text-xs text-white/40 mt-2">
                                                = {shares} share{shares !== 1 ? "s" : ""}
                                                {totalCostSek < parseFloat(inputValue) && (
                                                    <span className="text-amber-400 ml-1">
                                                        (remaining: ${(parseFloat(inputValue) - totalCostSek).toFixed(2)})
                                                    </span>
                                                )}
                                            </p>
                                        )}
                                    </div>

                                    {/* Total */}
                                    <div className={`flex items-center justify-between p-3 sm:p-4 rounded-xl border ${canAfford
                                        ? "bg-violet-500/10 border-violet-500/20"
                                        : "bg-rose-500/10 border-rose-500/20"
                                        }`}>
                                        <div>
                                            <span className="text-xs sm:text-sm text-white/60">Total cost</span>
                                            {!canAfford && shares > 0 && (
                                                <p className="text-[10px] text-rose-400">Insufficient balance</p>
                                            )}
                                        </div>
                                        <span className={`text-lg sm:text-xl font-black tabular-nums ${canAfford ? "text-violet-400" : "text-rose-400"
                                            }`}>
                                            ${totalCostSek.toLocaleString("en-US", { maximumFractionDigits: 2 })}
                                        </span>
                                    </div>

                                    {error && (
                                        <p className="text-sm text-rose-400 text-center">{error}</p>
                                    )}

                                    {success && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="flex flex-col items-center text-center py-4"
                                        >
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ type: "spring", damping: 10 }}
                                                className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-600 flex items-center justify-center mb-4"
                                            >
                                                <PartyPopper className="w-8 h-8 text-white" />
                                            </motion.div>
                                            <h3 className="text-xl font-black text-white mb-2">Purchase complete! 🎉</h3>
                                            <p className="text-white/60 text-sm mb-3">
                                                You bought <span className="font-bold text-white">{shares}</span> shares of <span className="font-bold text-violet-400">${symbol}</span>
                                            </p>
                                            <p className="text-2xl font-black text-violet-400 tabular-nums">
                                                ${totalCostSek.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                                            </p>
                                            <div className="mt-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400">
                                                <Lock className="w-3 h-3" />
                                                <span>Locked for 30 min (Fair Play)</span>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="p-4 sm:p-6 pt-0 flex gap-3">
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="flex-1 px-4 py-3 rounded-xl bg-white/[0.06] text-white/60 font-bold hover:bg-white/10 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleBuy}
                                        disabled={isLoading || success || !canAfford || shares < 1}
                                        className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isLoading ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : success ? (
                                            "✓"
                                        ) : (
                                            <>
                                                <Gamepad2 className="w-4 h-4" />
                                                Buy (Arena)
                                            </>
                                        )}
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
