"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, TrendingUp, Zap, ChevronRight } from "lucide-react";
import Link from "next/link";

const ONBOARDING_KEY = "ticko_has_seen_onboarding";

const slides = [
    {
        icon: Sparkles,
        color: "from-emerald-400 to-emerald-600",
        title: "Välkommen till Ticko! 🚀",
        description: "Din nya plattform för smart aktiehandel. Kombinera AI-insikter med sociala diskussioner.",
    },
    {
        icon: Zap,
        color: "from-violet-400 to-violet-600",
        title: "Upptäck nya aktier",
        description: "Svep genom aktier Tinder-style i Upptäck-läget. AI genererar unika insikter för varje aktie.",
    },
    {
        icon: TrendingUp,
        color: "from-amber-400 to-orange-500",
        title: "Ticko Analys",
        description: "Vår AI analyserar marknadssentiment i realtid. Se heatmapen för att hitta möjligheter.",
    },
];

export function OnboardingModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        // Check if user has seen onboarding
        const hasSeen = localStorage.getItem(ONBOARDING_KEY);
        if (!hasSeen) {
            setIsOpen(true);
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

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-md z-50"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#0B0F17] p-8 rounded-[2rem] border border-white/20 shadow-2xl z-50 overflow-hidden"
                    >
                        {/* Close button */}
                        <button
                            onClick={handleClose}
                            className="absolute top-4 right-4 p-2 rounded-xl bg-white/[0.04] hover:bg-white/10 text-white/40 hover:text-white transition-all z-10"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Content */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentSlide}
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                className="text-center"
                            >
                                {/* Icon */}
                                <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${slide.color} flex items-center justify-center shadow-xl`}>
                                    <Icon className="w-10 h-10 text-white" />
                                </div>

                                {/* Title */}
                                <h2 className="text-2xl font-black text-white mb-3">
                                    {slide.title}
                                </h2>

                                {/* Description */}
                                <p className="text-white/60 leading-relaxed mb-8">
                                    {slide.description}
                                </p>
                            </motion.div>
                        </AnimatePresence>

                        {/* Progress dots */}
                        <div className="flex justify-center gap-2 mb-6">
                            {slides.map((_, index) => (
                                <div
                                    key={index}
                                    className={`w-2 h-2 rounded-full transition-all ${index === currentSlide
                                            ? "w-8 bg-emerald-400"
                                            : "bg-white/20"
                                        }`}
                                />
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleClose}
                                className="flex-1 py-3 px-4 rounded-xl bg-white/[0.04] hover:bg-white/10 text-white/60 font-semibold transition-all"
                            >
                                Hoppa över
                            </button>
                            <button
                                onClick={handleNext}
                                className="flex-1 py-3 px-4 btn-gradient text-white rounded-xl font-bold flex items-center justify-center gap-2"
                            >
                                {currentSlide < slides.length - 1 ? (
                                    <>
                                        Nästa
                                        <ChevronRight className="w-4 h-4" />
                                    </>
                                ) : (
                                    "Kom igång!"
                                )}
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
