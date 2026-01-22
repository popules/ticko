"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bell, TrendingUp, TrendingDown } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/lib/supabase/client";

interface CreateAlertModalProps {
    symbol: string;
    currentPrice: number;
    currencySymbol: string;
    isOpen: boolean;
    onClose: () => void;
}

export function CreateAlertModal({
    symbol,
    currentPrice,
    currencySymbol,
    isOpen,
    onClose
}: CreateAlertModalProps) {
    const { user } = useAuth();
    const [targetPrice, setTargetPrice] = useState((currentPrice ?? 0).toFixed(2));
    const [direction, setDirection] = useState<"above" | "below">("above");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsSubmitting(true);
        setError(null);

        try {
            const { error: dbError } = await supabase
                .from("alerts")
                .insert({
                    user_id: user.id,
                    symbol,
                    target_price: parseFloat(targetPrice),
                    direction,
                } as never);

            if (dbError) throw dbError;

            onClose();
        } catch (err) {
            setError("Could not create alert. Please try again.");
            console.error("Alert creation error:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#0B0F17]/95 backdrop-blur-3xl p-8 rounded-[2rem] border border-white/20 shadow-2xl z-50"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                                    <Bell className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-white">Price Alert</h2>
                                    <p className="text-xs text-white/40">${symbol}</p>
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
                            {/* Current Price Info */}
                            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10">
                                <p className="text-xs text-white/40 mb-1">Current price</p>
                                <p className="text-2xl font-black text-white tabular-nums">
                                    {currencySymbol}{(currentPrice ?? 0).toFixed(2)}
                                </p>
                            </div>

                            {/* Direction Selection */}
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setDirection("above")}
                                    className={`flex items-center justify-center gap-2 p-4 rounded-2xl border transition-all ${direction === "above"
                                        ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
                                        : "bg-white/[0.04] border-white/10 text-white/60 hover:bg-white/[0.08]"
                                        }`}
                                >
                                    <TrendingUp className="w-5 h-5" />
                                    <span className="font-bold">Above</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setDirection("below")}
                                    className={`flex items-center justify-center gap-2 p-4 rounded-2xl border transition-all ${direction === "below"
                                        ? "bg-rose-500/20 border-rose-500/30 text-rose-400"
                                        : "bg-white/[0.04] border-white/10 text-white/60 hover:bg-white/[0.08]"
                                        }`}
                                >
                                    <TrendingDown className="w-5 h-5" />
                                    <span className="font-bold">Below</span>
                                </button>
                            </div>

                            {/* Target Price Input */}
                            <div>
                                <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">
                                    Target price
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-bold">
                                        {currencySymbol}
                                    </span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={targetPrice}
                                        onChange={(e) => setTargetPrice(e.target.value)}
                                        className="w-full pl-10 pr-4 py-4 bg-white/[0.04] border border-white/10 rounded-2xl text-white text-xl font-black tabular-nums focus:outline-none focus:border-emerald-500/50 transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <p className="text-rose-400 text-sm text-center">{error}</p>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isSubmitting || !user}
                                className="w-full py-4 btn-gradient text-white rounded-2xl font-bold text-sm shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? "Creating..." : "Create Alert"}
                            </button>

                            {!user && (
                                <p className="text-xs text-white/30 text-center">
                                    You must be logged in to create alerts
                                </p>
                            )}
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
