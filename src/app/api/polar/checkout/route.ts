import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createCheckoutSession, CheckoutProduct } from "@/lib/polar";

export async function POST(request: NextRequest) {
    try {
        // Get product from query param (default to reset for backwards compatibility)
        const { searchParams } = new URL(request.url);
        const product = (searchParams.get("product") as CheckoutProduct) || "reset";

        // Get authenticated user
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                },
            }
        );

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Get user email for Polar
        const { data: profile } = await supabase
            .from("profiles")
            .select("email")
            .eq("id", user.id)
            .single();

        // Create checkout session
        const result = await createCheckoutSession(
            user.id,
            profile?.email || user.email,
            product
        );

        if ("error" in result) {
            return NextResponse.json(
                { error: result.error },
                { status: 500 }
            );
        }

        return NextResponse.json({ checkoutUrl: result.checkoutUrl });
    } catch (error) {
        console.error("Checkout API error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
