import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);

    // Get query params
    const ticker = searchParams.get('ticker') || 'AAPL';
    const returnPct = parseFloat(searchParams.get('return') || '0');

    // User requested "I'm up +15% in the Ticko challenge"
    const isPositive = returnPct >= 0;
    const returnSign = isPositive ? '+' : '';
    const formattedReturn = `${returnSign}${returnPct.toFixed(1)}%`;

    // Theme colors: Ticko Green
    const primaryColor = '#10B981'; // Emerald 500
    const secondaryColor = '#059669'; // Emerald 600
    const bgColor = '#0f172a'; // Slate 900
    const textColor = '#ffffff';

    return new ImageResponse(
        (
            <div
                style={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: bgColor,
                    background: `radial-gradient(circle at 50% 100%, #10b98122 0%, #0f172a 50%)`,
                    fontFamily: 'system-ui, sans-serif',
                }}
            >
                {/* Card Container */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '60px',
                        width: '90%',
                        height: '80%',
                        borderRadius: '32px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(16, 185, 129, 0.2)', // Green subtle border
                        boxShadow: '0 20px 80px -20px rgba(16, 185, 129, 0.3)', // Green glow
                    }}
                >
                    {/* Header: Logo & Ticker */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            width: '100%',
                        }}
                    >
                        {/* Fake Logo (since we can't load external images easily in edge without fetch) */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div
                                style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '12px',
                                    background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontSize: '28px',
                                    fontWeight: 'bold',
                                }}
                            >
                                T
                            </div>
                            <span style={{ fontSize: '32px', fontWeight: 'bold', color: 'white' }}>Ticko</span>
                        </div>

                        {/* Ticker Badge */}
                        <div
                            style={{
                                padding: '12px 24px',
                                borderRadius: '100px',
                                background: 'rgba(255, 255, 255, 0.1)',
                                color: 'rgba(255, 255, 255, 0.8)',
                                fontSize: '24px',
                                fontWeight: 'bold',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                            }}
                        >
                            ${ticker}
                        </div>
                    </div>

                    {/* Main Content */}
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '20px',
                            textAlign: 'center',
                        }}
                    >
                        <div style={{ fontSize: '32px', color: 'rgba(255,255,255,0.7)' }}>
                            I'm up
                        </div>
                        <div
                            style={{
                                fontSize: '110px',
                                fontWeight: 900,
                                color: primaryColor,
                                lineHeight: '1',
                                textShadow: '0 0 40px rgba(16, 185, 129, 0.5)',
                            }}
                        >
                            {formattedReturn}
                        </div>
                        <div style={{ fontSize: '32px', color: 'rgba(255,255,255,0.7)' }}>
                            in the Ticko challenge
                        </div>
                    </div>

                    {/* Footer: User CTA */}
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '12px',
                        }}
                    >
                        <div
                            style={{
                                padding: '16px 40px',
                                borderRadius: '100px',
                                background: `linear-gradient(90deg, ${primaryColor}, ${secondaryColor})`,
                                color: 'white',
                                fontSize: '28px',
                                fontWeight: 'bold',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                            }}
                        >
                            <span>Can you beat me?</span>
                            <span>👉</span>
                        </div>
                        <div style={{ fontSize: '20px', color: 'rgba(255,255,255,0.5)', marginTop: '8px' }}>
                            tickomarkets.com
                        </div>
                    </div>
                </div>
            </div>
        ),
        {
            width: 1200,
            height: 630,
        },
    );
}
