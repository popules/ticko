"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, Wallet, Loader2 } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/lib/supabase/client";

interface AddToPortfolioModalProps {
    symbol: string;
    name: string;
    currentPrice: number;
    currencySymbol: string;
    isOpen: boolean;
    onClose: () => void;
}

export function AddToPortfolioModal({
    symbol,
    name,
    currentPrice,
    currencySymbol,
    isOpen,
    onClose,
}: AddToPortfolioModalProps) {
    const { user } = useAuth();
    const [shares, setShares] = useState(1);
    const [buyPrice, setBuyPrice] = useState(currentPrice);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const totalValue = shares * buyPrice;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !supabase || shares <= 0 || buyPrice <= 0) return;

        setIsSubmitting(true);
        setError(null);

        try {
            // Check if already in portfolio
            const { data: existing } = await (supabase as any)
                .from("portfolio")
                .select("id, shares, buy_price")
                .eq("user_id", user.id)
                .eq("symbol", symbol)
                .single();

            if (existing) {
                // Update existing position (Weighted Average Price)
                const existingData = existing as any;
                const oldShares = Number(existingData.shares);
                const oldPrice = Number(existingData.buy_price);
                const newShares = oldShares + shares;
                const newAvgPrice = ((oldShares * oldPrice) + (shares * buyPrice)) / newShares;

                const { error: updateError } = await (supabase as any)
                    .from("portfolio")
                    .update({ shares: newShares, buy_price: newAvgPrice })
                    .eq("id", existingData.id);

                if (updateError) throw updateError;
            } else {
                // Create new position
                const { error: insertError } = await (supabase as any)
                    .from("portfolio")
                    .insert({
                        user_id: user.id,
                        symbol,
                        name,
                        shares,
                        buy_price: buyPrice,
                        currency: currencySymbol === "kr" ? "SEK" : "USD",
                    });

                if (insertError) throw insertError;
            }

            setSuccess(true);
            setTimeout(() => {
                onClose();
                setSuccess(false);
                setShares(1);
            }, 1500);
        } catch (err) {
            setError("Kunde inte lägga till i portföljen. Försök igen.");
            console.error("Portfolio error:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#0B0F17]/95 backdrop-blur-3xl p-8 rounded-[2rem] border border-white/20 shadow-2xl z-50"
                    >
                        {success ? (
                            <div className="text-center py-8">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center"
                                >
                                    <Wallet className="w-8 h-8 text-emerald-400" />
                                </motion.div>
                                <h3 className="text-xl font-bold text-white mb-2">Tillagd i portföljen!</h3>
                                <p className="text-white/50">{shares} aktier i ${symbol}</p>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg">
                                            <Wallet className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black text-white">Lägg till i Portfölj</h2>
                                            <p className="text-xs text-white/40">${symbol} · {name}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/10 text-white/40 hover:text-white transition-all"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10">
                                        <p className="text-xs text-white/40 mb-1">Nuvarande pris</p>
                                        <p className="text-2xl font-black text-white tabular-nums">
                                            {currencySymbol}{currentPrice.toFixed(2)}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-3">
                                            Antal aktier
                                        </label>
                                        <div className="flex items-center gap-4">
                                            <button
                                                type="button"
                                                onClick={() => setShares(Math.max(1, shares - 1))}
                                                className="w-12 h-12 rounded-xl bg-white/[0.06] hover:bg-white/10 text-white flex items-center justify-center transition-all"
                                            >
                                                <Minus className="w-5 h-5" />
                                            </button>
                                            <input
                                                type="number"
                                                min="1"
                                                value={shares}
                                                onChange={(e) => setShares(Math.max(1, parseInt(e.target.value) || 1))}
                                                className="flex-1 text-center text-3xl font-black text-white bg-transparent focus:outline-none"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShares(shares + 1)}
                                                className="w-12 h-12 rounded-xl bg-white/[0.06] hover:bg-white/10 text-white flex items-center justify-center transition-all"
                                            >
                                                <Plus className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                                        <div className="flex justify-between items-center">
                                            <p className="text-sm text-white/60">Totalt värde</p>
                                            <p className="text-2xl font-black text-emerald-400 tabular-nums">
                                                {currencySymbol}{totalValue.toFixed(2)}
                                            </p>
                                        </div>
                                    </div>

                                    {error && (
                                        <p className="text-rose-400 text-sm text-center">{error}</p>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !user}
                                        className="w-full py-4 btn-gradient text-white rounded-2xl font-bold text-sm shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                                    >
                                        {isSubmitting ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Lägger till...
                                            </span>
                                        ) : (
                                            "Lägg till i Portfölj"
                                        )}
                                    </button>

                                    {!user && (
                                        <p className="text-xs text-white/30 text-center">
                                            Du måste vara inloggad
                                        </p>
                                    )}
                                </form>
                            </>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
