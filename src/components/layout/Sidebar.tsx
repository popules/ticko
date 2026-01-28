"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { SearchDialog } from "./SearchDialog";
import {
    Home,
    TrendingUp,
    Star,
    User,
    Settings,
    Search,
    Trophy,
    Sparkles,
    Gamepad2,
    LogOut,
    Menu,
    X,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { APP_CONFIG, UI_STRINGS } from "@/config/app";
import { TickoLogo } from "@/components/ui/TickoLogo";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useAuth } from "@/providers/AuthProvider";
import { useSearch } from "@/providers/SearchProvider";
import { motion, AnimatePresence } from "framer-motion";

// Navigation Items
const navItems = [
    { icon: Home, label: UI_STRINGS.home, href: "/" },
    { icon: Sparkles, label: UI_STRINGS.discovery, href: "/discover" },
    { icon: TrendingUp, label: UI_STRINGS.markets, href: "/market" },
    { icon: Gamepad2, label: "Paper Trading", href: "/paper-trading" },
    { icon: Star, label: UI_STRINGS.watchlist, href: "/watchlist" },
    { icon: Trophy, label: "Leaderboard", href: "/leaderboard" },
    { icon: User, label: UI_STRINGS.profile, href: "/profile" },
];

export function Sidebar() {
    const { open } = useSearch();
    const { user, signOut } = useAuth();
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileOpen(false);
    }, [pathname]);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (mobileOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [mobileOpen]);

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

    const SidebarContent = () => (
        <>
            {/* Logo & Notifications */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
                <Link href="/" className="flex items-center" onClick={() => setMobileOpen(false)}>
                    <TickoLogo />
                </Link>
                <div className="flex items-center gap-2">
                    <NotificationBell />
                    {/* Mobile close button */}
                    <button
                        onClick={() => setMobileOpen(false)}
                        className="md:hidden p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Search Trigger */}
            <div className="p-4">
                <button
                    onClick={() => {
                        open();
                        setMobileOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-white/[0.06] rounded-2xl text-white/40 border border-white/10 hover:border-emerald-500/50 hover:text-white transition-all text-sm group"
                >
                    <Search className="w-4 h-4 group-hover:text-emerald-400 transition-colors" />
                    <span>{UI_STRINGS.search}</span>
                    <span className="ml-auto text-xs bg-white/10 px-1.5 py-0.5 rounded text-white/30 font-medium hidden sm:inline">⌘K</span>
                </button>
            </div>

            {/* Navigation */}
            <nav className="p-3 flex-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href ||
                        (item.href !== "/" && pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className={`flex items-center justify-between px-4 py-2.5 rounded-2xl transition-all group ${isActive
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "text-white/70 hover:text-white hover:bg-white/[0.06] border border-transparent"
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon className={`w-4 h-4 ${isActive ? "text-emerald-400" : ""}`} />
                                <span className="text-[13px] font-medium">{item.label}</span>
                            </div>
                        </Link>
                    );
                })}
            </nav>

            {/* Spacer */}
            <div className="flex-1 md:block hidden" />

            {/* Footer */}
            <div className="p-3 border-t border-white/10 space-y-1">
                <Link
                    href="/settings"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-2xl text-white/70 hover:text-white hover:bg-white/[0.06] transition-all"
                >
                    <Settings className="w-4 h-4" />
                    <span className="text-[13px] font-medium">{UI_STRINGS.settings}</span>
                </Link>
                {user ? (
                    <button
                        onClick={() => {
                            signOut();
                            setMobileOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-white/40 hover:text-rose-400 hover:bg-rose-400/10 transition-all group"
                    >
                        <LogOut className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                        <span className="text-[13px] font-medium">Log out</span>
                    </button>
                ) : (
                    <Link
                        href="/login"
                        onClick={() => setMobileOpen(false)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-white/70 hover:text-emerald-400 hover:bg-emerald-400/10 transition-all group"
                    >
                        <LogOut className="w-4 h-4 rotate-180 group-hover:-rotate-[168deg] transition-transform" />
                        <span className="text-[13px] font-medium">Log in</span>
                    </Link>
                )}
            </div>

            {/* Footer Links for logged-in users */}
            <div className="px-4 pb-4 hidden md:block">
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-white/20">
                    <Link href="/community-guidelines" className="hover:text-white/50 transition-colors">Guidelines</Link>
                    <Link href="/terms" className="hover:text-white/50 transition-colors">Terms</Link>
                    <Link href="/privacy" className="hover:text-white/50 transition-colors">Privacy</Link>
                    <Link href="/about" className="hover:text-white/50 transition-colors">About</Link>
                    <Link href="/contact" className="hover:text-white/50 transition-colors">Contact</Link>
                </div>
            </div>
        </>
    );

    return (
        <>
            {/* Mobile Header Bar */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#020617]/95 backdrop-blur-xl border-b border-white/10 z-50 flex items-center justify-between px-4">
                <button
                    onClick={() => setMobileOpen(true)}
                    className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                >
                    <Menu className="w-6 h-6" />
                </button>
                <Link href="/">
                    <TickoLogo />
                </Link>
                {user ? (
                    <NotificationBell />
                ) : (
                    <Link
                        href="/login"
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-sm font-bold border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors"
                    >
                        Log in
                    </Link>
                )}
            </div>

            {/* Mobile Spacer */}
            <div className="md:hidden h-16" />

            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-64 h-screen sticky top-0 flex-col border-r border-white/10 bg-white/[0.02] backdrop-blur-xl z-50">
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileOpen(false)}
                            className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
                        />

                        {/* Sidebar */}
                        <motion.aside
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="md:hidden fixed inset-y-0 left-0 w-72 flex flex-col bg-[#020617] border-r border-white/10 z-[70] overflow-y-auto"
                        >
                            <SidebarContent />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
