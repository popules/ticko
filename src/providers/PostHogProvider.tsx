'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider, usePostHog } from 'posthog-js/react'
import { useEffect, useState } from 'react'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
    const [isInitialized, setIsInitialized] = useState(false)

    useEffect(() => {
        const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
        const apiHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com'

        if (apiKey && !posthog.__loaded) {
            posthog.init(apiKey, {
                api_host: apiHost,
                person_profiles: 'identified_only',
                capture_pageview: false
            })
        }
    }, [])

    // If PostHog is configuration is missing, just render children
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
        return <>{children}</>
    }

    return <PHProvider client={posthog}>{children}</PHProvider>
}
