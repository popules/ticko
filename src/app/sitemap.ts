import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

const BASE_URL = 'https://tickomarkets.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: BASE_URL,
            lastModified: new Date(),
            changeFrequency: 'hourly',
            priority: 1,
        },
        {
            url: `${BASE_URL}/discover`,
            lastModified: new Date(),
            changeFrequency: 'hourly',
            priority: 0.9,
        },
        {
            url: `${BASE_URL}/market`,
            lastModified: new Date(),
            changeFrequency: 'hourly',
            priority: 0.9,
        },
        {
            url: `${BASE_URL}/leaderboard`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        },
        {
            url: `${BASE_URL}/about`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${BASE_URL}/contact`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${BASE_URL}/privacy`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.3,
        },
        {
            url: `${BASE_URL}/terms`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.3,
        },
    ];

    // S&P 500 + Swedish/Nordic tickers (always indexed for programmatic SEO)
    const popularTickers = [
        // ═══════════════════════════════════════════════════════════════
        // SWEDISH / NORDIC STOCKS
        // ═══════════════════════════════════════════════════════════════
        'VOLV-B', 'ERIC-B', 'ASSA-B', 'SAND', 'ATCO-A', 'SEB-A', 'SWED-A', 'HM-B',
        'AZN', 'INVE-B', 'ESSITY-B', 'TELIA', 'KINV-B', 'SCA-B', 'SKF-B', 'ABB',
        'NDA-SE', 'HEXA-B', 'ELUX-B', 'BOL', 'SINCH', 'EVO', 'NIBE-B', 'ALFA',
        'SSAB-A', 'SSAB-B', 'SAAB-B', 'AXFO', 'BALD-B', 'CAST', 'CLAS-B',
        'ELUX-B', 'FABG', 'GETI-B', 'HUSQ-B', 'LATO-B', 'LUND-B', 'LOOMIS',
        'MTRS', 'NOBI', 'PEAB-B', 'SECT-B', 'SECU-B', 'STOR-B', 'SWEC-B',
        'TEL2-B', 'THULE', 'TREL-B', 'WALL-B', 'WIHL',

        // ═══════════════════════════════════════════════════════════════
        // S&P 500 - INFORMATION TECHNOLOGY
        // ═══════════════════════════════════════════════════════════════
        'AAPL', 'MSFT', 'NVDA', 'AVGO', 'ORCL', 'CRM', 'ADBE', 'AMD', 'CSCO',
        'ACN', 'IBM', 'INTC', 'INTU', 'QCOM', 'TXN', 'AMAT', 'NOW', 'ADI',
        'LRCX', 'MU', 'KLAC', 'SNPS', 'CDNS', 'PANW', 'CRWD', 'FTNT', 'MSI',
        'APH', 'MCHP', 'TEL', 'NXPI', 'HPQ', 'KEYS', 'ON', 'MPWR', 'CTSH',
        'IT', 'ANSS', 'CDW', 'TYL', 'ZBRA', 'FSLR', 'SWKS', 'TRMB', 'PTC',
        'AKAM', 'JNPR', 'GEN', 'FFIV', 'NTAP', 'WDC', 'EPAM', 'QRVO', 'ENPH',

        // ═══════════════════════════════════════════════════════════════
        // S&P 500 - COMMUNICATION SERVICES
        // ═══════════════════════════════════════════════════════════════
        'GOOGL', 'GOOG', 'META', 'NFLX', 'DIS', 'CMCSA', 'VZ', 'T', 'TMUS',
        'CHTR', 'EA', 'WBD', 'OMC', 'TTWO', 'LYV', 'MTCH', 'IPG', 'PARA',
        'NWSA', 'NWS', 'FOX', 'FOXA',

        // ═══════════════════════════════════════════════════════════════
        // S&P 500 - CONSUMER DISCRETIONARY
        // ═══════════════════════════════════════════════════════════════
        'AMZN', 'TSLA', 'HD', 'MCD', 'NKE', 'LOW', 'SBUX', 'TJX', 'BKNG',
        'ORLY', 'CMG', 'MAR', 'AZO', 'HLT', 'GM', 'ROST', 'F', 'DHI',
        'YUM', 'LULU', 'LEN', 'EBAY', 'GPC', 'TSCO', 'BBY', 'ULTA', 'DRI',
        'APTV', 'PHM', 'DECK', 'GRMN', 'EXPE', 'NVR', 'POOL', 'CCL', 'RCL',
        'LVS', 'MGM', 'WYNN', 'CZR', 'BWA', 'TPR', 'HAS', 'WHR', 'NCLH',
        'MHK', 'RL',

        // ═══════════════════════════════════════════════════════════════
        // S&P 500 - CONSUMER STAPLES
        // ═══════════════════════════════════════════════════════════════
        'PG', 'PEP', 'KO', 'COST', 'WMT', 'PM', 'MO', 'MDLZ', 'CL', 'TGT',
        'KMB', 'STZ', 'GIS', 'ADM', 'SYY', 'KHC', 'HSY', 'MKC', 'K', 'CHD',
        'CAG', 'CLX', 'TSN', 'HRL', 'SJM', 'CPB', 'TAP', 'BG', 'LW', 'KR',
        'WBA', 'DG', 'DLTR', 'EL',

        // ═══════════════════════════════════════════════════════════════
        // S&P 500 - HEALTH CARE
        // ═══════════════════════════════════════════════════════════════
        'UNH', 'JNJ', 'LLY', 'MRK', 'ABBV', 'TMO', 'ABT', 'PFE', 'DHR', 'BMY',
        'AMGN', 'ISRG', 'ELV', 'MDT', 'GILD', 'CVS', 'VRTX', 'SYK', 'REGN',
        'ZTS', 'BSX', 'CI', 'BDX', 'HUM', 'MCK', 'HCA', 'EW', 'MRNA', 'IDXX',
        'IQV', 'DXCM', 'A', 'CAH', 'MTD', 'RMD', 'BAX', 'GEHC', 'BIIB', 'WST',
        'ZBH', 'HOLX', 'ALGN', 'COO', 'TECH', 'MOH', 'CNC', 'VTRS', 'LH',
        'DGX', 'CRL', 'XRAY', 'DVA', 'CTLT', 'INCY', 'HSIC',

        // ═══════════════════════════════════════════════════════════════
        // S&P 500 - FINANCIALS
        // ═══════════════════════════════════════════════════════════════
        'JPM', 'V', 'MA', 'BAC', 'WFC', 'GS', 'MS', 'BLK', 'SPGI', 'C',
        'AXP', 'SCHW', 'CB', 'MMC', 'PGR', 'AON', 'CME', 'ICE', 'USB', 'PNC',
        'TFC', 'MCO', 'AJG', 'MET', 'AFL', 'AIG', 'MSCI', 'COF', 'BK', 'PRU',
        'TRV', 'ALL', 'AMP', 'DFS', 'FIS', 'FITB', 'STT', 'TROW', 'NTRS',
        'HBAN', 'RJF', 'MTB', 'SYF', 'CFG', 'WRB', 'KEY', 'CINF', 'BRO',
        'RF', 'L', 'FDS', 'NDAQ', 'EG', 'RE', 'CBOE', 'GL', 'IVZ', 'AIZ',
        'BEN', 'MKTX', 'ZION', 'LNC', 'CMA',

        // ═══════════════════════════════════════════════════════════════
        // S&P 500 - INDUSTRIALS
        // ═══════════════════════════════════════════════════════════════
        'CAT', 'UNP', 'RTX', 'HON', 'BA', 'DE', 'UPS', 'LMT', 'GE', 'ADP',
        'ETN', 'ITW', 'WM', 'EMR', 'FDX', 'NOC', 'GD', 'TT', 'CSX', 'NSC',
        'JCI', 'PH', 'CTAS', 'PCAR', 'CARR', 'CPRT', 'FAST', 'ODFL', 'AME',
        'VRSK', 'RSG', 'OTIS', 'LHX', 'PWR', 'CMI', 'IR', 'PAYX', 'EFX',
        'GWW', 'ROK', 'XYL', 'DOV', 'HUBB', 'WAB', 'DAL', 'UAL', 'LUV',
        'SWK', 'EXPD', 'TXT', 'JBHT', 'IEX', 'LDOS', 'BR', 'J', 'PNR',
        'FTV', 'HWM', 'NDSN', 'MAS', 'ALLE', 'CHRW', 'GNRC', 'SNA', 'RHI',
        'NLOK', 'HII', 'AAL', 'AOS', 'ALLE', 'PAYC', 'ROL',

        // ═══════════════════════════════════════════════════════════════
        // S&P 500 - ENERGY
        // ═══════════════════════════════════════════════════════════════
        'XOM', 'CVX', 'COP', 'SLB', 'EOG', 'MPC', 'PXD', 'PSX', 'VLO', 'OXY',
        'WMB', 'HES', 'KMI', 'HAL', 'DVN', 'BKR', 'FANG', 'TRGP', 'OKE',
        'CTRA', 'MRO', 'APA',

        // ═══════════════════════════════════════════════════════════════
        // S&P 500 - UTILITIES
        // ═══════════════════════════════════════════════════════════════
        'NEE', 'DUK', 'SO', 'D', 'AEP', 'SRE', 'EXC', 'XEL', 'PCG', 'ED',
        'WEC', 'AWK', 'EIX', 'ES', 'DTE', 'PPL', 'ETR', 'FE', 'AEE', 'CMS',
        'CEG', 'CNP', 'EVRG', 'ATO', 'NI', 'PNW', 'NRG', 'LNT',

        // ═══════════════════════════════════════════════════════════════
        // S&P 500 - MATERIALS
        // ═══════════════════════════════════════════════════════════════
        'LIN', 'APD', 'SHW', 'FCX', 'ECL', 'NUE', 'NEM', 'DD', 'DOW', 'CTVA',
        'PPG', 'VMC', 'MLM', 'IFF', 'ALB', 'LYB', 'STLD', 'BALL', 'CF',
        'AVY', 'FMC', 'IP', 'CE', 'MOS', 'PKG', 'EMN', 'SEE', 'WRK', 'AMCR',

        // ═══════════════════════════════════════════════════════════════
        // S&P 500 - REAL ESTATE
        // ═══════════════════════════════════════════════════════════════
        'PLD', 'AMT', 'EQIX', 'CCI', 'PSA', 'O', 'WELL', 'DLR', 'SPG', 'VICI',
        'AVB', 'EQR', 'SBAC', 'WY', 'ARE', 'EXR', 'MAA', 'VTR', 'IRM', 'PEAK',
        'ESS', 'UDR', 'KIM', 'HST', 'REG', 'CPT', 'BXP', 'INVH', 'FRT', 'CBRE',

        // ═══════════════════════════════════════════════════════════════
        // BONUS - BERKSHIRE & POPULAR ETFS (for search traffic)
        // ═══════════════════════════════════════════════════════════════
        'BRK-A', 'BRK-B', 'PYPL', 'SQ', 'COIN', 'HOOD', 'SOFI', 'PLTR', 'SNOW',
        'DDOG', 'ZS', 'NET', 'MDB', 'U', 'RBLX', 'ABNB', 'DASH', 'RIVN', 'LCID',
    ];

    // Dynamic stock pages - fetch tickers from posts + popular baseline
    let stockPages: MetadataRoute.Sitemap = [];

    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        let dbTickers: string[] = [];

        if (supabaseUrl && supabaseKey) {
            const supabase = createClient(supabaseUrl, supabaseKey);

            // Get unique tickers from posts (most discussed)
            const { data: posts } = await supabase
                .from('posts')
                .select('ticker_symbol')
                .not('ticker_symbol', 'is', null)
                .order('created_at', { ascending: false })
                .limit(500);

            if (posts) {
                dbTickers = posts.map(p => p.ticker_symbol).filter(Boolean);
            }
        }

        // Merge popular + DB tickers, dedupe
        const allTickers = [...new Set([...popularTickers, ...dbTickers])];

        stockPages = allTickers.map(ticker => ({
            url: `${BASE_URL}/stock/${ticker}`,
            lastModified: new Date(),
            changeFrequency: 'hourly' as const,
            priority: 0.8,
        }));
    } catch (error) {
        console.error('Sitemap: Failed to fetch stock pages:', error);

        // Fallback to just popular tickers
        stockPages = popularTickers.map(ticker => ({
            url: `${BASE_URL}/stock/${ticker}`,
            lastModified: new Date(),
            changeFrequency: 'hourly' as const,
            priority: 0.8,
        }));
    }

    return [...staticPages, ...stockPages];
}
