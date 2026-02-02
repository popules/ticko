"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { RightPanel } from "@/components/layout/RightPanel";
import { FeedStream } from "@/components/feed/FeedStream";
import { OnboardingModal } from "@/components/onboarding/OnboardingModal";
import { DashboardAcademyCard } from "@/components/learn/DashboardAcademyCard";
import { ChallengesWidget } from "@/components/dashboard/ChallengesWidget";

export function DashboardView() {
    return (
        <div className="flex flex-col lg:flex-row min-h-screen w-full overflow-x-hidden">
            {/* Onboarding Modal - Shows once for new users */}
            <OnboardingModal />

            {/* Left Sidebar */}
            <Sidebar />

            {/* Main Content - Feed */}
            <main className="flex-1 min-w-0 pb-24 md:pb-0">
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
            <RightPanel />
        </div>
    );
}
