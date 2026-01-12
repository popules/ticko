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
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'transparent',
                }}
            >
                <svg
                    width="32"
                    height="32"
                    viewBox="0 0 40 40"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    {/* Vertical Bar */}
                    <rect
                        x="14"
                        y="8"
                        width="12"
                        height="24"
                        rx="4"
                        fill="#2DD4BF"
                        style={{ fillOpacity: 0.8 }}
                        stroke="white"
                        strokeOpacity="0.3"
                        strokeWidth="0.5"
                    />

                    {/* Horizontal Bar (Overlapping) - using a slightly darker mint for depth */}
                    <rect
                        x="8"
                        y="8"
                        width="24"
                        height="11"
                        rx="4"
                        fill="#0D9488"
                        style={{ fillOpacity: 0.7 }}
                        stroke="white"
                        strokeOpacity="0.3"
                        strokeWidth="0.5"
                    />

                    {/* Intersection highlight - matching the overlapping feel of the logo */}
                    <rect
                        x="14"
                        y="8"
                        width="12"
                        height="11"
                        rx="4"
                        fill="#5EEAD4"
                        style={{ fillOpacity: 0.5 }}
                    />
                </svg>
            </div>
        ),
        {
            ...size,
        }
    )
}
