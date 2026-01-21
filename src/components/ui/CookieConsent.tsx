"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X, Check } from "lucide-react";

const COOKIE_CONSENT_KEY = "ticko_cookie_consent";

export function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if user has already consented
        const hasConsented = document.cookie.includes(`${COOKIE_CONSENT_KEY}=true`);
        if (!hasConsented) {
            // Small delay for better UX
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        // Set a cookie that expires in 365 days
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        document.cookie = `${COOKIE_CONSENT_KEY}=true; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;

        // Also set analytics preference
        document.cookie = `ticko_analytics=true; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;

        setIsVisible(false);
    };

    const handleDecline = () => {
        // Set a session cookie to not show again this session
        document.cookie = `${COOKIE_CONSENT_KEY}=false; path=/; SameSite=Lax`;
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 100, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 50, scale: 0.95 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="fixed bottom-6 right-6 z-50 w-[90%] max-w-sm"
                >
                    <div className="bg-[#0B0F17]/95 backdrop-blur-xl rounded-2xl border border-white/10 p-5 shadow-2xl shadow-black/50">
                        <div className="flex items-start gap-4">
                            {/* Cookie icon */}
                            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                                <span className="text-2xl">🍪</span>
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <h3 className="text-base font-bold text-white mb-1">
                                    Here's a cookie for you! 🍪
                                </h3>
                                <p className="text-sm text-white/50 leading-relaxed">
                                    We use cookies to give you the best experience. No tracking, just smart memories.
                                </p>
                            </div>

                            {/* Close button */}
                            <button
                                onClick={handleDecline}
                                className="flex-shrink-0 p-1 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={handleDecline}
                                className="flex-1 py-2.5 px-4 rounded-xl bg-white/[0.04] hover:bg-white/10 text-white/60 text-sm font-medium transition-all"
                            >
                                No thanks
                            </button>
                            <button
                                onClick={handleAccept}
                                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#020617] text-sm font-bold transition-all flex items-center justify-center gap-2"
                            >
                                <Check className="w-4 h-4" />
                                I love cookies
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
