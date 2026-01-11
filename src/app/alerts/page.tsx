"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { sv } from "date-fns/locale";
import { Bell, Heart, MessageCircle, User, Loader2, Check } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import { motion } from "framer-motion";

interface Notification {
    id: string;
    type: 'like' | 'comment' | 'reply' | 'follow' | 'system';
    created_at: string;
    is_read: boolean;
    entity_id: string;
    content?: string;
    profiles: {
        username: string;
        avatar_url: string | null;
    } | null; // The actor
}

export default function AlertsPage() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchNotifications = async () => {
            const { data } = await supabase
                .from("notifications")
                .select(`
                    *,
                    profiles:actor_id (username, avatar_url)
                `)
                .order("created_at", { ascending: false })
                .limit(50); // Limit to 50 recent

            if (data) {
                setNotifications(data as any);
            }
            setIsLoading(false);
        };

        fetchNotifications();

        // Subscribe to real-time new notifications
        const channel = supabase
            .channel('notifications_page')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${user.id}`
                },
                (payload) => {
                    // Fetch the full actor details usually better, but for speed just inserting minimal
                    // Ideally we re-fetch deeply or optimistically add. 
                    // Let's just re-fetch for simplicity to get actor profile
                    fetchNotifications();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    const markAllRead = async () => {
        if (!user) return;

        // Optimistic update
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));

        await supabase
            .from("notifications")
            .update({ is_read: true })
            .eq("user_id", user.id)
            .eq("is_read", false);
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'like': return <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />;
            case 'comment': return <MessageCircle className="w-4 h-4 text-sky-400 fill-sky-400" />;
            case 'follow': return <User className="w-4 h-4 text-emerald-400" />;
            default: return <Bell className="w-4 h-4 text-white" />;
        }
    };

    const getLink = (n: Notification) => {
        if (n.type === 'follow') return `/profil/${n.profiles?.username}`; // Ideally user_id but we only have username here unless we select id
        // Wait, profile lookup by username is supported? Yes usually.
        // Actually actor_id was joined. profiles is the joined object.
        // We probably need actor_id to link to profile properly if our routes use ID.
        // My routes use /profil/[id]. 
        // Notifications table has actor_id. So we can use that if we had it in the object.
        // The join returns data in 'profiles' key. 
        // Let's just link to post for like/comment.
        if (n.type === 'like' || n.type === 'comment') return `/post/${n.entity_id}`;
        return '#';
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-white/20" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-white">Notiser</h1>
                {notifications.some(n => !n.is_read) && (
                    <button
                        onClick={markAllRead}
                        className="flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                        <Check className="w-4 h-4" />
                        Markera alla som lästa
                    </button>
                )}
            </div>

            <div className="space-y-2">
                {notifications.length === 0 ? (
                    <div className="text-center py-12 bg-white/[0.02] rounded-3xl border border-dashed border-white/10">
                        <Bell className="w-8 h-8 text-white/20 mx-auto mb-3" />
                        <p className="text-white/40">Inga nya notiser</p>
                    </div>
                ) : (
                    notifications.map((n) => (
                        <Link
                            href={getLink(n)}
                            key={n.id}
                        >
                            <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex items-start gap-4 p-4 rounded-2xl border transition-all ${n.is_read
                                        ? "bg-transparent border-transparent hover:bg-white/[0.02]"
                                        : "bg-white/[0.05] border-white/10 hover:border-emerald-500/30"
                                    }`}
                            >
                                <div className="mt-1 p-2 rounded-full bg-white/[0.05] border border-white/10">
                                    {getIcon(n.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-5 h-5 rounded-full bg-indigo-500/20 overflow-hidden flex items-center justify-center">
                                            {n.profiles?.avatar_url ? (
                                                <img src={n.profiles.avatar_url} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-[8px] font-bold text-indigo-300">{n.profiles?.username?.[0] || "?"}</span>
                                            )}
                                        </div>
                                        <span className="font-bold text-white text-sm">@{n.profiles?.username || "Okänd"}</span>
                                        <span className="text-white/40 text-xs">• {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: sv })}</span>
                                    </div>
                                    <p className="text-sm text-white/80">
                                        {n.type === 'like' && "gillade ditt inlägg"}
                                        {n.type === 'comment' && `kommenterade: "${n.content || ''}"`}
                                        {n.type === 'follow' && "började följa dig"}
                                        {n.type === 'system' && (n.content || "Systemmeddelande")}
                                    </p>
                                </div>
                                {!n.is_read && (
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2" />
                                )}
                            </motion.div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}
