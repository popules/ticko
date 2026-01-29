// Learn Content - Static content for Trading Academy
// Each module contains lessons with short, TikTok-style content

export interface Lesson {
    id: string;
    title: string;
    description: string;
    content: string;
    ctaText: string;
    ctaLink: string;
    emoji: string;
}

export interface Module {
    id: string;
    title: string;
    description: string;
    emoji: string;
    lessons: Lesson[];
}

export const LEARN_CONTENT: Module[] = [
    {
        id: "basics",
        title: "The Basics",
        description: "What are stocks and how do markets work?",
        emoji: "📚",
        lessons: [
            {
                id: "what-is-a-stock",
                title: "What is a Stock?",
                description: "Own a tiny piece of a company",
                emoji: "🏢",
                content: `When you buy a stock, you're buying a small piece of a company.

If Apple has 1 billion shares and you buy 1 share, you own 0.0000001% of Apple. Tiny, but real!

**Why buy stocks?**
- Companies grow → Your piece becomes worth more
- Some companies pay you cash just for holding (called dividends)

**The risk?** Companies can also shrink or fail. Your piece becomes worth less.`,
                ctaText: "Search for Apple stock",
                ctaLink: "/stock/AAPL",
            },
            {
                id: "what-is-a-market",
                title: "What is a Market?",
                description: "Where buyers meet sellers",
                emoji: "🏛️",
                content: `A stock market is just a place where people buy and sell stocks. Think of it like eBay for company shares.

**The big ones:**
- **NYSE** (New York Stock Exchange) - The oldest, most prestigious
- **NASDAQ** - Tech-heavy, where Apple/Google/Tesla trade
- **Nordic exchanges** - Stockholm, Copenhagen, Helsinki, Oslo

**When are they open?**
Each market has its own hours based on local time. The US markets trade 9:30 AM - 4:00 PM Eastern. European markets open earlier in those timezones.

The price you see is simply what the last person paid for that stock.`,
                ctaText: "See what's trending now",
                ctaLink: "/market",
            },
            {
                id: "understanding-tickers",
                title: "Understanding Tickers",
                description: "Why is Apple called AAPL?",
                emoji: "🏷️",
                content: `Every stock has a short code called a "ticker symbol."

**Examples:**
- Apple → **AAPL**
- Tesla → **TSLA**  
- Google → **GOOGL**
- Microsoft → **MSFT**

These are like usernames for companies. When you see "$TSLA is up 5%" on social media, they're talking about Tesla stock.

The "$" before the ticker is just a convention to show it's a stock.`,
                ctaText: "Search for a ticker",
                ctaLink: "/discover",
            },
        ],
    },
    {
        id: "charts",
        title: "Reading Charts",
        description: "Those red and green bars explained",
        emoji: "📊",
        lessons: [
            {
                id: "candlesticks",
                title: "Candlesticks Explained",
                description: "The building blocks of charts",
                emoji: "🕯️",
                content: `Each "candle" shows what happened to a stock's price over a period of time.

**A candle has 4 parts:**
- **Open** - Where the price started
- **Close** - Where the price ended
- **High** - The highest it went
- **Low** - The lowest it went

**Colors:**
- 🟢 **Green** = Price went UP (closed higher than it opened)
- 🔴 **Red** = Price went DOWN (closed lower than it opened)

The "body" shows open-to-close. The "wicks" show the highs and lows.`,
                ctaText: "Look at a real chart",
                ctaLink: "/stock/NVDA",
            },
            {
                id: "timeframes",
                title: "Understanding Timeframes",
                description: "Zoom in or zoom out",
                emoji: "⏱️",
                content: `Charts can show different time periods. Each candle represents that much time.

**Common timeframes:**
- **1D (1 Day)** - Each candle = 1 day of trading
- **1W (1 Week)** - Each candle = 1 week
- **1M (1 Month)** - Each candle = 1 month

**Pro tip:**
- Short timeframes (1D) = Good for active traders
- Long timeframes (1M, 1Y) = Good for investors

Zoomed out, the market almost always goes up over decades.`,
                ctaText: "Try different timeframes",
                ctaLink: "/stock/SPY",
            },
        ],
    },
    {
        id: "first-trade",
        title: "Your First Trade",
        description: "Buy and sell without real money",
        emoji: "🎮",
        lessons: [
            {
                id: "what-is-paper-trading",
                title: "What is Paper Trading?",
                description: "Practice with fake money",
                emoji: "📝",
                content: `Paper trading is trading with fake (virtual) money. All the real prices, none of the real risk.

**Why paper trade?**
- Learn how trading works without losing real money
- Test strategies before going live
- Build confidence and track record

On Ticko, you start with **$100,000 in virtual cash**. Use it to buy and sell real stocks at real prices.

Your performance is tracked on the leaderboard!`,
                ctaText: "Start paper trading",
                ctaLink: "/paper-trading",
            },
            {
                id: "how-to-buy",
                title: "How to Buy & Sell",
                description: "Making your first trade",
                emoji: "💰",
                content: `**To buy a stock on Ticko:**
1. Go to any stock page
2. Click "Buy" 
3. Enter how many shares (or dollar amount)
4. Confirm the trade

**To sell:**
Same process, but click "Sell" instead.

**What's a "position"?**
When you own shares of a stock, that's called having a "position" in that stock.

Start small. Even 1 share counts!`,
                ctaText: "Make your first trade",
                ctaLink: "/paper-trading",
            },
        ],
    },
    {
        id: "risk",
        title: "Risk & Strategy",
        description: "Don't lose your shirt",
        emoji: "🛡️",
        lessons: [
            {
                id: "diversification",
                title: "Don't Put All Eggs in One Basket",
                description: "Spread the risk",
                emoji: "🥚",
                content: `If you put all your money in one stock and it crashes, you lose everything.

**Diversification** = Owning multiple different stocks.

**Example:**
- ❌ Bad: 100% in Tesla
- ✅ Better: 20% each in Apple, Google, Tesla, Amazon, Microsoft

If one crashes, the others might hold up. Some people even buy "index funds" that own 500 stocks at once (like SPY).`,
                ctaText: "View SPY (S&P 500)",
                ctaLink: "/stock/SPY",
            },
            {
                id: "position-sizing",
                title: "Position Sizing",
                description: "How much to bet",
                emoji: "📏",
                content: `Never risk more than you can afford to lose.

**A simple rule:**
Don't put more than 5-10% of your portfolio in any single stock.

**Example with $10,000:**
- Max per stock: $500-$1,000
- You'd own 10-20 different stocks

This way, even if one stock goes to zero, you only lose 5-10% of your total.

Paper trading is the perfect place to practice this!`,
                ctaText: "Check your portfolio",
                ctaLink: "/paper-trading",
            },
        ],
    },
    {
        id: "community",
        title: "Competing & Community",
        description: "Trade with friends",
        emoji: "🏆",
        lessons: [
            {
                id: "leaderboard",
                title: "The Leaderboard",
                description: "See how you stack up",
                emoji: "🥇",
                content: `Every paper trader on Ticko is ranked by their performance.

**How it works:**
- Your portfolio value is tracked daily
- Rankings are updated based on % gains
- Top traders get recognized

**Why compete?**
- Motivation to learn and improve
- Prove your skills with a public track record
- Bragging rights 😎

Can you reach the top 10?`,
                ctaText: "View the Leaderboard",
                ctaLink: "/leaderboard",
            },
            {
                id: "sharing",
                title: "Sharing Your Trades",
                description: "Build your reputation",
                emoji: "📢",
                content: `Ticko is social! Share your trades and predictions.

**What you can do:**
- Post about stocks you're watching
- Share your buy/sell decisions
- Follow other traders and learn from them
- React and comment on posts

**Your track record is public.** This means no fake gurus - everyone can see your real (paper) performance.

The best way to learn is to watch what successful traders do.`,
                ctaText: "Explore the feed",
                ctaLink: "/discover",
            },
        ],
    },
];

