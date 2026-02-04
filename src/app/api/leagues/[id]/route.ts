import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * Get Fantasy League details and leaderboard
 */
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = await createSupabaseServerClient();

        // Authenticate user (optional - could allow public viewing)
        const { data: { user } } = await supabase.auth.getUser();

        // Get league details
        const { data: leagueData, error: leagueError } = await supabase
            .from("fantasy_leagues")
            .select(`
                id,
                name,
                invite_code,
                creator_id,
                starting_capital,
                start_date,
                end_date,
                duration_days,
                max_members,
                is_active
            `)
            .eq("id", id)
            .single();

        const league = leagueData as any;

        if (leagueError || !league) {
            return NextResponse.json({ error: "League not found" }, { status: 404 });
        }

        // Get all members with their profiles, sorted by current_value
        const { data: members, error: membersError } = await supabase
            .from("fantasy_league_members")
            .select(`
                id,
                user_id,
                rank_in_league,
                current_value,
                starting_value,
                joined_at,
                profile:profiles (
                    id,
                    username,
                    avatar_url,
                    league_rating
                )
            `)
            .eq("league_id", id)
            .order("current_value", { ascending: false });

        if (membersError) {
            console.error("Fetch members error:", membersError);
            return NextResponse.json({ error: "Failed to fetch members" }, { status: 500 });
        }

        // Calculate days remaining
        const endDate = league.end_date ? new Date(league.end_date) : null;
        const now = new Date();
        const daysRemaining = endDate
            ? Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
            : null;

        // Check if user is a member
        const isMember = user ? members?.some((m: any) => m.user_id === user.id) : false;
        const userMembership = user ? members?.find((m: any) => m.user_id === user.id) : null;

        // Format members for response
        const formattedMembers = (members || []).map((member: any, index: number) => ({
            user_id: member.user_id,
            username: member.profile?.username || "Unknown",
            avatar_url: member.profile?.avatar_url,
            league_rating: member.profile?.league_rating,
            rank: index + 1,
            current_value: member.current_value,
            starting_value: member.starting_value,
            pnl: member.current_value - member.starting_value,
            pnl_percent: member.starting_value > 0
                ? ((member.current_value - member.starting_value) / member.starting_value) * 100
                : 0,
            is_current_user: user?.id === member.user_id,
        }));

        // Generate invite URL
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://tickomarkets.com";
        const invite_url = `${baseUrl}/leagues/join/${league.invite_code}`;

        return NextResponse.json({
            league: {
                id: league.id,
                name: league.name,
                invite_code: league.invite_code,
                invite_url,
                creator_id: league.creator_id,
                is_creator: user?.id === league.creator_id,
                starting_capital: league.starting_capital,
                start_date: league.start_date,
                end_date: league.end_date,
                duration_days: league.duration_days,
                max_members: league.max_members,
                members_count: members?.length || 0,
                is_active: league.is_active && (daysRemaining === null || daysRemaining > 0),
                days_remaining: daysRemaining,
            },
            members: formattedMembers,
            is_member: isMember,
            my_rank: userMembership ? formattedMembers.findIndex((m: any) => m.is_current_user) + 1 : null,
        });

    } catch (error: any) {
        console.error("League detail error:", error);
        return NextResponse.json({ error: error.message || "Failed to fetch league" }, { status: 500 });
    }
}
