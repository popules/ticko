import OpenAI from "openai";

let openaiInstance: OpenAI | null = null;

/**
 * Returns a lazy-loaded OpenAI client.
 * This prevents the constructor from throwing an error during build/module evaluation
 * if the OPENAI_API_KEY is not yet available.
 */
export function getOpenAIClient(): OpenAI {
    if (!openaiInstance) {
        const apiKey = process.env.OPENAI_API_KEY;

        // If we're in build mode or the key is missing, we don't want to crash immediately
        // but we'll provide a dummy client or handle the error gracefully during execution.
        if (!apiKey && process.env.NODE_ENV === "production") {
            console.warn("OPENAI_API_KEY is missing. OpenAI features will fail at runtime.");
        }

        openaiInstance = new OpenAI({
            apiKey: apiKey || "dummy_key_for_build",
        });
    }
    return openaiInstance;
}

export const openai = getOpenAIClient();
