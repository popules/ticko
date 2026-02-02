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
        <div className="flex min-h-screen overflow-x-hidden relative">
            {/* Sidebar Background Extensions - fills full page height on desktop */}
            <div className="hidden lg:block fixed left-0 top-0 bottom-0 w-64 bg-white/[0.02] border-r border-white/10 -z-10" />
            {showRightPanel && (
                <div className="hidden lg:block fixed right-0 top-0 bottom-0 w-80 bg-white/[0.02] border-l border-white/10 -z-10" />
            )}

            {/* Left Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <main className={`flex-1 min-w-0 lg:border-r border-white/10 pb-20 md:pb-0 ${className}`}>
                {children}
                {showFooter && <AppFooter />}
            </main>

            {/* Right Panel */}
            {showRightPanel && (
                <div className="hidden lg:block">
                    <RightPanel />
                </div>
            )}
        </div>
    );
}
