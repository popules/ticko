"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { RightPanel } from "@/components/layout/RightPanel";

export default function LearnLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col lg:flex-row min-h-screen w-full overflow-x-hidden">
            <div className="shrink-0 lg:h-screen lg:sticky lg:top-0">
                <Sidebar />
            </div>
            <main className="flex-1 min-w-0 border-r border-white/10 pb-24 md:pb-0">
                {children}
            </main>
            <RightPanel />
        </div>
    );
}
