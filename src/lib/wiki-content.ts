export interface WikiTerm {
    slug: string;
    title: string;
    description: string; // For meta description (short)
    emoji: string;
    content: string; // Markdown content
    relatedStocks: string[]; // Tickers to link to (e.g. ['TSLA', 'GME'])
    category: 'basics' | 'analysis' | 'strategy' | 'advanced';
}

export const WIKI_CONTENT: WikiTerm[] = [
    {
        slug: 'short-selling',
        title: 'Short Selling',
        description: 'Short selling is a trading strategy used to profit when a stock price falls. Learn how to short sell risk-free on Ticko.',
        emoji: '📉',
        category: 'strategy',
        relatedStocks: ['TSLA', 'GME', 'NVDA'],
        content: `
# What is Short Selling?

Short selling (or "going short") is a way to profit when you think a stock's price will go **down**.

## How it works
1. **Borrow:** You borrow shares of a stock (e.g., Tesla) from a broker.
2. **Sell:** You immediately sell them at the current high price (e.g., $200).
3. **Wait:** You wait for the price to drop.
4. **Buy Back:** You buy the shares back at the lower price (e.g., $150).
5. **Return:** You return the shares to the broker.
6. **Profit:** You keep the difference ($50).

## The Risk
If the price goes **up** instead of down, you still have to buy the shares back to return them. Since a stock price can theoretically go up infinitely, your potential loss is infinite.

## Practice Short Selling Risk-Free
Short selling is risky for beginners. That's why Ticko allows you to **paper trade** short positions with virtual money.

*   **Test your bearish thesis:** Think [Tesla](/stock/TSLA) is overvalued? Short it on Ticko.
*   **Hedge your portfolio:** Learn how pros protect their gains.
*   **Zero Risk:** If you're wrong, you only lose virtual currency.
        `
    },
    {
        slug: 'pe-ratio',
        title: 'P/E Ratio (Price-to-Earnings)',
        description: 'The P/E Ratio measures a company\'s stock price relative to its earnings. Is the stock cheap or expensive? Find out here.',
        emoji: '⚖️',
        category: 'analysis',
        relatedStocks: ['AAPL', 'MSFT', 'AMZN'],
        content: `
# P/E Ratio Explained

The **Price-to-Earnings (P/E) Ratio** is the most common metric used to value a stock. It tells you how much investors are willing to pay for every $1 of earnings the company generates.

## Formula
$$ P/E = \\frac{\\text{Share Price}}{\\text{Earnings Per Share (EPS)}} $$

## What does it mean?
*   **High P/E (>30):** Investors expect high growth in the future. Tech stocks like [Nvidia](/stock/NVDA) often have high P/E ratios.
*   **Low P/E (<15):** The stock might be undervalued ("cheap") or the company is struggling. Value stocks like banks or energy companies often have lower P/E ratios.

## Example
*   **Company A:** Trades at $100 and earns $5/year. P/E = 20.
*   **Company B:** Trades at $20 and earns $2/year. P/E = 10.

Company B is "cheaper" relative to its profits.

## View P/E Ratios on Ticko
Every stock page on Ticko shows the live P/E ratio.
1. Search for a stock like [Apple](/stock/AAPL).
2. Check the "Stats" card.
3. Compare it to competitors.
        `
    },
    {
        slug: 'market-cap',
        title: 'Market Capitalization',
        description: 'Market Cap is the total value of a company\'s shares. Learn large-cap vs small-cap and how it affects volatility.',
        emoji: '💰',
        category: 'basics',
        relatedStocks: ['AAPL', 'MSFT', 'GOOGL'],
        content: `
# What is Market Cap?

**Market Capitalization** (Market Cap) is the total dollar market value of a company's outstanding shares. It tells you how much the company is worth.

## Formula
$$ \\text{Market Cap} = \\text{Share Price} \\times \\text{Total Number of Shares} $$

## Categories
*   **Mega-Cap ($200B+):** The giants. [Apple](/stock/AAPL), [Microsoft](/stock/MSFT). Very stable, safer.
*   **Large-Cap ($10B - $200B):** Established industry leaders.
*   **Mid-Cap ($2B - $10B):** Established but with room to grow.
*   **Small-Cap ($300M - $2B):** Higher risk, potential for massive growth (and massive losses).

## Why does it matter?
Stock price tends to be misleading. A stock priced at $10 can be "bigger" than a stock priced at $1,000 if the $10 company has way more shares. Market Cap lets you compare apples to apples.
        `
    },
    {
        slug: 'volatility',
        title: 'Volatility (Beta)',
        description: 'Volatility measures how much a stock price swings up and down. High volatility means higher risk but higher potential reward.',
        emoji: '🎢',
        category: 'analysis',
        relatedStocks: ['TSLA', 'COIN', 'MSTR'],
        content: `
# Understanding Volatility

**Volatility** refers to the speed and magnitude of price changes.

*   **High Volatility:** Prices swing wildly (e.g., +/- 5% in a day). Great for traders, scary for retirees. Crypto stocks like [Coinbase](/stock/COIN) are often volatile.
*   **Low Volatility:** Prices move slowly and steadily. Utility companies and big banks are often less volatile.

## Beta
A common measure of volatility is **Beta**.
*   **Beta = 1.0:** Moves exactly with the market (S&P 500).
*   **Beta > 1.0:** More volatile than the market (e.g., Tesla).
*   **Beta < 1.0:** Less volatile than the market (e.g., Coca-Cola).

## Trading Volatility on Ticko
Traders love volatility because price movement = opportunity.
Check the "Top Movers" on the Ticko [Markets](/market) page to find the most volatile stocks today.
        `
    },
    {
        slug: 'dividends',
        title: 'Dividends',
        description: 'Dividends are cash payments companies send to shareholders. Learn how to build a passive income portfolio.',
        emoji: '💸',
        category: 'basics',
        relatedStocks: ['KO', 'JNJ', 'O'],
        content: `
# What are Dividends?

A **dividend** is a distribution of corporate profits to eligible shareholders. It's basically the company paying you just for owning the stock.

## Why do companies pay dividends?
*   To reward loyal shareholders.
*   To show financial strength (they have extra cash).
*   Because they are mature and don't need to reinvest *every* dollar into growth.

## Dividend Yield
This tells you how much cash you get back relative to the stock price.
$$ \\text{Yield} = \\frac{\\text{Annual Dividend}}{\\text{Stock Price}} $$

If a stock is $100 and pays $5/year, the yield is 5%.

## Paper Trading Dividend Stocks
On Ticko, you can build a "Dividend Portfolio" to track how these safe, income-generating stocks perform compared to high-growth tech stocks. Search for "Dividend Aristocrats" like [Coca-Cola](/stock/KO).
        `
    },
    {
        slug: 'bull-market',
        title: 'Bull Market',
        description: 'A Bull Market is when prices are rising and optimism is high. Learn how to trade during a bull run.',
        emoji: '🐂',
        category: 'basics',
        relatedStocks: ['SPY', 'QQQ', 'NVDA'],
        content: `
# What is a Bull Market?

A **Bull Market** is a period where stock prices are rising or are expected to rise. The term "bull" comes from the way the animal attacks—by thrusting its horns **up** into the air.

## Characteristics
*   Prices rise by 20% or more after a drop.
*   Investors are optimistic ("Bullish").
*   Economy is generally strong.
*   Unemployment is low.

## What to do?
"The trend is your friend." In a bull market, the most common strategy is to buy and hold, or "buy the dip" (buying when price drops slightly, expecting it to go back up).

## Are you Bullish?
Use **Ticko AI** on any stock page to check the "Community Sentiment". If 80% of users are bullish, you know the crowd expects the price to go up.
        `
    },
    {
        slug: 'bear-market',
        title: 'Bear Market',
        description: 'A Bear Market is when prices are falling and pessimism is high. Learn strategies to survive and profit.',
        emoji: '🐻',
        category: 'basics',
        relatedStocks: ['SPY', 'SQQQ'],
        content: `
# What is a Bear Market?

A **Bear Market** is when a market experiences prolonged price declines. It typically describes a condition in which securities prices fall 20% or more from recent highs. The term "bear" comes from the way the animal attacks—swiping its paws **down**.

## Characteristics
*   Prices drop >20%.
*   Investor pessimism ("Bearish").
*   Economic recession or slowdown.

## How to make money?
While most lose money, skilled traders can profit by:
1.  **Short Selling:** Betting against stocks.
2.  **Buying Puts:** Options strategies that profit from drops.
3.  **Inverse ETFs:** Funds that go up when the market goes down.

## Practice Bear Strategies
Don't risk your savings trying to short the market for the first time. Use your $10,000 virtual portfolio on Ticko to practice navigating a downturn.
        `
    }
];

export function getWikiTerm(slug: string): WikiTerm | undefined {
    return WIKI_CONTENT.find(term => term.slug === slug);
}

export function getRelatedTerms(category: string): WikiTerm[] {
    return WIKI_CONTENT.filter(term => term.category === category);
}

export function getAllWikiSlugs(): string[] {
    return WIKI_CONTENT.map(term => term.slug);
}
