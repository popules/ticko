import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);

    // Get parameters
    const ticker = searchParams.get('ticker') || 'AAPL';
    const name = searchParams.get('name') || 'Apple Inc.';
    const price = searchParams.get('price') || '0.00';
    const change = searchParams.get('change') || '0.00';
    const sentiment = searchParams.get('sentiment') || 'neutral'; // bull, bear, neutral

    const changeNum = parseFloat(change);
    const isPositive = changeNum >= 0;

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
                    backgroundColor: '#020617',
                    backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(16, 185, 129, 0.15) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
                }}
            >
                {/* Logo */}
                <div
                    style={{
                        position: 'absolute',
                        top: 40,
                        left: 40,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                    }}
                >
                    <div
                        style={{
                            width: 48,
                            height: 48,
                            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                            borderRadius: 12,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 28,
                            fontWeight: 800,
                            color: 'white',
                        }}
                    >
                        T
                    </div>
                    <span style={{ fontSize: 32, fontWeight: 700, color: 'white' }}>ticko</span>
                </div>

                {/* Ticker symbol */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 16,
                        marginBottom: 16,
                    }}
                >
                    <span style={{ fontSize: 96, fontWeight: 900, color: 'white', letterSpacing: -2 }}>
                        ${ticker}
                    </span>
                    {sentiment !== 'neutral' && (
                        <div
                            style={{
                                padding: '12px 24px',
                                borderRadius: 20,
                                background: sentiment === 'bull' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)',
                                border: `2px solid ${sentiment === 'bull' ? '#10B981' : '#F43F5E'}`,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                            }}
                        >
                            <span style={{ fontSize: 24, color: sentiment === 'bull' ? '#10B981' : '#F43F5E', fontWeight: 700 }}>
                                {sentiment === 'bull' ? '📈 BULL' : '📉 BEAR'}
                            </span>
                        </div>
                    )}
                </div>

                {/* Company name */}
                <span style={{ fontSize: 32, color: 'rgba(255,255,255,0.6)', marginBottom: 32 }}>
                    {name}
                </span>

                {/* Price */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 24 }}>
                    <span style={{ fontSize: 72, fontWeight: 800, color: 'white' }}>
                        ${price}
                    </span>
                    <span
                        style={{
                            fontSize: 36,
                            fontWeight: 700,
                            color: isPositive ? '#10B981' : '#F43F5E',
                        }}
                    >
                        {isPositive ? '+' : ''}{change}%
                    </span>
                </div>

                {/* Footer */}
                <div
                    style={{
                        position: 'absolute',
                        bottom: 40,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        color: 'rgba(255,255,255,0.4)',
                        fontSize: 20,
                    }}
                >
                    <span>Se diskussionen på</span>
                    <span style={{ color: '#10B981', fontWeight: 600 }}>ticko.se/aktie/{ticker}</span>
                </div>
            </div>
        ),
        {
            width: 1200,
            height: 630,
        }
    );
}
