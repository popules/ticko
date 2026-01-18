import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);

    // Get query params
    const ticker = searchParams.get('ticker') || 'AAPL';
    const returnPct = parseFloat(searchParams.get('return') || '0');
    const username = searchParams.get('username') || 'Anonym';
    const level = parseInt(searchParams.get('level') || '1');

    const isPositive = returnPct >= 0;
    const returnColor = isPositive ? '#34D399' : '#F87171';
    const returnSign = isPositive ? '+' : '';

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
                    background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
                    fontFamily: 'system-ui, sans-serif',
                }}
            >
                {/* Card Container */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: '60px 80px',
                        borderRadius: '32px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                >
                    {/* Ticker */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            marginBottom: '24px',
                        }}
                    >
                        <div
                            style={{
                                padding: '16px 24px',
                                borderRadius: '16px',
                                background: 'linear-gradient(135deg, #8B5CF6 0%, #D946EF 100%)',
                                color: 'white',
                                fontSize: '32px',
                                fontWeight: 'bold',
                            }}
                        >
                            ${ticker}
                        </div>
                    </div>

                    {/* Return Percentage */}
                    <div
                        style={{
                            fontSize: '96px',
                            fontWeight: 'bold',
                            color: returnColor,
                            lineHeight: 1,
                            marginBottom: '16px',
                        }}
                    >
                        {returnSign}{returnPct.toFixed(1)}%
                    </div>

                    {/* User Info */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            color: 'rgba(255, 255, 255, 0.6)',
                            fontSize: '24px',
                        }}
                    >
                        <span>@{username}</span>
                        <span style={{ color: '#8B5CF6' }}>•</span>
                        <span style={{ color: '#8B5CF6' }}>Level {level}</span>
                    </div>
                </div>

                {/* Branding */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginTop: '40px',
                        color: 'rgba(255, 255, 255, 0.4)',
                        fontSize: '24px',
                    }}
                >
                    <span>🎮</span>
                    <span>Ticko Paper Trading</span>
                </div>
            </div>
        ),
        {
            width: 1200,
            height: 630,
        },
    );
}
