export type SentimentType = "bull" | "bear";
export type ReactionType = "up" | "down";

export interface Profile {
    id: string;
    username: string;
    avatar_url: string | null;
    reputation_score: number;
    created_at: string;
    updated_at: string;
}

export interface Post {
    id: string;
    user_id: string;
    content: string;
    ticker_symbol: string | null;
    sentiment: SentimentType | null;
    gif_url: string | null;
    created_at: string;
    // Joined profile data
    profiles?: Profile;
    // Reaction counts (computed)
    up_count?: number;
    down_count?: number;
    user_reaction?: ReactionType | null;
}

export interface PostInsert {
    user_id: string;
    content: string;
    ticker_symbol?: string | null;
    sentiment?: SentimentType | null;
    gif_url?: string | null;
}

export interface Reaction {
    id: string;
    user_id: string;
    post_id: string;
    reaction_type: ReactionType;
    created_at: string;
}

export interface ReactionInsert {
    user_id: string;
    post_id: string;
    reaction_type: ReactionType;
}

export interface Watchlist {
    id: string;
    user_id: string;
    ticker_symbol: string;
    added_at: string;
}

export interface TickerSentiment {
    bullish_count: number;
    bearish_count: number;
    bullish_percent: number;
    bearish_percent: number;
    total_posts: number;
}

// Supabase database type definitions
export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: Profile;
                Insert: {
                    id: string;
                    username: string;
                    avatar_url?: string | null;
                    reputation_score?: number;
                };
                Update: Partial<Omit<Profile, "id" | "created_at" | "updated_at">>;
            };
            posts: {
                Row: Post;
                Insert: PostInsert;
                Update: Partial<Omit<Post, "id" | "user_id" | "created_at">>;
            };
            reactions: {
                Row: Reaction;
                Insert: ReactionInsert;
                Update: { reaction_type?: ReactionType };
            };
            watchlists: {
                Row: Watchlist;
                Insert: { user_id: string; ticker_symbol: string };
                Update: { ticker_symbol?: string };
            };
        };
        Enums: {
            sentiment_type: SentimentType;
        };
        Functions: {
            get_ticker_sentiment: {
                Args: { ticker_symbol_param: string };
                Returns: TickerSentiment[];
            };
            get_post_reactions: {
                Args: { post_id_param: string };
                Returns: { up_count: number; down_count: number }[];
            };
        };
    };
}
