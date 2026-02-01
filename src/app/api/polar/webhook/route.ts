import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

// Webhook secret for signature validation
const POLAR_WEBHOOK_SECRET = process.env.POLAR_WEBHOOK_SECRET || "";

// Use service role client for webhook operations (bypasses RLS)
function getSupabaseAdmin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
}

/**
 * Validate webhook signature using Standard Webhooks spec
 * https://www.standardwebhooks.com/
 */
function validateWebhookSignature(
    payload: string,
    headers: Record<string, string>
): boolean {
    const webhookId = headers["webhook-id"];
    const webhookTimestamp = headers["webhook-timestamp"];
    const webhookSignature = headers["webhook-signature"];

    if (!webhookId || !webhookTimestamp || !webhookSignature || !POLAR_WEBHOOK_SECRET) {
        return false;
    }

    // Check timestamp is within 5 minutes
    const timestampMs = parseInt(webhookTimestamp) * 1000;
    const now = Date.now();
    if (Math.abs(now - timestampMs) > 5 * 60 * 1000) {
        console.error("Webhook timestamp too old or in future");
        return false;
    }

    // Create signed content
    const signedContent = `${webhookId}.${webhookTimestamp}.${payload}`;

    // Extract secret (remove prefix if present)
    let secretKey = POLAR_WEBHOOK_SECRET;
    if (secretKey.startsWith("whsec_")) {
        secretKey = secretKey.slice(6);
    } else if (secretKey.startsWith("polar_whs_")) {
        secretKey = secretKey.slice(10);
    }

    const secretBytes = Buffer.from(secretKey, "base64");

    // Create expected signature
    const expectedSignature = crypto
        .createHmac("sha256", secretBytes)
        .update(signedContent)
        .digest("base64");

    // Parse signatures from header (format: "v1,signature1 v1,signature2")
    const signatures = webhookSignature.split(" ").map(s => {
        const [version, sig] = s.split(",");
        return { version, sig };
    });

    // Check if any signature matches
    return signatures.some(({ version, sig }) =>
        version === "v1" && sig === expectedSignature
    );
}

/**
 * Activate Pro subscription for user
 */
async function activateProSubscription(userId: string, periodEnd: string): Promise<void> {
    const supabaseAdmin = getSupabaseAdmin();

    await supabaseAdmin
        .from("profiles")
        .update({
            is_pro: true,
            pro_expires_at: periodEnd,
            watchlist_limit: 50, // Upgrade watchlist limit
        })
        .eq("id", userId);

    console.log(`Pro subscription activated for user: ${userId}, expires: ${periodEnd}`);
}

/**
 * Deactivate Pro subscription for user
 */
async function deactivateProSubscription(userId: string): Promise<void> {
    const supabaseAdmin = getSupabaseAdmin();

    await supabaseAdmin
        .from("profiles")
        .update({
            is_pro: false,
            watchlist_limit: 10, // Reset to free limit
        })
        .eq("id", userId);

    console.log(`Pro subscription deactivated for user: ${userId}`);
}

/**
 * Reset user's paper trading portfolio after successful payment
 */
async function resetPortfolioAfterPayment(userId: string): Promise<void> {
    const supabaseAdmin = getSupabaseAdmin();

    // 1. Archive existing transactions (mark as archived instead of delete)
    await supabaseAdmin
        .from("transactions")
        .update({ archived: true })
        .eq("user_id", userId)
        .is("archived", false);

    // 2. Delete active portfolio positions
    await supabaseAdmin
        .from("portfolio")
        .delete()
        .eq("user_id", userId);

    // 3. Get current paid_reset_count
    const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("paid_reset_count")
        .eq("id", userId)
        .single();

    const currentCount = profile?.paid_reset_count || 0;

    // 4. Reset profile stats for fair play
    await supabaseAdmin
        .from("profiles")
        .update({
            paper_win_streak: 0,
            paper_total_pnl: 0,
            paper_win_rate: 0,
            paid_reset_count: currentCount + 1,
            paper_last_reset: new Date().toISOString(),
        })
        .eq("id", userId);

    // 5. Log the paid reset transaction
    await supabaseAdmin
        .from("reset_transactions")
        .insert({
            user_id: userId,
            amount_sek: 49,
            reset_type: "paid",
        });

    console.log(`Portfolio reset completed for user: ${userId}`);
}

export async function POST(request: NextRequest) {
    try {
        // Get raw body for signature validation
        const body = await request.text();
        const headers = Object.fromEntries(request.headers.entries());

        // Validate webhook signature
        if (!validateWebhookSignature(body, headers)) {
            console.error("Webhook signature validation failed");
            return NextResponse.json(
                { error: "Invalid signature" },
                { status: 403 }
            );
        }

        // Parse event
        const event = JSON.parse(body);

        // Handle checkout.updated event (when checkout is completed)
        if (event.type === "checkout.updated") {
            const checkout = event.data;

            // Only process if checkout status is succeeded
            if (checkout.status !== "succeeded") {
                return NextResponse.json({ received: true }, { status: 202 });
            }

            const userId = checkout.metadata?.userId as string;

            if (!userId) {
                console.error("No userId in checkout metadata");
                return NextResponse.json(
                    { error: "Missing userId" },
                    { status: 400 }
                );
            }

            // Verify this is for portfolio reset product
            if (checkout.metadata?.action === "portfolio_reset") {
                await resetPortfolioAfterPayment(userId);
            }
        }

        // Handle subscription events
        if (event.type === "subscription.created" || event.type === "subscription.updated") {
            const subscription = event.data;
            const userId = subscription.metadata?.userId as string;

            if (!userId) {
                console.error("No userId in subscription metadata");
                return NextResponse.json({ received: true }, { status: 202 });
            }

            // Check if subscription is active
            if (subscription.status === "active") {
                const periodEnd = subscription.current_period_end || subscription.ended_at;
                await activateProSubscription(userId, periodEnd);
            } else if (subscription.status === "canceled" || subscription.status === "expired") {
                await deactivateProSubscription(userId);
            }
        }

        // Handle subscription cancellation
        if (event.type === "subscription.canceled" || event.type === "subscription.revoked") {
            const subscription = event.data;
            const userId = subscription.metadata?.userId as string;

            if (userId) {
                await deactivateProSubscription(userId);
            }
        }

        // Return 202 to acknowledge receipt
        return NextResponse.json({ received: true }, { status: 202 });
    } catch (error) {
        console.error("Webhook handler error:", error);
        return NextResponse.json(
            { error: "Webhook processing failed" },
            { status: 500 }
        );
    }
}
