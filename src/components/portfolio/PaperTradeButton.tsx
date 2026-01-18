"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gamepad2, X, Loader2, TrendingUp, AlertTriangle } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface PaperTradeButtonProps {
    symbol: string;
}

export function PaperTradeButton({ symbol }: PaperTradeButtonProps) {
    const { user } = useAuth();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [shares, setShares] = useState("1");
    const [isLoading, setIsLoading] = useState(false);
    const [stockPrice, setStockPrice] = useState<number | null>(null);
    const [stockName, setStockName] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const openModal = async () => {
        setIsOpen(true);
        setError("");
        setSuccess(false);

        // Fetch current price
        try {
            const res = await fetch(`/api/stocks/${symbol}`);
            const data = await res.json();
            setStockPrice(data.price || 0);
            setStockName(data.name || symbol);
        } catch {
            setStockPrice(100); // Fallback
        }
    };

    const handleBuy = async () => {
        if (!user || !supabase || !stockPrice) return;

        const numShares = parseInt(shares);
        if (isNaN(numShares) || numShares < 1) {
            setError("Ange minst 1 aktie");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const { error: dbError } = await (supabase as any)
                .from("portfolio")
                .insert({
                    user_id: user.id,
                    symbol: symbol,
                    name: stockName,
                    shares: numShares,
                    buy_price: stockPrice,
                    currency: "USD",
                });

            if (dbError) throw dbError;

            setSuccess(true);
            setTimeout(() => {
                setIsOpen(false);
                setSuccess(false);
                setShares("1");
            }, 1500);
        } catch (err) {
            setError("Kunde inte genomföra köpet");
        } finally {
            setIsLoading(false);
        }
    };

    const totalCost = stockPrice ? stockPrice * parseInt(shares || "0") : 0;

    return (
        <>
            <button
                onClick={openModal}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-violet-500/10 border border-violet-500/30 text-violet-400 text-sm font-bold hover:bg-violet-500/20 transition-all group"
            >
                <Gamepad2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">Paper Trade</span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => setIsOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-md bg-[#0B0F17] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-400 to-fuchsia-600 flex items-center justify-center">
                                        <Gamepad2 className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-white">Paper Trade</h2>
                                        <p className="text-xs text-white/40">Köp ${symbol}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 rounded-xl hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Warning */}
                            <div className="mx-6 mt-6 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2">
                                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                                <p className="text-xs text-amber-400/80">
                                    Detta är en simulering med virtuella pengar. Inga riktiga transaktioner görs.
                                </p>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-4">
                                {/* Stock Info */}
                                <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.04] border border-white/10">
                                    <div>
                                        <p className="font-bold text-white">${symbol}</p>
                                        <p className="text-xs text-white/40">{stockName}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-white tabular-nums">
                                            ${stockPrice?.toFixed(2) || "..."}
                                        </p>
                                        <p className="text-[10px] text-white/30">per aktie</p>
                                    </div>
                                </div>

                                {/* Shares Input */}
                                <div>
                                    <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">
                                        Antal aktier
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={shares}
                                        onChange={(e) => setShares(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white text-lg font-bold tabular-nums focus:border-violet-500/50 focus:outline-none transition-colors"
                                        placeholder="1"
                                    />
                                </div>

                                {/* Total */}
                                <div className="flex items-center justify-between p-4 rounded-xl bg-violet-500/10 border border-violet-500/20">
                                    <span className="text-sm text-white/60">Total kostnad</span>
                                    <span className="text-xl font-black text-violet-400 tabular-nums">
                                        ${totalCost.toFixed(2)}
                                    </span>
                                </div>

                                {error && (
                                    <p className="text-sm text-rose-400 text-center">{error}</p>
                                )}

                                {success && (
                                    <div className="flex items-center justify-center gap-2 text-emerald-400">
                                        <TrendingUp className="w-5 h-5" />
                                        <span className="font-bold">Köp genomfört!</span>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="p-6 pt-0 flex gap-3">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="flex-1 px-4 py-3 rounded-xl bg-white/[0.06] text-white/60 font-bold hover:bg-white/10 transition-colors"
                                >
                                    Avbryt
                                </button>
                                <button
                                    onClick={handleBuy}
                                    disabled={isLoading || success}
                                    className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : success ? (
                                        "✓"
                                    ) : (
                                        <>
                                            <Gamepad2 className="w-4 h-4" />
                                            Köp (Paper)
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
