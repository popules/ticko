# Ticko Product Roadmap

**Vision:** Ticko as a **game to learn trading** — practice with $10k, compete in leagues, climb ranks, and learn in the Arena.

Below: first a full list of **what’s already implemented** (so we don’t re-build it). Then each phase says what is **new** vs **existing**.

---

## Already implemented (do not re-build)

**Auth & profile:** Register, login, reset password, auth callback, Supabase auth. Profiles (username, display_name, bio, location, avatar_url, reputation_score, paper_*, is_pro, etc.). Profile API, avatar upload, edit profile.

**Notifications (full stack):** `notifications` table + RLS; type enum (like, comment, reply, follow, system). Triggers: notify on comment, on reaction (like). App-created notifications: follow, achievement, season winner, prediction correct. **API:** `GET /api/notifications` (list with actor/post), `POST` (mark all read). **UI:** NotificationBell (sidebar), NotificationList (dropdown), `/alerts` page (full list), realtime subscription. **Push:** `lib/push.ts`, `POST /api/push/subscribe`, `POST /api/push/send` — infrastructure exists; roadmap only adds *new push triggers* (e.g. challenge complete, season ending).

**Feed & social:** Posts, comments, reactions, cashtags, PostCard, CommentForm, CommentList, FeedStream, ReportModal. Follow (API + FollowButton). Reports → `POST /api/reports` (email to admin). Community guidelines page.

**Paper trading & Arena:** Portfolio table, transactions, 30-min lock, paper_season_pnl, paper_total_pnl, daily snapshot cron. Paper trading page (portfolio, history, graph, insights), PaperTradeButton, PaperSellModal, PaidResetModal (Polar). Season history, TradingInsights.

**Seasons & leaderboard:** `seasons` table, active season, `historical_portfolios`, Hall of Fame. Season-reset cron (snapshot, badges, new season). Leaderboard page: paper (season / all-time), reputation tab, season winners, last winner, season history collapsible.

**Academy:** 5 modules, ~12 lessons in `learn-content.ts`. `/learn`, `/learn/[moduleId]`, `/learn/[moduleId]/[lessonId]`. ProgressTracker, useLearnProgress (localStorage). Lesson CTAs to stock/paper-trading/leaderboard. **Not yet:** server-side progress, XP/cash rewards for lessons, Academy achievements — those are in Phase 2.

**Achievements & XP:** achievements.ts (full set), user_achievements, awardAchievement, checkAchievements, checkPaperTradingAchievements. level-system.ts (XP per post/comment/reaction/trade, streaks, getLevel). ranks.ts (20 ranks). XP awarded on trade, achievements create notifications.

**Market & stocks:** Market page (gainers/losers, sectors, indices, etc.). Stock pages, charts, AI summary, sentiment. Watchlist API + WatchButton. Alerts page = notifications list (not price alerts).

