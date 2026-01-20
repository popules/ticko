"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, TrendingUp, Wallet, User } from "lucide-react";
import { useSearch } from "@/providers/SearchProvider";

export function MobileNav() {
    const pathname = usePathname();
    const { open } = useSearch();

    const navItems = [
        { icon: Home, label: "Home", href: "/" },
        { icon: Search, label: "Search", action: open },
        { icon: TrendingUp, label: "Market", href: "/marknad" },
        { icon: Wallet, label: "Portfolio", href: "/portfolio" },
        { icon: User, label: "Profile", href: "/profil" },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#0B0F17]/95 backdrop-blur-xl border-t border-white/10 safe-area-inset-bottom">
            <div className="flex items-center justify-around py-2 px-4">
                {navItems.map((item, idx) => {
                    const isActive = item.href ? pathname === item.href : false;
                    const Icon = item.icon;

                    if (item.action) {
                        return (
                            <button
                                key={idx}
                                onClick={item.action}
                                className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-white/40 hover:text-white transition-all"
                            >
                                <Icon className="w-6 h-6 transition-transform" />
                                <span className="text-[10px] font-medium">{item.label}</span>
                            </button>
                        );
                    }

                    return (
                        <Link
                            key={item.href}
                            href={item.href!}
                            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${isActive
                                ? "text-emerald-400"
                                : "text-white/40 hover:text-white/60"
                                }`}
                        >
                            <Icon className={`w-6 h-6 ${isActive ? "scale-110" : ""} transition-transform`} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
