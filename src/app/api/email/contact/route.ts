import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { name, email, subject, message } = await request.json();

        if (!name || !email || !message) {
            return NextResponse.json(
                { error: "Name, email and message are required" },
                { status: 400 }
            );
        }

        if (!process.env.RESEND_API_KEY) {
            return NextResponse.json({ success: true, message: "Email skipped - no API key" });
        }

        const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                from: "Ticko Kontakt <hello@ticko.se>",
                to: "hello@ticko.se",
                reply_to: email,
                subject: `New Contact Form: ${subject}`,
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; border-radius: 12px;">
                        <h2 style="color: #111827; margin-bottom: 24px;">Nytt meddelande från webbplatsen</h2>
                        <div style="background-color: white; padding: 24px; border-radius: 8px; border: 1px solid #e5e7eb;">
                            <p><strong>Namn:</strong> ${name}</p>
                            <p><strong>E-post:</strong> ${email}</p>
                            <p><strong>Ämne:</strong> ${subject}</p>
                            <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
                                <p style="white-space: pre-wrap;">${message}</p>
                            </div>
                        </div>
                    </div>
                `
            })
        });

        if (!response.ok) {
            return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Contact email error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
