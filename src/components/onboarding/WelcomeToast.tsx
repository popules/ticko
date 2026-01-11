"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, ArrowRight } from "lucide-react";
import Link from "next/link";

const WELCOME_KEY = "ticko_has_seen_welcome";

export function WelcomeToast() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if user has seen welcome message
        const hasSeen = localStorage.getItem(WELCOME_KEY);
        if (!hasSeen) {
            // Show after a delay to not overwhelm user
            const timer = setTimeout(() => setIsVisible(true), 3000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleDismiss = () => {
        localStorage.setItem(WELCOME_KEY, "true");
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 100 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="fixed bottom-24 right-6 z-40 max-w-sm"
                >
                    <div className="bg-[#0B0F17]/95 backdrop-blur-xl rounded-2xl border border-white/10 p-4 shadow-2xl shadow-black/50">
                        {/* Close button */}
                        <button
                            onClick={handleDismiss}
                            className="absolute top-3 right-3 p-1 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="flex items-start gap-3 pr-6">
                            {/* Icon */}
                            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-bold text-white mb-0.5">
                                    Välkommen till Ticko! 🚀
                                </h3>
                                <p className="text-xs text-white/50 leading-relaxed mb-3">
                                    Utforska marknaden och gå med i Sveriges största investeringscommunity.
                                </p>
                                <Link
                                    href="/upptack"
                                    onClick={handleDismiss}
                                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors group"
                                >
                                    Kom igång
                                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
