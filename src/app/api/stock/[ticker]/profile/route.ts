import { NextResponse } from "next/server";
import { fetchStockProfile } from "@/lib/stocks-api";

// Cache for 24 hours at edge (company info rarely changes)
export const revalidate = 86400;

export async function GET(
    request: Request,
    { params }: { params: Promise<{ ticker: string }> }
) {
    const { ticker } = await params;

    if (!ticker) {
        return NextResponse.json({ error: "Ticker is required" }, { status: 400 });
    }

    const profile = await fetchStockProfile(ticker.toUpperCase());

    if (!profile) {
        return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json(profile, {
        headers: {
            // CDN cache for 24 hours, stale-while-revalidate for seamless updates
            'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600',
        }
    });
}
