"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { enUS } from "date-fns/locale";
import { Bell, Heart, MessageCircle, User, Loader2, Check } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import { motion } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { RightPanel } from "@/components/layout/RightPanel";

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
    } | null;
}

export default function AlertsPage() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchNotifications = async () => {
            const { data } = await (supabase as any)
                .from("notifications")
                .select(`
                    *,
                    profiles:actor_id (username, avatar_url)
                `)
                .order("created_at", { ascending: false })
                .limit(50);

            if (data) {
                setNotifications(data as any);
            }
            setIsLoading(false);
        };

        fetchNotifications();

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
                () => {
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
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        await (supabase as any)
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
        if (n.type === 'follow') return `/profile/${n.profiles?.username}`;
        if (n.type === 'like' || n.type === 'comment') return `/post/${n.entity_id}`;
        return '#';
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen bg-[#020617]">
                <Sidebar />
                <main className="flex-1 flex items-center justify-center border-x border-white/5">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                </main>
                <RightPanel />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-[#020617]">
            <Sidebar />
            <main className="flex-1 border-x border-white/5 overflow-y-auto">
                <div className="max-w-2xl mx-auto py-8 px-4">
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-2xl font-extrabold text-white tracking-tight">Notifications</h1>
                        {notifications.some(n => !n.is_read) && (
                            <button
                                onClick={markAllRead}
                                className="flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                            >
                                <Check className="w-4 h-4" />
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div className="space-y-2">
                        {notifications.length === 0 ? (
                            <div className="text-center py-12 bg-white/[0.02] rounded-3xl border border-dashed border-white/10">
                                <Bell className="w-8 h-8 text-white/20 mx-auto mb-3" />
                                <p className="text-white/40">No new notifications</p>
                            </div>
                        ) : (
                            notifications.map((n) => (
                                <Link href={getLink(n)} key={n.id}>
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
                                                        <img src={n.profiles.avatar_url} className="w-full h-full object-cover" alt="" />
                                                    ) : (
                                                        <span className="text-[8px] font-bold text-indigo-300">{n.profiles?.username?.[0] || "?"}</span>
                                                    )}
                                                </div>
                                                <span className="font-bold text-white text-sm">@{n.profiles?.username || "Unknown"}</span>
                                                <span className="text-white/40 text-xs">• {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: enUS })}</span>
                                            </div>
                                            <p className="text-sm text-white/80">
                                                {n.type === 'like' && "liked your post"}
                                                {n.type === 'comment' && `commented: "${n.content || ''}"`}
                                                {n.type === 'follow' && "started following you"}
                                                {n.type === 'system' && (n.content || "System notification")}
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
            </main>
            <RightPanel />
        </div>
    );
}
