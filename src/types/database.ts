export type SentimentType = "bull" | "bear";
export type ReactionType = "up" | "down";
export type PredictionStatus = "pending" | "correct" | "incorrect";

export type ChallengeType = 'daily' | 'weekly';
export type ChallengeCategory = 'trading' | 'social' | 'learning';

export interface Challenge {
    id: string;
    type: ChallengeType;
    category: ChallengeCategory;
    title: string;
    description: string;
    target_count: number;
    xp_reward: number;
    cash_reward: number;
    is_active: boolean;
    created_at: string;
}

export interface UserChallenge {
    id: string;
    user_id: string;
    challenge_id: string;
    current_count: number;
    is_completed: boolean;
    completed_at: string | null;
    expires_at: string;
}

export interface Profile {
    id: string;
    username: string;
    avatar_url: string | null;
    reputation_score: number;
    created_at: string;
    updated_at: string;
    // Pro subscription fields
    is_pro?: boolean;
    pro_expires_at?: string | null;
    // AI usage metering
    ai_usage_count?: number;
    ai_usage_date?: string | null;
    // Watchlist limit
    watchlist_limit?: number;
    // League rating (MMR)
    league_rating?: number;
    league_rating_updated_at?: string | null;
}

export interface Post {
    id: string;
    user_id: string;
    content: string;
    ticker_symbol: string | null;
    sentiment: SentimentType | null;
    gif_url: string | null;
    is_prediction?: boolean;
    prediction_price?: number | null;
    target_date?: string | null;
    prediction_status?: PredictionStatus;
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
    is_prediction?: boolean;
    prediction_price?: number | null;
    target_date?: string | null;
    prediction_status?: PredictionStatus;
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

export interface League {
    id: string;
    season_id: string;
    name: string;
    tier: number;
    min_level: number;
    max_level: number | null;
    created_at: string;
}

export interface LeaguePlacement {
    id: string;
    league_id: string;
    user_id: string;
    joined_at: string;
    rank_in_league: number | null;
    // Joined league data
    leagues?: League;
    // Joined profile data
    profiles?: Profile;
}

// Fantasy League Types (Friend Competitions)
export interface FantasyLeague {
    id: string;
    name: string;
    invite_code: string;
    creator_id: string;
    starting_capital: number;
    start_date: string;
    end_date: string | null;
    duration_days: number;
    max_members: number;
    is_active: boolean;
    created_at: string;
}

export interface FantasyLeagueMember {
    id: string;
    league_id: string;
    user_id: string;
    joined_at: string;
    starting_value: number;
    current_value: number;
    rank_in_league: number | null;
    // Joined data
    fantasy_leagues?: FantasyLeague;
    profiles?: Profile;
}

export interface FantasyLeagueSnapshot {
    id: string;
    league_id: string;
    user_id: string;
    snapshot_date: string;
    portfolio_value: number;
}

export interface LearnProgress {
    id: string;
    user_id: string;
    module_id: string;
    lesson_id: string;
    completed_at: string;
    xp_awarded: number;
}

// Supabase database type definitions
export type Database = {
    public: {
        Tables: {
            profiles: {
                Row: Profile;
                Insert: {
                    id: string;
                    username: string;
                    avatar_url?: string | null;
                    reputation_score?: number;
                    is_pro?: boolean;
                    pro_expires_at?: string | null;
                    ai_usage_count?: number;
                    ai_usage_date?: string | null;
                    watchlist_limit?: number;
                };
                Update: {
                    username?: string;
                    avatar_url?: string | null;
                    reputation_score?: number;
                    is_pro?: boolean;
                    pro_expires_at?: string | null;
                    ai_usage_count?: number;
                    ai_usage_date?: string | null;
                    watchlist_limit?: number;
                };
            };
            posts: {
                Row: Post;
                Insert: PostInsert;
                Update: {
                    content?: string;
                    ticker_symbol?: string | null;
                    sentiment?: SentimentType | null;
                    gif_url?: string | null;
                    is_prediction?: boolean;
                    prediction_price?: number | null;
                    target_date?: string | null;
                    prediction_status?: PredictionStatus;
                };
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
            leagues: {
                Row: League;
                Insert: {
                    season_id: string;
                    name: string;
                    tier: number;
                    min_level: number;
                    max_level?: number | null;
                };
                Update: {
                    name?: string;
                    min_level?: number;
                    max_level?: number | null;
                };
            };
            league_placements: {
                Row: LeaguePlacement;
                Insert: {
                    league_id: string;
                    user_id: string;
                    rank_in_league?: number | null;
                };
                Update: {
                    rank_in_league?: number | null;
                };
            };
            learn_progress: {
                Row: LearnProgress;
                Insert: {
                    user_id: string;
                    module_id: string;
                    lesson_id: string;
                    xp_awarded?: number;
                };
                Update: {
                    xp_awarded?: number;
                };
            };
            challenges: {
                Row: Challenge;
                Insert: {
                    type: ChallengeType;
                    category: ChallengeCategory;
                    title: string;
                    description: string;
                    target_count: number;
                    xp_reward: number;
                    cash_reward?: number;
                    is_active?: boolean;
                };
                Update: {
                    title?: string;
                    description?: string;
                    target_count?: number;
                    xp_reward?: number;
                    is_active?: boolean;
                };
            };
            user_challenges: {
                Row: UserChallenge;
                Insert: {
                    user_id: string;
                    challenge_id: string;
                    current_count?: number;
                    is_completed?: boolean;
                    completed_at?: string | null;
                    expires_at: string;
                };
                Update: {
                    current_count?: number;
                    is_completed?: boolean;
                    completed_at?: string | null;
                };
            };
        };
        Enums: {
            sentiment_type: SentimentType;
            prediction_status: PredictionStatus;
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
};
