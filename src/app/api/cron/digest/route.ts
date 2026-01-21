import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Weekly digest - runs every Sunday at 10:00 UTC
export async function GET(request: Request) {
    // Verify cron secret
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
    }

    if (!process.env.RESEND_API_KEY) {
        return NextResponse.json({ error: "Resend not configured" }, { status: 500 });
    }

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    try {
        // Get all users with email
        const { data: users, error: usersError } = await supabase
            .from("profiles")
            .select("id, username, email")
            .not("email", "is", null);

        if (usersError || !users) {
            throw new Error("Failed to fetch users");
        }

        // Get weekly trending tickers
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const { data: posts } = await supabase
            .from("posts")
            .select("ticker_symbol, sentiment")
            .not("ticker_symbol", "is", null)
            .gte("created_at", oneWeekAgo.toISOString());

        // Aggregate trending
        const tickerMap = new Map<string, { count: number; bullish: number; bearish: number }>();
        (posts || []).forEach((post: any) => {
            if (!post.ticker_symbol) return;
            const existing = tickerMap.get(post.ticker_symbol) || { count: 0, bullish: 0, bearish: 0 };
            existing.count++;
            if (post.sentiment === "bull") existing.bullish++;
            if (post.sentiment === "bear") existing.bearish++;
            tickerMap.set(post.ticker_symbol, existing);
        });

        const trending = Array.from(tickerMap.entries())
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, 5);

        let emailsSent = 0;

        for (const user of users) {
            if (!user.email) continue;

            // Get user stats for this week
            const { count: newFollowers } = await supabase
                .from("follows")
                .select("*", { count: "exact", head: true })
                .eq("following_id", user.id)
                .gte("created_at", oneWeekAgo.toISOString());

            const { data: userPosts } = await supabase
                .from("posts")
                .select("id, up_count")
                .eq("user_id", user.id)
                .gte("created_at", oneWeekAgo.toISOString());

            const totalLikes = (userPosts || []).reduce((sum, p) => sum + (p.up_count || 0), 0);
            const totalPosts = (userPosts || []).length;

            // Skip if user has no activity
            if (trending.length === 0 && !newFollowers && !totalLikes && !totalPosts) {
                continue;
            }

            // Build email
            const trendingHtml = trending.length > 0
                ? trending.map(([ticker, stats], i) => `
                    <tr>
                        <td style="padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.05);">
                            <span style="color: ${i === 0 ? '#F59E0B' : 'rgba(255,255,255,0.4)'}; font-weight: 700; width: 24px; display: inline-block;">${i + 1}</span>
                            <span style="color: white; font-weight: 600;">$${ticker}</span>
                        </td>
                        <td style="padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.05); text-align: right;">
                            <span style="color: rgba(255,255,255,0.5);">${stats.count} posts</span>
                        </td>
                        <td style="padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.05); text-align: right;">
                            <span style="color: ${stats.bullish > stats.bearish ? '#10B981' : '#F43F5E'};">
                                ${stats.bullish > stats.bearish ? '📈' : '📉'} ${Math.round((stats.bullish / (stats.bullish + stats.bearish || 1)) * 100)}% bull
                            </span>
                        </td>
                    </tr>
                `).join('')
                : '<tr><td colspan="3" style="padding: 24px; text-align: center; color: rgba(255,255,255,0.4);">Quiet week in the market!</td></tr>';

            const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0B0F17; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0B0F17; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px;">
                    <!-- Header -->
                    <tr>
                        <td style="padding-bottom: 32px; text-align: center;">
                            <div style="display: inline-flex; align-items: center; gap: 12px;">
                                <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #2DD4BF, #14B8A6); border-radius: 10px;"></div>
                                <span style="font-size: 24px; font-weight: 700; color: white;">ticko</span>
                            </div>
                        </td>
                    </tr>

                    <!-- Main -->
                    <tr>
                        <td style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 24px; padding: 32px;">
                            <h1 style="margin: 0 0 8px 0; font-size: 24px; color: white; text-align: center;">
                                Your Weekly Report 📊
                            </h1>
                            <p style="margin: 0 0 32px 0; color: rgba(255,255,255,0.5); text-align: center;">
                                Hi ${user.username}! Here's what happened on Ticko this week.
                            </p>

                            <!-- Stats -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
                                <tr>
                                    <td width="33%" style="text-align: center; padding: 16px;">
                                        <p style="margin: 0; font-size: 32px; font-weight: 800; color: #10B981;">${totalPosts}</p>
                                        <p style="margin: 4px 0 0 0; font-size: 12px; color: rgba(255,255,255,0.4); text-transform: uppercase;">New Posts</p>
                                    </td>
                                    <td width="33%" style="text-align: center; padding: 16px; border-left: 1px solid rgba(255,255,255,0.1); border-right: 1px solid rgba(255,255,255,0.1);">
                                        <p style="margin: 0; font-size: 32px; font-weight: 800; color: #F59E0B;">${totalLikes}</p>
                                        <p style="margin: 4px 0 0 0; font-size: 12px; color: rgba(255,255,255,0.4); text-transform: uppercase;">Likes</p>
                                    </td>
                                    <td width="33%" style="text-align: center; padding: 16px;">
                                        <p style="margin: 0; font-size: 32px; font-weight: 800; color: #3B82F6;">+${newFollowers || 0}</p>
                                        <p style="margin: 4px 0 0 0; font-size: 12px; color: rgba(255,255,255,0.4); text-transform: uppercase;">Followers</p>
                                    </td>
                                </tr>
                            </table>

                            <!-- Trending -->
                            <h3 style="margin: 0 0 16px 0; font-size: 14px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 1px;">
                                🔥 Most Discussed This Week
                            </h3>
                            <table width="100%" cellpadding="0" cellspacing="0" style="background: rgba(255,255,255,0.02); border-radius: 12px; overflow: hidden;">
                                ${trendingHtml}
                            </table>

                            <!-- CTA -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 32px;">
                                <tr>
                                    <td align="center">
                                        <a href="https://tickomarkets.com" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #2DD4BF, #14B8A6); color: #0B0F17; font-weight: 700; font-size: 14px; text-decoration: none; border-radius: 12px;">
                                            See what's happening →
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding-top: 32px; text-align: center;">
                            <p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.3);">
                                You're receiving this email because you're a member of Ticko.<br>
                                <a href="https://tickomarkets.com/settings" style="color: rgba(255,255,255,0.4);">Manage notifications</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
            `;

            // Send email
            try {
                await fetch("https://api.resend.com/emails", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        from: "Ticko <hello@tickomarkets.com>",
                        to: user.email,
                        subject: `📊 Your Weekly Report on Ticko`,
                        html: emailHtml,
                    }),
                });
                emailsSent++;
            } catch (e) {
                console.error(`Failed to send digest to ${user.email}:`, e);
            }
        }

        return NextResponse.json({
            success: true,
            message: `Weekly digest sent to ${emailsSent} users`,
            trending: trending.map(([t]) => t),
        });
    } catch (error) {
        console.error("Digest error:", error);
        return NextResponse.json({ error: "Failed to send digest" }, { status: 500 });
    }
}
