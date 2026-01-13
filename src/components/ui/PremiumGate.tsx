"use client";

import { useAuth } from "@/providers/AuthProvider";
import { Lock, Sparkles } from "lucide-react";
import Link from "next/link";

interface PremiumGateProps {
    children: React.ReactNode;
    featureName?: string;
    description?: string;
}

export function PremiumGate({
    children,
    featureName = "Premium-funktion",
    description = "Registrera dig gratis för att låsa upp AI-analys, bevakningslistor och mycket mer."
}: PremiumGateProps) {
    const { user } = useAuth();

    if (user) {
        return <>{children}</>;
    }

    return (
        <div className="relative group">
            {/* Blurred preview */}
            <div className="opacity-30 blur-sm pointer-events-none select-none" aria-hidden="true">
                {children}
            </div>

            {/* Overlay CTA */}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-transparent via-[#020617]/80 to-[#020617]/95 rounded-2xl p-6 text-center">
                <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-violet-500/20">
                    <Lock className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    {featureName}
                </h3>
                <p className="text-sm text-white/60 mb-5 max-w-xs">
                    {description}
                </p>
                <Link
                    href="/registrera"
                    className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
                >
                    Skapa konto gratis
                </Link>
                <Link
                    href="/logga-in"
                    className="mt-3 text-sm text-white/40 hover:text-white transition-colors"
                >
                    Har redan konto? Logga in
                </Link>
            </div>
        </div>
    );
}
