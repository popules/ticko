"use client";

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom"; // Add this import
import { motion, AnimatePresence } from "framer-motion";
import { useTour } from "@/providers/TourProvider";
import { ChevronRight, X, Sparkles } from "lucide-react";

export function TourOverlay() {
    const { isOpen, currentStepIndex, steps, nextStep, closeTour } = useTour();
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const step = steps[currentStepIndex];

    useEffect(() => {
        if (!isOpen || !step) return;

        const updateRect = () => {
            const element = document.getElementById(step.targetId);
            if (element) {
                const rect = element.getBoundingClientRect();
                // Add some padding
                const padding = 8;
                setTargetRect({
                    top: rect.top - padding,
                    left: rect.left - padding,
                    width: rect.width + (padding * 2),
                    height: rect.height + (padding * 2),
                    bottom: rect.bottom + padding,
                    right: rect.right + padding,
                    x: rect.x - padding,
                    y: rect.y - padding,
                    toJSON: () => { }
                });

                // Ensure element is in view
                element.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        };

        updateRect();
        window.addEventListener("resize", updateRect);
        window.addEventListener("scroll", updateRect);

        return () => {
            window.removeEventListener("resize", updateRect);
            window.removeEventListener("scroll", updateRect);
        };
    }, [isOpen, step]);

    if (!isMounted || !isOpen || !step || !targetRect) return null;

    // Portal to body to ensure it's on top of everything
    return createPortal(
        <div className="fixed inset-0 z-[100] pointer-events-none">
            {/* Spotlight Effect using massive box-shadow */}
            <motion.div
                initial={false}
                animate={{
                    top: targetRect.top,
                    left: targetRect.left,
                    width: targetRect.width,
                    height: targetRect.height,
                }}
                transition={{
                    type: "spring",
                    damping: 30,
                    stiffness: 300
                }}
                className="absolute rounded-xl shadow-[0_0_0_9999px_rgba(0,0,0,0.85)] border-2 border-emerald-500/50 pointer-events-auto"
            />

            {/* Tooltip */}
            <Tooltip
                step={step}
                targetRect={targetRect}
                onNext={nextStep}
                onSkip={closeTour}
                isLast={currentStepIndex === steps.length - 1}
                current={currentStepIndex + 1}
                total={steps.length}
            />
        </div>,
        document.body
    );
}

function Tooltip({ step, targetRect, onNext, onSkip, isLast, current, total }: any) {
    // Calculate position
    // Default to right, but check if it fits
    let top = targetRect.top;
    let left = targetRect.right + 20;
    const width = 320;

    const navHeight = 80;

    // Simple positioning logic
    if (step.position === "bottom") {
        top = targetRect.bottom + 20;
        left = targetRect.left + (targetRect.width / 2) - (width / 2);
    } else if (step.position === "left") {
        top = targetRect.top;
        left = targetRect.left - width - 20;
    } else if (step.position === "top") {
        top = targetRect.top - 200; // rough height estimate
        left = targetRect.left + (targetRect.width / 2) - (width / 2);
    }

    // Ensure it doesn't go off screen
    if (left + width > window.innerWidth) {
        left = window.innerWidth - width - 20;
    }
    if (left < 20) left = 20;
    if (top < navHeight) top = navHeight + 20;


    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            key={step.id} // Re-animate on step change
            transition={{ duration: 0.3 }}
            style={{ top, left, width }}
            className="absolute bg-gradient-to-br from-[#0f1629] to-[#0B0F17] p-6 rounded-2xl border border-white/10 shadow-2xl pointer-events-auto flex flex-col gap-4"
        >
            <div className="flex items-start justify-between">
                <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider mb-1 block">
                        Step {current} of {total}
                    </span>
                    <h3 className="text-lg font-bold text-white leading-tight">
                        {step.title}
                    </h3>
                </div>
                <button
                    onClick={onSkip}
                    className="p-1 rounded-lg hover:bg-white/10 text-white/30 hover:text-white transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            <p className="text-sm text-white/60 leading-relaxed">
                {step.content}
            </p>

            <div className="flex items-center justify-end gap-3 mt-2">
                <button
                    onClick={onNext}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-[#020617] font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
                >
                    {isLast ? (
                        <>
                            <Sparkles className="w-4 h-4" />
                            Finish
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
    );
}
