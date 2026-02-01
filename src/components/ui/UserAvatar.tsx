"use client";

import { cn } from "@/lib/utils";
import { User } from "lucide-react";

interface UserAvatarProps {
    src?: string | null;
    username?: string;
    frame?: string | null;
    size?: "sm" | "md" | "lg" | "xl" | "2xl";
    className?: string;
}

export function UserAvatar({ src, username, frame, size = "md", className }: UserAvatarProps) {
    const sizeClasses = {
        sm: "w-8 h-8 text-[10px]",
        md: "w-10 h-10 text-xs",
        lg: "w-16 h-16 text-lg",
        xl: "w-24 h-24 text-3xl",
        "2xl": "w-32 h-32 text-4xl"
    };

    const getFrameStyles = (frameName: string) => {
        switch (frameName) {
            case "gold":
                return "ring-4 ring-yellow-400 ring-offset-2 ring-offset-[#0B0F17] shadow-[0_0_15px_rgba(250,204,21,0.5)]";
            case "neon":
                return "ring-4 ring-fuchsia-500 ring-offset-2 ring-offset-[#0B0F17] shadow-[0_0_15px_rgba(217,70,239,0.5)] animate-pulse";
            case "emerald":
                return "ring-4 ring-emerald-500 ring-offset-2 ring-offset-[#0B0F17] shadow-[0_0_15px_rgba(16,185,129,0.5)]";
            case "diamond":
                return "ring-4 ring-cyan-400 ring-offset-2 ring-offset-[#0B0F17] shadow-[0_0_20px_rgba(34,211,238,0.6)]";
            default:
                return "";
        }
    };

    return (
        <div className={cn("relative shrink-0", sizeClasses[size], className)}>
            {/* Avatar Container */}
            <div className={cn(
                "w-full h-full rounded-full bg-gradient-to-br from-emerald-400 to-blue-600 p-[2px] overflow-hidden relative z-10",
                frame && getFrameStyles(frame)
            )}>
                <div className="w-full h-full rounded-full bg-[#0B0F17] flex items-center justify-center overflow-hidden">
                    {src ? (
                        <img
                            src={src}
                            alt={username || "User"}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <span className="font-black text-white/80 uppercase">
                            {username ? username.charAt(0) : <User className="w-1/2 h-1/2" />}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
