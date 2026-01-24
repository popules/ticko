import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;

// Where to send report notifications (your inbox)
// Where to send report notifications (your inbox)
const ADMIN_EMAIL = "hello@tickomarkets.com";

interface ReportBody {
    post_id: string;
    reason: string;
    reporter_id?: string;
}

const REASON_LABELS: Record<string, string> = {
    market_manipulation: "Market Manipulation / Pump & Dump",
    spam: "Spam or advertising",
    harassment: "Harassment or hate speech",
    misinformation: "False Information",
    other: "Other"
};

export async function POST(request: NextRequest) {
    try {
        const body: ReportBody = await request.json();
        const { post_id, reason, reporter_id } = body;

        if (!post_id || !reason) {
            return NextResponse.json(
                { error: "post_id and reason are required" },
                { status: 400 }
            );
        }

        // Validate reason
        const validReasons = ["market_manipulation", "spam", "harassment", "misinformation", "other"];
        if (!validReasons.includes(reason)) {
            return NextResponse.json(
                { error: "Invalid reason" },
                { status: 400 }
            );
        }

        // Create Supabase client - use service key if available, otherwise anon key with cookies
        let supabase;
        if (supabaseServiceKey) {
            supabase = createClient(supabaseUrl, supabaseServiceKey);
        } else {
            const cookieStore = await cookies();
            supabase = createClient(supabaseUrl, supabaseAnonKey, {
                global: { headers: { Cookie: cookieStore.toString() } },
            });
        }

        // Get post details for the notification
        const { data: post } = await supabase
            .from("posts")
            .select("content, user_id, profiles(username)")
            .eq("id", post_id)
            .single();

        // Insert report into database
        const { data: report, error: insertError } = await supabase
            .from("reports")
            .insert({
                post_id,
                reporter_id: reporter_id || null,
                reason,
                status: "pending"
            })
            .select()
            .single();

        if (insertError) {
            console.error("Failed to insert report:", insertError);
            return NextResponse.json(
                { error: "Failed to save report" },
                { status: 500 }
            );
        }

        // Send email notification to admin
        // Uses your existing Resend account with tintel.se domain
        if (process.env.RESEND_API_KEY) {
            try {
                await fetch("https://api.resend.com/emails", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        from: "Ticko Reports <hello@tickomarkets.com>",
                        to: ADMIN_EMAIL,
                        subject: `⚠️ New Report: ${REASON_LABELS[reason] || reason}`,
                        html: `
                            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
                                <h2 style="color: #10b981;">🚨 New Report on Ticko</h2>
                                
                                <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin: 20px 0;">
                                    <p style="margin: 0 0 12px 0;"><strong>Reason:</strong> ${REASON_LABELS[reason] || reason}</p>
                                    <p style="margin: 0 0 12px 0;"><strong>Author:</strong> @${(post?.profiles as any)?.username || "Unknown"}</p>
                                    <p style="margin: 0;"><strong>Post ID:</strong> <code>${post_id}</code></p>
                                </div>
                                
                                <p><strong>Content:</strong></p>
                                <blockquote style="background: #1e293b; color: #e2e8f0; padding: 16px; border-radius: 8px; border-left: 4px solid #10b981; margin: 0;">
                                    ${post?.content || "Could not fetch content"}
                                </blockquote>
                                
                                <p style="margin-top: 24px;">
                                    <a href="https://tickomarkets.com/post/${post_id}" style="background: #10b981; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                                        View Post →
                                    </a>
                                </p>
                                
                                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">
                                
                                <p style="color: #64748b; font-size: 12px;">
                                    Report ID: ${report?.id}<br>
                                    Time: ${new Date().toLocaleString("en-US", { timeZone: "America/New_York" })}
                                </p>
                            </div>
                        `
                    })
                });
                console.log("Report notification sent to admin");
            } catch (emailError) {
                console.error("Failed to send email notification:", emailError);
                // Don't fail the request if email fails - report is still saved
            }
        }

        return NextResponse.json({
            success: true,
            message: "Report submitted successfully",
            report_id: report?.id
        });

    } catch (error: any) {
        console.error("Report API error:", error);
        return NextResponse.json(
            { error: "Failed to submit report" },
            { status: 500 }
        );
    }
}

// GET endpoint to fetch user's own reports
export async function GET(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
            global: { headers: { Cookie: cookieStore.toString() } },
        });

        // Verify user is authenticated
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            );
        }

        // Only allow users to fetch their own reports
        const { data: reports, error } = await supabase
            .from("reports")
            .select("*")
            .eq("reporter_id", user.id)
            .order("created_at", { ascending: false });

        if (error) throw error;

        return NextResponse.json({ reports });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error("Get reports error:", error);
        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
}
