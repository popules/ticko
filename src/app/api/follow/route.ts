import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(request: Request) {
    const cookieStore = await cookies();
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Cookie: cookieStore.toString() } },
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { following_id } = await request.json();

    if (!following_id) {
        return NextResponse.json({ error: "following_id is required" }, { status: 400 });
    }

    if (user.id === following_id) {
        return NextResponse.json({ error: "You cannot follow yourself" }, { status: 400 });
    }

    // Check if already following
    const { data: existingFollow, error: fetchError } = await (supabase as any)
        .from("follows")
        .select("*")
        .eq("follower_id", user.id)
        .eq("following_id", following_id)
        .single();

    if (existingFollow) {
        // Unfollow
        const { error: deleteError } = await (supabase as any)
            .from("follows")
            .delete()
            .eq("follower_id", user.id)
            .eq("following_id", following_id);

        if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 });
        return NextResponse.json({ following: false });
    } else {
        // Follow
        const { error: insertError } = await (supabase as any)
            .from("follows")
            .insert({ follower_id: user.id, following_id });

        if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });

        // Create notification for the person being followed
        await (supabase as any).from("notifications").insert({
            user_id: following_id,
            actor_id: user.id,
            type: "follow"
        });

        return NextResponse.json({ following: true });
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const targetUserId = searchParams.get("targetUserId");

    const cookieStore = await cookies();
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Cookie: cookieStore.toString() } },
    });

    if (!targetUserId) {
        return NextResponse.json({ error: "targetUserId is required" }, { status: 400 });
    }

    // Get followers/following counts
    const [followersCount, followingCount, isFollowing] = await Promise.all([
        (supabase as any).from("follows").select("*", { count: "exact", head: true }).eq("following_id", targetUserId),
        (supabase as any).from("follows").select("*", { count: "exact", head: true }).eq("follower_id", targetUserId),
        userId ? (supabase as any).from("follows").select("*").eq("follower_id", userId).eq("following_id", targetUserId).single() : null
    ]);

    return NextResponse.json({
        followers: followersCount.count || 0,
        following: followingCount.count || 0,
        isFollowing: !!isFollowing?.data
    });
}
