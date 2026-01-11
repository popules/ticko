"use client";

import { useState, useEffect } from "react";
import { Sparkles, Loader2, RefreshCw, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function MorningReport() {
    const [report, setReport] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isVisible, setIsVisible] = useState(true);

    const fetchReport = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/ai/morning-report");
            const data = await res.json();
            if (data.report) {
                setReport(data.report);
            } else if (data.message) {
                setReport(data.message);
            }
        } catch (error) {
            console.error("Failed to fetch morning report:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, []);

    if (!isVisible) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative p-6 rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-emerald-500/10 via-transparent to-blue-500/5 backdrop-blur-2xl overflow-hidden mb-6 group"
        >
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[60px] rounded-full -mr-16 -mt-16 group-hover:bg-emerald-500/20 transition-all duration-700" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/10 blur-[50px] rounded-full -ml-12 -mb-12 group-hover:bg-blue-500/20 transition-all duration-700" />

            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/20">
                        <Sparkles className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest">Morgonrapport</h3>
                        <p className="text-[10px] text-white/40 uppercase tracking-tighter">Personliga insikter från Ticko AI</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchReport}
                        disabled={isLoading}
                        className="p-2 rounded-xl text-white/30 hover:text-white hover:bg-white/10 transition-all disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                    </button>
                    <button
                        onClick={() => setIsVisible(false)}
                        className="p-2 rounded-xl text-white/30 hover:text-white hover:bg-white/10 transition-all"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="relative">
                {isLoading ? (
                    <div className="py-8 flex flex-col items-center justify-center gap-3">
                        <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
                        <p className="text-xs text-white/30 font-medium italic">Analyserar marknaden åt dig...</p>
                    </div>
                ) : report ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap font-medium"
                    >
                        {report}
                    </motion.div>
                ) : (
                    <p className="text-sm text-white/40 italic py-4">Kunde inte generera rapporten just nu.</p>
                )}
            </div>

            {/* Footer decoration */}
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <span className="text-[9px] text-white/20 font-bold uppercase tracking-widest">Powered by Ticko AI</span>
                    <span className="text-[8px] text-white/10 uppercase tracking-widest">Ej finansiell rådgivning</span>
                </div>
                <div className="flex gap-1">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-emerald-500/20" />
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
