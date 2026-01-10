"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { sv } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import {
    Bell,
    ThumbsUp,
    MessageCircle,
    UserPlus,
    TrendingUp,
    Check,
    Loader2
} from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import Link from "next/link";

interface Notification {
    id: string;
    type: "like" | "comment" | "follow" | "alert";
    is_read: boolean;
    created_at: string;
    actor?: {
        username: string;
    } | null;
    posts?: {
        content: string;
    } | null;
}

export function NotificationList() {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!user || !isSupabaseConfigured || !supabase) return;

        const fetchNotifications = async () => {
            setIsLoading(true);
            const { data, error } = await supabase
                .from("notifications")
                .select(`
                    id,
                    type,
                    is_read,
                    created_at,
                    actor:profiles!actor_id (username),
                    posts (content)
                `)
                .eq("user_id", user.id)
                .order("created_at", { ascending: false })
                .limit(10);

            if (!error && data) {
                setNotifications(data as Notification[]);
                setUnreadCount(data.filter((n: Notification) => !n.is_read).length);
            }
            setIsLoading(false);
        };

        fetchNotifications();
    }, [user]);

    const markAllAsRead = async () => {
        if (!user || !supabase) return;

        await supabase
            .from("notifications")
            .update({ is_read: true } as never)
            .eq("user_id", user.id)
            .eq("is_read", false);

        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
    };

    const getIcon = (type: string) => {
        switch (type) {
            case "like": return <ThumbsUp className="w-4 h-4 text-rose-400" />;
            case "comment": return <MessageCircle className="w-4 h-4 text-blue-400" />;
            case "follow": return <UserPlus className="w-4 h-4 text-violet-400" />;
            case "alert": return <TrendingUp className="w-4 h-4 text-emerald-400" />;
            default: return <Bell className="w-4 h-4 text-white/40" />;
        }
    };

    const getMessage = (notification: Notification) => {
        const actor = notification.actor?.username || "Någon";
        switch (notification.type) {
            case "like": return `${actor} gillade ditt inlägg`;
            case "comment": return `${actor} kommenterade ditt inlägg`;
            case "follow": return `${actor} började följa dig`;
            case "alert": return "En prisvarning har triggats!";
            default: return "Ny notifikation";
        }
    };

    if (!user) return null;

    return (
        <div className="relative">
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/60 hover:text-white transition-all border border-white/10"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                        {unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Panel */}
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-hidden bg-[#0B0F17]/95 backdrop-blur-3xl rounded-2xl border border-white/20 shadow-2xl z-50"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 border-b border-white/10">
                                <h3 className="font-bold text-white">Notifikationer</h3>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                                    >
                                        <Check className="w-3 h-3" />
                                        Markera alla som lästa
                                    </button>
                                )}
                            </div>

                            {/* Content */}
                            <div className="overflow-y-auto max-h-72">
                                {isLoading ? (
                                    <div className="flex justify-center py-8">
                                        <Loader2 className="w-5 h-5 animate-spin text-white/40" />
                                    </div>
                                ) : notifications.length === 0 ? (
                                    <div className="p-8 text-center text-white/40">
                                        <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">Inga notifikationer</p>
                                    </div>
                                ) : (
                                    notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={`flex items-start gap-3 p-4 border-b border-white/5 hover:bg-white/[0.04] transition-all ${!notification.is_read ? "bg-emerald-500/5" : ""
                                                }`}
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center flex-shrink-0">
                                                {getIcon(notification.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-white/80">
                                                    {getMessage(notification)}
                                                </p>
                                                <p className="text-xs text-white/30 mt-0.5">
                                                    {formatDistanceToNow(new Date(notification.created_at), {
                                                        addSuffix: true,
                                                        locale: sv,
                                                    })}
                                                </p>
                                            </div>
                                            {!notification.is_read && (
                                                <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0 mt-1.5" />
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
