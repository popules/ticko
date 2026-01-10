import { Sidebar } from "@/components/layout/Sidebar";
import { RightPanel } from "@/components/layout/RightPanel";
import { FeedStream } from "@/components/feed/FeedStream";
import { APP_CONFIG } from "@/config/app";

export default function HomePage() {
  return (
    <div className="flex min-h-screen">
      {/* Left Sidebar - Navigation & Trending */}
      <Sidebar />

      {/* Main Content - Feed */}
      <main className="flex-1 border-r border-white/10">
        {/* Header */}
        <header className="sticky top-0 z-10 backdrop-blur-xl bg-[#020617]/80 border-b border-white/10 px-6 py-5">
          <h1 className="text-xl font-bold text-white">
            {APP_CONFIG.name} Feed
          </h1>
          <p className="text-sm text-white/50">
            {APP_CONFIG.tagline}
          </p>
        </header>

        {/* Feed Content */}
        <div className="p-6">
          <FeedStream />
        </div>
      </main>

      {/* Right Panel - Market Insights & Watchlist */}
      <RightPanel />
    </div>
  );
}
