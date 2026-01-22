import { NextResponse } from "next/server";
import { fetchStockProfile } from "@/lib/stocks-api";

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

    return NextResponse.json(profile);
}
