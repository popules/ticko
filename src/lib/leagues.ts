import { supabase } from "./supabase/client";
import { Database } from "@/types/database";
import { getLevel } from "./level-system";

type League = Database['public']['Tables']['leagues']['Row'];
type LeaguePlacement = Database['public']['Tables']['league_placements']['Row'];

export async function getUserLeague(userId: string): Promise<LeaguePlacement | null> {
    try {
        const { data, error } = await supabase
            .from("league_placements")
            .select("*, leagues(*)")
            .eq("user_id", userId)
            .maybeSingle();

        if (error) {
            console.error("Error fetching user league:", error);
            return null;
        }

        return data;
    } catch (e) {
        console.error("Unexpected error fetching user league:", e);
        return null;
    }
}

export async function getLeagueLeaderboard(leagueId: string): Promise<LeaguePlacement[]> {
    try {
        const { data, error } = await supabase
            .from("league_placements")
            .select("*, profiles(*)")
            .eq("league_id", leagueId)
            .order("rank_in_league", { ascending: true })
            .limit(50);

        if (error) {
            console.error("Error fetching league leaderboard:", error);
            return [];
        }

        return data || [];
    } catch (e) {
        console.error("Unexpected error fetching leaderboard:", e);
        return [];
    }
}

// Logic to assign a user to a league based on their level/reputation
export async function assignUserToLeague(userId: string, seasonId: string): Promise<boolean> {
    try {
        // 1. Check if already in a league for this season
        const existing = await getUserLeague(userId);
        // Cast to any because the joined 'leagues' property might not be inferred correctly by standard types
        if (existing && (existing as any).leagues && (existing as any).leagues.season_id === seasonId) {
            return true; // Already assigned
        }

        // 2. Get user profile for reputation/level
        const { data: profile } = await supabase
            .from("profiles")
            .select("reputation_score")
            .eq("id", userId)
            .single();

        if (!profile) return false;

        const level = getLevel((profile as any).reputation_score || 0);

        // 3. Find appropriate league
        const { data: leagues } = await supabase
            .from("leagues")
            .select("*")
            .eq("season_id", seasonId)
            .order("tier", { ascending: true });

        if (!leagues || leagues.length === 0) {
            console.warn("No leagues found for season", seasonId);
            return false;
        }

        // Find match based on level tiers
        // Fallback to lowest tier if no match
        let targetLeague = leagues[0];

        for (const league of leagues) {
            // Cast league to any to avoid type errors if min_level/max_level aren't on the inferred type
            const l = league as any;
            if (level >= l.min_level && (l.max_level === null || level <= l.max_level)) {
                targetLeague = league;
                break;
            }
        }

        // 4. Create placement
        const { error: placementError } = await (supabase as any)
            .from("league_placements")
            .insert({
                league_id: (targetLeague as any).id,
                user_id: userId,
                rank_in_league: null // Will be calculated by cron/trigger later
            });

        if (placementError) {
            console.error("Failed to create placement:", placementError);
            return false;
        }

        return true;

    } catch (e) {
        console.error("Error assigning user to league:", e);
        return false;
    }
}
