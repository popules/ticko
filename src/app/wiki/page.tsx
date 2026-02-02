import { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, Search, TrendingUp } from 'lucide-react';
import { WIKI_CONTENT, WikiTerm } from '@/lib/wiki-content';

export const metadata: Metadata = {
    title: 'Financial Wiki - Ticko Markets',
    description: 'Master the markets with the Ticko Financial Encyclopedia. Learn trading terms, strategies, and analysis concepts.',
};

export default function WikiIndexPage() {
    // Group terms by category
    const categories = {
        basics: WIKI_CONTENT.filter(t => t.category === 'basics'),
        analysis: WIKI_CONTENT.filter(t => t.category === 'analysis'),
        strategy: WIKI_CONTENT.filter(t => t.category === 'strategy'),
    };

    return (
        <div className="min-h-screen bg-[#020617] text-white">
            {/* Hero Section */}
            <div className="relative border-b border-white/10 overflow-hidden">
                <div className="absolute inset-0 bg-emerald-500/5" />
                <div className="max-w-4xl mx-auto px-4 py-20 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-sm mb-8">
                        <BookOpen className="w-4 h-4" />
                        Financial Encyclopedia
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
                        Talk the <span className="text-emerald-400">Talk</span>.
                    </h1>
                    <p className="text-xl text-white/50 max-w-2xl mx-auto mb-10">
                        The stock market has its own language. Master the terms, understand the concepts, and trade with confidence.
                    </p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-16">
                <div className="grid md:grid-cols-3 gap-12">

                    {/* Category Column */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-xl">🎓</span>
                            <h2 className="text-2xl font-bold">Basics</h2>
                        </div>
                        <p className="text-white/40 text-sm mb-6">Foundational concepts every investor must know.</p>
                        <div className="grid gap-3">
                            {categories.basics.map(term => (
                                <TermCard key={term.slug} term={term} />
                            ))}
                        </div>
                    </div>

                    {/* Category Column */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-xl">📊</span>
                            <h2 className="text-2xl font-bold">Analysis</h2>
                        </div>
                        <p className="text-white/40 text-sm mb-6">Metrics and tools to evaluate companies.</p>
                        <div className="grid gap-3">
                            {categories.analysis.map(term => (
                                <TermCard key={term.slug} term={term} />
                            ))}
                        </div>
                    </div>

                    {/* Category Column */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-xl">🚀</span>
                            <h2 className="text-2xl font-bold">Strategy</h2>
                        </div>
                        <p className="text-white/40 text-sm mb-6">Actionable ways to make (or lose) money.</p>
                        <div className="grid gap-3">
                            {categories.strategy.map(term => (
                                <TermCard key={term.slug} term={term} />
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

function TermCard({ term }: { term: WikiTerm }) {
    return (
        <Link
            href={`/wiki/${term.slug}`}
            className="block p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all group"
        >
            <div className="flex items-center gap-3 mb-2">
                <span className="text-xl">{term.emoji}</span>
                <h3 className="font-bold text-white group-hover:text-emerald-400 transition-colors">{term.title}</h3>
            </div>
            <p className="text-sm text-white/50 line-clamp-2">
                {term.description}
            </p>
        </Link>
    );
}