// Helper to get module by ID
export function getModuleById(moduleId: string): Module | undefined {
    return LEARN_CONTENT.find((m) => m.id === moduleId);
}

// Helper to get lesson by IDs
export function getLessonById(
    moduleId: string,
    lessonId: string
): Lesson | undefined {
    const module = getModuleById(moduleId);
    return module?.lessons.find((l) => l.id === lessonId);
}

// Helper to get next lesson
export function getNextLesson(
    moduleId: string,
    lessonId: string
): { moduleId: string; lessonId: string } | null {
    const moduleIndex = LEARN_CONTENT.findIndex((m) => m.id === moduleId);
    if (moduleIndex === -1) return null;

    const module = LEARN_CONTENT[moduleIndex];
    const lessonIndex = module.lessons.findIndex((l) => l.id === lessonId);

    // If there's a next lesson in current module
    if (lessonIndex < module.lessons.length - 1) {
        return {
            moduleId: module.id,
            lessonId: module.lessons[lessonIndex + 1].id,
        };
    }

    // If there's a next module
    if (moduleIndex < LEARN_CONTENT.length - 1) {
        const nextModule = LEARN_CONTENT[moduleIndex + 1];
        return {
            moduleId: nextModule.id,
            lessonId: nextModule.lessons[0].id,
        };
    }

    return null; // Course complete
}

// Total lessons count
export const TOTAL_LESSONS = LEARN_CONTENT.reduce(
    (acc, m) => acc + m.lessons.length,
    0
);
