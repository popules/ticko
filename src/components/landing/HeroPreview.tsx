"use client";

import { motion } from "framer-motion";
import { Trophy, TrendingUp, ArrowUpRight, ArrowDownRight, MessageCircle, Heart, Bell } from "lucide-react";
import { useEffect, useState } from "react";

// Realistic mock data
const mockPosts = [
    {
        user: "Erik_Investerar",
        avatar: "🧑‍💼",
        ticker: "$VOLV-B",
        tickerColor: "text-emerald-400",
        sentiment: "bullish",
        text: "Stark Q4-rapport! Orderingången överträffar förväntningarna. Håller min position.",
        likes: 24,
        comments: 8,
        time: "2 min",
    },
    {
        user: "AnnaTrader",
        avatar: "👩‍💻",
        ticker: "$ERIC-B",
        tickerColor: "text-violet-400",
        sentiment: "bearish",
        text: "Lite orolig över 5G-marknaden just nu. Avvaktar tills vi ser bättre signaler.",
        likes: 12,
        comments: 5,
        time: "5 min",
    },
];

const topUsers = [
    { rank: 1, name: "StockMaster", score: "94%", emoji: "🥇" },
    { rank: 2, name: "NordicInvestor", score: "89%", emoji: "🥈" },
    { rank: 3, name: "TechTrader", score: "85%", emoji: "🥉" },
];

const tickerTapeItems = [
    "Erik_Investerar köpte $VOLV-B",
    "AnnaTrader bevakar $SEB-A",
    "StockMaster sålde $HM-B",
    "NordicInvestor gillade ett inlägg",
    "TechTrader kommenterade på $ERIC-B",
];

const trendingStocks = [
    { ticker: "VOLV-B", price: "289,50", change: "+2.4%", up: true },
    { ticker: "ERIC-B", price: "78,20", change: "-1.2%", up: false },
    { ticker: "SEB-A", price: "142,80", change: "+0.8%", up: true },
];

