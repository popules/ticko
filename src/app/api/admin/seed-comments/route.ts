import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { openai } from '@/lib/openai';
import { verifyAdmin, isErrorResponse } from '@/lib/admin-auth';

const BOT_USERNAMES = ['StockWizard', 'NordicTrader', 'BearHunter', 'ValueViking', 'MemeKing'];

export async function POST(request: Request) {
    // Verify admin access
    const authResult = await verifyAdmin();
    if (isErrorResponse(authResult)) {
        return authResult;
    }

    try {
        const { ticker, count = 3 } = await request.json();

        if (!ticker) {
            return NextResponse.json({ error: 'Ticker required' }, { status: 400 });
        }

        // 1. Get Bot IDs
        const { data: bots } = await getSupabaseAdmin()
            .from('profiles')
            .select('id, username, bio')
            .in('username', BOT_USERNAMES);

        if (!bots || bots.length === 0) {
            return NextResponse.json({ error: 'No bots found. Run create-bots first.' }, { status: 404 });
        }

        const posts = [];

        // 2. Generate content loop
        for (let i = 0; i < count; i++) {
            // Pick random bot
            const bot = bots[Math.floor(Math.random() * bots.length)];

            // Random sentiment
            const sentiment = Math.random() > 0.5 ? 'bull' : (Math.random() > 0.5 ? 'bear' : null);

            // Generate text
            const prompt = `
            You are a stock trader on a social platform (like Twitter/X).
            Ticker: ${ticker}
            Your Persona: ${bot.bio}
            Sentiment: ${sentiment || 'Neutral/Questioning'}
            
            Write a SHORT comment (max 20 words). Slang allowed. Valid financial context preferred.
            Language: English (or Swedish if the ticker ends with .ST).
            `;

            const completion = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [{ role: "user", content: prompt }],
                max_tokens: 50,
            });

            const content = completion.choices[0].message.content?.replace(/"/g, '') || `Watching ${ticker}...`;

            // Insert post
            const { data: post, error } = await getSupabaseAdmin()
                .from('posts')
                .insert({
                    user_id: bot.id,
                    content: content,
                    ticker_symbol: ticker.toUpperCase(),
                    sentiment: sentiment as 'bull' | 'bear' | null,
                })
                .select();

            if (!error && post) {
                posts.push(post[0]);
            }
        }

        return NextResponse.json({ success: true, count: posts.length, posts });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error("Seed error:", error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
