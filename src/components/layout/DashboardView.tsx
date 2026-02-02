"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import { FeedStream } from "@/components/feed/FeedStream";
import { OnboardingModal } from "@/components/onboarding/OnboardingModal";
import { DashboardAcademyCard } from "@/components/learn/DashboardAcademyCard";
import { ChallengesWidget } from "@/components/dashboard/ChallengesWidget";

export function DashboardView() {
    return (
        <AppLayout showRightPanel={true}>
            {/* Onboarding Modal - Shows once for new users */}
            <OnboardingModal />

            {/* Feed Content */}
            <div className="p-4 md:p-6">
                <DashboardAcademyCard />
                <div className="lg:hidden mb-6">
                    <ChallengesWidget />
                </div>
                <FeedStream />
            </div>
        </AppLayout>
    );
}
