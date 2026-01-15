import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        // Get posts from the last 24 hours with sentiment
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

        const { data: posts, error } = await supabase
            .from("posts")
            .select("sentiment, created_at")
            .gte("created_at", oneDayAgo);

        if (error) {
            console.error("Sentiment fetch error:", error);
            throw error;
        }

        // Count sentiments
        let bullish = 0;
        let bearish = 0;
        let neutral = 0;

        (posts || []).forEach((post) => {
            if (post.sentiment === "bullish" || post.sentiment === "bull") {
                bullish++;
            } else if (post.sentiment === "bearish" || post.sentiment === "bear") {
                bearish++;
            } else {
                neutral++;
            }
        });

        const total = bullish + bearish + neutral;

        // Calculate percentages (default to balanced if no posts)
        let greed = 50;
        let fear = 30;
        let neutralPercent = 20;

        if (total > 0) {
            greed = Math.round((bullish / total) * 100);
            fear = Math.round((bearish / total) * 100);
            neutralPercent = 100 - greed - fear;
        }

        // Determine dominant sentiment for label
        let dominant: "greed" | "fear" | "neutral" = "neutral";
        if (greed > fear && greed > neutralPercent) dominant = "greed";
        if (fear > greed && fear > neutralPercent) dominant = "fear";

        return NextResponse.json({
            greed,
            fear,
            neutral: neutralPercent,
            dominant,
            totalPosts: total,
            period: "24h"
        });

    } catch (error: any) {
        console.error("Sentiment API error:", error);
        // Return default values on error
        return NextResponse.json({
            greed: 50,
            fear: 30,
            neutral: 20,
            dominant: "neutral",
            totalPosts: 0,
            period: "24h"
        });
    }
}
