import { supabase } from "./supabase/client";

export const ACHIEVEMENTS = {
    EARLY_ADOPTER: "early_adopter",
    FIRST_POST: "first_post",
    ORACLE: "oracle",
    INFLUENCER: "influencer",
};

export async function checkAndAwardAchievement(userId: string, key: string) {
    try {
        // 1. Get achievement ID
        const { data: achievement } = await supabase
            .from("achievements")
            .select("id")
            .eq("key", key)
            .single();

        if (!achievement) return;

        // 2. Insert into user_achievements (ignore conflict)
        const { error } = await supabase
            .from("user_achievements")
            .insert({ user_id: userId, achievement_id: achievement.id })
            .ignore();

        if (!error) {
            // Could return "Awarded!" to show a toast
            return true;
        }
    } catch (e) {
        console.error("Achievement error:", e);
    }
    return false;
}
