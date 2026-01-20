"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { enUS } from "date-fns/locale";
import { Newspaper, ExternalLink, TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import Link from "next/link";

interface NewsItem {
    title: string;
    url: string;
    source: string;
    summary: string;
    publishedAt: string;
    image?: string;
    sentiment?: string;
}

interface NewsFeedProps {
    symbol: string;
}

export function NewsFeed({ symbol }: NewsFeedProps) {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/news/${symbol}`);
                const data = await res.json();
                setNews(data.news || []);
            } catch {
                setNews([]);
            }
            setIsLoading(false);
        };

        fetchNews();
    }, [symbol]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-white/40" />
            </div>
        );
    }

    if (news.length === 0) {
        return (
            <div className="text-center py-8 text-white/40">
                <Newspaper className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No news right now</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {news.map((item, index) => (
                <Link
                    key={index}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 bg-white/[0.04] hover:bg-white/[0.08] rounded-2xl border border-white/10 transition-all group"
                >
                    <div className="flex gap-4">
                        {item.image && (
                            <div className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-white/5">
                                <img
                                    src={item.image}
                                    alt=""
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                                <h4 className="text-sm font-semibold text-white leading-snug line-clamp-2 group-hover:text-emerald-400 transition-colors">
                                    {item.title}
                                </h4>
                                <ExternalLink className="w-4 h-4 text-white/20 flex-shrink-0 mt-0.5 group-hover:text-white/60 transition-colors" />
                            </div>
                            <p className="text-xs text-white/40 line-clamp-2 mb-2">
                                {item.summary}
                            </p>
                            <div className="flex items-center gap-3 text-xs">
                                <span className="text-white/30">{item.source}</span>
                                <span className="text-white/20">•</span>
                                <span className="text-white/30">
                                    {(() => {
                                        try {
                                            return formatDistanceToNow(new Date(item.publishedAt), {
                                                addSuffix: true,
                                                locale: enUS,
                                            });
                                        } catch (e) {
                                            return "Recently";
                                        }
                                    })()}
                                </span>
                                {item.sentiment && (
                                    <>
                                        <span className="text-white/20">•</span>
                                        <span
                                            className={`flex items-center gap-1 ${item.sentiment === "Bullish"
                                                ? "text-emerald-400"
                                                : item.sentiment === "Bearish"
                                                    ? "text-rose-400"
                                                    : "text-white/40"
                                                }`}
                                        >
                                            {item.sentiment === "Bullish" && <TrendingUp className="w-3 h-3" />}
                                            {item.sentiment === "Bearish" && <TrendingDown className="w-3 h-3" />}
                                            {item.sentiment}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
}
