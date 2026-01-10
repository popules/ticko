"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Sparkles, TrendingUp, Wallet, User } from "lucide-react";

const navItems = [
    { icon: Home, label: "Hem", href: "/" },
    { icon: Sparkles, label: "Upptäck", href: "/upptack" },
    { icon: TrendingUp, label: "Marknad", href: "/marknad" },
    { icon: Wallet, label: "Portfölj", href: "/portfolio" },
    { icon: User, label: "Profil", href: "/profil" },
];

export function MobileNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#0B0F17]/95 backdrop-blur-xl border-t border-white/10 safe-area-inset-bottom">
            <div className="flex items-center justify-around py-2 px-4">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
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
