import Link from "next/link";
import type { ReactNode } from "react";

// Regex patterns
const CASHTAG_REGEX = /\$([A-Z]{1,5}(?:-[A-Z])?)/gi;
const MENTION_REGEX = /@([a-zA-Z0-9_]+)/g;

interface ContentMatch {
    type: "text" | "cashtag" | "mention";
    value: string;
    ticker?: string;
    username?: string;
}

/**
 * Parses text content and extracts cashtags and @mentions
 */
export function parseContent(text: string): ContentMatch[] {
    const parts: ContentMatch[] = [];

    // Combined regex to match both patterns
    const combinedRegex = /(\$[A-Z]{1,5}(?:-[A-Z])?)|(@[a-zA-Z0-9_]+)/gi;

    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = combinedRegex.exec(text)) !== null) {
        // Add text before the match
        if (match.index > lastIndex) {
            parts.push({
                type: "text",
                value: text.slice(lastIndex, match.index),
            });
        }

        const matchedValue = match[0];

        if (matchedValue.startsWith("$")) {
            // Cashtag
            parts.push({
                type: "cashtag",
                value: matchedValue,
                ticker: matchedValue.slice(1).toUpperCase(),
            });
        } else if (matchedValue.startsWith("@")) {
            // Mention
            parts.push({
                type: "mention",
                value: matchedValue,
                username: matchedValue.slice(1),
            });
        }

        lastIndex = match.index + matchedValue.length;
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
 * Renders text with clickable cashtags (green) and @mentions (blue)
 */
export function renderWithCashtags(text: string): ReactNode[] {
    const parts = parseContent(text);

    return parts.map((part, index) => {
        if (part.type === "cashtag" && part.ticker) {
            return (
                <Link
                    key={`cashtag-${part.ticker}-${index}`}
                    href={`/stock/${part.ticker}`}
                    className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
                >
                    {part.value}
                </Link>
            );
        }

        if (part.type === "mention" && part.username) {
            return (
                <Link
                    key={`mention-${part.username}-${index}`}
                    href={`/profile/${part.username}`}
                    className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                >
                    {part.value}
                </Link>
            );
        }

        return <span key={index}>{part.value}</span>;
    });
}

// Legacy function for backwards compatibility
export function parseCashtags(text: string): ContentMatch[] {
    return parseContent(text).filter(p => p.type !== "mention");
}

/**
 * Extracts the first ticker symbol from content
 */
export function extractFirstTicker(text: string): string | null {
    CASHTAG_REGEX.lastIndex = 0;
    const match = CASHTAG_REGEX.exec(text);
    return match ? match[1].toUpperCase() : null;
}

/**
 * Extracts all @mentions from content
 */
export function extractMentions(text: string): string[] {
    const mentions: string[] = [];
    let match: RegExpExecArray | null;

    MENTION_REGEX.lastIndex = 0;
    while ((match = MENTION_REGEX.exec(text)) !== null) {
        mentions.push(match[1]);
    }

    return mentions;
}
