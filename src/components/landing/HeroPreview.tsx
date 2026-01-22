"use client";

import { motion } from "framer-motion";
import { Trophy, TrendingUp, ArrowUpRight, ArrowDownRight, MessageCircle, Heart, Bell } from "lucide-react";
import { useEffect, useState } from "react";

// Realistic mock data
const mockPosts = [
    {
        user: "TraderMike",
        avatar: "🧑‍💼",
        ticker: "$TSLA",
        tickerColor: "text-emerald-400",
        sentiment: "bullish",
        text: "Strong Q4 report! Order intake exceeds expectations. Holding my position.",
        likes: 24,
        comments: 8,
        time: "2 min",
    },
    {
        user: "AnnaTrader",
        avatar: "👩‍💻",
        ticker: "$AAPL",
        tickerColor: "text-violet-400",
        sentiment: "bearish",
        text: "A bit worried about the smartphone market right now. Waiting for better signals.",
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
    "TraderMike bought $TSLA",
    "AnnaTrader is watching $AAPL",
    "StockMaster sold $MSFT",
    "NordicInvestor liked a post",
    "TechTrader commented on $NVDA",
];

const trendingStocks = [
    { ticker: "TSLA", price: "248.50", change: "+2.4%", up: true },
    { ticker: "AAPL", price: "178.20", change: "-1.2%", up: false },
    { ticker: "NVDA", price: "542.80", change: "+0.8%", up: true },
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
        <div className="relative w-full max-w-5xl mx-auto -mt-4 md:-mt-10 mb-16 md:mb-32 perspective-[2000px]">
            {/* Enhanced glow effect - reduced on mobile */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] bg-emerald-500/20 md:bg-emerald-500/25 blur-[100px] md:blur-[150px] rounded-full animate-pulse" />
            <div className="absolute top-1/3 left-1/3 w-[40%] h-[40%] bg-violet-500/10 md:bg-violet-500/15 blur-[80px] md:blur-[100px] rounded-full hidden md:block" />

            <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
                className="relative bg-[#0B0F17]/90 backdrop-blur-xl border border-white/10 rounded-xl md:rounded-2xl shadow-2xl overflow-hidden"
            >
                {/* Mock Browser Bar - simplified on mobile */}
                <div className="h-8 md:h-10 border-b border-white/10 bg-white/[0.02] flex items-center px-3 md:px-4 gap-2">
                    <div className="flex gap-1 md:gap-1.5">
                        <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-rose-500/30 border border-rose-500/50" />
                        <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-yellow-500/30 border border-yellow-500/50" />
                        <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-emerald-500/30 border border-emerald-500/50" />
                    </div>
                    <div className="ml-2 md:ml-4 h-5 md:h-6 flex-1 max-w-[200px] md:w-64 bg-white/5 rounded-md flex items-center px-2 md:px-3">
                        <span className="text-[9px] md:text-[10px] text-white/30 truncate">tickomarkets.com</span>
                    </div>
                    {/* Live indicator */}
                    <div className="ml-auto flex items-center gap-1 md:gap-2">
                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[9px] md:text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Live</span>
                    </div>
                </div>

                {/* Animated Ticker Tape */}
                <div className="h-6 md:h-8 border-b border-white/5 bg-emerald-500/5 overflow-hidden relative">
                    <motion.div
                        animate={{ x: [0, -1000] }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute whitespace-nowrap flex items-center h-full gap-4 md:gap-8 text-[10px] md:text-[11px] text-white/40"
                    >
                        {[...tickerTapeItems, ...tickerTapeItems].map((item, i) => (
                            <span key={i} className="flex items-center gap-1 md:gap-2">
                                <span className="w-1 h-1 rounded-full bg-emerald-500/50" />
                                {item}
                            </span>
                        ))}
                    </motion.div>
                </div>

                {/* Mock Content - Responsive Grid */}
                <div className="p-3 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 min-h-[280px] md:h-[480px] overflow-hidden">
                    {/* Sidebar Mock - Hidden on mobile */}
                    <div className="hidden md:block col-span-3 border-r border-white/10 pr-6 space-y-4">
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
                            {["Home", "Discover", "Watchlist"].map((item, i) => (
                                <div key={i} className="h-9 w-full bg-white/[0.02] rounded-lg flex items-center px-3">
                                    <span className="text-[11px] text-white/40">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Feed Mock - Full width on mobile */}
                    <div className="col-span-1 md:col-span-6 space-y-3 md:space-y-4">
                        {/* Stock highlight card */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                            className="h-16 md:h-20 w-full bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 rounded-xl md:rounded-2xl flex items-center p-3 md:p-4 gap-3 md:gap-4"
                        >
                            <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg md:rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
                                <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-emerald-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5 md:mb-1">
                                    <span className="text-sm font-bold text-white">$TSLA</span>
                                    <span className="text-xs text-emerald-400 font-semibold">$248.50</span>
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">+2.4%</span>
                                </div>
                                <div className="text-[10px] md:text-[11px] text-white/40 truncate">Tesla Inc • Most discussed today</div>
                            </div>
                            {/* Mini chart - hidden on mobile */}
                            <svg className="w-16 h-8 md:w-20 md:h-10 hidden sm:block shrink-0" viewBox="0 0 80 40">
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

                        {/* Posts - show only 1 on mobile */}
                        {mockPosts.slice(0, typeof window !== 'undefined' && window.innerWidth < 768 ? 1 : 2).map((post, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.9 + i * 0.15 }}
                                className="p-3 md:p-4 bg-white/[0.02] border border-white/5 rounded-xl md:rounded-2xl space-y-2 md:space-y-3 hover:bg-white/[0.04] transition-colors"
                            >
                                <div className="flex items-center gap-2 md:gap-3">
                                    <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center text-base md:text-lg shrink-0">
                                        {post.avatar}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-xs md:text-sm font-semibold text-white/90">{post.user}</span>
                                            <span className={`text-[10px] md:text-xs font-bold ${post.tickerColor}`}>{post.ticker}</span>
                                            <span className={`text-[8px] md:text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase ${post.sentiment === "bullish"
                                                ? "bg-emerald-500/20 text-emerald-400"
                                                : "bg-rose-500/20 text-rose-400"
                                                }`}>
                                                {post.sentiment === "bullish" ? "🐂 Bull" : "🐻 Bear"}
                                            </span>
                                        </div>
                                        <span className="text-[9px] md:text-[10px] text-white/30">{post.time} ago</span>
                                    </div>
                                </div>
                                <p className="text-[12px] md:text-[13px] text-white/60 leading-relaxed line-clamp-2">{post.text}</p>
                                <div className="flex items-center gap-4 pt-1">
                                    <div className="flex items-center gap-1.5 text-white/30 hover:text-rose-400 transition-colors cursor-pointer">
                                        <Heart className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                        <motion.span
                                            key={i === 0 ? likeCount : post.likes}
                                            initial={{ scale: 1.2, color: "rgb(248 113 113)" }}
                                            animate={{ scale: 1, color: "inherit" }}
                                            className="text-[10px] md:text-[11px] font-medium"
                                        >
                                            {i === 0 ? likeCount : post.likes}
                                        </motion.span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-white/30 hover:text-blue-400 transition-colors cursor-pointer">
                                        <MessageCircle className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                        <span className="text-[10px] md:text-[11px] font-medium">{post.comments}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Right Panel Mock - Hidden on mobile */}
                    <div className="hidden md:block col-span-3 border-l border-white/10 pl-6 space-y-5">
                        {/* Leaderboard */}
                        <motion.div
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 1 }}
                            className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <Trophy className="w-4 h-4 text-amber-500" />
                                <span className="text-[11px] font-bold text-white/60 uppercase tracking-wider">Leaderboard</span>
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
                                <span className="text-[10px] font-bold text-violet-400">New notification</span>
                            </div>
                            <p className="text-[11px] text-white/50">StockMaster commented on your $TSLA analysis</p>
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
