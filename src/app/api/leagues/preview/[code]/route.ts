import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

/**
 * Get a preview of a Fantasy League by invite code (public, no auth required)
 */
export async function GET(
    request: Request,
    { params }: { params: Promise<{ code: string }> }
) {
    try {
        const { code } = await params;
        const admin = getSupabaseAdmin();

        // Find the league by invite code
        const { data: league, error: leagueError } = await admin
            .from("fantasy_leagues")
            .select("id, name, creator_id, max_members, end_date, is_active")
            .eq("invite_code", code.toUpperCase().trim())
            .single();

        if (leagueError || !league) {
            return NextResponse.json({ error: "League not found" }, { status: 404 });
        }

        // Get member count
        const { count } = await admin
            .from("fantasy_league_members")
            .select("*", { count: "exact", head: true })
            .eq("league_id", league.id);

        // Calculate days remaining
        const endDate = league.end_date ? new Date(league.end_date) : null;
        const now = new Date();
        const daysRemaining = endDate
            ? Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
            : null;

        return NextResponse.json({
            id: league.id,
            name: league.name,
            creator_id: league.creator_id,
            members_count: count || 0,
            max_members: league.max_members,
            days_remaining: daysRemaining,
            is_active: league.is_active && (daysRemaining === null || daysRemaining > 0),
        });

    } catch (error: any) {
        console.error("League preview error:", error);
        return NextResponse.json({ error: error.message || "Failed to fetch league" }, { status: 500 });
    }
}
