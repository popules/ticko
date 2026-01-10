"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
    Home,
    TrendingUp,
    Star,
    Bell,
    User,
    Settings,
    Search,
    Flame,
    Sparkles,
} from "lucide-react";
import { APP_CONFIG, UI_STRINGS } from "@/config/app";
import { SentimentGauge } from "@/components/analysis/SentimentGauge";
import { getTrendingStocks } from "@/lib/stocks";

// Trending data from library
const trendingTickers = getTrendingStocks();

const navItems = [
    { icon: Home, label: UI_STRINGS.home, href: "/" },
    { icon: Sparkles, label: UI_STRINGS.discovery, href: "/upptack", isNew: true },
    { icon: TrendingUp, label: UI_STRINGS.markets, href: "/marknad" },
    { icon: Star, label: UI_STRINGS.watchlist, href: "/watchlist" },
    { icon: Bell, label: UI_STRINGS.alerts, href: "/alerts" },
    { icon: User, label: UI_STRINGS.profile, href: "/profil" },
];

export function Sidebar() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchResults = async () => {
            if (searchQuery.length < 2) {
                setSearchResults([]);
                setShowDropdown(false);
                return;
            }

            setIsSearching(true);
            try {
                const res = await fetch(`/api/stocks/search?q=${encodeURIComponent(searchQuery)}`);
                const data = await res.json();
                setSearchResults(data.results || []);
                setShowDropdown(true);
            } catch (error) {
                console.error("Search failed:", error);
            } finally {
                setIsSearching(false);
            }
        };

        const timer = setTimeout(fetchResults, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && searchQuery.trim()) {
            if (searchResults.length > 0) {
                router.push(`/aktie/${searchResults[0].symbol}`);
            } else {
                const ticker = searchQuery.trim().replace("$", "").toUpperCase();
                router.push(`/aktie/${ticker}`);
            }
            setSearchQuery("");
            setShowDropdown(false);
        }
    };

    const handleSelectResult = (symbol: string) => {
        router.push(`/aktie/${symbol}`);
        setSearchQuery("");
        setShowDropdown(false);
    };

    return (
        <aside className="w-64 h-screen sticky top-0 flex flex-col border-r border-white/10 bg-white/[0.02] backdrop-blur-xl">
            {/* Logo */}
            <div className="p-5 border-b border-white/10">
                <Link href="/" className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold text-white tracking-tight">
                        {APP_CONFIG.name}
                    </span>
                </Link>
            </div>

            {/* Search */}
            <div className="p-4 relative" ref={dropdownRef}>
                <div className="flex items-center gap-3 px-4 py-3 bg-white/[0.06] rounded-2xl text-white/60 border border-white/10 focus-within:border-emerald-500/50 transition-all">
                    <Search className={`w-4 h-4 ${isSearching ? "animate-pulse text-emerald-400" : ""}`} />
                    <input
                        type="text"
                        placeholder={UI_STRINGS.search}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleSearch}
                        onFocus={() => searchQuery.length >= 2 && setShowDropdown(true)}
                        className="bg-transparent border-none outline-none text-sm flex-1 placeholder:text-white/40 text-white"
                    />
                </div>

                {/* Dropdown Results */}
                {showDropdown && searchResults.length > 0 && (
                    <div className="absolute left-4 right-4 top-full mt-2 bg-[#0B0F17]/95 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl z-50 overflow-hidden">
                        <div className="max-h-[300px] overflow-y-auto py-2 scrollbar-hide">
                            {searchResults.map((result) => (
                                <button
                                    key={result.symbol}
                                    onClick={() => handleSelectResult(result.symbol)}
                                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.06] transition-all text-left"
                                >
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-sm font-bold text-white">${result.symbol}</span>
                                        <span className="text-[10px] text-white/40 truncate max-w-[140px]">
                                            {result.name}
                                        </span>
                                    </div>
                                    <div className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.04] text-white/30 border border-white/5 uppercase">
                                        {result.exchDisp}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="p-3">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center justify-between px-4 py-3 rounded-2xl text-white/70 hover:text-white hover:bg-white/[0.06] transition-all group"
                    >
                        <div className="flex items-center gap-3">
                            <item.icon className={`w-5 h-5 ${item.isNew ? "text-emerald-400" : ""}`} />
                            <span className="font-medium">{item.label}</span>
                        </div>
                        {item.isNew && (
                            <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-md border border-emerald-500/20 group-hover:bg-emerald-500/30 transition-colors">
                                NY
                            </span>
                        )}
                    </Link>
                ))}
            </nav>

            {/* Trending Section */}
            <div className="flex-1 p-4 overflow-y-auto scrollbar-hide">
                <div className="flex items-center gap-2 px-3 mb-4">
                    <Flame className="w-4 h-4 text-orange-400" />
                    <span className="text-sm font-semibold text-white">
                        {UI_STRINGS.trending}
                    </span>
                </div>

                <div className="space-y-2">
                    {trendingTickers.map((ticker) => (
                        <Link
                            key={ticker.symbol}
                            href={`/aktie/${ticker.symbol}`}
                            className="block p-3 rounded-2xl hover:bg-white/[0.06] transition-all border border-transparent hover:border-white/10"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold text-white text-sm">
                                    ${ticker.symbol}
                                </span>
                                <span
                                    className={`text-xs font-medium tabular-nums ${ticker.change >= 0 ? "text-emerald-400" : "text-rose-400"
                                        }`}
                                >
                                    {ticker.change >= 0 ? "+" : ""}
                                    {ticker.change.toFixed(2)}%
                                </span>
                            </div>
                            <p className="text-xs text-white/50 mb-2 truncate">
                                {ticker.name}
                            </p>
                            <SentimentGauge
                                bullishPercent={ticker.sentiment ?? 50}
                                size="sm"
                                showLabels={false}
                            />
                        </Link>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/10">
                <Link
                    href="/settings"
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl text-white/70 hover:text-white hover:bg-white/[0.06] transition-all"
                >
                    <Settings className="w-5 h-5" />
                    <span className="font-medium">{UI_STRINGS.settings}</span>
                </Link>
            </div>
        </aside>
    );
}
