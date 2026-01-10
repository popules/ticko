"use client";

import { useState } from "react";
import { Wallet, Plus } from "lucide-react";
import { AddToPortfolioModal } from "./AddToPortfolioModal";

interface PortfolioButtonProps {
    symbol: string;
    name: string;
    currentPrice: number;
    currencySymbol: string;
}

export function PortfolioButton({ symbol, name, currentPrice, currencySymbol }: PortfolioButtonProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 btn-gradient text-white rounded-xl font-semibold text-sm shadow-lg shadow-emerald-500/20 hover:scale-[1.02] transition-all"
            >
                <Plus className="w-4 h-4" />
                Köp
            </button>

            <AddToPortfolioModal
                symbol={symbol}
                name={name}
                currentPrice={currentPrice}
                currencySymbol={currencySymbol}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
}
