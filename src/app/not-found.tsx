"use client";

import Link from "next/link";
import { MoveLeft, Search } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 text-center">
            <div className="max-w-md w-full">
                <div className="mb-8 relative">
                    <div className="w-32 h-32 bg-emerald-500/10 rounded-full mx-auto flex items-center justify-center border border-emerald-500/20 shadow-[0_0_40px_-10px_rgba(16,185,129,0.3)]">
                        <Search className="w-12 h-12 text-emerald-400" />
                    </div>
                </div>

                <h1 className="text-4xl font-black text-white tracking-tighter mb-4">404</h1>
                <p className="text-xl text-white/60 font-medium mb-8 leading-relaxed">
                    Vi hittade inte sidan du letade efter. <br />
                    <span className="text-emerald-400 italic">Men vi kan hjälpa dig hitta vinnare på marknaden.</span>
                </p>

                <div className="flex flex-col gap-3">
                    <Link
                        href="/marknad"
                        className="w-full px-6 py-4 bg-emerald-500 hover:bg-emerald-400 text-[#020617] rounded-xl font-bold text-lg transition-all"
                    >
                        Gå till Marknaden
                    </Link>
                    <Link
                        href="/"
                        className="w-full px-6 py-4 bg-white/[0.04] text-white hover:bg-white/[0.08] rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                    >
                        <MoveLeft className="w-4 h-4" />
                        Tillbaka hem
                    </Link>
                </div>
            </div>
        </div>
    );
}
