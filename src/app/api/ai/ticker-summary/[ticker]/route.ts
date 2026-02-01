import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { openai } from "@/lib/openai";
import { TICKER_SUMMARY_SYSTEM_PROMPT } from "@/config/ai-prompts";
import { checkAndIncrementAIUsage, createLimitReachedResponse } from "@/lib/ai-metering";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(
    request: Request,
    { params }: { params: Promise<{ ticker: string }> }
) {
    const { ticker } = await params;
    const cookieStore = await cookies();
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Cookie: cookieStore.toString() } },
    });

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check AI usage metering
    const metering = await checkAndIncrementAIUsage(supabase, user.id);
    if (!metering.allowed) {
        return NextResponse.json(createLimitReachedResponse(), { status: 402 });
    }

    try {
        // 1. Fetch recent posts for this ticker
        const { data: posts, error } = await supabase
            .from("posts")
            .select("content, created_at")
            .eq("ticker_symbol", ticker.toUpperCase())
            .order("created_at", { ascending: false })
            .limit(20);

        if (error) throw error;

        if (!posts || posts.length === 0) {
            return NextResponse.json({
                summary: `No recent posts found for $${ticker}. Be the first to share your analysis!`
            });
        }

        // 2. Prepare posts for AI
        const postsContent = posts.map(p => p.content).join("\n---\n");

        const prompt = `
Analyze the following ${posts.length} posts from the Ticko community regarding $${ticker}:

POSTS:
${postsContent}

TASK:
Summarize the community discussion according to the instructions in your system prompt.
        `;

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: TICKER_SUMMARY_SYSTEM_PROMPT },
                { role: "user", content: prompt }
            ],
            temperature: 0.5,
            max_tokens: 200,
        });

        const summary = response.choices[0].message.content;

        return NextResponse.json({ summary });

    } catch (error: any) {
        console.error("Ticker summary error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
