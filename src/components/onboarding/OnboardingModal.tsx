"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Wallet, Trophy, Brain, MessageCircle, ChevronRight, Sparkles, User, Check, AlertCircle } from "lucide-react";
import Link from "next/link";
import { TickoLogo } from "@/components/ui/TickoLogo";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/lib/supabase/client";

const ONBOARDING_KEY = "ticko_has_seen_onboarding";

const slides = [
    {
        icon: Wallet,
        gradient: "from-emerald-400 to-teal-500",
        bgGlow: "bg-emerald-500/20",
        title: "Here's $10,000 💰",
        description: "You just got $10,000 in virtual money. Trade real stocks, risk nothing. Your challenge: beat the market.",
        highlight: "100% risk-free",
    },
    {
        icon: Trophy,
        gradient: "from-yellow-400 to-orange-500",
        bgGlow: "bg-yellow-500/20",
        title: "Climb the Leaderboard 🏆",
        description: "Compete in monthly seasons. Every trade builds your track record. Top traders get eternal glory in the Hall of Fame.",
        highlight: "Seasons reset monthly",
    },
    {
        icon: Brain,
        gradient: "from-violet-400 to-fuchsia-500",
        bgGlow: "bg-violet-500/20",
        title: "Ticko AI is Your Edge 🤖",
        description: "Get instant stock analysis, news summaries, and sentiment insights. It's like having a research team in your pocket.",
        highlight: "Powered by AI",
    },
    {
        icon: MessageCircle,
        gradient: "from-blue-400 to-cyan-500",
        bgGlow: "bg-blue-500/20",
        title: "Join the Discussion 💬",
        description: "Tag stocks with $TICKER, share your analysis, react with GIFs. See what real traders are saying about your stocks.",
        highlight: "Community-driven",
    },
];

