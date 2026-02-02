"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { RightPanel } from "@/components/layout/RightPanel";
import { FeedStream } from "@/components/feed/FeedStream";
import { OnboardingModal } from "@/components/onboarding/OnboardingModal";
import { DashboardAcademyCard } from "@/components/learn/DashboardAcademyCard";
import { ChallengesWidget } from "@/components/dashboard/ChallengesWidget";
import { APP_CONFIG } from "@/config/app";

export function DashboardView() {
    return (
        <div className="flex flex-col lg:flex-row min-h-screen w-full overflow-x-hidden relative">
            {/* Sidebar Background Extension - fills full height on desktop */}
            <div className="hidden lg:block fixed left-0 top-0 bottom-0 w-64 bg-white/[0.02] border-r border-white/10 -z-10" />
            <div className="hidden lg:block fixed right-0 top-0 bottom-0 w-80 bg-white/[0.02] border-l border-white/10 -z-10" />
            
            {/* Onboarding Modal - Shows once for new users */}
            <OnboardingModal />

            {/* Left Sidebar - Navigation & Trending - Handles its own responsive states */}
            <div className="shrink-0 lg:h-screen lg:sticky lg:top-0">
                <Sidebar />
            </div>

            {/* Main Content - Feed */}
            <main className="flex-1 min-w-0 lg:border-r border-white/10 pb-24 md:pb-0">


                {/* Feed Content */}
                <div className="p-4 md:p-6">
                    <DashboardAcademyCard />
                    <div className="lg:hidden mb-6">
                        <ChallengesWidget />
                    </div>
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

