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

        // Ticko brand: Dark mode #0A0A0A, Emerald accent #10B981
        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0A0A0A; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0A0A0A; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px;">
                    <!-- Logo -->
                    <tr>
                        <td align="center" style="padding-bottom: 32px;">
                            <table cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="vertical-align: middle;">
                                        <!-- Ticko T Icon -->
                                        <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #10B981 0%, #059669 100%); border-radius: 10px; display: inline-block;"></div>
                                    </td>
                                    <td style="vertical-align: middle; padding-left: 12px;">
                                        <span style="font-size: 28px; font-weight: 700; color: white; letter-spacing: -0.5px;">ticko</span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Main Card -->
                    <tr>
                        <td style="background: linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%); border: 1px solid rgba(255,255,255,0.08); border-radius: 24px; padding: 48px;">
                            
                            <!-- Welcome Header -->
                            <h1 style="margin: 0 0 24px 0; font-size: 26px; font-weight: 800; color: white; text-align: left; line-height: 1.3;">
                                Hej ${username}! 👋
                            </h1>
                            
                            <p style="margin: 0 0 20px 0; font-size: 16px; color: rgba(255,255,255,0.7); text-align: left; line-height: 1.7;">
                                Kul att du har hittat hit. Du har precis tagit första steget mot att bli en <strong style="color: #10B981;">legendarisk investerare</strong> på Ticko.
                            </p>
                            
                            <p style="margin: 0 0 32px 0; font-size: 16px; color: rgba(255,255,255,0.7); text-align: left; line-height: 1.7;">
                                Vi har precis aktiverat din portfölj och fyllt den med <strong style="color: white;">100 000 kr</strong> i virtuellt startkapital. Nu är det upp till dig att förvalta dem. Inga dolda avgifter, ingen riktig risk – bara ren skicklighet och kampen om leaderboarden.
                            </p>
                            
                            <!-- Section Header -->
                            <h2 style="margin: 0 0 20px 0; font-size: 18px; font-weight: 700; color: white;">
                                Så här tar du täten på Ticko:
                            </h2>
                            
                            <!-- Steps -->
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <!-- Step 1 -->
                                <tr>
                                    <td style="padding: 14px 0;">
                                        <table width="100%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td width="48" style="vertical-align: top;">
                                                    <div style="width: 44px; height: 44px; background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.3); border-radius: 12px; text-align: center; line-height: 44px; font-size: 20px;">🔍</div>
                                                </td>
                                                <td style="padding-left: 16px;">
                                                    <h3 style="margin: 0 0 4px 0; font-size: 15px; font-weight: 600; color: white;">Hitta din edge</h3>
                                                    <p style="margin: 0; font-size: 14px; color: rgba(255,255,255,0.5); line-height: 1.5;">Använd <strong style="color: #10B981;">Ticko AI</strong> för att analysera sentimentet och nyheterna kring dina favoritaktier.</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <!-- Step 2 -->
                                <tr>
                                    <td style="padding: 14px 0;">
                                        <table width="100%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td width="48" style="vertical-align: top;">
                                                    <div style="width: 44px; height: 44px; background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.3); border-radius: 12px; text-align: center; line-height: 44px; font-size: 20px;">📈</div>
                                                </td>
                                                <td style="padding-left: 16px;">
                                                    <h3 style="margin: 0 0 4px 0; font-size: 15px; font-weight: 600; color: white;">Gör din första trade</h3>
                                                    <p style="margin: 0; font-size: 14px; color: rgba(255,255,255,0.5); line-height: 1.5;">Marknaden rör sig i realtid. Hitta en vinnare och tryck på köp.</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <!-- Step 3 -->
                                <tr>
                                    <td style="padding: 14px 0;">
                                        <table width="100%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td width="48" style="vertical-align: top;">
                                                    <div style="width: 44px; height: 44px; background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.3); border-radius: 12px; text-align: center; line-height: 44px; font-size: 20px;">⏱️</div>
                                                </td>
                                                <td style="padding-left: 16px;">
                                                    <h3 style="margin: 0 0 4px 0; font-size: 15px; font-weight: 600; color: white;">Håll koll på 30-minutersregeln</h3>
                                                    <p style="margin: 0; font-size: 14px; color: rgba(255,255,255,0.5); line-height: 1.5;">För att hålla tävlingen rättvis är alla köp låsta i 30 minuter. Det är din analys mot marknaden.</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <!-- Step 4 -->
                                <tr>
                                    <td style="padding: 14px 0;">
                                        <table width="100%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td width="48" style="vertical-align: top;">
                                                    <div style="width: 44px; height: 44px; background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.3); border-radius: 12px; text-align: center; line-height: 44px; font-size: 20px;">🏆</div>
                                                </td>
                                                <td style="padding-left: 16px;">
                                                    <h3 style="margin: 0 0 4px 0; font-size: 15px; font-weight: 600; color: white;">Klättra i ranking</h3>
                                                    <p style="margin: 0; font-size: 14px; color: rgba(255,255,255,0.5); line-height: 1.5;">Samla XP genom lönsamma trades och bygg din Win Streak för att multiplicera dina poäng.</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Divider -->
                            <div style="height: 1px; background: linear-gradient(90deg, transparent, rgba(16,185,129,0.4), transparent); margin: 28px 0;"></div>
                            
                            <!-- Call to action text -->
                            <p style="margin: 0 0 24px 0; font-size: 16px; color: rgba(255,255,255,0.8); text-align: center; line-height: 1.6;">
                                <strong style="color: white;">Är du redo att slå börsen?</strong><br>
                                Just nu pågår <span style="color: #10B981; font-weight: 600;">Säsong 1</span>. Visa communityt att ditt track record är på riktigt.
                            </p>
                            
                            <!-- CTA Button -->
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center">
                                        <a href="https://ticko.se/paper-trading" style="display: inline-block; padding: 18px 48px; background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: #0A0A0A; font-weight: 700; font-size: 16px; text-decoration: none; border-radius: 16px; box-shadow: 0 8px 32px rgba(16,185,129,0.4), 0 2px 8px rgba(16,185,129,0.3);">
                                            Starta din utmaning på Ticko nu →
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                        </td>
                    </tr>
                    
                    <!-- Signature Section -->
                    <tr>
                        <td style="padding: 40px 24px 0 24px;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td>
                                        <p style="margin: 0 0 16px 0; font-size: 15px; color: rgba(255,255,255,0.7); line-height: 1.6;">
                                            Vi ses på leaderboarden! 🚀
                                        </p>
                                        <table cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="vertical-align: middle;">
                                                    <!-- Anton Avatar -->
                                                    <div style="width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #10B981 0%, #059669 100%); text-align: center; line-height: 48px; font-size: 20px; font-weight: 700; color: white;">A</div>
                                                </td>
                                                <td style="padding-left: 14px;">
                                                    <p style="margin: 0; font-size: 15px; font-weight: 600; color: white;">Anton på Ticko</p>
                                                    <p style="margin: 2px 0 0 0; font-size: 13px; color: rgba(255,255,255,0.4);">Grundare</p>
                                                </td>
                                            </tr>
                                        </table>
                                        <p style="margin: 20px 0 0 0; font-size: 13px; color: rgba(255,255,255,0.4); font-style: italic;">
                                            PS. Svara gärna på det här mailet om du har idéer eller feedback. Jag läser allt!
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding-top: 40px; text-align: center;">
                            <p style="margin: 0 0 8px 0; font-size: 12px; color: rgba(255,255,255,0.25);">
                                Du får detta mail för att du registrerade dig på Ticko.
                            </p>
                            <p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.25);">
                                © 2026 Ticko · <a href="https://ticko.se/integritet" style="color: rgba(255,255,255,0.35); text-decoration: none;">Integritetspolicy</a>
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
                from: "Anton från Ticko <hej@ticko.se>",
                to: email,
                subject: `Välkommen till Ticko – Dina 100 000 kr är redo! 📈`,
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
