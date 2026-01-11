import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(
    request: Request,
    { params }: { params: { postId: string } }
) {
    const { postId } = params;
    const cookieStore = await cookies();
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Cookie: cookieStore.toString() } },
    });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // 1. Fetch the post and prediction data
        const { data: post, error: fetchError } = await supabase
            .from("posts")
            .select("*, profiles(reputation_score)")
            .eq("id", postId)
            .single();

        if (fetchError || !post) throw new Error("Inlägg hittades inte");
        if (!post.is_prediction || post.prediction_status !== "pending") {
            return NextResponse.json({ message: "Ingen väntande prediktion att evaluera" });
        }

        // 2. Fetch current price
        const ticker = post.ticker_symbol;
        if (!ticker) throw new Error("Inget ticker-symbol för inlägget");

        const res = await fetch(`${new URL(request.url).origin}/api/stocks/${ticker}`);
        const stockData = await res.json();

        if (!stockData || !stockData.price) {
            throw new Error("Kunde inte hämta aktuellt pris för evaluering");
        }

        const currentPrice = stockData.price;
        const entryPrice = post.prediction_price;
        const sentiment = post.sentiment;

        // 3. Determine outcome
        let outcome: "correct" | "incorrect" = "incorrect";
        if (sentiment === "bull" && currentPrice > entryPrice) outcome = "correct";
        if (sentiment === "bear" && currentPrice < entryPrice) outcome = "correct";

        // 4. Update post status
        const { error: updateError } = await supabase
            .from("posts")
            .update({ prediction_status: outcome })
            .eq("id", postId);

        if (updateError) throw updateError;

        // 5. Update user reputation
        const scoreChange = outcome === "correct" ? 10 : -5;
        const currentScore = post.profiles?.reputation_score || 0;

        const { error: profileError } = await supabase
            .from("profiles")
            .update({ reputation_score: currentScore + scoreChange })
            .eq("id", post.user_id);

        if (profileError) throw profileError;

        return NextResponse.json({
            success: true,
            outcome,
            scoreChange,
            currentPrice,
            entryPrice
        });

    } catch (error: any) {
        console.error("Evaluation error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
