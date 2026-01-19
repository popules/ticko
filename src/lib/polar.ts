import { Polar } from "@polar-sh/sdk";

// Initialize Polar client
export const polar = new Polar({
    accessToken: process.env.POLAR_API_KEY,
});

// Product ID for Portfolio Reset (49 SEK)
export const PORTFOLIO_RESET_PRODUCT_ID = process.env.POLAR_PRODUCT_ID || "";

// Webhook secret for signature validation
export const POLAR_WEBHOOK_SECRET = process.env.POLAR_WEBHOOK_SECRET || "";

// App URL for redirects
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://ticko.se";

/**
 * Create a checkout session for portfolio reset
 */
export async function createCheckoutSession(
    userId: string,
    userEmail?: string
): Promise<{ checkoutUrl: string } | { error: string }> {
    try {
        const checkout = await polar.checkouts.create({
            products: [PORTFOLIO_RESET_PRODUCT_ID],
            successUrl: APP_URL + "/paper-trading?reset=success",
            metadata: {
                userId,
                action: "portfolio_reset",
            },
            ...(userEmail && { customerEmail: userEmail }),
        });

        return { checkoutUrl: checkout.url };
    } catch (error) {
        console.error("Polar checkout error:", error);
        return { error: "Kunde inte skapa betalningssession" };
    }
}
