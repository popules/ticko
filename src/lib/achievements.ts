import { supabase } from "./supabase/client";

// Achievement definitions with criteria
export interface Achievement {
    key: string;
    name: string;
    description: string;
    emoji: string;
    category: "engagement" | "community" | "prediction" | "milestone";
    rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
    points: number;
}

export const ACHIEVEMENTS: Record<string, Achievement> = {
    // Engagement achievements
    EARLY_ADOPTER: {
        key: "early_adopter",
        name: "Pionjär",
        description: "Gick med under beta-perioden",
        emoji: "🚀",
        category: "milestone",
        rarity: "rare",
        points: 50,
    },
    FIRST_POST: {
        key: "first_post",
        name: "Första Inlägget",
        description: "Skapade ditt första inlägg",
        emoji: "✍️",
        category: "engagement",
        rarity: "common",
        points: 10,
    },
    PROLIFIC_POSTER: {
        key: "prolific_poster",
        name: "Aktiv Skribent",
        description: "Skapat 50+ inlägg",
        emoji: "📝",
        category: "engagement",
        rarity: "uncommon",
        points: 25,
    },
    CENTURY_CLUB: {
        key: "century_club",
        name: "Hundraklubben",
        description: "Skapat 100+ inlägg",
        emoji: "💯",
        category: "engagement",
        rarity: "rare",
        points: 50,
    },

    // Community achievements
    FIRST_FOLLOWER: {
        key: "first_follower",
        name: "Första Följaren",
        description: "Fick din första följare",
        emoji: "👋",
        category: "community",
        rarity: "common",
        points: 10,
    },
    INFLUENCER: {
        key: "influencer",
        name: "Influencer",
        description: "Har 50+ följare",
        emoji: "⭐",
        category: "community",
        rarity: "rare",
        points: 100,
    },
    CELEBRITY: {
        key: "celebrity",
        name: "Kändis",
        description: "Har 100+ följare",
        emoji: "🌟",
        category: "community",
        rarity: "epic",
        points: 200,
    },
    SUPPORTER: {
        key: "supporter",
        name: "Supporter",
        description: "Reaktade på 50+ inlägg",
        emoji: "❤️",
        category: "community",
        rarity: "common",
        points: 15,
    },
    COMMENTER: {
        key: "commenter",
        name: "Kommentator",
        description: "Skrev 25+ kommentarer",
        emoji: "💬",
        category: "community",
        rarity: "uncommon",
        points: 20,
    },

    // Prediction achievements
    FIRST_PREDICTION: {
        key: "first_prediction",
        name: "Siare",
        description: "Gjorde din första förutsägelse",
        emoji: "🔮",
        category: "prediction",
        rarity: "common",
        points: 10,
    },
    ORACLE: {
        key: "oracle",
        name: "Orakel",
        description: "5 korrekta förutsägelser i rad",
        emoji: "🎯",
        category: "prediction",
        rarity: "epic",
        points: 150,
    },
    CRYSTAL_BALL: {
        key: "crystal_ball",
        name: "Kristallkula",
        description: "10 korrekta förutsägelser totalt",
        emoji: "🪄",
        category: "prediction",
        rarity: "rare",
        points: 75,
    },
    PROPHET: {
        key: "prophet",
        name: "Profet",
        description: "25 korrekta förutsägelser totalt",
        emoji: "🏆",
        category: "prediction",
        rarity: "legendary",
        points: 300,
    },

    // Milestone achievements
    RISING_STAR: {
        key: "rising_star",
        name: "Stigande Stjärna",
        description: "Nådde 100 reputation",
        emoji: "✨",
        category: "milestone",
        rarity: "common",
        points: 10,
    },
    VETERAN: {
        key: "veteran",
        name: "Veteran",
        description: "Nådde 1000 reputation",
        emoji: "🏅",
        category: "milestone",
        rarity: "rare",
        points: 50,
    },
    LEGEND: {
        key: "legend",
        name: "Legend",
        description: "Nådde 10000 reputation",
        emoji: "👑",
        category: "milestone",
        rarity: "legendary",
        points: 500,
    },
    WATCHLIST_KING: {
        key: "watchlist_king",
        name: "Bevakningskung",
        description: "Har 25+ aktier på bevakningslistan",
        emoji: "👁️",
        category: "engagement",
        rarity: "uncommon",
        points: 20,
    },
    PORTFOLIO_PRO: {
        key: "portfolio_pro",
        name: "Portföljproffs",
        description: "Lade till 10+ aktier i portföljen",
        emoji: "💼",
        category: "engagement",
        rarity: "uncommon",
        points: 25,
    },

    // Paper Trading achievements
    FIRST_PAPER_TRADE: {
        key: "first_paper_trade",
        name: "Första Pappershandeln",
        description: "Genomförde din första paper trade",
        emoji: "🎮",
        category: "engagement",
        rarity: "common",
        points: 10,
    },
    PAPER_10X: {
        key: "paper_10x",
        name: "Tiodubblingen",
        description: "Nådde 1M kr i paper trading",
        emoji: "🚀",
        category: "milestone",
        rarity: "epic",
        points: 200,
    },
    PAPER_WINNER: {
        key: "paper_winner",
        name: "Säsongens Vinnare",
        description: "Vann en veckas paper trading-topplista",
        emoji: "🏆",
        category: "milestone",
        rarity: "legendary",
        points: 500,
    },
    PAPER_COMEBACK: {
        key: "paper_comeback",
        name: "Comeback Kid",
        description: "Gick från -50% till positiv avkastning",
        emoji: "💪",
        category: "milestone",
        rarity: "rare",
        points: 75,
    },
    PAPER_STREAK_3: {
        key: "paper_streak_3",
        name: "Tre i Rad",
        description: "3 lönsamma trades i rad",
        emoji: "🔥",
        category: "engagement",
        rarity: "uncommon",
        points: 25,
    },
    PAPER_DIVERSIFIED: {
        key: "paper_diversified",
        name: "Diversifierad",
        description: "Har 10+ olika aktier i paper portföljen",
        emoji: "🌐",
        category: "engagement",
        rarity: "uncommon",
        points: 20,
    },
};

