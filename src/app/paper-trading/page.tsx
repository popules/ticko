"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { RightPanel } from "@/components/layout/RightPanel";
import { useAuth } from "@/providers/AuthProvider";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { getPaperTradingSettings } from "@/config/subscription";
import { awardAchievement } from "@/lib/achievements";
import { PaperSellModal } from "@/components/portfolio/PaperSellModal";
import {
    Gamepad2, TrendingUp, TrendingDown, Loader2, Plus, DollarSign,
    Sparkles, AlertTriangle, Coins, RotateCcw, Trophy, Clock,
    History, BarChart3, Wallet, ArrowUpRight, ArrowDownRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";

const USD_TO_SEK = 10.5;

interface PortfolioItem {
    id: string;
    symbol: string;
    name: string;
    shares: number;
    buy_price: number;
    currency: string;
    current_price?: number;
    change_percent?: number;
}

interface Transaction {
    id: string;
    symbol: string;
    name: string;
    type: "buy" | "sell";
    shares: number;
    price: number;
    currency: string;
    total_sek: number;
    realized_pnl: number;
    created_at: string;
}

interface Snapshot {
    snapshot_date: string;
    total_value: number;
}

type TabType = "portfolio" | "history" | "graph";

export default function PaperTradingPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();

    // Tab state
    const [activeTab, setActiveTab] = useState<TabType>("portfolio");

    // Portfolio state
    const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [totalValue, setTotalValue] = useState(0);
    const [isPro, setIsPro] = useState(false);

    // Sell modal state
    const [sellItem, setSellItem] = useState<PortfolioItem | null>(null);

    // History state
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    // Graph state
    const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
    const [isLoadingGraph, setIsLoadingGraph] = useState(false);

    // Get tier settings based on Pro status
    const tierSettings = getPaperTradingSettings(isPro);
    const STARTING_CAPITAL = tierSettings.startingCapital;
    const RESET_THRESHOLD = tierSettings.resetThreshold;
    const RESET_COOLDOWN_DAYS = tierSettings.resetCooldownDays;

    const [cashBalance, setCashBalance] = useState<number>(STARTING_CAPITAL);

    // Reset functionality
    const [resetCount, setResetCount] = useState(0);
    const [lastResetDate, setLastResetDate] = useState<Date | null>(null);
    const [isResetting, setIsResetting] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!authLoading && !user) {
            router.replace("/logga-in");
        }
    }, [user, authLoading, router]);

    // Fetch portfolio data
    useEffect(() => {
        if (!user || !isSupabaseConfigured || !supabase) return;

        const fetchPortfolio = async () => {
            setIsLoading(true);

            const { data, error } = await (supabase as any)
                .from("portfolio")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Portfolio fetch error:", error);
                setIsLoading(false);
                return;
            }

            // Fetch user's paper trading stats
            const { data: profile } = await (supabase as any)
                .from("profiles")
                .select("paper_reset_count, paper_last_reset, is_pro")
                .eq("id", user.id)
                .single();

            if (profile) {
                setResetCount(profile.paper_reset_count || 0);
                setLastResetDate(profile.paper_last_reset ? new Date(profile.paper_last_reset) : null);
                setIsPro(profile.is_pro || false);

                if ((data || []).length === 1) {
                    awardAchievement(user.id, "first_paper_trade");
                }
            }

            // Fetch current prices
            const enrichedPortfolio = await Promise.all(
                ((data || []) as PortfolioItem[]).map(async (item: PortfolioItem) => {
                    try {
                        const res = await fetch(`/api/stocks/${item.symbol}`);
                        const stockData = await res.json();
                        return {
                            ...item,
                            current_price: stockData.price || item.buy_price,
                            change_percent: stockData.changePercent || 0,
                        };
                    } catch {
                        return { ...item, current_price: item.buy_price, change_percent: 0 };
                    }
                })
            );

            setPortfolio(enrichedPortfolio);

            // Calculate totals (in SEK)
            let totalInvestedSek = 0;
            let totalCurrentSek = 0;

            enrichedPortfolio.forEach((item: PortfolioItem) => {
                const isSek = item.currency === "SEK";
                const rate = isSek ? 1 : USD_TO_SEK;
                const currentValue = item.shares * (item.current_price || item.buy_price) * rate;
                const buyValue = item.shares * item.buy_price * rate;
                totalInvestedSek += buyValue;
                totalCurrentSek += currentValue;
            });

            setTotalValue(totalCurrentSek);
            setCashBalance(STARTING_CAPITAL - totalInvestedSek);
            setIsLoading(false);
        };

        fetchPortfolio();
    }, [user, STARTING_CAPITAL]);

    // Fetch transaction history when tab changes
    useEffect(() => {
        if (activeTab !== "history" || !user || !supabase) return;

        const fetchHistory = async () => {
            setIsLoadingHistory(true);
            const { data } = await (supabase as any)
                .from("transactions")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false })
                .limit(50);

            setTransactions(data || []);
            setIsLoadingHistory(false);
        };

        fetchHistory();
    }, [activeTab, user]);

    // Fetch graph data when tab changes
    useEffect(() => {
        if (activeTab !== "graph" || !user || !supabase) return;

        const fetchSnapshots = async () => {
            setIsLoadingGraph(true);
            const { data } = await (supabase as any)
                .from("portfolio_snapshots")
                .select("snapshot_date, total_value")
                .eq("user_id", user.id)
                .order("snapshot_date", { ascending: true })
                .limit(90);

            // Add current value as today's point
            const today = new Date().toISOString().split('T')[0];
            const snapshotData = (data || []) as Snapshot[];

            // Add today's value if not already there
            const hasToday = snapshotData.some(s => s.snapshot_date === today);
            if (!hasToday) {
                snapshotData.push({
                    snapshot_date: today,
                    total_value: totalValue + cashBalance
                });
            }

            setSnapshots(snapshotData);
            setIsLoadingGraph(false);
        };

        fetchSnapshots();
    }, [activeTab, user, totalValue, cashBalance]);

    // Handle sell completion
    const handleSold = (id: string, sharesSold: number, proceeds: number, realizedPnl: number) => {
        // Update portfolio
        setPortfolio(prev => {
            const item = prev.find(p => p.id === id);
            if (!item) return prev;

            if (sharesSold >= item.shares) {
                // Remove item
                return prev.filter(p => p.id !== id);
            } else {
                // Update shares
                return prev.map(p =>
                    p.id === id ? { ...p, shares: p.shares - sharesSold } : p
                );
            }
        });

        // Update cash balance
        setCashBalance(prev => prev + proceeds);

        // Update total value
        setTotalValue(prev => {
            const item = portfolio.find(p => p.id === id);
            if (!item) return prev;
            const isSek = item.currency === "SEK";
            const rate = isSek ? 1 : USD_TO_SEK;
            const soldValue = sharesSold * (item.current_price || item.buy_price) * rate;
            return prev - soldValue;
        });
    };

    // Reset logic
    const totalPortfolioValue = totalValue + cashBalance;
    const canReset = totalPortfolioValue < RESET_THRESHOLD;

    const daysSinceReset = lastResetDate
        ? Math.floor((Date.now() - lastResetDate.getTime()) / (1000 * 60 * 60 * 24))
        : RESET_COOLDOWN_DAYS;

    const cooldownRemaining = Math.max(0, RESET_COOLDOWN_DAYS - daysSinceReset);
    const isOnCooldown = cooldownRemaining > 0;

    const handleReset = async () => {
        if (!user || !supabase || !canReset || isOnCooldown) return;

        setIsResetting(true);

        try {
            await supabase.from("portfolio").delete().eq("user_id", user.id);

            await (supabase as any).from("profiles").update({
                paper_reset_count: resetCount + 1,
                paper_last_reset: new Date().toISOString(),
            }).eq("id", user.id);

            setPortfolio([]);
            setTotalValue(0);
            setCashBalance(STARTING_CAPITAL);
            setResetCount(prev => prev + 1);
            setLastResetDate(new Date());
            setShowResetModal(false);
        } catch (err) {
            console.error("Reset error:", err);
        }

        setIsResetting(false);
    };

    if (authLoading || isLoading) {
        return (
            <div className="flex min-h-screen">
                <Sidebar />
                <main className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-white/40" />
                </main>
                <RightPanel />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex min-h-screen">
                <Sidebar />
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <Gamepad2 className="w-16 h-16 text-white/20 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-white mb-2">Logga in för att testa paper trading</h2>
                        <Link href="/logga-in" className="text-emerald-400 hover:underline">
                            Logga in →
                        </Link>
                    </div>
                </main>
                <RightPanel />
            </div>
        );
    }

    const overallPL = totalPortfolioValue - STARTING_CAPITAL;
    const overallPLPercent = (overallPL / STARTING_CAPITAL) * 100;

    // Calculate realized P&L from transactions
    const totalRealizedPnl = transactions
        .filter(t => t.type === "sell")
        .reduce((sum, t) => sum + (t.realized_pnl || 0), 0);

    return (
        <div className="flex min-h-screen">
            <Sidebar />

            <main className="flex-1 border-r border-white/10">
                {/* Header */}
                <header className="sticky top-0 z-10 backdrop-blur-xl bg-[#020617]/80 border-b border-white/10 px-4 sm:px-6 py-4 sm:py-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-400 to-fuchsia-600 flex items-center justify-center shadow-lg">
                                <Gamepad2 className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h1 className="text-xl sm:text-2xl font-black text-white">Paper Trading</h1>
                                    <span className="px-2 py-0.5 rounded-full bg-violet-500/20 border border-violet-500/30 text-[10px] font-bold text-violet-400 uppercase tracking-wider">
                                        Simulering
                                    </span>
                                    {resetCount > 0 && (
                                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-[10px] font-bold text-amber-400">
                                            🔄 {resetCount} reset{resetCount !== 1 ? "s" : ""}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-white/40">{portfolio.length} virtuella innehav</p>
                            </div>
                        </div>

                        <Link
                            href="/leaderboard"
                            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-bold hover:bg-yellow-500/20 transition-all"
                        >
                            <Trophy className="w-4 h-4" />
                            <span className="hidden sm:inline">Topplistan</span>
                        </Link>
                    </div>
                </header>

                {/* Warning Banner */}
                <div className="mx-4 sm:mx-6 mt-4 sm:mt-6 p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-bold text-amber-400">Detta är en simulering</p>
                        <p className="text-xs text-white/50 mt-1">
                            Paper trading använder virtuella pengar. Inga riktiga transaktioner görs.
                        </p>
                    </div>
                </div>

                {/* Portfolio Summary */}
                <div className="p-4 sm:p-6 border-b border-white/10">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                        {/* Virtual Cash */}
                        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-violet-500/10 to-violet-500/5 border border-violet-500/20">
                            <div className="flex items-center gap-2 mb-2">
                                <Coins className="w-4 h-4 text-violet-400" />
                                <p className="text-[10px] text-violet-400/80 uppercase tracking-widest font-bold">Kassa</p>
                            </div>
                            <p className="text-lg sm:text-2xl font-black text-white tabular-nums">
                                {cashBalance.toLocaleString("sv-SE", { minimumFractionDigits: 0, maximumFractionDigits: 0 })} kr
                            </p>
                        </div>

                        {/* Portfolio Value */}
                        <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.04] border border-white/10">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="w-4 h-4 text-white/40" />
                                <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">I aktier</p>
                            </div>
                            <p className="text-lg sm:text-2xl font-black text-white tabular-nums">
                                {totalValue.toLocaleString("sv-SE", { minimumFractionDigits: 0, maximumFractionDigits: 0 })} kr
                            </p>
                        </div>

                        {/* Total Value */}
                        <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.04] border border-white/10">
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="w-4 h-4 text-white/40" />
                                <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Totalt</p>
                            </div>
                            <p className="text-lg sm:text-2xl font-black text-white tabular-nums">
                                {totalPortfolioValue.toLocaleString("sv-SE", { minimumFractionDigits: 0, maximumFractionDigits: 0 })} kr
                            </p>
                        </div>

                        {/* Total P&L */}
                        <div className={`p-4 sm:p-5 rounded-2xl border ${overallPL >= 0 ? "bg-emerald-500/10 border-emerald-500/20" : "bg-rose-500/10 border-rose-500/20"}`}>
                            <div className="flex items-center gap-2 mb-2">
                                {overallPL >= 0 ? (
                                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                                ) : (
                                    <TrendingDown className="w-4 h-4 text-rose-400" />
                                )}
                                <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Avkastning</p>
                            </div>
                            <p className={`text-lg sm:text-2xl font-black tabular-nums ${overallPL >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                                {overallPL >= 0 ? "+" : ""}{overallPL.toLocaleString("sv-SE", { minimumFractionDigits: 0, maximumFractionDigits: 0 })} kr
                            </p>
                            <p className={`text-[10px] mt-1 ${overallPL >= 0 ? "text-emerald-400/60" : "text-rose-400/60"}`}>
                                {overallPL >= 0 ? "+" : ""}{overallPLPercent.toFixed(2)}%
                            </p>
                        </div>
                    </div>

                    {/* Reset Button */}
                    {canReset && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-4 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20"
                        >
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div>
                                    <p className="text-sm font-bold text-rose-400">Portfölj under 25 000 kr</p>
                                    <p className="text-xs text-white/50 mt-1">
                                        Du kan återställa till 100 000 kr och börja om.
                                        {isOnCooldown && (
                                            <span className="text-amber-400 ml-2">
                                                <Clock className="w-3 h-3 inline mr-1" />
                                                Vänta {cooldownRemaining} dag{cooldownRemaining !== 1 ? "ar" : ""} till
                                            </span>
                                        )}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowResetModal(true)}
                                    disabled={isOnCooldown}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-rose-500/30"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    Återställ portfölj
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Starting Capital Info */}
                    <div className="mt-4 text-center">
                        <p className="text-[10px] text-white/30">
                            🎮 Startkapital: <span className="text-white/50 font-bold">{STARTING_CAPITAL.toLocaleString("sv-SE")} kr</span> virtuella kronor
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="px-4 sm:px-6 py-3 border-b border-white/10 flex gap-2 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab("portfolio")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === "portfolio"
                            ? "bg-violet-500/20 text-violet-400 border border-violet-500/30"
                            : "bg-white/[0.04] text-white/60 border border-white/10 hover:text-white"
                            }`}
                    >
                        <Wallet className="w-4 h-4" />
                        Portfölj
                    </button>
                    <button
                        onClick={() => setActiveTab("history")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === "history"
                            ? "bg-violet-500/20 text-violet-400 border border-violet-500/30"
                            : "bg-white/[0.04] text-white/60 border border-white/10 hover:text-white"
                            }`}
                    >
                        <History className="w-4 h-4" />
                        Historik
                    </button>
                    <button
                        onClick={() => setActiveTab("graph")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === "graph"
                            ? "bg-violet-500/20 text-violet-400 border border-violet-500/30"
                            : "bg-white/[0.04] text-white/60 border border-white/10 hover:text-white"
                            }`}
                    >
                        <BarChart3 className="w-4 h-4" />
                        Graf
                    </button>
                </div>

                {/* Tab Content */}
                <div className="p-4 sm:p-6">
                    {activeTab === "portfolio" && (
                        <div>
                            {portfolio.length === 0 ? (
                                <div className="text-center py-12 sm:py-16">
                                    <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-full bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center mx-auto mb-4">
                                        <Gamepad2 className="w-8 sm:w-10 h-8 sm:h-10 text-violet-400" />
                                    </div>
                                    <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Inga virtuella innehav</h3>
                                    <p className="text-white/40 mb-6 max-w-md mx-auto text-sm">
                                        Du har {cashBalance.toLocaleString("sv-SE")} kr virtuella kronor att investera.
                                        Gå till en aktiesida och klicka &quot;Paper Trade&quot;!
                                    </p>
                                    <Link
                                        href="/upptack"
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-xl font-bold transition-transform hover:scale-105"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Upptäck aktier
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Gamepad2 className="w-4 h-4" />
                                        Dina virtuella innehav
                                    </h3>
                                    {portfolio.map((item, index) => {
                                        const isSek = item.currency === "SEK";
                                        const rate = isSek ? 1 : USD_TO_SEK;
                                        const currentPrice = item.current_price || item.buy_price;
                                        const currentValueSek = item.shares * currentPrice * rate;
                                        const buyValueSek = item.shares * item.buy_price * rate;
                                        const pl = currentValueSek - buyValueSek;
                                        const plPercent = ((pl / buyValueSek) * 100);

                                        return (
                                            <motion.div
                                                key={item.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.06] transition-all group"
                                            >
                                                <Link href={`/aktie/${item.symbol}`} className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                                                    <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-xl bg-gradient-to-br from-violet-400 to-fuchsia-600 flex items-center justify-center text-white font-black text-[10px] sm:text-xs shrink-0">
                                                        {item.symbol.split('.')[0].slice(0, 4)}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <p className="font-bold text-white tracking-tight truncate">${item.symbol}</p>
                                                            <span className="px-1.5 py-0.5 rounded bg-violet-500/20 text-[8px] font-bold text-violet-400 uppercase shrink-0">
                                                                Paper
                                                            </span>
                                                        </div>
                                                        <p className="text-[10px] sm:text-[11px] font-medium text-white/40 truncate">{item.name || item.symbol}</p>
                                                    </div>
                                                </Link>

                                                <div className="text-right mx-2 sm:mx-4 shrink-0">
                                                    <p className="text-xs sm:text-sm font-bold text-white tabular-nums">{item.shares} st</p>
                                                </div>

                                                <div className="text-right mr-2 sm:mr-6 shrink-0">
                                                    <p className="font-bold text-white tabular-nums text-sm sm:text-base">
                                                        {currentValueSek.toLocaleString("sv-SE", { maximumFractionDigits: 0 })} kr
                                                    </p>
                                                    <div className={`flex items-center justify-end gap-1 text-xs font-bold tabular-nums ${pl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                                                        {pl >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                                        {pl >= 0 ? "+" : ""}{plPercent.toFixed(1)}%
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => setSellItem(item)}
                                                    className="px-3 sm:px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold opacity-0 group-hover:opacity-100 transition-all border border-emerald-500/20 flex items-center gap-1.5 shrink-0"
                                                >
                                                    <DollarSign className="w-3.5 h-3.5" />
                                                    <span className="hidden sm:inline">Sälj</span>
                                                </button>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "history" && (
                        <div>
                            {isLoadingHistory ? (
                                <div className="flex justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-white/40" />
                                </div>
                            ) : transactions.length === 0 ? (
                                <div className="text-center py-12">
                                    <History className="w-12 h-12 text-white/20 mx-auto mb-4" />
                                    <h3 className="text-lg font-bold text-white mb-2">Ingen historik ännu</h3>
                                    <p className="text-white/40 text-sm">Dina köp och sälj kommer visas här.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Realized P&L Summary */}
                                    <div className={`p-4 rounded-2xl border flex items-center justify-between ${totalRealizedPnl >= 0
                                        ? "bg-emerald-500/10 border-emerald-500/20"
                                        : "bg-rose-500/10 border-rose-500/20"
                                        }`}>
                                        <span className="text-white/60 text-sm">Realiserad vinst/förlust</span>
                                        <span className={`text-xl font-black tabular-nums ${totalRealizedPnl >= 0 ? "text-emerald-400" : "text-rose-400"
                                            }`}>
                                            {totalRealizedPnl >= 0 ? "+" : ""}{totalRealizedPnl.toLocaleString("sv-SE", { maximumFractionDigits: 0 })} kr
                                        </span>
                                    </div>

                                    {/* Transactions List */}
                                    <div className="space-y-2">
                                        {transactions.map((tx) => {
                                            const isBuy = tx.type === "buy";
                                            const date = new Date(tx.created_at);

                                            return (
                                                <div key={tx.id} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.04] border border-white/10">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isBuy
                                                            ? "bg-emerald-500/20"
                                                            : "bg-rose-500/20"
                                                            }`}>
                                                            {isBuy ? (
                                                                <ArrowUpRight className="w-5 h-5 text-emerald-400" />
                                                            ) : (
                                                                <ArrowDownRight className="w-5 h-5 text-rose-400" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-white">{isBuy ? "Köpte" : "Sålde"} ${tx.symbol}</p>
                                                            <p className="text-xs text-white/40">
                                                                {tx.shares} st @ {tx.price.toFixed(2)} {tx.currency === "SEK" ? "kr" : "$"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-bold text-white tabular-nums">
                                                            {isBuy ? "-" : "+"}{tx.total_sek.toLocaleString("sv-SE", { maximumFractionDigits: 0 })} kr
                                                        </p>
                                                        {!isBuy && tx.realized_pnl !== 0 && (
                                                            <p className={`text-xs font-bold tabular-nums ${tx.realized_pnl >= 0 ? "text-emerald-400" : "text-rose-400"
                                                                }`}>
                                                                {tx.realized_pnl >= 0 ? "+" : ""}{tx.realized_pnl.toLocaleString("sv-SE", { maximumFractionDigits: 0 })} kr
                                                            </p>
                                                        )}
                                                        <p className="text-[10px] text-white/30 mt-1">
                                                            {date.toLocaleDateString("sv-SE")}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "graph" && (
                        <div>
                            {isLoadingGraph ? (
                                <div className="flex justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-white/40" />
                                </div>
                            ) : snapshots.length < 2 ? (
                                <div className="text-center py-12">
                                    <BarChart3 className="w-12 h-12 text-white/20 mx-auto mb-4" />
                                    <h3 className="text-lg font-bold text-white mb-2">Inte tillräckligt med data</h3>
                                    <p className="text-white/40 text-sm max-w-md mx-auto">
                                        Grafen visas när vi har minst 2 dagars data.
                                        Ditt portföljvärde sparas automatiskt varje natt.
                                    </p>
                                    <div className="mt-6 p-4 rounded-xl bg-violet-500/10 border border-violet-500/20 max-w-sm mx-auto">
                                        <p className="text-violet-400 text-sm">
                                            📊 Nuvarande värde: <span className="font-bold">{(totalValue + cashBalance).toLocaleString("sv-SE")} kr</span>
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10">
                                        <h3 className="text-sm font-bold text-white/60 mb-4">Portföljutveckling</h3>
                                        <div className="h-64 sm:h-80">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={snapshots}>
                                                    <defs>
                                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <XAxis
                                                        dataKey="snapshot_date"
                                                        tickFormatter={(date) => new Date(date).toLocaleDateString("sv-SE", { day: "numeric", month: "short" })}
                                                        stroke="#ffffff20"
                                                        tick={{ fill: "#ffffff40", fontSize: 11 }}
                                                    />
                                                    <YAxis
                                                        tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                                                        stroke="#ffffff20"
                                                        tick={{ fill: "#ffffff40", fontSize: 11 }}
                                                        domain={['dataMin - 5000', 'dataMax + 5000']}
                                                    />
                                                    <Tooltip
                                                        contentStyle={{
                                                            backgroundColor: "#0B0F17",
                                                            border: "1px solid rgba(255,255,255,0.1)",
                                                            borderRadius: "12px",
                                                            color: "white"
                                                        }}
                                                        labelFormatter={(date) => new Date(date).toLocaleDateString("sv-SE", { dateStyle: "long" })}
                                                        formatter={(value) => [`${(value as number || 0).toLocaleString("sv-SE")} kr`, "Värde"]}
                                                    />
                                                    <Area
                                                        type="monotone"
                                                        dataKey="total_value"
                                                        stroke="#8b5cf6"
                                                        strokeWidth={2}
                                                        fill="url(#colorValue)"
                                                    />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10">
                                            <p className="text-xs text-white/40 mb-1">Startpunkt</p>
                                            <p className="text-lg font-bold text-white tabular-nums">
                                                {snapshots[0]?.total_value.toLocaleString("sv-SE", { maximumFractionDigits: 0 })} kr
                                            </p>
                                        </div>
                                        <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10">
                                            <p className="text-xs text-white/40 mb-1">Nuvarande</p>
                                            <p className="text-lg font-bold text-white tabular-nums">
                                                {(totalValue + cashBalance).toLocaleString("sv-SE", { maximumFractionDigits: 0 })} kr
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            <RightPanel />

            {/* Sell Modal */}
            {sellItem && (
                <PaperSellModal
                    item={sellItem}
                    userId={user.id}
                    onClose={() => setSellItem(null)}
                    onSold={handleSold}
                />
            )}

            {/* Reset Confirmation Modal */}
            <AnimatePresence>
                {showResetModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => setShowResetModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-md bg-[#0B0F17] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
                        >
                            <div className="p-6 border-b border-white/10 bg-gradient-to-r from-rose-500/10 to-orange-500/10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center">
                                        <RotateCcw className="w-5 h-5 text-rose-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-white">Återställ portfölj</h2>
                                        <p className="text-xs text-white/40">Är du säker?</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 space-y-4">
                                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
                                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                                    <div className="text-sm text-amber-400/80">
                                        <p className="font-bold mb-1">Detta kommer att:</p>
                                        <ul className="list-disc list-inside text-xs space-y-1">
                                            <li>Radera alla dina virtuella innehav</li>
                                            <li>Återställa din kassa till 100 000 kr</li>
                                            <li>Öka din reset-räknare (synlig för andra)</li>
                                        </ul>
                                    </div>
                                </div>

                                <p className="text-sm text-white/50 text-center">
                                    Du har återställt <span className="text-white font-bold">{resetCount}</span> gång{resetCount !== 1 ? "er" : ""} tidigare.
                                </p>
                            </div>

                            <div className="p-6 pt-0 flex gap-3">
                                <button
                                    onClick={() => setShowResetModal(false)}
                                    className="flex-1 px-4 py-3 rounded-xl bg-white/[0.06] text-white/60 font-bold hover:bg-white/10 transition-colors"
                                >
                                    Avbryt
                                </button>
                                <button
                                    onClick={handleReset}
                                    disabled={isResetting}
                                    className="flex-1 px-4 py-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 font-bold transition-colors flex items-center justify-center gap-2 border border-rose-500/30"
                                >
                                    {isResetting ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <RotateCcw className="w-4 h-4" />
                                            Ja, återställ
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