**Other APIs:** account/delete, admin (create-bots, delete-test-users, seed-comments), AI (copilot, evaluate-prediction, morning-report, ticker-summary, trading-insights), analyze, cron (daily-snapshot, digest, predictions, season-reset, tickobot), discovery, email (contact, welcome), follow, market/*, news, og/trade-card, polar (checkout, webhook), portfolio/trade, posts/[id], profile, push (send, subscribe), reports, search, sentiment, stock/*, stocks/*, watchlist.

**Moderation:** Reports exist. Mute/block: not present yet — Phase 7 says “add if not present.”

**Language:** App is **English-only**. Any Swedish in the codebase (e.g. "Säsong" in season names, Swedish strings) is legacy and wrong — remove it. Do not add Swedish.

---

## Phase 1: Leagues & Brackets (Core Game Pillar)

**Goal:** Players compete in leagues of similar skill so leaderboards feel winnable and matchmaking is fair.

**New vs existing:** All new — leagues table, league_placements (or profile columns), league assignment in season-reset, `GET /api/league/current`, `GET /api/league/[leagueId]/leaderboard`, league badge in sidebar/profile, “My league” tab or page on leaderboard. Reuse: seasons, profiles (reputation_score, level), leaderboard UI patterns.

### 1.1 Data model

- **`leagues` table**
  - `id`, `name` (e.g. "Bronze", "Silver", "Gold", "Platinum", "Diamond"), `tier` (1–5 or 1–10), `min_level`, `max_level` (optional; can be level-based or PnL-based).
  - `season_id` (FK) so leagues are per season.
- **`league_placements`** (or add to `profiles`)
  - `user_id`, `league_id`, `season_id`, `joined_at`, `rank_in_league`, `promotion_eligible`, `relegation_eligible`.
- **Placement rule (v1):** On season start (or first Arena activity), assign user to a league by **level** (from `reputation_score` + `getLevel()` / `getUserRank()`). E.g. Level 1–4 → Bronze, 5–8 → Silver, etc. Use existing `ranks.ts` bands.

### 1.2 Backend

- **API: Get my league** — `GET /api/league/current` → current season, league name, rank in league, tier, promotion/relegation zone.
- **API: League leaderboard** — `GET /api/league/[leagueId]/leaderboard` → top N in that league (by `paper_season_pnl`), with rank, username, avatar, PnL.
- **Cron / season-reset:** After creating new season, run **league assignment**: for each user with activity in the past season, compute level (from `reputation_score`), assign to a league for the new season. Optionally: **promotion/relegation** — top X% move up, bottom X% move down (next phase).

### 1.3 Frontend

- **League badge** — In sidebar and profile: show current league (e.g. "Silver League"), tier icon, rank-in-league (e.g. "Rank 12 in Silver").
- **League leaderboard page** — `/leaderboard/league` or tab on existing leaderboard: "My league" (default) vs "Global". List top 50 in user’s league with rank, username, PnL; highlight current user.
- **Arena / Paper Trading** — Show league context: "You’re in Silver League. Top 3 get promoted to Gold at season end."
- **Season reset copy** — "Season 12 is over. You finished Rank 5 in Silver. You’re staying in Silver for Season 13." (Later: "You’re promoted to Gold!")

### 1.4 Scope / de-scope for v1

- **In scope:** Level-based leagues, one leaderboard per league per season, league badge + rank in UI, league assignment on season start.
- **Later:** Promotion/relegation automation, PnL-based leagues, private leagues / friend groups.

---

## Phase 2: Academy Deep Integration (Build on What You Have)

**Goal:** Academy isn’t a separate "learn" section — it’s part of the game loop (unlocks, rewards, visibility).

**New vs existing:** New: `learn_progress` table (optional), `POST /api/learn/complete`, XP/cash rewards on lesson complete, Academy achievements (first lesson, module complete, graduate), Academy card on dashboard/Arena. Existing: Academy content, useLearnProgress (localStorage), lesson pages, awardXp, awardAchievement — extend, don’t replace.

### 2.1 Server-side progress (optional but recommended)

- **`learn_progress` table** — `user_id`, `module_id`, `lesson_id`, `completed_at`. Sync from client on lesson complete (e.g. `POST /api/learn/complete`). Keep localStorage as cache; server is source of truth for rewards and unlocks.
- **API: Complete lesson** — `POST /api/learn/complete` with `moduleId`, `lessonId`. Upsert `learn_progress`, return new progress + any rewards (e.g. XP, virtual cash bonus).

### 2.2 Unlocks and rewards

- **XP for lessons** — e.g. +10 XP per lesson completed (reuse `awardXp()`). Optionally: first-time completion only.
- **Virtual cash bonus** — e.g. "Complete module 'Your First Trade' → +$500 virtual cash" (one-time). Requires portfolio/cash adjustment in backend.
- **Unlocks (optional)** — e.g. "Complete 'Candlesticks' to unlock chart timeframes" or "Complete 'Risk & Strategy' to unlock advanced stats." Prefer soft nudges first; hard unlocks only if you want stronger gamification.
- **Achievements** — New achievements: "First lesson", "Module complete: Basics", "Academy graduate" (all lessons). Hook into existing `awardAchievement()` and `checkAchievements()`.

### 2.3 In-app visibility

- **Dashboard / Arena** — Small "Academy" card: "3/12 lessons done. Complete 'How to Buy & Sell' for +$500." Links to `/learn`.
- **Onboarding** — After "Here’s $10k", add optional slide: "Learn the basics in Ticko Academy — bite-sized lessons, no experience needed."
- **Post-lesson CTA** — Already have `ctaLink` (e.g. to `/paper-trading`, `/leaderboard`). Add optional "Claim +$500" or "Earn 10 XP" button when server-side reward is implemented.

### 2.4 Content (no structural change)

- Academy structure stays: 5 modules, existing lessons, `learn-content.ts`, `useLearnProgress` (and optionally server sync). Roadmap only adds rewards and visibility.

---

## Phase 3: Daily / Weekly Challenges (Retention Loop)

**Goal:** Give players a reason to open the app every day and a clear "what to do next."

**New vs existing:** New: `challenges` table, `user_challenge_progress`, cron for daily/weekly challenge rows, `GET /api/challenges/active`, `POST /api/challenges/progress` (or internal progress updates), challenges widget on dashboard/Arena. Reuse: **notifications** (insert a notification when user completes a challenge: “You completed ‘Make 1 trade’! +10 XP”) and **push** (optional: send push for challenge complete) — do not build a second notifications system.

### 3.1 Challenge definitions

- **Daily:** e.g. "Make 1 trade today", "Post about a stock", "React to 3 posts", "Complete 1 Academy lesson."
- **Weekly:** e.g. "Make 5 trades this week", "Be in top 20 of your league", "Complete 3 lessons", "Hit a 3-trade win streak."

### 3.2 Data and backend

- **`challenges` table** — `id`, `key` (e.g. `daily_trade_1`), `type` (daily | weekly), `title`, `description`, `target_count`, `xp_reward`, `cash_reward` (optional).
- **`user_challenge_progress`** — `user_id`, `challenge_id`, `season_id` (or date window), `progress` (e.g. count), `completed_at`, `rewarded_at`.
- **Cron:** Daily at midnight (per region or UTC): create daily challenge rows for the day. Weekly: create weekly challenge rows per season/week.
- **APIs:** `GET /api/challenges/active` (my daily + weekly), `POST /api/challenges/progress` (internal or called when user trades/posts/completes lesson). When `progress >= target`, set `completed_at`, call `awardXp()` / credit cash, set `rewarded_at`.

### 3.3 Frontend

- **Challenges widget** — On dashboard or Arena: "Today: Make 1 trade (0/1) — 10 XP." "This week: Top 20 in your league — 50 XP." Progress bars, claim reward when done.
- **Notifications** — "You completed 'Make 1 trade'! +10 XP." (Reuse existing notifications table.)

---

## Phase 4: Arena-First UX and Naming (Game Positioning)

**Goal:** The app feels like a game first; "paper trading" and "market data" support the Arena.

**New vs existing:** Copy and nav only — rename “Paper Trading” → “Arena” in sidebar/labels, add league context to Arena page once Phase 1 exists. No new APIs or tables. Existing: paper-trading page, sidebar, landing, onboarding — just relabel and reorder.

### 4.1 Naming and nav

- **Rename in UI:** "Paper Trading" → **"Arena"** (or "My challenge" / "$10k challenge"). Keep route `/paper-trading` or add redirect from `/arena`.
- **Sidebar / nav:** Primary item = "Arena" (portfolio + trades). "Leaderboard" = "Rankings" or "Leaderboard" with league tab prominent. "Feed" = "Arena feed" or "What players are saying."
- **Landing / onboarding:** Lead with "Arena", "Season", "League", "Rank." Keep "virtual money" and "no real risk" in copy.

### 4.2 Arena dashboard

- **Above the fold:** Season name, days left, your league, rank in league, portfolio value, today’s PnL. Then: challenges (Phase 3), then portfolio list.
- **League promo/relegation** — "Top 3 in Silver get promoted. You’re #5 — 2 spots to go."

### 4.3 Market and discover

- Keep market page and discover; in nav or footer label as "Markets" / "Discover" so they support the Arena rather than compete with it.

---

## Phase 5: App Store & Distribution (Game Positioning)

**Goal:** Ship Ticko as a game that teaches trading (e.g. App Store / Play Store).

**New vs existing:** New: store listing (category, title, subtitle, screenshots, description), native wrapper if desired (Capacitor etc.), deep links for share rank/league. Existing: app works as PWA; legal/disclaimers already in place.

### 5.1 Store listing

- **Category:** Games → Simulation (or similar). Avoid "Finance" as primary if you want "game" discovery.
- **Title:** e.g. "Ticko: Stock Trading Game" or "Ticko Arena – Learn to Trade."
- **Subtitle:** "Practice with $10k. Compete in leagues. Learn."
- **Screenshots:** Arena, leaderboard, league badge, Academy, feed. Short captions: "Your league. Your rank." "Learn. Trade. Compete."
- **Description:** Lead with challenge, leagues, seasons, zero risk, learning. Mention Academy and AI as tools inside the game.

### 5.2 Build and compliance

- **PWA → native wrapper** (e.g. Capacitor, React Native) if you want a single codebase; or separate native app. Next.js app can remain primary; wrapper loads webview or export.
- **Legal:** Keep "educational," "simulated trading," "not financial advice" in app and store description. Same disclaimers as today.

### 5.3 Deep links and sharing

- **Share rank/league:** "I’m #3 in Gold League this season – Ticko Arena." Open app to profile or leaderboard. Implement `/profile/[id]` and `/leaderboard?league=gold` (or similar).
- **Invite:** "Join my league" (if you add private leagues later) or "Join Ticko Arena – here’s $10k to start."

---

## Phase 6: Progression and Cosmetics (Optional)

**Goal:** Visible progression and optional vanity rewards.

**New vs existing:** New: more prominent level/rank in profile and sidebar, league tier badge asset, optional avatar_frame_id or user_cosmetics. Existing: level-system.ts, ranks.ts, level colors — just expose more; no new backend unless you add cosmetics table.

### 6.1 Progression

- You already have levels (level-system.ts) and ranks (ranks.ts). Expose them more: "Level 7 – Analyst" in profile, sidebar, leaderboard. Progress bar to next level/rank.
- **League tier visuals** — Icon/badge per league (Bronze/Silver/Gold etc.) on avatar or profile.

### 6.2 Cosmetics (optional)

- **Avatar frames** — Unlock by league, season winner, or achievements. Store in `profiles` (e.g. `avatar_frame_id`) or a small `user_cosmetics` table.
- **Themes** — Unlock dark/light or accent color by level/achievement. Low priority.

---

## Phase 7: Polish and Scale (Ongoing)

**New vs existing:** Extend existing systems; don’t duplicate.

- **Performance:** Lazy load feed, virtualize leaderboards, cache league leaderboard (new cache; existing APIs).
- **Moderation:** **Keep** existing reports and community guidelines. **Add** mute/block only if not present (check codebase before building).
- **Analytics:** New: funnel + league engagement events. Existing: PostHog or similar if already wired.
- **Language:** App is **English-only**. Any Swedish in code, UI, or content (e.g. "Säsong" in season names, SEK labels) is legacy from when the app was Swedish and should be removed. Do not add Swedish. If you add other languages later, add EN variants or other locales only — no Swedish.
- **Notifications / push:** **Reuse** existing `notifications` table and push (`/api/push/send`, `lib/push.ts`). **Add** new triggers only: e.g. cron or app logic that inserts notifications and/or sends push for “Season ending in 24h,” “You were promoted to Gold,” “Daily challenge: 1 trade left.” Do not build a second notification or push system.

---

## Summary Table

| Phase | Focus | Key deliverables |
|-------|--------|-------------------|
| **1** | Leagues & brackets | Leagues table, placement by level, league leaderboard, league badge, season assignment |
| **2** | Academy integration | Server-side progress (optional), XP/cash rewards, Academy achievements, dashboard CTAs |
| **3** | Daily/weekly challenges | Challenges table, progress tracking, cron, challenges widget, rewards |
| **4** | Arena-first UX | Rename Paper → Arena, nav and landing emphasis, league promo/relegation copy |
| **5** | App Store & distribution | Store listing (game category), title/subtitle, screenshots, build (wrapper if needed) |
| **6** | Progression & cosmetics | Level/rank visibility, league badges, optional frames/themes |
| **7** | Polish & scale | Perf, moderation, analytics, English-only (remove legacy Swedish), push |

---

## Suggested Order

1. **Phase 1 (Leagues)** — Biggest new mechanic; unblocks "compete with similar players" and store pitch.
2. **Phase 4 (Arena naming + UX)** — Quick wins; rename and reorder nav/landing so "game" is clear.
3. **Phase 2 (Academy rewards)** — Build on existing Academy; server-side progress optional but enables XP/cash and achievements.
4. **Phase 3 (Challenges)** — Retention; depends on leagues (optional) for "top 20 in league" type challenges.
5. **Phase 5 (App Store)** — When you’re ready to ship; can be in parallel with 2/3.
6. **Phase 6–7** — As needed for retention and scale.

---

## What You Already Have (No Duplication)

See the **Already implemented** section at the top for the full list (notifications, APIs, Academy, seasons, leaderboards, achievements, push, reports, etc.). Each phase above has a **New vs existing** line so you only build what’s not there. Use this doc as the single source of truth for "what’s next"; adjust dates and scope per your capacity.
