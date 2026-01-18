// Subscription tier configuration for Ticko

export const SUBSCRIPTION_TIERS = {
    FREE: {
        name: "Gratis",
        price: 0,
        paperTrading: {
            startingCapital: 100000, // 100k SEK
            resetThreshold: 25000, // Can reset when < 25k
            resetCooldownDays: 7, // 7 days between resets
        },
        features: [
            "Paper trading med 100k virtuella kronor",
            "Obegränsade inlägg och reaktioner",
            "Bevakningslista",
            "AI-aktieanalys",
        ],
    },
    PRO: {
        name: "Pro",
        price: 29, // 29 kr/månad
        paperTrading: {
            startingCapital: 1000000, // 1M SEK
            resetThreshold: 100000, // Can reset when < 100k
            resetCooldownDays: 3, // 3 days between resets
        },
        features: [
            "Paper trading med 1M virtuella kronor",
            "Snabbare reset (3 dagar istället för 7)",
            "Pro-badge på profilen",
            "Prioriterad support",
            "Tidig tillgång till nya funktioner",
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
