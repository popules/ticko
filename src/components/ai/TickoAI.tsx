"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Sparkles, Loader2, Bot, User, Star, Brain } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { AnimatePresence, motion } from "framer-motion";
import { ProUpsellModal } from "@/components/ui/ProUpsellModal";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: number;
    isLimitReached?: boolean;
}

export function TickoAI() {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "welcome",
            role: "assistant",
            content: "Hey! I'm Ticko AI - your personal trading assistant. I know your portfolio, your trades, and your watchlist. Ask me anything!",
            timestamp: Date.now(),
        },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showProModal, setShowProModal] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input.trim(),
            timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        try {
            // Context from URL (basic)
            const path = window.location.pathname;
            const contextTicker = path.startsWith("/stock/") ? path.split("/")[2] : null;

            const res = await fetch("/api/ai/copilot", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: userMsg.content,
                    contextTicker,
                    history: messages.slice(-5), // Keep limited context
                }),
            });

            const data = await res.json();

            // Handle 402 - limit reached
            if (res.status === 402 && data.error === "limit_reached") {
                const limitMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    content: "You've used your 3 free AI messages today. Upgrade to Pro for unlimited access!",
                    timestamp: Date.now(),
                    isLimitReached: true,
                };
                setMessages((prev) => [...prev, limitMsg]);
                return;
            }

            if (!res.ok) throw new Error("Failed");

            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: data.reply || "I could not answer that right now.",
                timestamp: Date.now(),
            };

            setMessages((prev) => [...prev, botMsg]);
        } catch (error) {
            console.error(error);
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now().toString(),
                    role: "assistant",
                    content: "An error occurred. Please try again later.",
                    timestamp: Date.now(),
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) return null;

    return (
        <>
            {/* Toggle Button - positioned above mobile nav on mobile, bottom-right on desktop */}
            <button
                onClick={() => setIsOpen(true)}
                className={`fixed p-3.5 sm:p-4 rounded-full shadow-[0_0_40px_-5px_rgba(139,92,246,0.5)] transition-all transform hover:scale-105 z-40 ${isOpen ? "scale-0 opacity-0 pointer-events-none" : "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white"
                    } bottom-24 right-4 sm:bottom-6 sm:right-6`}
            >
                <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse" />
                <Brain className="w-5 h-5 sm:w-6 sm:h-6 relative z-10" />
            </button>

            {/* Chat Window - Full screen on mobile, floating on desktop */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed z-50 overflow-hidden bg-[#0f172a] border border-white/10 shadow-2xl flex flex-col
                            inset-0 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-96 sm:h-[600px] sm:max-h-[80vh] sm:rounded-2xl"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-white/10 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 flex items-center justify-between backdrop-blur-md">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg">
                                    <Brain className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-sm">Ticko AI</h3>
                                    <p className="text-[10px] text-violet-400 font-medium flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                                        Personal Assistant
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide" ref={scrollRef}>
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                                >
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === "assistant"
                                            ? msg.isLimitReached ? "bg-violet-500/10 text-violet-400" : "bg-violet-500/10 text-violet-400"
                                            : "bg-white/10 text-white"
                                            }`}
                                    >
                                        {msg.role === "assistant" ? (
                                            msg.isLimitReached ? <Star className="w-4 h-4" /> : <Brain className="w-4 h-4" />
                                        ) : (
                                            <User className="w-4 h-4" />
                                        )}
                                    </div>
                                    <div
                                        className={`max-w-[75%] p-3 rounded-2xl text-sm leading-relaxed ${msg.role === "assistant"
                                            ? msg.isLimitReached 
                                                ? "bg-violet-500/10 text-white/90 border border-violet-500/20 rounded-tl-none"
                                                : "bg-white/[0.04] text-white/90 border border-white/5 rounded-tl-none"
                                            : "bg-violet-500 text-white font-medium rounded-tr-none"
                                            }`}
                                    >
                                        {msg.content}
                                        {msg.isLimitReached && (
                                            <button
                                                onClick={() => setShowProModal(true)}
                                                className="mt-2 w-full px-3 py-2 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-xs font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-1"
                                            >
                                                <Star className="w-3 h-3" />
                                                Upgrade to Pro
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                                {isLoading && (
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-violet-500/10 text-violet-400">
                                        <Brain className="w-4 h-4" />
                                    </div>
                                    <div className="bg-white/[0.04] p-4 rounded-2xl rounded-tl-none border border-white/5">
                                        <Loader2 className="w-4 h-4 animate-spin text-violet-400" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-white/10 bg-white/[0.02]">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSend();
                                }}
                                className="relative flex items-center gap-2"
                            >
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask about your portfolio, a stock, the market..."
                                    className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.08] transition-all pr-12"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || isLoading}
                                    className="absolute right-2 p-1.5 bg-violet-500 text-white rounded-lg disabled:opacity-50 disabled:bg-violet-500/50 hover:bg-violet-400 transition-colors"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </form>
                            <p className="text-[10px] text-center text-white/30 mt-2 px-2 leading-tight">
                                Ticko AI is for information only, not financial advice.
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Pro Upsell Modal */}
            {showProModal && (
                <ProUpsellModal
                    trigger="ai_limit"
                    onClose={() => setShowProModal(false)}
                />
            )}
        </>
    );
}
