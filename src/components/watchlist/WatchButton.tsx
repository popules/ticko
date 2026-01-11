"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { motion } from "framer-motion";

interface WatchButtonProps {
    symbol: string;
}

export function WatchButton({ symbol }: WatchButtonProps) {
    const queryClient = useQueryClient();

    // Fetch current watchlist to check if this symbol is in it
    const { data: watchlistData } = useQuery({
        queryKey: ["watchlist"],
        queryFn: async () => {
            const res = await fetch("/api/watchlist");
            return res.json();
        }
    });

    const isWatched = watchlistData?.symbols?.includes(symbol) ||
        watchlistData?.stocks?.some((s: any) => s.symbol === symbol || s.symbol.replace('.ST', '') === symbol);

    const toggleWatch = useMutation({
        mutationFn: async () => {
            const res = await fetch("/api/watchlist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ticker: symbol }),
            });
            return res.json();
        },
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ["watchlist"] });
            const previousWatchlist = queryClient.getQueryData(["watchlist"]);

            // Optimistically update
            queryClient.setQueryData(["watchlist"], (old: any) => {
                if (!old) return { symbols: [symbol], stocks: [] };
                const isCurrentlyWatched = old.symbols?.includes(symbol);

                return {
                    ...old,
                    symbols: isCurrentlyWatched
                        ? old.symbols.filter((s: string) => s !== symbol)
                        : [...(old.symbols || []), symbol]
                };
            });

            return { previousWatchlist };
        },
        onError: (err, newTodo, context) => {
            queryClient.setQueryData(["watchlist"], context?.previousWatchlist);
            console.error("Watch toggle failed", err);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["watchlist"] });
        },
    });

    return (
        <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => toggleWatch.mutate()}
            disabled={toggleWatch.isPending}
            className={`p-2.5 rounded-xl transition-all border ${isWatched
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-lg shadow-emerald-500/10"
                : "bg-white/[0.06] hover:bg-white/[0.1] text-white/60 hover:text-white border-white/10"
                }`}
            title={isWatched ? "Ta bort från bevakningslista" : "Lägg till i bevakningslista"}
        >
            <Star className={`w-5 h-5 ${isWatched ? "fill-emerald-400" : ""}`} />
        </motion.button>
    );
}
