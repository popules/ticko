import { Polar } from "@polar-sh/sdk";

// Initialize Polar client
export const polar = new Polar({
    accessToken: process.env.POLAR_API_KEY,
});

// Product IDs
export const PORTFOLIO_RESET_PRODUCT_ID = process.env.POLAR_PRODUCT_ID || "";
export const PRO_SUBSCRIPTION_PRODUCT_ID = process.env.POLAR_PRO_PRODUCT_ID || "";

// Webhook secret for signature validation
export const POLAR_WEBHOOK_SECRET = process.env.POLAR_WEBHOOK_SECRET || "";

// App URL for redirects
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://tickomarkets.com";

export type CheckoutProduct = "reset" | "pro";

/**
 * Create a checkout session for portfolio reset
 */
export async function createCheckoutSession(
    userId: string,
    userEmail?: string,
    product: CheckoutProduct = "reset"
): Promise<{ checkoutUrl: string } | { error: string }> {
    try {
        const isProSubscription = product === "pro";
        const productId = isProSubscription ? PRO_SUBSCRIPTION_PRODUCT_ID : PORTFOLIO_RESET_PRODUCT_ID;

        if (!productId) {
            return { error: `${product} product not configured` };
        }

        const checkout = await polar.checkouts.create({
            products: [productId],
            successUrl: isProSubscription
                ? APP_URL + "/settings?upgraded=true"
                : APP_URL + "/arena?reset=success",
            metadata: {
                userId,
                action: isProSubscription ? "pro_subscription" : "portfolio_reset",
            },
            ...(userEmail && { customerEmail: userEmail }),
        });

        return { checkoutUrl: checkout.url };
    } catch (error) {
        console.error("Polar checkout error:", error);
        return { error: "Could not create payment session" };
    }
}
