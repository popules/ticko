import { ImageResponse } from 'next/og'

// Route segment config
export const runtime = 'edge'

// Image metadata
export const size = {
    width: 32,
    height: 32,
}
export const contentType = 'image/png'

// Image generation
export default function Icon() {
    return new ImageResponse(
        (
            // ImageResponse JSX element
            <div
                style={{
                    fontSize: 24,
                    background: 'transparent',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                }}
            >
                {/* Background Shield/Box */}
                <div
                    style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(135deg, #2DD4BF 0%, #0D9488 100%)',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                    }}
                />

                {/* The "T" Shape - Horizontal */}
                <div
                    style={{
                        position: 'absolute',
                        top: '20%',
                        width: '60%',
                        height: '25%',
                        background: 'white',
                        borderRadius: '2px',
                        opacity: 0.9,
                    }}
                />

                {/* The "T" Shape - Vertical */}
                <div
                    style={{
                        position: 'absolute',
                        top: '20%',
                        width: '25%',
                        height: '60%',
                        background: 'white',
                        borderRadius: '2px',
                        opacity: 0.9,
                    }}
                />
            </div>
        ),
        // ImageResponse options
        {
            // For convenience, we can re-use the exported icons size metadata
            // config to also set the ImageResponse's width and height.
            ...size,
        }
    )
}
