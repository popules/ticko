"use client";

import { AppLayout } from "@/components/layout/AppLayout";

export default function LearnLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AppLayout showRightPanel={true}>
            <div className="min-w-0 pb-24 md:pb-0">
                {children}
            </div>
        </AppLayout>
    );
}
