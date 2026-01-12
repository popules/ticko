'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { useEffect } from 'react'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
            const apiHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com'

            if (apiKey) {
                posthog.init(apiKey, {
                    api_host: apiHost,
                    person_profiles: 'identified_only', // or 'always' to create profiles for anonymous users as well
                    capture_pageview: false // Disable automatic pageview capture, as we use Next.js router
                })
            }
        }
    }, [])

    return <PHProvider client={posthog}>{children}</PHProvider>
}
