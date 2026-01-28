"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { RightPanel } from "@/components/layout/RightPanel";
import { FeedStream } from "@/components/feed/FeedStream";
import { OnboardingModal } from "@/components/onboarding/OnboardingModal";
import { APP_CONFIG } from "@/config/app";

export function DashboardView() {
    return (
        <div className="flex flex-col lg:flex-row min-h-screen w-full overflow-x-hidden">
            {/* Onboarding Modal - Shows once for new users */}
            <OnboardingModal />

            {/* Left Sidebar - Navigation & Trending - Handles its own responsive states */}
            <div className="shrink-0 lg:h-screen lg:sticky lg:top-0">
                <Sidebar />
            </div>

            {/* Main Content - Feed */}
            <main className="flex-1 min-w-0 lg:border-r border-white/10 pb-24 md:pb-0">
                {/* Header */}
                <header className="sticky top-0 md:top-0 z-10 backdrop-blur-xl bg-[#020617]/80 border-b border-white/10 px-4 md:px-6 py-3 md:py-4 md:mt-0">
                    <h1 className="text-base md:text-lg font-extrabold text-white tracking-tight">
                        {APP_CONFIG.name} Feed
                    </h1>
                    <p className="text-[10px] md:text-xs text-white/50 font-medium">
                        {APP_CONFIG.tagline}
                    </p>
                </header>

                {/* Feed Content */}
                <div className="p-4 md:p-6">
                    <FeedStream />
                </div>
            </main>

            {/* Right Panel - Market Insights & Watchlist - Hidden on mobile */}
            <div className="hidden lg:block">
                <RightPanel />
            </div>
        </div>
    );
}

