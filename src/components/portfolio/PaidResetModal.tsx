"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, X, Loader2, Sparkles, Zap, CreditCard } from "lucide-react";

interface PaidResetModalProps {
    onClose: () => void;
}

const Portal = ({ children }: { children: React.ReactNode }) => {
    if (typeof window === "undefined") return null;
    return createPortal(children, document.body);
};

export function PaidResetModal({ onClose }: PaidResetModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handlePayAndReset = async () => {
        setIsLoading(true);
        setError("");

        try {
            const res = await fetch("/api/polar/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });

            const data = await res.json();

            if (!res.ok || data.error) {
                setError(data.error || "Något gick fel");
                setIsLoading(false);
                return;
            }

            // Redirect to Polar checkout
            window.location.href = data.checkoutUrl;
        } catch {
            setError("Kunde inte ansluta till betalning");
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
                        {/* Header */}
                        <div className="p-6 border-b border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                                    <Zap className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-white">Premium Reset</h2>
                                    <p className="text-xs text-white/40">Starta om i toppen</p>
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
                        <div className="p-6 space-y-6">
                            {/* Hero Section */}
                            <div className="text-center">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/30">
                                    <RotateCcw className="w-10 h-10 text-white" />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">
                                    Dags för en nystart?
                                </h3>
                                <p className="text-white/60 text-sm leading-relaxed">
                                    Nollställ din historik, hämta <span className="text-emerald-400 font-bold">100 000 kr</span> i nytt kapital
                                    och visa att du hör hemma i toppen.
                                </p>
                            </div>

                            {/* Features */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/10">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                        <Sparkles className="w-4 h-4 text-emerald-400" />
                                    </div>
                                    <span className="text-sm text-white/80">100 000 kr virtuellt startkapital</span>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/10">
                                    <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
                                        <RotateCcw className="w-4 h-4 text-violet-400" />
                                    </div>
                                    <span className="text-sm text-white/80">Ren slate på leaderboarden</span>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/10">
                                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                                        <Zap className="w-4 h-4 text-amber-400" />
                                    </div>
                                    <span className="text-sm text-white/80">Ingen cooldown – omedelbar reset</span>
                                </div>
                            </div>

                            {/* Price */}
                            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-rose-500/10 border border-amber-500/20 text-center">
                                <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Engångsbetalning</p>
                                <p className="text-3xl font-black text-white">
                                    49 <span className="text-lg text-white/60">kr</span>
                                </p>
                            </div>

                            {error && (
                                <p className="text-sm text-rose-400 text-center">{error}</p>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="p-6 pt-0 flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 px-4 py-3 rounded-xl bg-white/[0.06] text-white/60 font-bold hover:bg-white/10 transition-colors"
                            >
                                Avbryt
                            </button>
                            <button
                                onClick={handlePayAndReset}
                                disabled={isLoading}
                                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <CreditCard className="w-4 h-4" />
                                        Betala och återställ
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Footer */}
                        <div className="px-6 pb-4">
                            <p className="text-[10px] text-white/30 text-center">
                                Säker betalning via Polar.sh • Moms inkluderad
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            </AnimatePresence>
        </Portal>
    );
}
