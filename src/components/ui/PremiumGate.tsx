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
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
            {/* Blurred preview - lighter blur to show more of the content */}
            <div className="opacity-50 blur-[2px] pointer-events-none select-none p-5" aria-hidden="true">
                {children}
            </div>

            {/* Overlay CTA - positioned at bottom with gradient fade */}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-t from-[#020617] via-[#020617]/60 to-transparent p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mb-3 shadow-lg shadow-emerald-500/30">
                    <Lock className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-base font-bold text-white mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    {featureName}
                </h3>
                <p className="text-xs text-white/50 mb-4 max-w-[250px]">
                    {description}
                </p>
                <Link
                    href="/registrera"
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
                >
                    Skapa konto gratis
                </Link>
                <Link
                    href="/logga-in"
                    className="mt-2 text-xs text-white/30 hover:text-white/60 transition-colors"
                >
                    Har redan konto? Logga in
                </Link>
            </div>
        </div>
    );
}
