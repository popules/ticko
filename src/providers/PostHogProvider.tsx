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
                capture_pageview: false, // We'll handle this manually if needed
                loaded: (posthog) => {
                    // PostHog is ready
                    setIsInitialized(true)
                }
            })
        } else if (!apiKey) {
            // No API key, just render children without PostHog
            setIsInitialized(true)
        } else {
            // Already loaded
            setIsInitialized(true)
        }
    }, [])

    // If PostHog is not configured, just render children without the provider
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
        return <>{children}</>
    }

    // Wait for initialization to avoid passing uninitialized client
    if (!isInitialized) {
        return <>{children}</>
    }

    return <PHProvider client={posthog}>{children}</PHProvider>
}
