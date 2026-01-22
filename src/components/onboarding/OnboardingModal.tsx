"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Wallet, Trophy, Brain, MessageCircle, ChevronRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { TickoLogo } from "@/components/ui/TickoLogo";

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
    const [isOpen, setIsOpen] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        // Check if user has seen onboarding
        const hasSeen = localStorage.getItem(ONBOARDING_KEY);
        if (!hasSeen) {
            // Small delay to let the page load first
            const timer = setTimeout(() => setIsOpen(true), 500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleClose = () => {
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
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
