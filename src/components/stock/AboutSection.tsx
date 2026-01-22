"use client";

import { useState, useEffect } from "react";
import { Globe, Building2, MapPin, Users, Briefcase, Factory, ChevronDown, ChevronUp } from "lucide-react";
import { StockProfile } from "@/lib/stocks-api";

interface AboutSectionProps {
    ticker: string;
}

export function AboutSection({ ticker }: AboutSectionProps) {
    const [profile, setProfile] = useState<StockProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        async function fetchProfile() {
            try {
                const response = await fetch(`/api/stock/${ticker}/profile`);
                if (response.ok) {
                    const data = await response.json();
                    setProfile(data);
                }
            } catch (error) {
                console.error("Failed to fetch profile:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchProfile();
    }, [ticker]);

    if (loading) {
        return (
            <div className="space-y-4 animate-pulse">
                <div className="bg-white/[0.04] rounded-2xl p-6 border border-white/10">
                    <div className="h-4 bg-white/10 rounded w-1/4 mb-4"></div>
                    <div className="space-y-2">
                        <div className="h-3 bg-white/10 rounded w-full"></div>
                        <div className="h-3 bg-white/10 rounded w-full"></div>
                        <div className="h-3 bg-white/10 rounded w-3/4"></div>
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-white/[0.04] rounded-xl p-4 border border-white/10">
                            <div className="h-3 bg-white/10 rounded w-1/2 mb-2"></div>
                            <div className="h-4 bg-white/10 rounded w-3/4"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="bg-white/[0.04] rounded-2xl p-8 border border-white/10 text-center">
                <Building2 className="w-12 h-12 text-white/20 mx-auto mb-3" />
                <p className="text-white/40">Company information not available for ${ticker}</p>
            </div>
        );
    }

    const description = profile.description || "";
    const isLongDescription = description.length > 400;
    const displayDescription = expanded || !isLongDescription
        ? description
        : description.slice(0, 400) + "...";

    const infoItems = [
        { icon: Briefcase, label: "Sector", value: profile.sector },
        { icon: Factory, label: "Industry", value: profile.industry },
        { icon: MapPin, label: "Location", value: profile.city && profile.country ? `${profile.city}, ${profile.country}` : profile.country },
        { icon: Users, label: "Employees", value: profile.employees?.toLocaleString() },
        { icon: Globe, label: "Website", value: profile.website, isLink: true },
    ].filter(item => item.value);

    return (
        <div className="space-y-6">
            {/* Company Description */}
            {description && (
                <div className="bg-white/[0.04] backdrop-blur-xl rounded-2xl p-5 md:p-6 border border-white/10">
                    <h3 className="text-sm font-bold text-white/40 uppercase tracking-widest mb-4">
                        About
                    </h3>
                    <p className="text-white/70 text-sm md:text-base leading-relaxed">
                        {displayDescription}
                    </p>
                    {isLongDescription && (
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="flex items-center gap-1 mt-3 text-emerald-400 text-sm font-medium hover:text-emerald-300 transition-colors"
                        >
                            {expanded ? (
                                <>
                                    Show less <ChevronUp className="w-4 h-4" />
                                </>
                            ) : (
                                <>
                                    Read more <ChevronDown className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    )}
                </div>
            )}

            {/* Info Grid */}
            {infoItems.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {infoItems.map((item, index) => (
                        <div
                            key={index}
                            className="bg-white/[0.04] backdrop-blur-xl rounded-xl p-4 border border-white/10"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <item.icon className="w-4 h-4 text-white/40" />
                                <span className="text-xs text-white/40">{item.label}</span>
                            </div>
                            {item.isLink ? (
                                <a
                                    href={item.value}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors truncate block"
                                >
                                    {item.value?.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
                                </a>
                            ) : (
                                <p className="text-sm font-medium text-white truncate">
                                    {item.value}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
