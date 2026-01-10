"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { CreateAlertModal } from "./CreateAlertModal";

interface AlertButtonProps {
    symbol: string;
    currentPrice: number;
    currencySymbol: string;
}

export function AlertButton({ symbol, currentPrice, currencySymbol }: AlertButtonProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="p-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white/60 hover:text-amber-400 transition-colors border border-white/10"
                title="Skapa prisvarning"
            >
                <Bell className="w-5 h-5" />
            </button>

            <CreateAlertModal
                symbol={symbol}
                currentPrice={currentPrice}
                currencySymbol={currencySymbol}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
}
