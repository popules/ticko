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
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #020617; color: #ffffff; padding: 40px 20px; line-height: 1.6; margin: 0;">
    
    <div style="text-align: center; margin-bottom: 20px;">
        <img src="https://mzybyboqymjyfbavgnbq.supabase.co/storage/v1/object/public/public-assets/ticko-logo.png" 
             alt="Ticko" 
             width="120" 
             style="display: inline-block; border: 0; outline: none; text-decoration: none;">
    </div>

    <div style="max-width: 500px; margin: 0 auto; background-color: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; overflow: hidden;">
        
        <div style="padding: 40px 30px; text-align: center;">
            <h1 style="font-size: 24px; margin-bottom: 10px; color: #ffffff; font-weight: 700;">Welcome to the arena!</h1>
            <p style="font-size: 16px; color: rgba(255,255,255,0.7); margin-bottom: 24px;">
                Great to have you on board. Now you have the tools you need to chase results and take your trading to the next level.
            </p>
            
            <div style="background-color: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 12px; margin-bottom: 30px;">
                <p style="margin: 0; font-size: 15px; color: rgba(255,255,255,0.9);">
                    <strong>Get started now</strong><br>
                    Log in to your account and start tracking your trades. That's how we get better.
                </p>
            </div>

            <div style="margin-bottom: 30px;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://tickomarkets.com'}" 
                   style="display: inline-block; background-color: #10B981; background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 50px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);">
                   Go to my dashboard
                </a>
            </div>
        </div>

        <div style="padding: 20px; text-align: center; background-color: rgba(0, 0, 0, 0.2); font-size: 12px; color: rgba(255, 255, 255, 0.3);">
            <p style="margin: 0; font-weight: 600;">Where results matter.</p>
            <p style="margin: 5px 0 0;">&copy; 2026 Ticko</p>
        </div>
    </div>
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
                from: "Ticko Team <hello@tickomarkets.com>",
                to: email,
                subject: `Welcome to Ticko – Your $10,000 is ready! 📈`,
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
