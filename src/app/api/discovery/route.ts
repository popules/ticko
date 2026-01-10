import { NextResponse } from "next/server";
import { fetchDiscoveryStocks } from "@/lib/stocks-api";

export async function GET() {
    try {
        const stocks = await fetchDiscoveryStocks();
        return NextResponse.json({ stocks });
    } catch (error) {
        console.error("Discovery API error:", error);
        return NextResponse.json({ error: "Failed to fetch discovery stocks" }, { status: 500 });
    }
}
