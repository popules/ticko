// Base social XP (reduced to discourage spam)
export const XP_PER_POST = 5;
export const XP_PER_COMMENT = 5;
export const XP_PER_REACTION = 1;

// Skill-based trading XP (new: reward good trades)
export const XP_PER_PROFITABLE_TRADE = 50;
export const XP_PER_1000_PROFIT = 10;

// Streak multipliers (new: dopamine loop)
export const STREAK_MULTIPLIERS: Record<number, number> = {
    3: 1.5,  // 3 wins in a row = 1.5x XP
    5: 2.0,  // 5 wins = 2x XP
    10: 3.0, // 10 wins = 3x XP (beast mode)
};

/**
 * Get streak multiplier based on current win streak
 */
export function getStreakMultiplier(streak: number): number {
    if (streak >= 10) return STREAK_MULTIPLIERS[10];
    if (streak >= 5) return STREAK_MULTIPLIERS[5];
    if (streak >= 3) return STREAK_MULTIPLIERS[3];
    return 1.0;
}

/**
 * Calculate XP reward for a profitable trade
 */
export function calculateTradeXP(profitUsd: number, winStreak: number): number {
    if (profitUsd <= 0) return 0;

    // Base XP for any profit
    let xp = XP_PER_PROFITABLE_TRADE;

    // Bonus XP per $100 profit (Equivalent to 1000 kr in previous SEK logic)
    xp += Math.floor(profitUsd / 100) * XP_PER_1000_PROFIT;

    // Apply streak multiplier
    xp = Math.floor(xp * getStreakMultiplier(winStreak));

    return xp;
}

/**
 * Calculates the level based on total XP (reputation)
 * Formula: Level = floor(sqrt(xp / 10))
 * Examples:
 * 10 XP = Lvl 1
 * 40 XP = Lvl 2
 * 90 XP = Lvl 3
 * 1000 XP = Lvl 10
 */
export function getLevel(xp: number): number {
    if (xp < 0) return 0;
    return Math.floor(Math.sqrt(xp / 10));
}

/**
 * Calculates total XP required to reach a specific level
 */
export function getXpForLevel(level: number): number {
    return level * level * 10;
}

/**
 * Returns progress to next level (0-100)
 */
export function getProgressToNextLevel(xp: number): number {
    const currentLevel = getLevel(xp);
    const currentLevelXp = getXpForLevel(currentLevel);
    const nextLevelXp = getXpForLevel(currentLevel + 1);

    const xpInLevel = xp - currentLevelXp;
    const xpNeededForLevel = nextLevelXp - currentLevelXp;

    if (xpNeededForLevel === 0) return 100;

    return Math.min(100, Math.floor((xpInLevel / xpNeededForLevel) * 100));
}

/**
 * Returns a color class for the level badge
 */
export function getLevelColor(level: number): string {
    if (level >= 50) return "bg-amber-500 text-black border-amber-400"; // Legendary
    if (level >= 40) return "bg-rose-500 text-white border-rose-400";   // Master
    if (level >= 30) return "bg-purple-500 text-white border-purple-400"; // Diamond
    if (level >= 20) return "bg-blue-500 text-white border-blue-400";   // Platinum
    if (level >= 10) return "bg-emerald-500 text-black border-emerald-400"; // Gold
    if (level >= 5) return "bg-slate-500 text-white border-slate-400";  // Silver
    return "bg-slate-700 text-white/70 border-slate-600";               // Bronze
}
