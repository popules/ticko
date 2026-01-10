import Link from "next/link";
import type { ReactNode } from "react";

// Regex to match cashtags: $SYMBOL or $SYMBOL-X (e.g., $TSLA, $VOLV-B)
const CASHTAG_REGEX = /\$([A-Z]{1,5}(?:-[A-Z])?)/gi;

interface CashtagMatch {
    type: "text" | "cashtag";
    value: string;
    ticker?: string;
}

/**
 * Parses text content and extracts cashtags
 */
export function parseCashtags(text: string): CashtagMatch[] {
    const parts: CashtagMatch[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    // Reset regex state
    CASHTAG_REGEX.lastIndex = 0;

    while ((match = CASHTAG_REGEX.exec(text)) !== null) {
        // Add text before the match
        if (match.index > lastIndex) {
            parts.push({
                type: "text",
                value: text.slice(lastIndex, match.index),
            });
        }

        // Add the cashtag
        parts.push({
            type: "cashtag",
            value: match[0],
            ticker: match[1].toUpperCase(),
        });

        lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
        parts.push({
            type: "text",
            value: text.slice(lastIndex),
        });
    }

    return parts;
}

/**
 * Renders text with clickable cashtag links - now links to Swedish /aktie/ route
 */
export function renderWithCashtags(text: string): ReactNode[] {
    const parts = parseCashtags(text);

    return parts.map((part, index) => {
        if (part.type === "cashtag" && part.ticker) {
            return (
                <Link
                    key={`${part.ticker}-${index}`}
                    href={`/aktie/${part.ticker}`}
                    className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
                >
                    {part.value}
                </Link>
            );
        }
        return <span key={index}>{part.value}</span>;
    });
}

/**
 * Extracts the first ticker symbol from content
 */
export function extractFirstTicker(text: string): string | null {
    CASHTAG_REGEX.lastIndex = 0;
    const match = CASHTAG_REGEX.exec(text);
    return match ? match[1].toUpperCase() : null;
}
