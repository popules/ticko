import { NextResponse } from "next/server";
import { fetchStockData } from "@/lib/stocks-api";

// Fetch major indices for the RightPanel
export async function GET() {
    try {
        // Tickers for major indices
        // ^GSPC (S&P 500), ^IXIC (NASDAQ), ^OMXSPI (OMX Stockholm All-Share)
        const indexTickers = ["^GSPC", "^IXIC", "^OMXSPI"];

        const indexPromises = indexTickers.map(ticker => fetchStockData(ticker));
        const results = await Promise.all(indexPromises);

        const indices = results.map((data) => {
            if (!data) return null;

            // Clean up labels for display
            let label = data.symbol;
            if (data.symbol === "^GSPC") label = "S&P 500";
            if (data.symbol === "^IXIC") label = "NASDAQ";
            if (data.symbol === "^OMXSPI") label = "OMX 30"; // Using SPI as proxy for OMX30 if quote varies

            return {
                label,
                value: data.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                change: data.changePercent,
                rawPrice: data.price
            };
        }).filter(Boolean);

        return NextResponse.json({ indices });
    } catch (error: any) {
        console.error("Market indices fetch error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
