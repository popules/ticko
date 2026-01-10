"use client";

import { useState } from "react";
import { TrendingUp, TrendingDown, Send, AtSign, Image, X } from "lucide-react";
import { extractFirstTicker } from "@/lib/cashtag";
import { UI_STRINGS } from "@/config/app";
import { GiphyPicker } from "./GiphyPicker";
import { useAuth } from "@/providers/AuthProvider";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import type { SentimentType } from "@/types/database";

interface PostComposerProps {
    onNewPost?: () => void;
    tickerFilter?: string;
}

export function PostComposer({ onNewPost, tickerFilter }: PostComposerProps) {
    const { user } = useAuth();
    const [content, setContent] = useState("");
    const [sentiment, setSentiment] = useState<SentimentType | null>(null);
    const [gifUrl, setGifUrl] = useState<string | null>(null);
    const [showGiphyPicker, setShowGiphyPicker] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || !user || !isSupabaseConfigured || !supabase) return;

        setIsSubmitting(true);
        setError(null);

        const ticker = tickerFilter || extractFirstTicker(content);

        try {
            const { error: insertError } = await supabase.from("posts").insert({
                user_id: user.id,
                content: content.trim(),
                sentiment,
                ticker_symbol: ticker,
                gif_url: gifUrl,
            } as never);

            if (insertError) throw insertError;

            setContent("");
            setSentiment(null);
            setGifUrl(null);
            onNewPost?.();
        } catch (err) {
            console.error("Post error:", err);
            setError("Kunde inte publicera inlägget");
        }

        setIsSubmitting(false);
    };

    const charCount = content.length;
    const maxChars = 500;
    const isOverLimit = charCount > maxChars;

    if (!user) {
        return (
            <div className="bg-white/[0.04] backdrop-blur-xl rounded-2xl p-8 border border-white/10 text-center shadow-lg border-dashed">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                    <AtSign className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Gå med i diskussionen</h3>
                <p className="text-white/40 mb-6 text-sm max-w-xs mx-auto">
                    Logga in för att dela dina insikter, följa andra investerare och bygga din portfölj.
                </p>
                <a
                    href="/logga-in"
                    className="inline-flex items-center gap-2 px-8 py-3 btn-gradient text-white rounded-xl font-bold text-sm hover:scale-[1.02] transition-all"
                >
                    Logga in nu
                </a>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white/[0.04] backdrop-blur-xl rounded-2xl p-5 border border-white/10 shadow-lg">
            {/* Composer header */}
            <div className="flex items-center gap-2 mb-4 text-sm text-white/50">
                <AtSign className="w-4 h-4" />
                <span>{UI_STRINGS.composerHint}</span>
            </div>

            {/* Text area */}
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={UI_STRINGS.composerPlaceholder}
                className="w-full bg-transparent border-none outline-none resize-none text-white placeholder:text-white/40 min-h-[100px] text-base"
                rows={3}
            />

            {/* GIF preview */}
            {gifUrl && (
                <div className="relative inline-block mt-3">
                    <img
                        src={gifUrl}
                        alt="Selected GIF"
                        className="max-h-40 rounded-xl"
                    />
                    <button
                        type="button"
                        onClick={() => setGifUrl(null)}
                        className="absolute -top-2 -right-2 p-1.5 bg-rose-500 rounded-full text-white hover:bg-rose-600 transition-colors"
                    >
                        <X className="w-3 h-3" />
                    </button>
                </div>
            )}

            {/* GIPHY Picker */}
            {showGiphyPicker && (
                <div className="mt-4">
                    <GiphyPicker
                        onSelect={(url) => {
                            setGifUrl(url);
                            setShowGiphyPicker(false);
                        }}
                        onClose={() => setShowGiphyPicker(false)}
                    />
                </div>
            )}

            {/* Error message */}
            {error && (
                <div className="mt-3 text-rose-400 text-sm">{error}</div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-4">
                {/* Left actions */}
                <div className="flex items-center gap-3">
                    {/* GIF button */}
                    <button
                        type="button"
                        onClick={() => setShowGiphyPicker(!showGiphyPicker)}
                        className={`p-2 rounded-xl transition-all ${showGiphyPicker || gifUrl
                            ? "bg-violet-500/20 text-violet-400"
                            : "bg-white/[0.06] text-white/50 hover:bg-white/10 hover:text-white"
                            }`}
                    >
                        <Image className="w-5 h-5" />
                    </button>

                    {/* Sentiment toggles */}
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setSentiment(sentiment === "bull" ? null : "bull")}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium transition-all ${sentiment === "bull"
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/10"
                                : "bg-white/[0.06] text-white/60 hover:bg-white/10 border border-transparent"
                                }`}
                        >
                            <TrendingUp className="w-3.5 h-3.5" />
                            {UI_STRINGS.bullish}
                        </button>
                        <button
                            type="button"
                            onClick={() => setSentiment(sentiment === "bear" ? null : "bear")}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium transition-all ${sentiment === "bear"
                                ? "bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-lg shadow-rose-500/10"
                                : "bg-white/[0.06] text-white/60 hover:bg-white/10 border border-transparent"
                                }`}
                        >
                            <TrendingDown className="w-3.5 h-3.5" />
                            {UI_STRINGS.bearish}
                        </button>
                    </div>
                </div>

                {/* Character count & submit */}
                <div className="flex items-center gap-4">
                    <span
                        className={`text-xs tabular-nums ${isOverLimit ? "text-rose-400" : "text-white/40"
                            }`}
                    >
                        {charCount}/{maxChars}
                    </span>
                    <button
                        type="submit"
                        disabled={!content.trim() || isOverLimit || isSubmitting}
                        className="flex items-center gap-2 px-5 py-2.5 btn-gradient text-white rounded-xl font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send className="w-4 h-4" />
                        {UI_STRINGS.post}
                    </button>
                </div>
            </div>
        </form>
    );
}
