"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthProvider";

interface Step {
    id: string;
    targetId: string;
    title: string;
    content: string;
    position?: "top" | "bottom" | "left" | "right";
}

interface TourContextType {
    isOpen: boolean;
    currentStepIndex: number;
    steps: Step[];
    startTour: () => void;
    closeTour: () => void;
    nextStep: () => void;
    prevStep: () => void;
    registerStep: (step: Step) => void;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

const TOUR_COMPLETED_KEY = "ticko_tour_completed";

export function TourProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [steps, setSteps] = useState<Step[]>([
        {
            id: "portfolio",
            targetId: "tour-paper-trading-link",
            title: "Your $10,000 Portfolio 💰",
            content: "Access your paper trading dashboard here. You start with $10k virtual cash to practice risk-free.",
            position: "right"
        },
        {
            id: "market",
            targetId: "tour-market-link",
            title: "Discover Stocks 📈",
            content: "Find trending stocks, gainers, and losers in the Market tab. Research before you buy!",
            position: "right"
        },
        {
            id: "post",
            targetId: "tour-post-composer",
            title: "Share Your Analysis 🗣️",
            content: "Got a hot take? Share it with the community. Earn Reputation Points when people like your analysis.",
            position: "bottom"
        },
        {
            id: "leaderboard",
            targetId: "tour-leaderboard-link",
            title: "Compete for Glory 🏆",
            content: "Climb the leaderboard by growing your portfolio or earning reputation. Top traders get featured!",
            position: "right"
        }
    ]);

    const startTour = useCallback(() => {
        setIsOpen(true);
        setCurrentStepIndex(0);
    }, []);

    const closeTour = useCallback(() => {
        setIsOpen(false);
        // Mark as completed
        localStorage.setItem(TOUR_COMPLETED_KEY, "true");
    }, []);

    const nextStep = useCallback(() => {
        if (currentStepIndex < steps.length - 1) {
            setCurrentStepIndex(prev => prev + 1);
        } else {
            closeTour();
        }
    }, [currentStepIndex, steps.length, closeTour]);

    const prevStep = useCallback(() => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(prev => prev - 1);
        }
    }, [currentStepIndex]);

    const registerStep = useCallback((step: Step) => {
        setSteps(prev => {
            if (prev.some(s => s.id === step.id)) return prev;
            return [...prev, step];
        });
    }, []);

    return (
        <TourContext.Provider
            value={{
                isOpen,
                currentStepIndex,
                steps,
                startTour,
                closeTour,
                nextStep,
                prevStep,
                registerStep
            }}
        >
            {children}
        </TourContext.Provider>
    );
}

export function useTour() {
    const context = useContext(TourContext);
    if (context === undefined) {
        throw new Error("useTour must be used within a TourProvider");
    }
    return context;
}
