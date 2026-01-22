// Subscription tier configuration for Ticko
// Note: All users get the same $10k budget to ensure fair competition

export const SUBSCRIPTION_TIERS = {
    FREE: {
        name: "Free",
        price: 0,
        paperTrading: {
            startingCapital: 10000, // $10k USD - same for everyone for fair competition
            resetThreshold: 2500, // Can reset when < $2.5k
            resetCooldownDays: 7, // 7 days between resets
        },
        features: [
            "Paper trading with $10k virtual dollars",
            "Unlimited posts and reactions",
            "Watchlist",
            "AI stock analysis",
            "Compete on the leaderboard",
        ],
    },
} as const;

export type SubscriptionTier = keyof typeof SUBSCRIPTION_TIERS;

// Helper to get user's tier settings
// Note: isPro param kept for backwards compatibility but all users get same settings
export function getUserTierSettings(isPro: boolean) {
    return SUBSCRIPTION_TIERS.FREE;
}

// Helper to get paper trading settings for a tier
export function getPaperTradingSettings(isPro: boolean) {
    return SUBSCRIPTION_TIERS.FREE.paperTrading;
}

