"use client";

import { useState, useEffect } from "react";
import { Search, Loader2, TrendingUp, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useDebounce } from "@/hooks/useDebounce"; // I assume this exists or I'll implement inline debounce

export function SearchDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [query, setQuery] = useState("");
    const debouncedQuery = useDebounce(query, 500);
    const [results, setResults] = useState<{ users: any[], stocks: any[] }>({ users: [], stocks: [] });
    const [isLoading, setIsLoading] = useState(false);

    // Fetch results when debounced query changes
    useEffect(() => {
        const fetchResults = async () => {
            if (debouncedQuery.length < 2) {
                setResults({ users: [], stocks: [] });
                return;
            }

            setIsLoading(true);
            try {
                const res = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`);
                const data = await res.json();
                setResults(data);
            } catch (error) {
                console.error("Search failed", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchResults();
    }, [debouncedQuery]);

    // Close on escape
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-[#020617]/80 backdrop-blur-sm flex items-start justify-center pt-[20vh] p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="w-full max-w-xl bg-[#0B0F17] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[60vh]"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center gap-3 p-4 border-b border-white/5">
                        <Search className="w-5 h-5 text-white/40" />
                        <input
                            autoFocus
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search stocks ($TSLA) or users (@username)..."
                            className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-white/30 text-lg h-8"
                        />
                        {isLoading && <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />}
                    </div>

                    <div className="overflow-y-auto p-2">
                        {/* Stocks */}
                        {results.stocks.length > 0 && (
                            <div className="mb-4">
                                <h3 className="px-3 py-2 text-xs font-bold text-white/40 uppercase tracking-wider">Stocks</h3>
                                {results.stocks.map((stock: any) => (
                                    <Link
                                        key={stock.symbol}
                                        href={`/stock/${stock.symbol}`}
                                        onClick={onClose}
                                        className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                                <TrendingUp className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-white group-hover:text-emerald-400 transition-colors">${stock.symbol}</div>
                                                <div className="text-xs text-white/40">{stock.name}</div>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-medium px-2 py-1 rounded bg-white/5 text-white/50 border border-white/5 whitespace-nowrap">{stock.market}</span>
                                    </Link>
                                ))}
                            </div>
                        )}

                        {/* Users */}
                        {results.users.length > 0 && (
                            <div className="mb-2">
                                <h3 className="px-3 py-2 text-xs font-bold text-white/40 uppercase tracking-wider">Users</h3>
                                {results.users.map((user: any) => (
                                    <Link
                                        key={user.id}
                                        href={`/profile/${user.id}`}
                                        onClick={onClose}
                                        className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center overflow-hidden">
                                                {user.avatar_url ? (
                                                    <img src={user.avatar_url} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-indigo-400 font-bold text-xs">{user.username.charAt(0).toUpperCase()}</span>
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-bold text-white group-hover:text-indigo-400 transition-colors">@{user.username}</div>
                                            </div>
                                        </div>
                                        {user.reputation_score > 0 && (
                                            <span className="text-xs bg-white/10 text-white/60 px-2 py-0.5 rounded-full">+{user.reputation_score} rep</span>
                                        )}
                                    </Link>
                                ))}
                            </div>
                        )}

                        {query.length > 1 && !isLoading && results.stocks.length === 0 && results.users.length === 0 && (
                            <div className="p-8 text-center text-white/30">
                                No results for "{query}"
                            </div>
                        )}

                        {!query && (
                            <div className="p-8 text-center">
                                <p className="text-sm text-white/30">
                                    Search for <span className="text-emerald-400 font-mono">$TSLA</span>, <span className="text-emerald-400 font-mono">$VOLV</span><br />
                                    or community members.
                                </p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
