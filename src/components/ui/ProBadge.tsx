"use client";

import { Star } from "lucide-react";

interface ProBadgeProps {
    size?: "xs" | "sm" | "md";
    className?: string;
}

export function ProBadge({ size = "sm", className = "" }: ProBadgeProps) {
    const sizeClasses = {
        xs: "w-3.5 h-3.5 text-[8px]",
        sm: "w-4 h-4 text-[9px]",
        md: "w-5 h-5 text-[10px]",
    };

    return (
        <div
            className={`inline-flex items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-bold ${sizeClasses[size]} ${className}`}
            title="Pro Member"
        >
            <Star className="w-2/3 h-2/3 fill-current" />
        </div>
    );
}

interface ProBadgeInlineProps {
    className?: string;
}

export function ProBadgeInline({ className = "" }: ProBadgeInlineProps) {
    return (
        <span
            className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 border border-violet-500/30 text-violet-400 text-[10px] font-bold ${className}`}
        >
            <Star className="w-2.5 h-2.5 fill-current" />
            PRO
        </span>
    );
}
