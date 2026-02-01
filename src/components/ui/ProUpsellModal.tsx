"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Sparkles, Brain, Star, Zap, TrendingUp, Eye } from "lucide-react";

interface ProUpsellModalProps {
    onClose: () => void;
    trigger?: "ai_limit" | "watchlist_limit" | "portfolio_stats" | "general";
}

const Portal = ({ children }: { children: React.ReactNode }) => {
    if (typeof window === "undefined") return null;
    return createPortal(children, document.body);
};

const triggerMessages = {
    ai_limit: {
        title: "You've hit your daily limit",
        subtitle: "Upgrade to Pro for unlimited AI insights"
    },
    watchlist_limit: {
        title: "Watchlist is full",
        subtitle: "Upgrade to Pro for 50+ watchlist slots"
    },
    portfolio_stats: {
        title: "Pro Feature",
        subtitle: "Unlock deep portfolio analytics"
    },
    general: {
        title: "Upgrade to Ticko Pro",
        subtitle: "Unlock the full trading experience"
    }
};

export function ProUpsellModal({ onClose, trigger = "general" }: ProUpsellModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const { title, subtitle } = triggerMessages[trigger];

    const handleUpgrade = async () => {
        setIsLoading(true);
        setError("");

        try {
            const res = await fetch("/api/polar/checkout?product=pro", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });

            const data = await res.json();

            if (!res.ok || data.error) {
                setError(data.error || "Something went wrong");
                setIsLoading(false);
                return;
            }

            // Redirect to Polar checkout
            window.location.href = data.checkoutUrl;
        } catch {
            setError("Could not connect to payment");
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
                        className="w-full max-w-md bg-[#0B0F17] border border-white/10 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-400 via-purple-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                                    <Star className="w-6 h-6 text-white fill-white/20" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-white">{title}</h2>
                                    <p className="text-xs text-white/40">{subtitle}</p>
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
                        <div className="p-6 space-y-6 overflow-y-auto bg-[#0B0F17]">
                            {/* Hero Section */}
                            <div className="text-center">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-400 via-purple-500 to-fuchsia-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/40">
                                    <Sparkles className="w-10 h-10 text-white" />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">
                                    Ticko Pro
                                </h3>
                                <p className="text-white/60 text-sm leading-relaxed">
                                    Better insights. Better decisions. Same fair competition.
                                </p>
                            </div>

                            {/* Features */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/10">
                                    <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
                                        <Brain className="w-4 h-4 text-violet-400" />
                                    </div>
                                    <div className="flex-1">
                                        <span className="text-sm text-white/80 font-medium">Unlimited AI Analysis</span>
                                        <p className="text-xs text-white/40">No daily limits on stock insights</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/10">
                                    <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
                                        <TrendingUp className="w-4 h-4 text-violet-400" />
                                    </div>
                                    <div className="flex-1">
                                        <span className="text-sm text-white/80 font-medium">Deep Portfolio Stats</span>
                                        <p className="text-xs text-white/40">Win/loss ratio, hold times, best trades</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/10">
                                    <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
                                        <Eye className="w-4 h-4 text-violet-400" />
                                    </div>
                                    <div className="flex-1">
                                        <span className="text-sm text-white/80 font-medium">50+ Watchlist Slots</span>
                                        <p className="text-xs text-white/40">Track more stocks you care about</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/10">
                                    <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
                                        <Zap className="w-4 h-4 text-violet-400" />
                                    </div>
                                    <div className="flex-1">
                                        <span className="text-sm text-white/80 font-medium">Pro Badge</span>
                                        <p className="text-xs text-white/40">Stand out in the community</p>
                                    </div>
                                </div>
                            </div>

                            {/* Price */}
                            <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-fuchsia-500/10 border border-violet-500/20 text-center">
                                <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Monthly</p>
                                <p className="text-3xl font-black text-white">
                                    $5 <span className="text-lg text-white/60">USD</span>
                                </p>
                                <p className="text-xs text-white/40 mt-1">Cancel anytime</p>
                            </div>

                            {error && (
                                <p className="text-sm text-rose-400 text-center">{error}</p>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="p-6 pt-0 flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 px-4 py-3.5 rounded-xl bg-white/[0.06] text-white/60 font-bold hover:bg-white/10 transition-colors"
                            >
                                Maybe later
                            </button>
                            <button
                                onClick={handleUpgrade}
                                disabled={isLoading}
                                className="flex-1 px-4 py-3.5 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <Star className="w-4 h-4" />
                                        Upgrade to Pro
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Footer */}
                        <div className="px-6 pb-4">
                            <p className="text-[10px] text-white/30 text-center">
                                Secure payment via Polar.sh • Cancel anytime
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            </AnimatePresence>
        </Portal>
    );
}
