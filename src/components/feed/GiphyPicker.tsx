"use client";

import { useState, useCallback } from "react";
import { Search, X, Loader2, Image as ImageIcon } from "lucide-react";

interface GiphyPickerProps {
    onSelect: (gifUrl: string) => void;
    onClose: () => void;
}

interface GiphyGif {
    id: string;
    images: {
        fixed_height: {
            url: string;
            width: string;
            height: string;
        };
        original: {
            url: string;
        };
    };
    title: string;
}

const GIPHY_API_KEY = "GlVGYHkr3WSBnllca54iNt0yFbjz7L65"; // Public beta key

export function GiphyPicker({ onSelect, onClose }: GiphyPickerProps) {
    const [query, setQuery] = useState("");
    const [gifs, setGifs] = useState<GiphyGif[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const searchGifs = useCallback(async (searchQuery: string) => {
        if (!searchQuery.trim()) {
            // Load trending if no query
            setIsLoading(true);
            try {
                const res = await fetch(
                    `https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_API_KEY}&limit=12&rating=g`
                );
                const data = await res.json();
                setGifs(data.data);
            } catch (error) {
                console.error("Giphy error:", error);
            }
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setHasSearched(true);

        try {
            const res = await fetch(
                `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(
                    searchQuery
                )}&limit=12&rating=g`
            );
            const data = await res.json();
            setGifs(data.data);
        } catch (error) {
            console.error("Giphy error:", error);
        }
        setIsLoading(false);
    }, []);

    // Load trending on mount
    useState(() => {
        searchGifs("");
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        searchGifs(query);
    };

    return (
        <div className="bg-white/[0.06] backdrop-blur-xl rounded-2xl border border-white/10 p-4 w-full max-w-md">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-white/60" />
                    <span className="font-medium text-white">Lägg till GIF</span>
                </div>
                <button
                    onClick={onClose}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="mb-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search GIF..."
                        className="w-full bg-white/[0.06] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50 text-sm"
                    />
                </div>
            </form>

            {/* Grid */}
            {isLoading ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-white/50" />
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto scrollbar-hide">
                    {gifs.map((gif) => (
                        <button
                            key={gif.id}
                            onClick={() => onSelect(gif.images.fixed_height.url)}
                            className="aspect-square rounded-xl overflow-hidden hover:ring-2 hover:ring-emerald-500/50 transition-all"
                        >
                            <img
                                src={gif.images.fixed_height.url}
                                alt={gif.title}
                                className="w-full h-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}

            {/* Powered by Giphy */}
            <div className="mt-3 text-center">
                <span className="text-xs text-white/30">Powered by GIPHY</span>
            </div>
        </div>
    );
}
