"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

interface PollViewProps {
    poll: {
        id: string;
        question: string;
        options_data: { id: number; text: string }[];
        ends_at?: string;
    };
}

export function PollView({ poll }: PollViewProps) {
    const { user } = useAuth();
    const [votes, setVotes] = useState<Record<number, number>>({});
    const [userVote, setUserVote] = useState<number | null>(null); // Option index
    const [isLoading, setIsLoading] = useState(true);
    const [isVoting, setIsVoting] = useState(false);

    // Initial fetch
    useEffect(() => {
        const fetchVotes = async () => {
            // Get all votes for this poll
            const { data, error } = await supabase
                .from("poll_votes")
                .select("option_index, user_id")
                .eq("poll_id", poll.id);

            if (data) {
                const counts: Record<number, number> = {};
                poll.options_data.forEach(o => counts[o.id] = 0);

                let myVote = null;
                data.forEach(v => {
                    counts[v.option_index] = (counts[v.option_index] || 0) + 1;
                    if (user && v.user_id === user.id) myVote = v.option_index;
                });

                setVotes(counts);
                setUserVote(myVote);
            }
            setIsLoading(false);
        };

        fetchVotes();

        // Realtime subscription for updates
        const channel = supabase
            .channel(`poll-${poll.id}`)
            .on("postgres_changes", { event: "*", schema: "public", table: "poll_votes", filter: `poll_id=eq.${poll.id}` }, () => {
                fetchVotes(); // Re-fetch on any change
            })
            .subscribe();

        return () => { supabase.removeChannel(channel) };
    }, [poll.id, user]);

    const handleVote = async (optionIndex: number) => {
        if (!user || isVoting || userVote !== null) return;
        setIsVoting(true);

        try {
            const { error } = await supabase
                .from("poll_votes")
                .insert({
                    poll_id: poll.id,
                    user_id: user.id,
                    option_index: optionIndex
                });

            if (error) throw error;
            // Optimistic update
            setUserVote(optionIndex);
            setVotes(prev => ({ ...prev, [optionIndex]: (prev[optionIndex] || 0) + 1 }));
        } catch (e) {
            console.error("Vote failed", e);
        } finally {
            setIsVoting(false);
        }
    };

    const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0);

    if (isLoading) return <div className="h-20 flex items-center justify-center"><Loader2 className="w-4 h-4 animate-spin text-white/30" /></div>;

    return (
        <div className="mt-3 space-y-2">
            {poll.options_data.map((option) => {
                const count = votes[option.id] || 0;
                const percent = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
                const isWinner = totalVotes > 0 && count === Math.max(...Object.values(votes));

                return (
                    <button
                        key={option.id}
                        disabled={userVote !== null || isVoting}
                        onClick={() => handleVote(option.id)}
                        className={`relative w-full text-left p-3 rounded-xl border transition-all overflow-hidden group ${userVote === option.id
                                ? "border-emerald-500/50 bg-emerald-500/10"
                                : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]"
                            }`}
                    >
                        {/* Progress Bar Background */}
                        {userVote !== null && (
                            <div
                                className={`absolute top-0 left-0 bottom-0 transition-all duration-1000 ${userVote === option.id ? "bg-emerald-500/20" : "bg-white/10"
                                    }`}
                                style={{ width: `${percent}%` }}
                            />
                        )}

                        <div className="relative flex justify-between items-center z-10">
                            <span className={`text-sm font-medium ${userVote === option.id ? "text-emerald-400" : "text-white/80"}`}>
                                {option.text}
                            </span>
                            {userVote !== null && (
                                <span className="text-xs font-bold text-white/50">
                                    {Math.round(percent)}%
                                </span>
                            )}
                        </div>
                    </button>
                );
            })}
            <div className="flex justify-between items-center px-1">
                <span className="text-[10px] text-white/40">{totalVotes} röster</span>
                {poll.ends_at && <span className="text-[10px] text-white/40">Slutar {new Date(poll.ends_at).toLocaleDateString()}</span>}
            </div>
        </div>
    );
}