export function HeroPreview() {
    const [likeCount, setLikeCount] = useState(24);

    // Animate likes
    useEffect(() => {
        const interval = setInterval(() => {
            setLikeCount((prev) => prev + 1);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative w-full max-w-5xl mx-auto -mt-10 mb-32 perspective-[2000px]">
            {/* Enhanced glow effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] bg-emerald-500/25 blur-[150px] rounded-full animate-pulse" />
            <div className="absolute top-1/3 left-1/3 w-[40%] h-[40%] bg-violet-500/15 blur-[100px] rounded-full" />

            <motion.div
                initial={{ rotateX: 20, y: 100, opacity: 0 }}
                animate={{ rotateX: 10, y: 0, opacity: 1 }}
                transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                className="relative bg-[#0B0F17]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden transform-style-3d rotate-x-12"
            >
                {/* Mock Browser Bar */}
                <div className="h-10 border-b border-white/10 bg-white/[0.02] flex items-center px-4 gap-2">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-rose-500/30 border border-rose-500/50" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/30 border border-yellow-500/50" />
                        <div className="w-3 h-3 rounded-full bg-emerald-500/30 border border-emerald-500/50" />
                    </div>
                    <div className="ml-4 h-6 w-64 bg-white/5 rounded-md flex items-center px-3">
                        <span className="text-[10px] text-white/30">ticko.se</span>
                    </div>
                    {/* Live indicator */}
                    <div className="ml-auto flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Live</span>
                    </div>
                </div>

                {/* Animated Ticker Tape */}
                <div className="h-8 border-b border-white/5 bg-emerald-500/5 overflow-hidden relative">
                    <motion.div
                        animate={{ x: [0, -1000] }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute whitespace-nowrap flex items-center h-full gap-8 text-[11px] text-white/40"
                    >
                        {[...tickerTapeItems, ...tickerTapeItems].map((item, i) => (
                            <span key={i} className="flex items-center gap-2">
                                <span className="w-1 h-1 rounded-full bg-emerald-500/50" />
                                {item}
                            </span>
                        ))}
                    </motion.div>
                </div>

                {/* Mock Content */}
                <div className="p-6 grid grid-cols-12 gap-6 h-[480px] overflow-hidden">
                    {/* Sidebar Mock */}
                    <div className="col-span-3 border-r border-white/10 pr-6 space-y-4">
                        <div className="h-8 w-8 bg-emerald-500/20 rounded-lg mb-6 flex items-center justify-center">
                            <TrendingUp className="w-4 h-4 text-emerald-400" />
                        </div>

                        {/* Trending Stocks */}
                        <div className="space-y-2">
                            <span className="text-[10px] font-bold text-white/30 uppercase tracking-wider">Trending</span>
                            {trendingStocks.map((stock, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.8 + i * 0.1 }}
                                    className="h-10 w-full bg-white/[0.03] hover:bg-white/[0.06] rounded-xl flex items-center justify-between px-3 cursor-pointer transition-colors group"
                                >
                                    <span className="text-xs font-semibold text-white/70 group-hover:text-white">${stock.ticker}</span>
                                    <div className="flex items-center gap-1">
                                        {stock.up ? (
                                            <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                                        ) : (
                                            <ArrowDownRight className="w-3 h-3 text-rose-400" />
                                        )}
                                        <span className={`text-[10px] font-bold ${stock.up ? "text-emerald-400" : "text-rose-400"}`}>
                                            {stock.change}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Nav items */}
                        <div className="pt-4 space-y-2">
                            {["Hem", "Upptäck", "Bevakningar"].map((item, i) => (
                                <div key={i} className="h-9 w-full bg-white/[0.02] rounded-lg flex items-center px-3">
                                    <span className="text-[11px] text-white/40">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Feed Mock */}
                    <div className="col-span-6 space-y-4">
                        {/* Stock highlight card */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                            className="h-20 w-full bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 rounded-2xl flex items-center p-4 gap-4"
                        >
                            <div className="h-12 w-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-emerald-400" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-bold text-white">$VOLV-B</span>
                                    <span className="text-xs text-emerald-400 font-semibold">289,50 kr</span>
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">+2.4%</span>
                                </div>
                                <div className="text-[11px] text-white/40">Volvo Group • Mest diskuterad idag</div>
                            </div>
                            {/* Mini chart */}
                            <svg className="w-20 h-10" viewBox="0 0 80 40">
                                <path
                                    d="M0 35 Q20 30, 30 25 T50 15 T80 5"
                                    fill="none"
                                    stroke="rgb(16 185 129)"
                                    strokeWidth="2"
                                    className="drop-shadow-lg"
                                />
                                <path
                                    d="M0 35 Q20 30, 30 25 T50 15 T80 5 L80 40 L0 40 Z"
                                    fill="url(#chartGradient)"
                                    opacity="0.3"
                                />
                                <defs>
                                    <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stopColor="rgb(16 185 129)" />
                                        <stop offset="100%" stopColor="transparent" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </motion.div>

                        {/* Posts */}
                        {mockPosts.map((post, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.9 + i * 0.15 }}
                                className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-3 hover:bg-white/[0.04] transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center text-lg">
                                        {post.avatar}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold text-white/90">{post.user}</span>
                                            <span className={`text-xs font-bold ${post.tickerColor}`}>{post.ticker}</span>
                                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase ${post.sentiment === "bullish"
                                                    ? "bg-emerald-500/20 text-emerald-400"
                                                    : "bg-rose-500/20 text-rose-400"
                                                }`}>
                                                {post.sentiment === "bullish" ? "🐂 Bull" : "🐻 Bear"}
                                            </span>
                                        </div>
                                        <span className="text-[10px] text-white/30">{post.time} sedan</span>
                                    </div>
                                </div>
                                <p className="text-[13px] text-white/60 leading-relaxed">{post.text}</p>
                                <div className="flex items-center gap-4 pt-1">
                                    <div className="flex items-center gap-1.5 text-white/30 hover:text-rose-400 transition-colors cursor-pointer">
                                        <Heart className="w-4 h-4" />
                                        <motion.span
                                            key={i === 0 ? likeCount : post.likes}
                                            initial={{ scale: 1.2, color: "rgb(248 113 113)" }}
                                            animate={{ scale: 1, color: "inherit" }}
                                            className="text-[11px] font-medium"
                                        >
                                            {i === 0 ? likeCount : post.likes}
                                        </motion.span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-white/30 hover:text-blue-400 transition-colors cursor-pointer">
                                        <MessageCircle className="w-4 h-4" />
                                        <span className="text-[11px] font-medium">{post.comments}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Right Panel Mock */}
                    <div className="col-span-3 border-l border-white/10 pl-6 space-y-5">
                        {/* Leaderboard */}
                        <motion.div
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 1 }}
                            className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <Trophy className="w-4 h-4 text-amber-500" />
                                <span className="text-[11px] font-bold text-white/60 uppercase tracking-wider">Topplistan</span>
                            </div>
                            {topUsers.map((user, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 1.1 + i * 0.1 }}
                                    className="flex items-center gap-3 mb-3 last:mb-0"
                                >
                                    <span className="text-base">{user.emoji}</span>
                                    <div className="flex-1">
                                        <span className="text-xs font-medium text-white/70">{user.name}</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-emerald-400">{user.score}</span>
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* Notification popup */}
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ delay: 1.5 }}
                            className="p-3 bg-gradient-to-r from-violet-500/10 to-violet-500/5 border border-violet-500/20 rounded-xl"
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <Bell className="w-3.5 h-3.5 text-violet-400" />
                                <span className="text-[10px] font-bold text-violet-400">Ny notis</span>
                            </div>
                            <p className="text-[11px] text-white/50">StockMaster kommenterade på din analys av $VOLV-B</p>
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
