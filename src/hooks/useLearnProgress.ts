"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "ticko-learn-progress";

interface LearnProgress {
    completedLessons: string[]; // Format: "moduleId/lessonId"
}

function getInitialProgress(): LearnProgress {
    if (typeof window === "undefined") {
        return { completedLessons: [] };
    }

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.error("Failed to load learn progress:", e);
    }

    return { completedLessons: [] };
}

export function useLearnProgress() {
    const [progress, setProgress] = useState<LearnProgress>({
        completedLessons: [],
    });
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        setProgress(getInitialProgress());
        setIsLoaded(true);
    }, []);

    // Save to localStorage when progress changes
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
        }
    }, [progress, isLoaded]);

    const markLessonComplete = useCallback(
        (moduleId: string, lessonId: string) => {
            const key = `${moduleId}/${lessonId}`;
            setProgress((prev) => {
                if (prev.completedLessons.includes(key)) {
                    return prev;
                }
                return {
                    ...prev,
                    completedLessons: [...prev.completedLessons, key],
                };
            });
        },
        []
    );

    const isLessonComplete = useCallback(
        (moduleId: string, lessonId: string): boolean => {
            return progress.completedLessons.includes(`${moduleId}/${lessonId}`);
        },
        [progress.completedLessons]
    );

    const getModuleProgress = useCallback(
        (moduleId: string, totalLessons: number): number => {
            const completed = progress.completedLessons.filter((key) =>
                key.startsWith(`${moduleId}/`)
            ).length;
            return totalLessons > 0 ? (completed / totalLessons) * 100 : 0;
        },
        [progress.completedLessons]
    );

    const getTotalProgress = useCallback(
        (totalLessons: number): number => {
            return totalLessons > 0
                ? (progress.completedLessons.length / totalLessons) * 100
                : 0;
        },
        [progress.completedLessons]
    );

    const resetProgress = useCallback(() => {
        setProgress({ completedLessons: [] });
    }, []);

    return {
        completedCount: progress.completedLessons.length,
        markLessonComplete,
        isLessonComplete,
        getModuleProgress,
        getTotalProgress,
        resetProgress,
        isLoaded,
    };
}
