import { createClient, SupabaseClient } from "@supabase/supabase-js";

const FREE_AI_LIMIT_PER_DAY = 3;

interface MeteringResult {
    allowed: boolean;
    isPro: boolean;
    usageCount: number;
    limit: number;
    error?: string;
}

/**
 * Check if a user is Pro (active subscription)
 */
export function isUserPro(profile: { is_pro?: boolean; pro_expires_at?: string | null }): boolean {
    if (!profile.is_pro) return false;
    if (!profile.pro_expires_at) return profile.is_pro; // Legacy pro without expiration
    return new Date(profile.pro_expires_at) > new Date();
}

/**
 * Check and increment AI usage for a user.
 * Returns whether the request is allowed and current usage stats.
 * 
 * - Pro users: always allowed, no metering
 * - Free users: limited to FREE_AI_LIMIT_PER_DAY requests per day
 */
export async function checkAndIncrementAIUsage(
    supabase: SupabaseClient,
    userId: string
): Promise<MeteringResult> {
    // Get user profile with Pro status and AI usage
    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("is_pro, pro_expires_at, ai_usage_count, ai_usage_date")
        .eq("id", userId)
        .single();

    if (profileError || !profile) {
        return {
            allowed: false,
            isPro: false,
            usageCount: 0,
            limit: FREE_AI_LIMIT_PER_DAY,
            error: "Could not fetch user profile"
        };
    }

    // Pro users bypass metering
    if (isUserPro(profile)) {
        return {
            allowed: true,
            isPro: true,
            usageCount: 0,
            limit: Infinity
        };
    }

    // Free user metering
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    let currentCount = profile.ai_usage_count || 0;
    const lastUsageDate = profile.ai_usage_date;

    // Reset count if it's a new day
    if (lastUsageDate !== today) {
        currentCount = 0;
    }

    // Check if limit reached
    if (currentCount >= FREE_AI_LIMIT_PER_DAY) {
        return {
            allowed: false,
            isPro: false,
            usageCount: currentCount,
            limit: FREE_AI_LIMIT_PER_DAY
        };
    }

    // Increment usage
    const newCount = currentCount + 1;
    const { error: updateError } = await supabase
        .from("profiles")
        .update({
            ai_usage_count: newCount,
            ai_usage_date: today
        })
        .eq("id", userId);

    if (updateError) {
        console.error("Failed to update AI usage:", updateError);
        // Still allow the request even if we couldn't update the counter
    }

    return {
        allowed: true,
        isPro: false,
        usageCount: newCount,
        limit: FREE_AI_LIMIT_PER_DAY
    };
}

/**
 * Get current AI usage stats without incrementing
 */
export async function getAIUsageStats(
    supabase: SupabaseClient,
    userId: string
): Promise<{ isPro: boolean; usageCount: number; limit: number; remainingToday: number }> {
    const { data: profile } = await supabase
        .from("profiles")
        .select("is_pro, pro_expires_at, ai_usage_count, ai_usage_date")
        .eq("id", userId)
        .single();

    if (!profile) {
        return { isPro: false, usageCount: 0, limit: FREE_AI_LIMIT_PER_DAY, remainingToday: FREE_AI_LIMIT_PER_DAY };
    }

    const isPro = isUserPro(profile);
    if (isPro) {
        return { isPro: true, usageCount: 0, limit: Infinity, remainingToday: Infinity };
    }

    const today = new Date().toISOString().split("T")[0];
    const usageCount = profile.ai_usage_date === today ? (profile.ai_usage_count || 0) : 0;

    return {
        isPro: false,
        usageCount,
        limit: FREE_AI_LIMIT_PER_DAY,
        remainingToday: Math.max(0, FREE_AI_LIMIT_PER_DAY - usageCount)
    };
}

/**
 * Create the standard 402 response for limit reached
 */
export function createLimitReachedResponse() {
    return {
        error: "limit_reached",
        message: "You've used your 3 free AI analyses today. Upgrade to Pro for unlimited insights.",
        upgrade_url: "/pro"
    };
}
