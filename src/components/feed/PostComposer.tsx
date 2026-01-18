"use client";

import { useQuery } from "@tanstack/react-query";
import { checkAndAwardAchievement, awardXp } from "@/lib/achievements";
import { XP_PER_POST } from "@/lib/level-system";
import { getCompanyLogo } from "@/lib/stocks";

import { useState } from "react";
import { TrendingUp, TrendingDown, Send, AtSign, Image, X, BarChart2, Plus } from "lucide-react";
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

    // Poll state
    const [isPoll, setIsPoll] = useState(false);
    const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
    const [isPrediction, setIsPrediction] = useState(false);
    const [predictionPeriod, setPredictionPeriod] = useState("1w");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const ticker = extractFirstTicker(content);

    // Fetch live price for prediction baseline
    const { data: stockData } = useQuery({
        queryKey: ['stock-price', ticker],
        queryFn: async () => {
            if (!ticker) return null;
            const res = await fetch(`/api/stocks/${ticker}`);
            if (!res.ok) return null;
            return res.json();
        },
        enabled: !!ticker && isPrediction,
        staleTime: 10000 // 10 seconds cache
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || !user || !isSupabaseConfigured || !supabase) return;

        setIsSubmitting(true);
        setError(null);

        const ticker = tickerFilter || extractFirstTicker(content);

        try {
            let predictionPrice = null;
            let targetDate = null;

            if (isPrediction && ticker) {
                // Fetch current price for prediction
                const res = await fetch(`/api/stocks/${ticker}`);
                const stockData = await res.json();
                if (stockData && stockData.price) {
                    predictionPrice = stockData.price;

                    const now = new Date();
                    if (predictionPeriod === "1w") now.setDate(now.getDate() + 7);
                    else if (predictionPeriod === "1m") now.setMonth(now.getMonth() + 1);
                    else if (predictionPeriod === "3m") now.setMonth(now.getMonth() + 3);
                    targetDate = now.toISOString();
                } else {
                    throw new Error("Kunde inte hämta aktuellt pris för förutsägelse");
                }
            }

            const { data: postData, error: insertError } = await (supabase as any).from("posts").insert({
                user_id: user.id,
                content: content.trim(),
                sentiment: isPoll ? null : sentiment, // Polls shouldn't have sentiment usually
                ticker_symbol: ticker,
                gif_url: gifUrl,
                is_prediction: isPrediction,
                prediction_price: predictionPrice,
                target_date: targetDate,
            }).select().single();

            if (insertError) throw insertError;

            // Handle Poll Insertion
            if (isPoll && postData) {
                const optionsData = pollOptions
                    .filter(o => o.trim())
                    .map((text, i) => ({ id: i, text }));

                const { error: pollError } = await (supabase as any).from("polls").insert({
                    post_id: (postData as any).id,
                    question: content.trim(),
                    options_data: optionsData,
                });

                if (pollError) console.error("Poll insert error:", pollError);
            }

            // Trigger Achievement Check
            await checkAndAwardAchievement(user.id, "first_post");

            // Award XP for posting
            await awardXp(user.id, XP_PER_POST);

            setContent("");
            setSentiment(null);
            setGifUrl(null);
            setIsPrediction(false);
            setIsPoll(false);
            setPollOptions(["", ""]);
            onNewPost?.();
        } catch (err: any) {
            console.error("Post error:", err);
            setError(err.message || "Kunde inte publicera inlägget");
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
        <form onSubmit={handleSubmit} className="bg-white/[0.04] backdrop-blur-xl rounded-2xl p-5 border border-white/10 shadow-lg relative group focus-within:bg-white/[0.06] transition-colors">
            {/* Ticker badge */}
            {tickerFilter && (
                <div className="mb-3 flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                        ${tickerFilter}
                    </span>
                </div>
            )}

            {/* Text input area */}
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={tickerFilter ? `Vad tänker du om $${tickerFilter}?` : "Vad händer på marknaden?"}
                className="w-full bg-transparent border-none outline-none resize-none text-white placeholder:text-white/40 min-h-[80px] text-sm leading-relaxed focus:ring-0"
                disabled={isSubmitting}
                rows={3}
            />

            {/* GIF Preview */}
            {gifUrl && (
                <div className="relative mt-3 rounded-xl overflow-hidden border border-white/10 w-fit">
                    <img src={gifUrl} alt="Selected GIF" className="max-h-48 rounded-xl" />
                    <button
                        type="button"
                        onClick={() => setGifUrl(null)}
                        className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white/80 hover:text-white transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Giphy Picker */}
            {showGiphyPicker && (
                <div className="mt-3">
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
                <div className="mt-2 mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    {error}
                </div>
            )}

            {/* Poll Creator */}
            {isPoll && (
                <div className="mt-4 p-4 rounded-xl bg-[#020617] border border-white/10 space-y-3 animate-in fade-in slide-in-from-top-2">
                    {pollOptions.map((option, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <span className="text-white/30 text-xs font-bold w-12 text-right">Val {index + 1}</span>
                            <input
                                type="text"
                                value={option}
                                onChange={(e) => {
                                    const newOptions = [...pollOptions];
                                    newOptions[index] = e.target.value;
                                    setPollOptions(newOptions);
                                }}
                                placeholder={`Alternativ ${index + 1}`}
                                className="flex-1 bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500/50 outline-none transition-colors"
                            />
                            {index > 1 && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        const newOptions = pollOptions.filter((_, i) => i !== index);
                                        setPollOptions(newOptions);
                                    }}
                                    className="p-2 text-white/20 hover:text-white/50"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    ))}
                    {pollOptions.length < 4 && (
                        <button
                            type="button"
                            onClick={() => setPollOptions([...pollOptions, ""])}
                            className="ml-14 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
                        >
                            <Plus className="w-3 h-3" />
                            Lägg till alternativ
                        </button>
                    )}
                </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-2">
                <div className="flex items-center gap-2">
                    {/* Media Tools */}
                    <button
                        type="button"
                        onClick={() => setShowGiphyPicker(!showGiphyPicker)}
                        className={`p-2.5 rounded-full transition-colors ${showGiphyPicker ? 'bg-violet-500/10 text-violet-400' : 'text-emerald-400 hover:bg-emerald-500/10'}`}
                        title="Lägg till GIF"
                    >
                        <Image className="w-5 h-5" />
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setIsPoll(!isPoll);
                            setIsPrediction(false); // Mutually exclusive usually
                            setSentiment(null);
                        }}
                        className={`p-2.5 rounded-full transition-colors ${isPoll ? 'bg-blue-500/10 text-blue-400' : 'text-emerald-400 hover:bg-emerald-500/10'}`}
                        title="Skapa omröstning"
                    >
                        <BarChart2 className="w-5 h-5" />
                    </button>

                    <div className="h-6 w-px bg-white/10 mx-2" />

                    {/* Sentiment Pills */}
                    <button
                        type="button"
                        disabled={isPoll}
                        onClick={() => setSentiment(sentiment === "bull" ? null : "bull")}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${sentiment === "bull"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : "bg-transparent text-white/40 border-transparent hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
                            }`}
                    >
                        Bull
                    </button>
                    <button
                        type="button"
                        disabled={isPoll}
                        onClick={() => setSentiment(sentiment === "bear" ? null : "bear")}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${sentiment === "bear"
                            ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                            : "bg-transparent text-white/40 border-transparent hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
                            }`}
                    >
                        Bear
                    </button>

                    {/* Prediction Toggle (Contextual) */}
                    {sentiment && !isPoll && (
                        <div className="flex items-center gap-2 ml-2">
                            <button
                                type="button"
                                onClick={() => setIsPrediction(!isPrediction)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${isPrediction
                                    ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                                    : "bg-transparent text-white/40 border-transparent hover:bg-white/5"
                                    }`}
                            >
                                <TrendingUp className="w-3 h-3" />
                                {isPrediction ? "Kursmål PÅ" : "Kursmål"}
                            </button>

                            {isPrediction && (
                                <>
                                    <select
                                        value={predictionPeriod}
                                        onChange={(e) => setPredictionPeriod(e.target.value)}
                                        className="bg-[#020617] border border-white/10 rounded-lg px-2 py-1 text-[10px] font-bold text-white/70 outline-none"
                                    >
                                        <option value="1w">1 vecka</option>
                                        <option value="1m">1 månad</option>
                                        <option value="3m">3 månader</option>
                                        <option value="1y">1 år</option>
                                    </select>
                                    {stockData && (
                                        <span className="hidden sm:inline-flex text-[10px] text-emerald-400 font-medium ml-2 bg-emerald-500/10 px-2 py-1 rounded animate-in fade-in">
                                            Start: {stockData.price} {stockData.currencySymbol || stockData.currency}
                                        </span>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    {/* Char counter */}
                    <span className={`text-xs font-medium tabular-nums ${isOverLimit ? "text-rose-500" : "text-white/20"}`}>
                        {charCount}/{maxChars}
                    </span>

                    <button
                        type="submit"
                        disabled={!content.trim() || isOverLimit || isSubmitting || (isPoll && pollOptions.some(o => !o.trim()))}
                        className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:hover:bg-emerald-500 text-[#020617] rounded-full font-bold text-sm transition-all shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_-5px_rgba(16,185,129,0.4)]"
                    >
                        {isSubmitting ? (
                            <div className="w-5 h-5 border-2 border-[#020617]/30 border-t-[#020617] rounded-full animate-spin" />
                        ) : (
                            "Publicera"
                        )}
                    </button>
                </div>
            </div>
        </form>
    );
}
