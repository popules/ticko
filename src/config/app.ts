// Central application configuration
// Change NEXT_PUBLIC_APP_NAME in .env.local to update the app name globally

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "ticko";

export const APP_CONFIG = {
  name: APP_NAME,
  tagline: "Där resultat räknas",
  title: "Ticko Arena | Slå börsen riskfritt",
  description: "Gå med i Ticko Arena. Handla aktier med virtuella pengar, klättra på leaderboards och använd Ticko AI för att bemästra marknaden.",
  baseUrl: "https://www.ticko.se",
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

// Swedish UI strings
export const UI_STRINGS = {
  // Navigation
  home: "Hem",
  discovery: "Trendradarn",
  markets: "Marknader",
  watchlist: "Bevakningslista",
  portfolio: "Portfölj",
  alerts: "Aviseringar",
  profile: "Profil",
  settings: "Inställningar",
  search: "Sök aktier...",
  trending: "Trendande just nu",

  // Feed
  liveFeed: "Liveflöde",
  live: "Live",
  paused: "Pausad",
  noPosts: "Inga inlägg ännu",
  beFirst: "Bli den första att dela dina marknadsinsikter!",
  post: "Publicera",

  // Composer
  composerPlaceholder: "Vad händer på marknaden?",
  composerHint: "Använd $TICKER för att tagga aktier (t.ex. $TSLA, $VOLV-B)",
  sentiment: "Sentiment:",
  bullish: "Bullish",
  bearish: "Bearish",

  // Analysis
  aiAnalysis: "AI-analys",
  currentPrice: "Kurs nu",
  fairValue: "AI Riktkurs",
  upside: "uppsida",
  downside: "nedsida",
  aiReasoning: "AI-resonemang",
  communitySentiment: "Community-sentiment",
  updatedAgo: "Uppdaterad",

  // Market
  marketOverview: "Marknadsöversikt",
  viewFullWatchlist: "Visa hela bevakningslistan",

  // Stock page
  trade: "Handla",
  volume: "Volym",
  marketCap: "Börsvärde",
  peRatio: "P/E-tal",
  week52Range: "52v Intervall",
  discussion: "Diskussion",
} as const;
