"use client";

import { useAuth } from "@/providers/AuthProvider";
import { LandingPage } from "@/components/layout/LandingPage";
import { DashboardView } from "@/components/layout/DashboardView";

export default function HomePage() {
  const { user, isLoading } = useAuth();



  // If not logged in, show the Stocktwits-inspired landing page
  if (!user) {
    return <LandingPage />;
  }

  // If logged in, show the actual application dashboard
  return <DashboardView />;
}
