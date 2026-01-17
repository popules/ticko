"use client";

import { useState } from "react";
import { Share2, Check, Link2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ShareButtonProps {
    url?: string;
    title?: string;
    text?: string;
    className?: string;
    iconOnly?: boolean;
}

export function ShareButton({
    url,
    title = "Kolla in detta på Ticko",
    text = "",
    className = "",
    iconOnly = true,
}: ShareButtonProps) {
    const [copied, setCopied] = useState(false);

    const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");

    const handleShare = async () => {
        // Try native Web Share API first (mobile)
        if (navigator.share) {
            try {
                await navigator.share({
                    title,
                    text,
                    url: shareUrl,
                });
                return;
            } catch (err) {
                // User cancelled or share failed, fall through to clipboard
                if ((err as Error).name === "AbortError") return;
            }
        }

        // Fallback: copy to clipboard
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    return (
        <button
            onClick={handleShare}
            className={`flex items-center gap-2 text-white/40 hover:text-white transition-colors ${className}`}
            title="Dela"
        >
            <AnimatePresence mode="wait">
                {copied ? (
                    <motion.div
                        key="check"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="flex items-center gap-1.5 text-emerald-400"
                    >
                        <Check className="w-4 h-4" />
                        {!iconOnly && <span className="text-xs font-medium">Kopierad!</span>}
                    </motion.div>
                ) : (
                    <motion.div
                        key="share"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="flex items-center gap-1.5"
                    >
                        <Share2 className="w-4 h-4" />
                        {!iconOnly && <span className="text-xs font-medium">Dela</span>}
                    </motion.div>
                )}
            </AnimatePresence>
        </button>
    );
}
