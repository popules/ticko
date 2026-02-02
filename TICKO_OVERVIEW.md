# Ticko: Product Overview (for review and feedback)

**Use this doc to share Ticko with other AI models or reviewers and ask: "Do you think this is a good app? What would you improve?"**

---

## What is Ticko?

**Ticko** (tickomarkets.com) is a **social stock-trading game**. Users get **$10,000 in virtual cash**, trade real stocks at real prices (paper trading), and compete on leaderboards in **seasons** and **leagues**. The goal is to learn by doing—without real money—while competing with others and climbing ranks.

**Tagline:** *"Where results matter."*  
**Positioning:** *"Join Ticko Arena. Trade stocks with virtual money, climb the leaderboards, and use Ticko AI to master the market."*

---

## Who is it for?

- **Beginners** who want to learn how stocks and trading work without risking real money.
- **Casual traders** who like competition, leaderboards, and a game-like experience.
- **Communities** that want to discuss stocks, share takes, and see what’s trending.

It is **not** a broker or real-money trading app. Everything is simulated.

---

## Core experience (the "game loop")

1. **Sign up** → You get **$10k virtual cash** and enter **The Arena**.
2. **Trade** → Buy/sell real stocks (e.g. AAPL, NVDA) at live prices. Trades are **paper only**; a 30-minute lock prevents day-trading abuse.
3. **Compete** → Your **season P&L** and **league rank** (Bronze → Silver → Gold → Platinum → Diamond) determine where you stand. **Top 3 in a league promote**; bottom ranks can be relegated.
4. **Engage** → Post about stocks, comment, react, follow others. **Trending** and **Hot right now** show most-discussed tickers. You earn **XP** for trades, posts, comments, reactions; XP drives **level** and **rank** (e.g. "Analyst", "Pro").
5. **Learn** → **Ticko Academy** offers short lessons (e.g. "What is paper trading?", "Your first trade"). **Ticko AI** gives stock analysis, portfolio insights, and a chat assistant that knows your positions and P&L.

**Seasons** reset periodically (e.g. every few months). Your final rank and league are recorded; a new season starts with a fresh $10k and new league placement based on your level.

---

## Main features (what’s in the product today)

| Area | What it does |
|------|----------------|
| **The Arena** | Portfolio view, buy/sell flow, trade history, P&L chart, season banner, league badge and rank. "Ticko AI" tab with personalized trading insights (e.g. win rate, best/worst trades). Pro users get a "Performance" tab (deeper stats). |
| **Leaderboard** | Global and **per-league** rankings. Tabs: **My League** (default), **Reputation**, **Paper** (season P&L). Hall of Fame, season winners, history. |
| **Leagues** | Bronze / Silver / Gold / Platinum / Diamond. Placement by **level** (from XP). Each league has its own leaderboard; promotion/relegation at season end. |
| **Feed & social** | Posts with $TICKER tags, sentiment (bull/bear). Comments, nested replies, reactions, follows. Notifications (likes, comments, follows, achievements). Reports and community guidelines. |
| **Discover & trending** | "Hot right now" (most discussed stocks, last 4h). **Trending** page with filters (4h / 24h / 7d). Market overview (gainers/losers, sectors). |
| **Stocks** | Stock pages with price, chart (TradingView), performance metrics (1D, 5D, 1M, 3M, 6M, YTD, 1Y, 5Y). **AI Analysis** (fair value, reasoning, community sentiment). Watchlist; add/remove tickers. |
| **Ticko AI** | **Floating chat** (site-wide): asks about portfolio, trades, watchlist; answers use your real positions and P&L. **Stock Analysis** tab: AI fair value + reasoning per ticker. **Trading insights** in Arena: "roast" of your trading style (win rate, hold time, best/worst trades). **Metering:** 3 free AI uses per day; **Pro** = unlimited. |
| **Academy** | 5 modules, ~12 lessons (e.g. basics, first trade, candlesticks). Progress tracked (client-side). CTAs to Arena/leaderboard. No server-side rewards yet (no XP/cash for completing lessons). |
| **Progression** | XP from trades, posts, comments, reactions. **Levels** and **ranks** (20 ranks, e.g. Rookie → Analyst → Pro). **Achievements** (50+ types). Streaks. Pro users get a **Pro badge** and higher limits (e.g. watchlist 50 vs 10). |
| **Monetization** | **Ticko Pro** (~$5/mo): unlimited AI, bigger watchlist, Performance tab, Pro badge. **Paid reset:** one-time fee to reset portfolio to $10k mid-season. Payments via Polar; no ads. |

---

## Platform and tech

- **Web app** (Next.js), responsive; works on mobile browsers. **PWA** (manifest, service worker) for installability.
- **Backend:** Supabase (auth, Postgres, Realtime, RLS, storage). External APIs for market data. OpenAI for AI features.
- **No native iOS/Android app in the stores yet**; app-store distribution is planned (e.g. Capacitor wrapper or similar).

---

## Current state (summary)

- **Live and used:** Arena, paper trading, seasons, leaderboards, leagues (with placement and league leaderboard), challenges (daily/weekly with XP rewards), feed, comments, trending, stock pages, AI analysis and Ticko AI chat, Academy (content only), Pro subscription and metering.
- **Intentional limits:** No real-money trading. AI is rate-limited for free users. Watchlist capped for free users. Moderation via reports (no mute/block in-app yet).
- **English only.** Disclaimers throughout: educational, not financial advice.

---

## Ask for reviewers / other AIs

1. **Do you think this is a good app?** (Why or why not?)
2. **Who do you see as the main user?** (Beginners, casual competitors, something else?)
3. **What’s missing or underused?** (Features, clarity, retention, monetization.)
4. **What would you improve first?** (Product, positioning, growth, or tech.)
5. **How would you describe Ticko in one sentence** to a friend or investor?

If you’re an AI: answer in your own words; be direct and constructive. If you’re human: same—honest feedback is what we’re after.

---

*Document generated for sharing; reflects product as of early 2026. For internal roadmap and implementation details, see `ROADMAP.md` in the repo.*
