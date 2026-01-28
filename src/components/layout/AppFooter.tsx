"use client";

import Link from "next/link";

export function AppFooter() {
    return (
        <footer className="w-full py-6 px-6 border-t border-white/5 bg-[#020617]/50 mt-auto">
            <div className="max-w-2xl mx-auto">
                <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-white/30">
                    <Link href="/community-guidelines" className="hover:text-white/60 transition-colors">
                        Community Guidelines
                    </Link>
                    <Link href="/contact" className="hover:text-white/60 transition-colors">
                        Contact
                    </Link>
                </div>
                <p className="text-center text-[10px] text-white/15 mt-3">
                    © {new Date().getFullYear()} Ticko Markets. Not financial advice.
                </p>
            </div>
        </footer>
    );
}
