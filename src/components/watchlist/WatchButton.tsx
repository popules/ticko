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

    const isWatched = watchlistData?.stocks?.some((s: any) => s.symbol === symbol || s.symbol.replace('.ST', '') === symbol);

    const toggleWatch = useMutation({
        mutationFn: async () => {
            const res = await fetch("/api/watchlist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ticker: symbol }),
            });
            return res.json();
        },
        onSuccess: () => {
            // Invalidate and refetch
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
