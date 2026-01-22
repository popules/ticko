import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import YahooFinance from "yahoo-finance2";

// Create admin client lazily to avoid build-time errors
function getSupabaseAdmin() {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE || "";
    if (!serviceRoleKey) {
        throw new Error("SUPABASE_SERVICE_ROLE_KEY not configured");
    }
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey
    );
}

const yf = new YahooFinance();

// Price tolerance for prediction accuracy (within 5% = correct)
const PREDICTION_TOLERANCE = 0.05;

interface PendingPrediction {
    id: string;
    user_id: string;
    ticker_symbol: string;
    prediction_price: number;
    target_date: string;
    sentiment: 'bull' | 'bear';
}

/**
 * GET /api/cron/predictions
 * Cron job to verify predictions that have reached their target date
 */
export async function GET(request: Request) {
    // Verify cron secret to prevent abuse
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const supabaseAdmin = getSupabaseAdmin();
        const now = new Date().toISOString();

        // Fetch all pending predictions where target_date has passed
        const { data: predictions, error: fetchError } = await supabaseAdmin
            .from("posts")
            .select("id, user_id, ticker_symbol, prediction_price, target_date, sentiment")
            .eq("is_prediction", true)
            .eq("prediction_status", "pending")
            .not("ticker_symbol", "is", null)
            .not("prediction_price", "is", null)
            .not("target_date", "is", null)
            .lte("target_date", now);

        if (fetchError) throw fetchError;

        if (!predictions || predictions.length === 0) {
            return NextResponse.json({
                success: true,
                message: "No pending predictions to verify",
                processed: 0
            });
        }

        let processed = 0;
        let correct = 0;
        let incorrect = 0;
        const errors: string[] = [];

        // Process each prediction
        for (const prediction of predictions as PendingPrediction[]) {
            try {
                // Format ticker for Yahoo Finance
                const yahooTicker = prediction.ticker_symbol.includes(".")
                    ? prediction.ticker_symbol
                    : `${prediction.ticker_symbol}.ST`; // Assume Swedish stock if no suffix

                // Fetch current price
                const quote: any = await yf.quote(yahooTicker, {
                    fields: ["regularMarketPrice"]
                });

                const currentPrice = quote?.regularMarketPrice;
                if (!currentPrice) {
                    errors.push(`Could not fetch price for ${prediction.ticker_symbol}`);
                    continue;
                }

                // Determine if prediction was correct
                let isCorrect = false;
                const predictedPrice = prediction.prediction_price;
                const priceDiff = (currentPrice - predictedPrice) / predictedPrice;

                if (prediction.sentiment === "bull") {
                    // Bull prediction: correct if price went up or within tolerance
                    isCorrect = currentPrice >= predictedPrice || Math.abs(priceDiff) <= PREDICTION_TOLERANCE;
                } else if (prediction.sentiment === "bear") {
                    // Bear prediction: correct if price went down or within tolerance
                    isCorrect = currentPrice <= predictedPrice || Math.abs(priceDiff) <= PREDICTION_TOLERANCE;
                }

                const newStatus = isCorrect ? "correct" : "incorrect";

                // Update the post with the result
                const { error: updateError } = await supabaseAdmin
                    .from("posts")
                    .update({ prediction_status: newStatus })
                    .eq("id", prediction.id);

                if (updateError) {
                    errors.push(`Failed to update prediction ${prediction.id}: ${updateError.message}`);
                    continue;
                }

                // Update user's reputation score
                const reputationChange = isCorrect ? 10 : -5;
                const { error: repError } = await supabaseAdmin.rpc(
                    "increment_reputation",
                    { user_id: prediction.user_id, amount: reputationChange }
                );

                // If RPC doesn't exist, fall back to direct update
                if (repError && repError.message.includes("function")) {
                    const { data: profile } = await supabaseAdmin
                        .from("profiles")
                        .select("reputation_score")
                        .eq("id", prediction.user_id)
                        .single();

                    if (profile) {
                        await supabaseAdmin
                            .from("profiles")
                            .update({
                                reputation_score: Math.max(0, (profile.reputation_score || 0) + reputationChange)
                            })
                            .eq("id", prediction.user_id);
                    }
                }

                // Create notification for the user
                await supabaseAdmin.from("notifications").insert({
                    user_id: prediction.user_id,
                    type: isCorrect ? "prediction_correct" : "prediction_incorrect",
                    title: isCorrect ? "🎯 Your prediction was correct!" : "📉 Your prediction was incorrect",
                    content: `Your ${prediction.sentiment === "bull" ? "bullish" : "bearish"} prediction on $${prediction.ticker_symbol} was ${isCorrect ? "correct" : "incorrect"}. ${isCorrect ? "+10" : "-5"} points.`,
                    read: false
                });

                processed++;
                if (isCorrect) correct++;
                else incorrect++;

            } catch (err) {
                errors.push(`Error processing ${prediction.ticker_symbol}: ${err}`);
            }
        }

        return NextResponse.json({
            success: true,
            message: `Processed ${processed} predictions`,
            stats: { processed, correct, incorrect },
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error) {
        console.error("Prediction verification failed:", error);
        return NextResponse.json({ error: "Failed to verify predictions" }, { status: 500 });
    }
}

/**
 * POST for backwards compatibility or manual triggering
 */
export async function POST(request: Request) {
    return GET(request);
}
