import { NextResponse } from "next/server";
import { fetchStockData } from "@/lib/stocks-api";

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ ticker: string }> }
) {
    const { ticker } = await params;
    const upperTicker = ticker.toUpperCase();

    try {
        const stockData = await fetchStockData(upperTicker);

        if (!stockData) {
            return NextResponse.json({ error: "Stock not found" }, { status: 404 });
        }

        return NextResponse.json(stockData);
    } catch (error) {
        console.error(`Stock API error for ${upperTicker}:`, error);
        return NextResponse.json(
            { error: "Failed to fetch stock data" },
            { status: 500 }
        );
    }
}
