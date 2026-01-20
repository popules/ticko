// User Rank System
// 20 levels based on reputation score and activity

export interface RankInfo {
    level: number;
    name: string;
    minScore: number;
    color: string;
    emoji: string;
}

// 20 ranks from beginner to legendary
export const RANKS: RankInfo[] = [
    { level: 1, name: "Beginner", minScore: 0, color: "text-gray-400", emoji: "🌱" },
    { level: 2, name: "Observer", minScore: 10, color: "text-gray-400", emoji: "👀" },
    { level: 3, name: "Reader", minScore: 25, color: "text-slate-400", emoji: "📖" },
    { level: 4, name: "Participant", minScore: 50, color: "text-slate-300", emoji: "💬" },
    { level: 5, name: "Active", minScore: 100, color: "text-blue-400", emoji: "⚡" },
    { level: 6, name: "Engaged", minScore: 200, color: "text-blue-400", emoji: "🔥" },
    { level: 7, name: "Analyst", minScore: 350, color: "text-blue-500", emoji: "📊" },
    { level: 8, name: "Trend Spotter", minScore: 500, color: "text-cyan-400", emoji: "🔍" },
    { level: 9, name: "Market Follower", minScore: 750, color: "text-cyan-400", emoji: "📈" },
    { level: 10, name: "Strategist", minScore: 1000, color: "text-emerald-400", emoji: "♟️" },
    { level: 11, name: "Senior Strategist", minScore: 1500, color: "text-emerald-400", emoji: "🎯" },
    { level: 12, name: "Expert", minScore: 2000, color: "text-emerald-500", emoji: "💎" },
    { level: 13, name: "Mentor", minScore: 3000, color: "text-yellow-400", emoji: "🌟" },
    { level: 14, name: "Veteran", minScore: 4000, color: "text-yellow-400", emoji: "🏆" },
    { level: 15, name: "Master", minScore: 5500, color: "text-orange-400", emoji: "👑" },
    { level: 16, name: "Grand Master", minScore: 7500, color: "text-orange-500", emoji: "⚔️" },
    { level: 17, name: "Elite Trader", minScore: 10000, color: "text-rose-400", emoji: "🚀" },
    { level: 18, name: "Legend", minScore: 15000, color: "text-purple-400", emoji: "✨" },
    { level: 19, name: "Oracle", minScore: 25000, color: "text-purple-500", emoji: "🔮" },
    { level: 20, name: "God Tier", minScore: 50000, color: "text-fuchsia-400", emoji: "👁️" },
];

/**
 * Get the rank info for a user based on their reputation score
 */
export function getUserRank(reputationScore: number): RankInfo {
    // Find the highest rank the user qualifies for
    for (let i = RANKS.length - 1; i >= 0; i--) {
        if (reputationScore >= RANKS[i].minScore) {
            return RANKS[i];
        }
    }
    return RANKS[0]; // Default to first rank
}

/**
 * Get progress percentage to next rank
 */
export function getProgressToNextRank(reputationScore: number): number {
    const currentRank = getUserRank(reputationScore);
    const currentIndex = RANKS.findIndex(r => r.level === currentRank.level);

    if (currentIndex >= RANKS.length - 1) {
        return 100; // Already at max rank
    }

    const nextRank = RANKS[currentIndex + 1];
    const currentMin = currentRank.minScore;
    const nextMin = nextRank.minScore;
    const progress = ((reputationScore - currentMin) / (nextMin - currentMin)) * 100;

    return Math.min(100, Math.max(0, progress));
}

/**
 * Calculate accuracy from prediction stats
 */
export function calculateAccuracy(correctPredictions: number, totalPredictions: number): number {
    if (totalPredictions === 0) return 0;
    return Math.round((correctPredictions / totalPredictions) * 100);
}
