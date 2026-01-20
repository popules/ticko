// Subscription tier configuration for Ticko

export const SUBSCRIPTION_TIERS = {
    FREE: {
        name: "Free",
        price: 0,
        paperTrading: {
            startingCapital: 10000, // $10k USD
            resetThreshold: 2500, // Can reset when < $2.5k
            resetCooldownDays: 7, // 7 days between resets
        },
        features: [
            "Paper trading with $10k virtual dollars",
            "Unlimited posts and reactions",
            "Watchlist",
            "AI stock analysis",
        ],
    },
    PRO: {
        name: "Pro",
        price: 4.99, // $4.99/month
        paperTrading: {
            startingCapital: 100000, // $100k USD
            resetThreshold: 10000, // Can reset when < $10k
            resetCooldownDays: 3, // 3 days between resets
        },
        features: [
            "Paper trading with $100k virtual dollars",
            "Faster reset (3 days instead of 7)",
            "Pro badge on profile",
            "Priority support",
            "Early access to new features",
        ],
        badge: {
            emoji: "👑",
            color: "text-amber-400",
            bgColor: "bg-amber-500/10",
            borderColor: "border-amber-500/30",
        },
    },
} as const;

export type SubscriptionTier = keyof typeof SUBSCRIPTION_TIERS;

// Helper to get user's tier settings
export function getUserTierSettings(isPro: boolean) {
    return isPro ? SUBSCRIPTION_TIERS.PRO : SUBSCRIPTION_TIERS.FREE;
}

// Helper to get paper trading settings for a tier
export function getPaperTradingSettings(isPro: boolean) {
    return getUserTierSettings(isPro).paperTrading;
}
