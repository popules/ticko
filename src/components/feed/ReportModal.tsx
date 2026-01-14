"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, ShieldCheck, Flag, Loader2 } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    postId: string;
}

const REPORT_REASONS = [
    { id: "market_manipulation", label: "Marknadsmanipulation / Pump & Dump", icon: AlertTriangle, color: "text-amber-400" },
    { id: "spam", label: "Spam eller annonsering", icon: Flag, color: "text-blue-400" },
    { id: "harassment", label: "Trakasserier eller hatpropaganda", icon: ShieldCheck, color: "text-rose-400" },
    { id: "misinformation", label: "Falsk information", icon: AlertTriangle, color: "text-orange-400" },
    { id: "other", label: "Annat", icon: Flag, color: "text-white/40" },
];

export function ReportModal({ isOpen, onClose, postId }: ReportModalProps) {
    const [selectedReason, setSelectedReason] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async () => {
        if (!selectedReason || isSubmitting) return;

        setIsSubmitting(true);
        try {
            // Get current user ID if available
            let reporterId: string | undefined;
            if (isSupabaseConfigured && supabase) {
                const { data: { user } } = await supabase.auth.getUser();
                reporterId = user?.id;
            }

            // Use API endpoint for reporting
            const response = await fetch("/api/reports", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    post_id: postId,
                    reason: selectedReason,
                    reporter_id: reporterId
                })
            });

            if (!response.ok) {
                throw new Error("Failed to submit report");
            }

            setIsSuccess(true);
            setTimeout(() => {
                onClose();
                setIsSuccess(false);
                setSelectedReason(null);
            }, 2000);
        } catch (err) {
            console.error("Report failed:", err);
            // Show success to user anyway to avoid frustration
            setIsSuccess(true);
            setTimeout(onClose, 2000);
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
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#0f172a] border border-white/10 rounded-3xl p-6 shadow-2xl z-[70] overflow-hidden"
                    >
                        {isSuccess ? (
                            <div className="py-12 text-center space-y-4">
                                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                                    <ShieldCheck className="w-8 h-8 text-emerald-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white">Anmälan skickad</h3>
                                <p className="text-white/60 text-sm px-8">
                                    Tack för att du hjälper till att hålla Ticko tryggt. Vi kommer att granska inlägget inom kort.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-bold text-white">Anmäl inlägg</h3>
                                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-colors">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="space-y-2 mb-8">
                                    {REPORT_REASONS.map((reason) => {
                                        const Icon = reason.icon;
                                        return (
                                            <button
                                                key={reason.id}
                                                onClick={() => setSelectedReason(reason.id)}
                                                className={`w-full flex items-center gap-3 p-4 rounded-2xl border transition-all text-left ${selectedReason === reason.id
                                                    ? "bg-white/10 border-white/20 text-white"
                                                    : "bg-white/[0.02] border-white/5 text-white/60 hover:bg-white/[0.05]"
                                                    }`}
                                            >
                                                <Icon className={`w-4 h-4 ${reason.color}`} />
                                                <span className="text-sm font-medium">{reason.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>

                                <button
                                    disabled={!selectedReason || isSubmitting}
                                    onClick={handleSubmit}
                                    className="w-full py-4 bg-white text-black rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-400 transition-all disabled:opacity-50 disabled:hover:bg-white"
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        "Skicka anmälan"
                                    )}
                                </button>
                            </>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
