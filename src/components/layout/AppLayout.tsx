"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { RightPanel } from "@/components/layout/RightPanel";
import { AppFooter } from "@/components/layout/AppFooter";

interface AppLayoutProps {
    children: React.ReactNode;
    showRightPanel?: boolean;
    showFooter?: boolean;
    className?: string;
}

/**
 * Standard app layout with sidebars that extend full height.
 * Use this for all authenticated pages to ensure consistent sidebar behavior.
 */
export function AppLayout({
    children,
    showRightPanel = true,
    showFooter = false,
    className = ""
}: AppLayoutProps) {
    return (
        <div className="flex h-screen overflow-hidden bg-[#020617]">
            {/* Left Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <main className={`flex-1 min-w-0 overflow-y-auto lg:border-r border-white/10 pb-20 md:pb-0 scrollbar-hide ${className}`}>
                {children}
                {showFooter && <AppFooter />}
            </main>

            {/* Right Panel */}
            {showRightPanel && (
                <RightPanel />
            )}
        </div>
    );
}
