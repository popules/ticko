"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { SearchDialog } from "./SearchDialog";
import {
    Home,
    TrendingUp,
    Star,
    Bell,
    User,
    Settings,
    Search,
    Flame,
    Trophy,
    Sparkles,
    Wallet,
    Loader2,
    LogOut,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { APP_CONFIG, UI_STRINGS } from "@/config/app";
import { SentimentGauge } from "@/components/analysis/SentimentGauge";
import { getTrendingStocks } from "@/lib/stocks";
import { TickoLogo } from "@/components/ui/TickoLogo";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useAuth } from "@/providers/AuthProvider";

// Navigation Items
const navItems = [
    { icon: Home, label: UI_STRINGS.home, href: "/" },
    { icon: Sparkles, label: UI_STRINGS.discovery, href: "/upptack", isNew: true },
    { icon: TrendingUp, label: UI_STRINGS.markets, href: "/marknad" },
    { icon: Wallet, label: "Portfölj", href: "/portfolio" },
    { icon: Star, label: UI_STRINGS.watchlist, href: "/watchlist" },
    { icon: Trophy, label: "Topplistan", href: "/leaderboard" },
    { icon: Bell, label: UI_STRINGS.alerts, href: "/alerts" },
    { icon: User, label: UI_STRINGS.profile, href: "/profil" },
];

import { useSearch } from "@/providers/SearchProvider";

// ...

export function Sidebar() {
    const { open } = useSearch();
    const { signOut } = useAuth();
    const pathname = usePathname();

    // Fetch live trending snippets
    const { data: trendingData, isLoading: isTrendingLoading } = useQuery({
        queryKey: ["trending-stocks"],
        queryFn: async () => {
            const res = await fetch("/api/stocks/trending");
            const data = await res.json();
            return data.stocks || [];
        },
        refetchInterval: 60000,
    });



    return (
        <aside className="w-64 h-screen sticky top-0 flex flex-col border-r border-white/10 bg-white/[0.02] backdrop-blur-xl z-50">
            {/* Logo & Notifications */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
                <Link href="/" className="flex items-center">
                    <TickoLogo />
                </Link>
                <NotificationBell />
            </div>

            {/* Search Trigger */}
            <div className="p-4">
                <button
                    onClick={() => open()}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-white/[0.06] rounded-2xl text-white/40 border border-white/10 hover:border-emerald-500/50 hover:text-white transition-all text-sm group"
                >
                    <Search className="w-4 h-4 group-hover:text-emerald-400 transition-colors" />
                    <span>{UI_STRINGS.search}</span>
                    <span className="ml-auto text-xs bg-white/10 px-1.5 py-0.5 rounded text-white/30 font-medium">⌘K</span>
                </button>
            </div>

            {/* Navigation */}
            <nav className="p-3">
                {navItems.map((item) => {
                    const isActive = pathname === item.href ||
                        (item.href !== "/" && pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center justify-between px-4 py-2.5 rounded-2xl transition-all group ${isActive
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                    : "text-white/70 hover:text-white hover:bg-white/[0.06] border border-transparent"
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon className={`w-4 h-4 ${isActive ? "text-emerald-400" : item.isNew ? "text-emerald-400" : ""}`} />
                                <span className="text-[13px] font-medium">{item.label}</span>
                            </div>
                            {item.isNew && (
                                <span className="text-[9px] font-bold bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-md border border-emerald-500/20 group-hover:bg-emerald-500/30 transition-colors">
                                    NY
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Trending Section */}
            <div className="flex-1 p-4 overflow-y-auto scrollbar-hide">
                <div className="flex items-center gap-2 px-3 mb-3">
                    <Flame className="w-3.5 h-3.5 text-orange-400" />
                    <span className="text-[11px] font-bold text-white/40 uppercase tracking-widest">
                        {UI_STRINGS.trending}
                    </span>
                    {isTrendingLoading && <Loader2 className="w-3 h-3 animate-spin text-white/20 ml-auto" />}
                </div>

                <div className="space-y-2">
                    {isTrendingLoading ? (
                        // Skeleton Skeletons
                        [1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="p-3 rounded-2xl bg-white/[0.03] animate-pulse">
                                <div className="flex justify-between mb-2">
                                    <div className="h-4 w-12 bg-white/10 rounded" />
                                    <div className="h-4 w-10 bg-white/10 rounded" />
                                </div>
                                <div className="h-3 w-20 bg-white/5 rounded" />
                            </div>
                        ))
                    ) : (
                        trendingData?.map((ticker: any) => (
                            <Link
                                key={ticker.symbol}
                                href={`/aktie/${ticker.symbol}`}
                                className="block p-3 rounded-2xl hover:bg-white/[0.06] transition-all border border-transparent hover:border-white/10"
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-bold text-white text-[13px]">
                                        ${ticker.symbol.split('.')[0]}
                                    </span>
                                    <span
                                        className={`text-[11px] font-bold tabular-nums ${ticker.changePercent >= 0 ? "text-emerald-400" : "text-rose-400"
                                            }`}
                                    >
                                        {ticker.changePercent >= 0 ? "+" : ""}
                                        {ticker.changePercent.toFixed(2)}%
                                    </span>
                                </div>
                                <p className="text-[10px] text-white/40 mb-2 truncate">
                                    {ticker.name}
                                </p>
                                <SentimentGauge
                                    bullishPercent={ticker.bullishPercent ?? 50}
                                    size="sm"
                                    showLabels={false}
                                />
                            </Link>
                        ))
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-white/10 space-y-1">
                <Link
                    href="/settings"
                    className="flex items-center gap-3 px-4 py-2.5 rounded-2xl text-white/70 hover:text-white hover:bg-white/[0.06] transition-all"
                >
                    <Settings className="w-4 h-4" />
                    <span className="text-[13px] font-medium">{UI_STRINGS.settings}</span>
                </Link>
                <button
                    onClick={() => signOut()}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-white/40 hover:text-rose-400 hover:bg-rose-400/10 transition-all group"
                >
                    <LogOut className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                    <span className="text-[13px] font-medium">Logga ut</span>
                </button>
            </div>
        </aside>
    );
}
