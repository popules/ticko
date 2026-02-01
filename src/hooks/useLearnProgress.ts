"use client";

import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface LearnProgress {
    completedLessons: string[]; // Format: "moduleId/lessonId"
}

export function useLearnProgress() {
    const queryClient = useQueryClient();

    // Fetch progress from API
    const { data, isLoading } = useQuery({
        queryKey: ["learn-progress"],
        queryFn: async () => {
            const res = await fetch("/api/learn/progress");
            if (!res.ok) return { completedLessons: [] };
            return res.json() as Promise<LearnProgress>;
        },
    });

    // Mutation to mark lesson complete
    const mutation = useMutation({
        mutationFn: async ({ moduleId, lessonId }: { moduleId: string; lessonId: string }) => {
            const res = await fetch("/api/learn/progress", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ moduleId, lessonId }),
            });
            if (!res.ok) throw new Error("Failed to save progress");
            return res.json();
        },
        onSuccess: async (data, variables) => {
            // Optimistic update or refetch
            queryClient.invalidateQueries({ queryKey: ["learn-progress"] });
            queryClient.invalidateQueries({ queryKey: ["profile"] }); // Update XP

            // Trigger Challenge Progress (Action: 'lesson')
            try {
                await fetch("/api/challenges/progress", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ actionType: "lesson" }),
                });
                // Invalidate challenges to show progress in widget
                queryClient.invalidateQueries({ queryKey: ["active-challenges"] });
            } catch (err) {
                console.error("Failed to update challenge progress", err);
            }
        },
    });

    const markLessonComplete = useCallback(
        (moduleId: string, lessonId: string) => {
            mutation.mutate({ moduleId, lessonId });
        },
        [mutation]
    );

    const completedLessons = data?.completedLessons || [];

    const isLessonComplete = useCallback(
        (moduleId: string, lessonId: string): boolean => {
            return completedLessons.includes(`${moduleId}/${lessonId}`);
        },
        [completedLessons]
    );

    const getModuleProgress = useCallback(
        (moduleId: string, totalLessons: number): number => {
            const completed = completedLessons.filter((key) =>
                key.startsWith(`${moduleId}/`)
            ).length;
            return totalLessons > 0 ? (completed / totalLessons) * 100 : 0;
        },
        [completedLessons]
    );

    const getTotalProgress = useCallback(
        (totalLessons: number): number => {
            return totalLessons > 0
                ? (completedLessons.length / totalLessons) * 100
                : 0;
        },
        [completedLessons]
    );

    const resetProgress = useCallback(() => {
        // For testing purposes, we might want to support this, but with API it's harder.
        // We could call a DELETE endpoint, but for now let's just invalidate/refetch.
        queryClient.setQueryData(["learn-progress"], { completedLessons: [] });
    }, [queryClient]);

    return {
        completedCount: completedLessons.length,
        markLessonComplete,
        isLessonComplete,
        getModuleProgress,
        getTotalProgress,
        resetProgress,
        isLoaded: !isLoading,
    };
}
