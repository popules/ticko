// Central application configuration
// Change NEXT_PUBLIC_APP_NAME in .env.local to update the app name globally

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Ticko";

export const APP_CONFIG = {
  name: APP_NAME,
  tagline: "Where results matter",
  title: "Ticko | Beat the market risk-free",
  description: "Join Ticko Arena. Trade stocks with virtual money, climb the leaderboards, and use Ticko AI to master the market.",
  baseUrl: "https://tickomarkets.com",
} as const;

export const BASE_URL = APP_CONFIG.baseUrl;

// Theme colors
export const THEME = {
  background: "#020617",
  card: "rgba(255, 255, 255, 0.04)",
  cardBorder: "rgba(255, 255, 255, 0.12)",
  bullish: "#10B981", // Emerald-500
  bearish: "#F43F5E", // Rose-500
} as const;

// UI strings (English)
export const UI_STRINGS = {
  // Navigation
  home: "Home",
  discovery: "Discover",
  markets: "Markets",
  watchlist: "Watchlist",
  portfolio: "Portfolio",
  alerts: "Alerts",
  profile: "Profile",
  settings: "Settings",
  search: "Search stocks...",
  trending: "Trending now",

  // Feed
  liveFeed: "Live Feed",
  live: "Live",
  paused: "Paused",
  noPosts: "No posts yet",
  beFirst: "Be the first to share your market insights!",
  post: "Post",

  // Composer
  composerPlaceholder: "What's happening in the market?",
  composerHint: "Use $TICKER to tag stocks (e.g. $TSLA, $AAPL)",
  sentiment: "Sentiment:",
  bullish: "Bullish",
  bearish: "Bearish",

  // Analysis
  aiAnalysis: "AI Analysis",
  currentPrice: "Current Price",
  fairValue: "AI Target",
  upside: "upside",
  downside: "downside",
  aiReasoning: "AI Reasoning",
  communitySentiment: "Community Sentiment",
  updatedAgo: "Updated",

  // Market
  marketOverview: "Market Overview",
  viewFullWatchlist: "View full watchlist",

  // Stock page
  trade: "Trade",
  volume: "Volume",
  marketCap: "Market Cap",
  peRatio: "P/E Ratio",
  week52Range: "52W Range",
  discussion: "Discussion",
} as const;

