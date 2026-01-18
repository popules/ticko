export const XP_PER_POST = 10;
export const XP_PER_COMMENT = 5;
export const XP_PER_REACTION = 1;

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
