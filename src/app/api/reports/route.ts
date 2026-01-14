import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase with service role for admin operations
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Where to send report notifications (your inbox)
const ADMIN_EMAIL = "support@ticko.se";

interface ReportBody {
    post_id: string;
    reason: string;
    reporter_id?: string;
}

const REASON_LABELS: Record<string, string> = {
    market_manipulation: "Marknadsmanipulation / Pump & Dump",
    spam: "Spam eller annonsering",
    harassment: "Trakasserier eller hatpropaganda",
    misinformation: "Falsk information",
    other: "Annat"
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

        // Get post details for the notification
        const { data: post } = await supabaseAdmin
            .from("posts")
            .select("content, user_id, profiles(username)")
            .eq("id", post_id)
            .single();

        // Insert report into database
        const { data: report, error: insertError } = await supabaseAdmin
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
                        from: "Ticko Anmälningar <noreply@tintel.se>",
                        to: ADMIN_EMAIL,
                        subject: `⚠️ Ny anmälan: ${REASON_LABELS[reason] || reason}`,
                        html: `
                            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
                                <h2 style="color: #10b981;">🚨 Ny anmälan på Ticko</h2>
                                
                                <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin: 20px 0;">
                                    <p style="margin: 0 0 12px 0;"><strong>Anledning:</strong> ${REASON_LABELS[reason] || reason}</p>
                                    <p style="margin: 0 0 12px 0;"><strong>Författare:</strong> @${(post?.profiles as any)?.username || "Okänd"}</p>
                                    <p style="margin: 0;"><strong>Inlägg ID:</strong> <code>${post_id}</code></p>
                                </div>
                                
                                <p><strong>Innehåll:</strong></p>
                                <blockquote style="background: #1e293b; color: #e2e8f0; padding: 16px; border-radius: 8px; border-left: 4px solid #10b981; margin: 0;">
                                    ${post?.content || "Kunde inte hämta innehåll"}
                                </blockquote>
                                
                                <p style="margin-top: 24px;">
                                    <a href="https://ticko.se/post/${post_id}" style="background: #10b981; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                                        Visa inlägg →
                                    </a>
                                </p>
                                
                                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">
                                
                                <p style="color: #64748b; font-size: 12px;">
                                    Rapport ID: ${report?.id}<br>
                                    Tid: ${new Date().toLocaleString("sv-SE", { timeZone: "Europe/Stockholm" })}
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
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("user_id");

        if (!userId) {
            return NextResponse.json(
                { error: "user_id required" },
                { status: 400 }
            );
        }

        const { data: reports, error } = await supabaseAdmin
            .from("reports")
            .select("*")
            .eq("reporter_id", userId)
            .order("created_at", { ascending: false });

        if (error) throw error;

        return NextResponse.json({ reports });
    } catch (error: any) {
        console.error("Get reports error:", error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
