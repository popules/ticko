"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { RightPanel } from "@/components/layout/RightPanel";
import { FeedStream } from "@/components/feed/FeedStream";
import { OnboardingModal } from "@/components/onboarding/OnboardingModal";
import { APP_CONFIG } from "@/config/app";

export function DashboardView() {
    return (
        <div className="flex min-h-screen">
            {/* Onboarding Modal - Shows once for new users */}
            <OnboardingModal />

            {/* Left Sidebar - Navigation & Trending - Hidden on mobile */}
            <div className="hidden lg:block">
                <Sidebar />
            </div>

            {/* Main Content - Feed */}
            <main className="flex-1 lg:border-r border-white/10">
                {/* Header */}
                <header className="sticky top-0 md:top-0 z-10 backdrop-blur-xl bg-[#020617]/80 border-b border-white/10 px-4 md:px-6 py-3 md:py-4 mt-16 md:mt-0">
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