// Rarity colors for UI
export const RARITY_COLORS: Record<Achievement["rarity"], string> = {
    common: "text-gray-400 bg-gray-500/10 border-gray-500/20",
    uncommon: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    rare: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    epic: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    legendary: "text-amber-400 bg-amber-500/10 border-amber-500/20",
};

export const RARITY_NAMES: Record<Achievement["rarity"], string> = {
    common: "Vanlig",
    uncommon: "Ovanlig",
    rare: "Sällsynt",
    epic: "Episk",
    legendary: "Legendarisk",
};

/**
 * Award an achievement to a user
 */
export async function awardAchievement(userId: string, achievementKey: string): Promise<boolean> {
    const achievement = Object.values(ACHIEVEMENTS).find(a => a.key === achievementKey);
    if (!achievement) return false;

    try {
        // Check if user already has this achievement
        const { data: existing } = await supabase
            .from("user_achievements")
            .select("id")
            .eq("user_id", userId)
            .eq("achievement_key", achievementKey)
            .single();

        if (existing) return false; // Already has it

        // Award the achievement
        const { error } = await (supabase as any)
            .from("user_achievements")
            .insert({
                user_id: userId,
                achievement_key: achievementKey,
                awarded_at: new Date().toISOString(),
            });

        if (error) {
            console.error("Failed to award achievement:", error);
            return false;
        }

        // Update user's reputation with achievement points
        const { data: profile } = await supabase
            .from("profiles")
            .select("reputation_score")
            .eq("id", userId)
            .single();

        if (profile) {
            await (supabase as any)
                .from("profiles")
                .update({
                    reputation_score: ((profile as any).reputation_score || 0) + achievement.points,
                })
                .eq("id", userId);
        }

        // Create notification
        await (supabase as any).from("notifications").insert({
            user_id: userId,
            type: "achievement",
            title: `🏆 Ny prestation: ${achievement.name}!`,
            content: achievement.description,
            read: false,
        });

        return true;
    } catch (e) {
        console.error("Achievement error:", e);
        return false;
    }
}

/**
 * Check all achievements for a user and award any new ones
 */
export async function checkAchievements(userId: string): Promise<string[]> {
    const awarded: string[] = [];

    try {
        // Get user stats
        const [
            { count: postCount },
            { count: followerCount },
            { count: reactionCount },
            { count: commentCount },
            { count: watchlistCount },
            { count: portfolioCount },
            { count: correctPredictions },
            { data: profile },
        ] = await Promise.all([
            supabase.from("posts").select("*", { count: "exact", head: true }).eq("user_id", userId),
            supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", userId),
            supabase.from("reactions").select("*", { count: "exact", head: true }).eq("user_id", userId),
            supabase.from("comments").select("*", { count: "exact", head: true }).eq("user_id", userId),
            supabase.from("watchlists").select("*", { count: "exact", head: true }).eq("user_id", userId),
            supabase.from("portfolio").select("*", { count: "exact", head: true }).eq("user_id", userId),
            supabase.from("posts").select("*", { count: "exact", head: true })
                .eq("user_id", userId)
                .eq("is_prediction", true)
                .eq("prediction_status", "correct"),
            supabase.from("profiles").select("reputation_score, created_at").eq("id", userId).single(),
        ]);

        const reputation = (profile as any)?.reputation_score || 0;

        // Check each achievement
        const checks: [string, boolean][] = [
            // Post achievements
            ["first_post", (postCount || 0) >= 1],
            ["prolific_poster", (postCount || 0) >= 50],
            ["century_club", (postCount || 0) >= 100],

            // Community achievements
            ["first_follower", (followerCount || 0) >= 1],
            ["influencer", (followerCount || 0) >= 50],
            ["celebrity", (followerCount || 0) >= 100],
            ["supporter", (reactionCount || 0) >= 50],
            ["commenter", (commentCount || 0) >= 25],

            // Prediction achievements
            ["crystal_ball", (correctPredictions || 0) >= 10],
            ["prophet", (correctPredictions || 0) >= 25],

            // Milestone achievements
            ["rising_star", reputation >= 100],
            ["veteran", reputation >= 1000],
            ["legend", reputation >= 10000],

            // Collection achievements
            ["watchlist_king", (watchlistCount || 0) >= 25],
            ["portfolio_pro", (portfolioCount || 0) >= 10],
        ];

        for (const [key, condition] of checks) {
            if (condition) {
                const wasAwarded = await awardAchievement(userId, key);
                if (wasAwarded) awarded.push(key);
            }
        }
    } catch (e) {
        console.error("Check achievements error:", e);
    }

    return awarded;
}

/**
 * Get all achievements for a user
 */
export async function getUserAchievements(userId: string): Promise<Achievement[]> {
    try {
        const { data } = await (supabase as any)
            .from("user_achievements")
            .select("achievement_key, awarded_at")
            .eq("user_id", userId)
            .order("awarded_at", { ascending: false });

        if (!data) return [];

        return (data as any[])
            .map(ua => Object.values(ACHIEVEMENTS).find(a => a.key === ua.achievement_key))
            .filter((a): a is Achievement => a !== undefined);
    } catch {
        return [];
    }
}

// Legacy export for backwards compatibility
export async function checkAndAwardAchievement(userId: string, key: string) {
    return awardAchievement(userId, key);
}
