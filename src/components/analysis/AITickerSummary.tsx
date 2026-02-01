"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Loader2, RefreshCw, Star } from "lucide-react";
import { motion } from "framer-motion";
import { ProUpsellModal } from "@/components/ui/ProUpsellModal";

interface AITickerSummaryProps {
    ticker: string;
}

export function AITickerSummary({ ticker }: AITickerSummaryProps) {
    const [summary, setSummary] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [limitReached, setLimitReached] = useState(false);
    const [showProModal, setShowProModal] = useState(false);

    const fetchSummary = async () => {
        setIsLoading(true);
        setLimitReached(false);
        try {
            const res = await fetch(`/api/ai/ticker-summary/${ticker}`);
            const data = await res.json();
            
            // Handle 402 - limit reached
            if (res.status === 402 && data.error === "limit_reached") {
                setLimitReached(true);
                setSummary(null);
                return;
            }
            
            setSummary(data.summary);
        } catch (error) {
            console.error("Failed to fetch ticker summary:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (ticker) fetchSummary();
    }, [ticker]);

    return (
        <div className="p-6 rounded-[2rem] border border-white/10 bg-white/[0.02] backdrop-blur-xl relative overflow-hidden group">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
                        <MessageSquare className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest">Community Talk</h3>
                        <p className="text-[10px] text-white/40 uppercase tracking-tighter">AI summary of the feed</p>
                    </div>
                </div>
                <button
                    onClick={fetchSummary}
                    disabled={isLoading}
                    className="p-2 rounded-lg text-white/20 hover:text-white hover:bg-white/10 transition-all disabled:opacity-50"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
                </button>
            </div>

            {/* Content */}
            <div className="relative min-h-[60px] flex items-center">
                {isLoading ? (
                    <div className="flex items-center gap-3 py-4">
                        <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                        <p className="text-xs text-white/30 italic">Reading posts...</p>
                    </div>
                ) : limitReached ? (
                    <div className="flex items-center gap-3 py-2">
                        <Star className="w-4 h-4 text-violet-400" />
                        <div>
                            <p className="text-xs text-white/50">Daily AI limit reached</p>
                            <button
                                onClick={() => setShowProModal(true)}
                                className="text-xs text-violet-400 hover:underline"
                            >
                                Upgrade to Pro for unlimited
                            </button>
                        </div>
                    </div>
                ) : summary ? (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-sm text-white/70 leading-relaxed italic"
                    >
                        "{summary}"
                    </motion.p>
                ) : (
                    <p className="text-sm text-white/30 italic">No summary available.</p>
                )}
            </div>

            {/* Subtle Gradient */}
            <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-blue-500/5 blur-[40px] rounded-full pointer-events-none" />

            {/* Pro Upsell Modal */}
            {showProModal && (
                <ProUpsellModal
                    trigger="ai_limit"
                    onClose={() => setShowProModal(false)}
                />
            )}
        </div>
    );
}
