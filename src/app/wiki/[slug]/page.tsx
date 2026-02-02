import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, BookOpen, TrendingUp, ArrowRight } from 'lucide-react';
import { getWikiTerm, getAllWikiSlugs, WIKI_CONTENT } from '@/lib/wiki-content';

interface WikiPageProps {
    params: Promise<{ slug: string }>;
}

// Generate static params for all wiki pages at build time
export async function generateStaticParams() {
    const slugs = getAllWikiSlugs();
    return slugs.map((slug) => ({
        slug: slug,
    }));
}

export async function generateMetadata({ params }: WikiPageProps): Promise<Metadata> {
    const { slug } = await params;
    const term = getWikiTerm(slug);

    if (!term) return { title: 'Term not found - Ticko Wiki' };

    return {
        title: `${term.title} - Financial Wiki | Ticko`,
        description: term.description,
        openGraph: {
            title: `${term.title} Explained - Ticko Financial Wiki`,
            description: term.description,
            type: 'article',
        },
        other: {
            // FAQ Schema / Article Schema
            "script:ld+json": JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Article",
                "headline": term.title,
                "description": term.description,
                "author": {
                    "@type": "Organization",
                    "name": "Ticko Markets"
                },
                "publisher": {
                    "@type": "Organization",
                    "name": "Ticko Markets",
                    "logo": {
                        "@type": "ImageObject",
                        "url": "https://tickomarkets.com/logo.png"
                    }
                }
            })
        }
    };
}

export default async function WikiPage({ params }: WikiPageProps) {
    const { slug } = await params;
    const term = getWikiTerm(slug);

    if (!term) {
        notFound();
    }

    // Find other terms in the same category
    const relatedTerms = WIKI_CONTENT
        .filter(t => t.category === term.category && t.slug !== term.slug)
        .slice(0, 3);

    return (
        <div className="min-h-screen bg-[#020617] text-white">
            <div className="max-w-4xl mx-auto px-4 py-12">
                {/* Breadcrumb / Back */}
                <div className="mb-8">
                    <Link
                        href="/wiki"
                        className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Financial Wiki
                    </Link>
                </div>

                {/* Header */}
                <div className="mb-12">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-4xl mb-6">
                        {term.emoji}
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-bold uppercase tracking-wider text-white/60">
                            {term.category}
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black mb-6">
                        {term.title}
                    </h1>
                    <p className="text-xl text-white/60 leading-relaxed max-w-2xl">
                        {term.description}
                    </p>
                </div>

                <div className="grid lg:grid-cols-[1fr,300px] gap-12">
                    {/* Main Content */}
                    <article className="prose prose-invert prose-lg prose-emerald max-w-none 
                        prose-h1:font-black prose-h1:text-3xl
                        prose-h2:text-2xl prose-h2:font-bold prose-h2:text-white prose-h2:mt-12
                        prose-p:text-white/70 prose-p:leading-relaxed
                        prose-a:text-emerald-400 prose-a:no-underline hover:prose-a:underline
                        prose-li:text-white/70">
                        <ReactMarkdown>
                            {term.content}
                        </ReactMarkdown>
                    </article>

                    {/* Sidebar / Related / CTA */}
                    <aside className="space-y-8">
                        {/* Practice Card */}
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 sticky top-24">
                            <div className="flex items-center gap-3 mb-4">
                                <TrendingUp className="w-5 h-5 text-emerald-400" />
                                <h3 className="font-bold text-white">Practice what you preach</h3>
                            </div>
                            <p className="text-sm text-white/60 mb-6">
                                Don't just read about {term.title}. Practice trading strictly risk-free with $10,000 on Ticko.
                            </p>

                            {term.relatedStocks.length > 0 && (
                                <div className="mb-6">
                                    <p className="text-xs font-bold text-white/40 uppercase mb-3">Popular Examples</p>
                                    <div className="flex flex-col gap-2">
                                        {term.relatedStocks.map(ticker => (
                                            <Link
                                                key={ticker}
                                                href={`/stock/${ticker}`}
                                                className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
                                            >
                                                <span className="font-bold font-mono">${ticker}</span>
                                                <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-emerald-400" />
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <Link
                                href="/register"
                                className="block w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-center transition-colors"
                            >
                                Start Paper Trading
                            </Link>
                        </div>

                        {/* Related Terms */}
                        {relatedTerms.length > 0 && (
                            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10">
                                <div className="flex items-center gap-3 mb-4">
                                    <BookOpen className="w-5 h-5 text-white/60" />
                                    <h3 className="font-bold text-white">Related Terms</h3>
                                </div>
                                <div className="space-y-3">
                                    {relatedTerms.map(t => (
                                        <Link
                                            key={t.slug}
                                            href={`/wiki/${t.slug}`}
                                            className="block p-3 rounded-xl hover:bg-white/5 transition-colors"
                                        >
                                            <p className="font-bold text-sm text-white mb-1">{t.title}</p>
                                            <p className="text-xs text-white/40 line-clamp-1">{t.description}</p>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </aside>
                </div>
            </div>
        </div>
    );
}
