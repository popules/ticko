import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { email, username } = await request.json();

        if (!email || !username) {
            return NextResponse.json(
                { error: "Email and username are required" },
                { status: 400 }
            );
        }

        if (!process.env.RESEND_API_KEY) {
            console.log("RESEND_API_KEY not configured, skipping welcome email");
            return NextResponse.json({ success: true, message: "Email skipped - no API key" });
        }

        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0B0F17; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0B0F17; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px;">
                    <!-- Logo -->
                    <tr>
                        <td align="center" style="padding-bottom: 32px;">
                            <div style="display: inline-flex; align-items: center; gap: 8px;">
                                <div style="width: 36px; height: 36px; background: linear-gradient(135deg, #10B981, #059669); border-radius: 10px;"></div>
                                <span style="font-size: 28px; font-weight: 800; color: white; letter-spacing: -0.5px;">ticko</span>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Main Card -->
                    <tr>
                        <td style="background: linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%); border: 1px solid rgba(255,255,255,0.1); border-radius: 24px; padding: 48px;">
                            
                            <!-- Welcome Header -->
                            <h1 style="margin: 0 0 8px 0; font-size: 32px; font-weight: 800; color: white; text-align: center;">
                                Välkommen, ${username}! 🚀
                            </h1>
                            <p style="margin: 0 0 32px 0; font-size: 16px; color: rgba(255,255,255,0.6); text-align: center;">
                                Du är nu en del av Sveriges smartaste börssnackare.
                            </p>
                            
                            <!-- Divider -->
                            <div style="height: 1px; background: linear-gradient(90deg, transparent, rgba(16,185,129,0.3), transparent); margin: 32px 0;"></div>
                            
                            <!-- Features -->
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="padding: 16px 0;">
                                        <table width="100%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td width="48" style="vertical-align: top;">
                                                    <div style="width: 40px; height: 40px; background: rgba(16,185,129,0.15); border-radius: 12px; text-align: center; line-height: 40px; font-size: 20px;">📊</div>
                                                </td>
                                                <td style="padding-left: 16px;">
                                                    <h3 style="margin: 0 0 4px 0; font-size: 15px; font-weight: 600; color: white;">Följ aktier i realtid</h3>
                                                    <p style="margin: 0; font-size: 13px; color: rgba(255,255,255,0.5);">Skapa din bevakningslista och få prisuppdateringar live.</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 16px 0;">
                                        <table width="100%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td width="48" style="vertical-align: top;">
                                                    <div style="width: 40px; height: 40px; background: rgba(16,185,129,0.15); border-radius: 12px; text-align: center; line-height: 40px; font-size: 20px;">💬</div>
                                                </td>
                                                <td style="padding-left: 16px;">
                                                    <h3 style="margin: 0 0 4px 0; font-size: 15px; font-weight: 600; color: white;">Diskutera med andra</h3>
                                                    <p style="margin: 0; font-size: 13px; color: rgba(255,255,255,0.5);">Dela dina tankar och läs vad andra tycker om aktier.</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 16px 0;">
                                        <table width="100%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td width="48" style="vertical-align: top;">
                                                    <div style="width: 40px; height: 40px; background: rgba(16,185,129,0.15); border-radius: 12px; text-align: center; line-height: 40px; font-size: 20px;">🤖</div>
                                                </td>
                                                <td style="padding-left: 16px;">
                                                    <h3 style="margin: 0 0 4px 0; font-size: 15px; font-weight: 600; color: white;">AI-driven analys</h3>
                                                    <p style="margin: 0; font-size: 13px; color: rgba(255,255,255,0.5);">Få smarta insikter om aktier med vår AI-assistent.</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- CTA Button -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 32px;">
                                <tr>
                                    <td align="center">
                                        <a href="https://ticko.se" style="display: inline-block; padding: 16px 48px; background: linear-gradient(135deg, #10B981, #059669); color: white; font-weight: 600; font-size: 15px; text-decoration: none; border-radius: 16px; box-shadow: 0 8px 24px rgba(16,185,129,0.3);">
                                            Börja utforska →
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding-top: 32px; text-align: center;">
                            <p style="margin: 0 0 8px 0; font-size: 12px; color: rgba(255,255,255,0.3);">
                                Du får detta mail för att du registrerade dig på Ticko.
                            </p>
                            <p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.3);">
                                © 2026 Ticko. Alla rättigheter förbehållna.
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

        const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                from: "Ticko <noreply@tintel.se>",
                to: email,
                subject: `Välkommen till Ticko, ${username}! 🚀`,
                html: emailHtml
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Resend error:", errorData);
            return NextResponse.json(
                { error: "Failed to send email" },
                { status: 500 }
            );
        }

        console.log(`Welcome email sent to ${email}`);
        return NextResponse.json({ success: true, message: "Welcome email sent" });

    } catch (error) {
        console.error("Welcome email error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
