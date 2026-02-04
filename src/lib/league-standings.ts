import { getSupabaseAdmin } from "@/lib/supabase-admin";

const STARTING_CAPITAL = 10000;
const EXCHANGE_RATE_USD_SEK = 10.5;

/**
 * Calculate a user's total portfolio value in USD
 */
export async function calculatePortfolioValue(userId: string): Promise<number> {
    const admin = getSupabaseAdmin();

    const { data: holdings } = await admin
        .from("portfolio")
        .select("shares, buy_price, currency, symbol")
        .eq("user_id", userId);

    if (!holdings || holdings.length === 0) {
        return STARTING_CAPITAL;
    }

    // For simplicity, we use buy_price as current value
    // In production, you'd fetch live prices, but that's expensive per trade
    let totalValueUsd = 0;
    for (const item of holdings) {
        const rateToUsd = item.currency === "SEK" ? (1 / EXCHANGE_RATE_USD_SEK) : 1;
        totalValueUsd += Math.abs(item.shares) * item.buy_price * rateToUsd;
    }

    // Add remaining cash
    let totalInvestedUsd = 0;
    for (const item of holdings) {
        const rateToUsd = item.currency === "SEK" ? (1 / EXCHANGE_RATE_USD_SEK) : 1;
        totalInvestedUsd += item.shares * item.buy_price * rateToUsd;
    }
    const cashBalance = STARTING_CAPITAL - totalInvestedUsd;

    return Math.round(cashBalance + totalValueUsd);
}

/**
 * Update user's current_value in all their fantasy leagues
 * Returns array of rank changes: { league_id, old_rank, new_rank, passed_users: string[] }
 */
export async function updateLeagueStandings(userId: string): Promise<Array<{
    league_id: string;
    league_name: string;
    old_rank: number;
    new_rank: number;
    passed_users: string[];
}>> {
    const admin = getSupabaseAdmin();
    const rankChanges: Array<{
        league_id: string;
        league_name: string;
        old_rank: number;
        new_rank: number;
        passed_users: string[];
    }> = [];

    try {
        // Get user's new portfolio value
        const newValue = await calculatePortfolioValue(userId);

        // Get all leagues user is in
        const { data: memberships } = await admin
            .from("fantasy_league_members")
            .select(`
                id,
                league_id,
                current_value,
                rank_in_league,
                fantasy_leagues (
                    id,
                    name,
                    is_active
                )
            `)
            .eq("user_id", userId);

        if (!memberships || memberships.length === 0) {
            return rankChanges;
        }

        // Update each league
        for (const membership of memberships as any[]) {
            if (!membership.fantasy_leagues?.is_active) continue;

            const leagueId = membership.league_id;
            const oldRank = membership.rank_in_league || 999;
            const oldValue = membership.current_value;

            // Update user's current value
            await admin
                .from("fantasy_league_members")
                .update({ current_value: newValue })
                .eq("id", membership.id);

            // Recalculate all ranks in this league
            const { data: allMembers } = await admin
                .from("fantasy_league_members")
                .select(`
                    id,
                    user_id,
                    current_value,
                    profiles (
                        username
                    )
                `)
                .eq("league_id", leagueId)
                .order("current_value", { ascending: false });

            if (!allMembers) continue;

            // Update ranks and track passed users
            const passedUsers: string[] = [];
            let newRank = 999;

            for (let i = 0; i < allMembers.length; i++) {
                const member = allMembers[i] as any;
                const rank = i + 1;

                await admin
                    .from("fantasy_league_members")
                    .update({ rank_in_league: rank })
                    .eq("id", member.id);

                if (member.user_id === userId) {
                    newRank = rank;
                }

                // Check if this user was passed
                if (member.user_id !== userId && newValue > member.current_value) {
                    // User passed this member (they were ahead before, now behind)
                    if (oldValue <= member.current_value) {
                        passedUsers.push(member.profiles?.username || "someone");
                    }
                }
            }

            // Record rank change if improved
            if (newRank < oldRank) {
                rankChanges.push({
                    league_id: leagueId,
                    league_name: membership.fantasy_leagues?.name || "League",
                    old_rank: oldRank,
                    new_rank: newRank,
                    passed_users: passedUsers,
                });
            }
        }

        return rankChanges;

    } catch (error) {
        console.error("Error updating league standings:", error);
        return rankChanges;
    }
}

/**
 * Create a notification for a user
 */
export async function createNotification({
    userId,
    type,
    message,
    actorId,
    leagueId,
    metadata,
}: {
    userId: string;
    type: "league_rank_up" | "league_invite" | "league_ending" | "comment" | "mention" | "reaction";
    message: string;
    actorId?: string;
    leagueId?: string;
    metadata?: Record<string, any>;
}) {
    const admin = getSupabaseAdmin();

    try {
        await admin.from("notifications").insert({
            user_id: userId,
            type,
            message,
            actor_id: actorId || null,
            league_id: leagueId || null,
            metadata: metadata || null,
            is_read: false,
        });
    } catch (error) {
        console.error("Error creating notification:", error);
    }
}

/**
 * Send rank up notifications when a user passes others in a league
 */
export async function sendRankUpNotifications(
    userId: string,
    rankChanges: Array<{
        league_id: string;
        league_name: string;
        old_rank: number;
        new_rank: number;
        passed_users: string[];
    }>
) {
    for (const change of rankChanges) {
        if (change.new_rank < change.old_rank) {
            let message = `🏆 You moved up to #${change.new_rank} in "${change.league_name}"!`;

            if (change.passed_users.length === 1) {
                message = `🏆 You passed @${change.passed_users[0]} and moved to #${change.new_rank} in "${change.league_name}"!`;
            } else if (change.passed_users.length > 1) {
                message = `🏆 You passed ${change.passed_users.length} people and moved to #${change.new_rank} in "${change.league_name}"!`;
            }

            await createNotification({
                userId,
                type: "league_rank_up",
                message,
                leagueId: change.league_id,
                metadata: {
                    old_rank: change.old_rank,
                    new_rank: change.new_rank,
                    passed_users: change.passed_users,
                },
            });
        }
    }
}
