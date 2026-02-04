import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { nanoid } from "nanoid";

export const dynamic = "force-dynamic";

/**
 * Create a new Fantasy League
 */
export async function POST(request: Request) {
    try {
        const supabase = await createSupabaseServerClient();
        const admin = getSupabaseAdmin();

        // Authenticate user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (!user || authError) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Parse request body
        const { name, duration_days = 30, max_members = 10 } = await request.json();

        if (!name || name.trim().length < 2) {
            return NextResponse.json({ error: "League name must be at least 2 characters" }, { status: 400 });
        }

        if (name.trim().length > 30) {
            return NextResponse.json({ error: "League name must be 30 characters or less" }, { status: 400 });
        }

        // Generate unique invite code (8 characters, uppercase alphanumeric)
        const invite_code = nanoid(8).toUpperCase();

        // Calculate end date
        const start_date = new Date();
        const end_date = new Date();
        end_date.setDate(end_date.getDate() + duration_days);

        // Get user's current portfolio value for starting value
        const { data: portfolio } = await admin
            .from("portfolio")
            .select("shares, buy_price, currency")
            .eq("user_id", user.id);

        // Calculate current portfolio value in USD
        const EXCHANGE_RATE_USD_SEK = 10.5;
        const STARTING_CAPITAL = 10000;

        let totalInvestedUsd = 0;
        (portfolio || []).forEach((item: any) => {
            const rateToUsd = item.currency === "SEK" ? (1 / EXCHANGE_RATE_USD_SEK) : 1;
            totalInvestedUsd += item.shares * item.buy_price * rateToUsd;
        });

        const currentValue = Math.round(STARTING_CAPITAL - totalInvestedUsd + totalInvestedUsd); // Total portfolio value

        // Create the league
        const { data: league, error: leagueError } = await admin
            .from("fantasy_leagues")
            .insert({
                name: name.trim(),
                invite_code,
                creator_id: user.id,
                starting_capital: STARTING_CAPITAL,
                start_date: start_date.toISOString(),
                end_date: end_date.toISOString(),
                duration_days,
                max_members,
                is_active: true,
            })
            .select()
            .single();

        if (leagueError) {
            console.error("League creation error:", leagueError);
            return NextResponse.json({ error: "Failed to create league" }, { status: 500 });
        }

        // Add creator as first member
        const { error: memberError } = await admin
            .from("fantasy_league_members")
            .insert({
                league_id: league.id,
                user_id: user.id,
                starting_value: currentValue,
                current_value: currentValue,
                rank_in_league: 1,
            });

        if (memberError) {
            console.error("Member creation error:", memberError);
            // If member creation fails, delete the league
            await admin.from("fantasy_leagues").delete().eq("id", league.id);
            return NextResponse.json({ error: "Failed to join league" }, { status: 500 });
        }

        // Generate invite URL
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://tickomarkets.com";
        const invite_url = `${baseUrl}/leagues/join/${invite_code}`;

        return NextResponse.json({
            id: league.id,
            name: league.name,
            invite_code,
            invite_url,
            duration_days,
            max_members,
            end_date: league.end_date,
        });

    } catch (error: any) {
        console.error("Create league error:", error);
        return NextResponse.json({ error: error.message || "Failed to create league" }, { status: 500 });
    }
}
