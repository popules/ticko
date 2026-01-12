import { NextRequest, NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";

const yf = new YahooFinance();

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");

    if (!query || query.length < 2) {
        return NextResponse.json({ results: [] });
    }

    try {
        const results: any = await yf.search(query, {
            newsCount: 0,
            quotesCount: 5
        });

        // Filter to only include stocks (equity)
        const filteredResults = results.quotes
            .filter((quote: any) => quote.quoteType === 'EQUITY')
            .map((quote: any) => ({
                symbol: quote.symbol,
                name: quote.longname || quote.shortname || quote.symbol,
                exchDisp: quote.exchDisp,
                typeDisp: quote.typeDisp
            }));

        return NextResponse.json({ results: filteredResults });
    } catch (error) {
        console.error("Search error:", error);
        return NextResponse.json({ error: "Failed to search stocks" }, { status: 500 });
    }
}
