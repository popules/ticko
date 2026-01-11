"use client";

import { useAuth } from "@/providers/AuthProvider";
import { LandingPage } from "@/components/layout/LandingPage";
import { DashboardView } from "@/components/layout/DashboardView";

export default function HomePage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  // If not logged in, show the Stocktwits-inspired landing page
  if (!user) {
    return <LandingPage />;
  }

  // If logged in, show the actual application dashboard
  return <DashboardView />;
}