export function OnboardingModal() {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);

    // Naming State
    const [isNaming, setIsNaming] = useState(false);
    const [username, setUsername] = useState("");
    const [nameError, setNameError] = useState<string | null>(null);
    const [isCheckingName, setIsCheckingName] = useState(false);
    const [isSubmittingName, setIsSubmittingName] = useState(false);

    useEffect(() => {
        const checkUserStatus = async () => {
            if (!user) return;

            // 1. Fetch current profile to see username
            const { data: profile } = await (supabase as any)
                .from("profiles")
                .select("username")
                .eq("id", user.id)
                .single();

            if (profile && profile.username && profile.username.startsWith("user_")) {
                // FORCE open if default username
                setIsOpen(true);
                setIsNaming(true);
                return;
            }

            // 2. Normal onboarding check
            const hasSeen = localStorage.getItem(ONBOARDING_KEY);
            if (!hasSeen) {
                const timer = setTimeout(() => setIsOpen(true), 500);
                return () => clearTimeout(timer);
            }
        };

        checkUserStatus();
    }, [user]);

    const handleClose = () => {
        // Prevent closing if we are in mandatory naming mode
        if (isNaming) return;

        localStorage.setItem(ONBOARDING_KEY, "true");
        setIsOpen(false);
    };

    const handleNext = () => {
        if (currentSlide < slides.length - 1) {
            setCurrentSlide(currentSlide + 1);
        } else {
            handleClose();
        }
    };

    const handleNameSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || isSubmittingName) return;

        const cleanName = username.trim();

        // Basic validation
        if (cleanName.length < 3) {
            setNameError("Username must be at least 3 characters");
            return;
        }
        if (!/^[a-zA-Z0-9_]+$/.test(cleanName)) {
            setNameError("Only letters, numbers and underscores allowed");
            return;
        }

        setIsCheckingName(true);
        setNameError(null);

        try {
            // Check availability
            const { data: existing } = await (supabase as any)
                .from("profiles")
                .select("id")
                .eq("username", cleanName)
                .neq("id", user.id) // Exclude self
                .single();

            if (existing) {
                setNameError("Username is already taken");
                setIsCheckingName(false);
                return;
            }

            // Update profile
            setIsSubmittingName(true);
            const { error: updateError } = await (supabase as any)
                .from("profiles")
                .update({ username: cleanName })
                .eq("id", user.id);

            if (updateError) throw updateError;

            // Success! Move to normal onboarding
            setIsNaming(false);
            setIsSubmittingName(false);
            setIsCheckingName(false);

        } catch (err) {
            console.error("Name update error:", err);
            setNameError("Could not update username. Try again.");
            setIsSubmittingName(false);
            setIsCheckingName(false);
        }
    };

    const slide = slides[currentSlide];
    const Icon = slide.icon;
    const isLastSlide = currentSlide === slides.length - 1;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50"
                        onClick={handleClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", duration: 0.5 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-gradient-to-b from-[#0f1629] to-[#0B0F17] p-8 rounded-[2rem] border border-white/10 shadow-2xl z-50 overflow-hidden"
                    >
                        {/* Special "Choose Username" State */}
                        {isNaming ? (
                            <div className="text-center relative z-10">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-emerald-500/20 rounded-full blur-[100px] opacity-50 -z-10" />

                                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-xl shadow-emerald-500/20">
                                    <User className="w-10 h-10 text-white" />
                                </div>

                                <h2 className="text-2xl font-black text-white mb-3">
                                    Choose your Alias 🥷
                                </h2>
                                <p className="text-white/60 mb-8 max-w-xs mx-auto">
                                    This is how you'll appear on the leaderboards and in discussions.
                                </p>

                                <form onSubmit={handleNameSubmit} className="space-y-4">
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                            <span className="text-white/40 font-bold">@</span>
                                        </div>
                                        <input
                                            type="text"
                                            value={username}
                                            onChange={(e) => {
                                                setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''));
                                                setNameError(null);
                                            }}
                                            placeholder="username"
                                            className={`w-full bg-white/[0.04] border ${nameError ? 'border-rose-500/50 focus:border-rose-500' : 'border-white/10 focus:border-emerald-500/50'} rounded-xl py-4 pl-10 pr-4 text-white placeholder:text-white/20 outline-none transition-all font-bold tracking-wide`}
                                            autoFocus
                                            maxLength={15}
                                        />
                                    </div>

                                    {nameError && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex items-center gap-2 text-rose-400 text-xs font-bold justify-center"
                                        >
                                            <AlertCircle className="w-3 h-3" />
                                            {nameError}
                                        </motion.div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={!username || isCheckingName || isSubmittingName || !!nameError}
                                        className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 disabled:cursor-not-allowed text-[#020617] font-bold text-lg shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                                    >
                                        {(isCheckingName || isSubmittingName) ? (
                                            <div className="w-5 h-5 border-2 border-[#020617]/30 border-t-[#020617] rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                Next
                                                <ChevronRight className="w-5 h-5" />
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        ) : (
                            /* Normal Onboarding Slides */
                            <>
                                {/* Animated glow background */}
                                <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 ${slide.bgGlow} rounded-full blur-[100px] opacity-50 transition-colors duration-500`} />

                                {/* Close button */}
                                <button
                                    onClick={handleClose}
                                    className="absolute top-4 right-4 p-2 rounded-xl bg-white/[0.04] hover:bg-white/10 text-white/40 hover:text-white transition-all z-10"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                {/* Logo */}
                                <div className="relative flex justify-center mb-6">
                                    <TickoLogo />
                                </div>

                                {/* Content */}
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={currentSlide}
                                        initial={{ opacity: 0, x: 50 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -50 }}
                                        transition={{ duration: 0.3 }}
                                        className="relative text-center"
                                    >
                                        {/* Icon */}
                                        <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${slide.gradient} flex items-center justify-center shadow-xl shadow-black/20`}>
                                            <Icon className="w-10 h-10 text-white" />
                                        </div>

                                        {/* Title */}
                                        <h2 className="text-2xl font-black text-white mb-3">
                                            {slide.title}
                                        </h2>

                                        {/* Description */}
                                        <p className="text-white/60 leading-relaxed mb-4">
                                            {slide.description}
                                        </p>

                                        {/* Highlight tag */}
                                        <span className={`inline-block px-3 py-1 rounded-full bg-gradient-to-r ${slide.gradient} bg-opacity-10 text-xs font-bold text-white/80 border border-white/10`}>
                                            {slide.highlight}
                                        </span>
                                    </motion.div>
                                </AnimatePresence>

                                {/* Progress dots */}
                                <div className="relative flex justify-center gap-2 mt-8 mb-6">
                                    {slides.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentSlide(index)}
                                            className={`h-2 rounded-full transition-all ${index === currentSlide
                                                ? `w-8 bg-gradient-to-r ${slide.gradient}`
                                                : "w-2 bg-white/20 hover:bg-white/30"
                                                }`}
                                        />
                                    ))}
                                </div>

                                {/* Actions */}
                                <div className="relative flex gap-3">
                                    <button
                                        onClick={handleClose}
                                        className="flex-1 py-3 px-4 rounded-xl bg-white/[0.04] hover:bg-white/10 text-white/60 font-semibold transition-all border border-white/10"
                                    >
                                        Skip
                                    </button>
                                    <button
                                        onClick={handleNext}
                                        className={`flex-1 py-3 px-4 rounded-xl bg-gradient-to-r ${slide.gradient} text-white font-bold flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-[1.02]`}
                                    >
                                        {isLastSlide ? (
                                            <>
                                                <Sparkles className="w-4 h-4" />
                                                Start Trading
                                            </>
                                        ) : (
                                            <>
                                                Next
                                                <ChevronRight className="w-4 h-4" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
