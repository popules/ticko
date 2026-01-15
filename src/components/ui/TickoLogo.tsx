"use client";

import { motion } from "framer-motion";

export function TickoLogo({ className = "", showText = true }: { className?: string, showText?: boolean }) {
    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <div className="relative w-10 h-10 flex items-center justify-center">
                <motion.svg
                    width="40"
                    height="40"
                    viewBox="0 0 40 40"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full"
                >
                    <defs>
                        <linearGradient id="mint-frost" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#2DD4BF" />
                            <stop offset="100%" stopColor="#0D9488" />
                        </linearGradient>
                        <filter id="glass-blur" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur in="SourceGraphic" stdDeviation="1" />
                        </filter>
                    </defs>

                    {/* Geometric T Shape - Vertical Bar */}
                    <rect
                        x="14"
                        y="8"
                        width="12"
                        height="24"
                        rx="4"
                        fill="url(#mint-frost)"
                        stroke="white"
                        strokeOpacity="0.3"
                        strokeWidth="0.5"
                    />

                    {/* Geometric T Shape - Horizontal Bar (Overlapping) */}
                    <rect
                        x="8"
                        y="8"
                        width="24"
                        height="10"
                        rx="4"
                        fill="url(#mint-frost)"
                        stroke="white"
                        strokeOpacity="0.3"
                        strokeWidth="0.5"
                    />

                    {/* Shimmer Effect */}
                    <motion.rect
                        x="0"
                        y="0"
                        width="40"
                        height="40"
                        fill="white"
                        initial={{ opacity: 0, x: -40, rotate: 45 }}
                        animate={{
                            opacity: [0, 0.1, 0],
                            x: [-20, 40],
                        }}
                        transition={{
                            repeat: Infinity,
                            duration: 2,
                            repeatDelay: 8,
                            ease: "easeInOut"
                        }}
                        style={{ mixBlendMode: 'overlay' }}
                    />
                </motion.svg>
            </div>

            {showText && (
                <span className="text-2xl font-medium tracking-tight text-white lowercase" style={{ fontFamily: 'Inter, sans-serif' }}>
                    ticko
                </span>
            )}
        </div>
    );
}
