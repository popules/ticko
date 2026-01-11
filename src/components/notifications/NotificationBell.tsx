"use client";

import { useState, useEffect } from "react";
import { Bell, Heart, MessageCircle, UserPlus, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { sv } from "date-fns/locale";
import { useAuth } from "@/providers/AuthProvider";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

export function NotificationBell() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/notifications");
            const data = await res.json();
            setNotifications(data);
            setUnreadCount(data.filter((n: any) => !n.is_read).length);
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();

        if (!isSupabaseConfigured || !supabase) return;

        // Subscribe to NEW notifications for this user
        const channel = supabase
            .channel('realtime_notifications')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${user?.id}`
                },
                (payload) => {
                    console.log('New notification received:', payload);
                    // Fetch full data to get actor profile
                    fetchNotifications();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user?.id]);

    const markAsRead = async () => {
        if (unreadCount === 0) return;
        try {
            await fetch("/api/notifications", { method: "POST" });
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        } catch (error) {
            console.error("Failed to mark notifications as read:", error);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case "like": return <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />;
            case "comment": return <MessageCircle className="w-4 h-4 text-blue-400" />;
            case "follow": return <UserPlus className="w-4 h-4 text-emerald-400" />;
            default: return <Bell className="w-4 h-4 text-white/40" />;
        }
    };

    const getMessage = (n: any) => {
        const actor = n.actor?.username || "Någon";
        switch (n.type) {
            case "like": return <span><b>{actor}</b> gillade ditt inlägg</span>;
            case "comment": return <span><b>{actor}</b> kommenterade ditt inlägg</span>;
            case "follow": return <span><b>{actor}</b> började följa dig</span>;
            default: return <span>Ny händelse från <b>{actor}</b></span>;
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => {
                    setIsOpen(!isOpen);
                    if (!isOpen) markAsRead();
                }}
                className={`relative p-3 rounded-2xl transition-all ${isOpen ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/[0.06] hover:text-white"
                    }`}
            >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-4 h-4 bg-emerald-500 text-[10px] font-black text-white rounded-full flex items-center justify-center border-2 border-[#0B0F17]">
                        {unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute left-0 mt-4 w-80 bg-[#0B0F17]/95 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-2xl z-50 overflow-hidden"
                        >
                            <div className="p-5 border-b border-white/10 flex items-center justify-between">
                                <h3 className="text-sm font-bold text-white uppercase tracking-widest">Notiser</h3>
                                {isLoading && <Loader2 className="w-3 h-3 animate-spin text-white/40" />}
                            </div>

                            <div className="max-h-[400px] overflow-y-auto scrollbar-hide">
                                {notifications.length > 0 ? (
                                    notifications.map((n) => (
                                        <div
                                            key={n.id}
                                            className={`p-4 flex gap-3 hover:bg-white/[0.04] transition-colors border-b border-white/5 last:border-0 ${!n.is_read ? "bg-emerald-500/[0.02]" : ""
                                                }`}
                                        >
                                            <div className="mt-1">{getIcon(n.type)}</div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-white/80 leading-snug">
                                                    {getMessage(n)}
                                                </p>
                                                <p className="text-[10px] text-white/30 mt-1 uppercase tracking-tighter">
                                                    {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: sv })}
                                                </p>
                                            </div>
                                            {!n.is_read && (
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2" />
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-12 text-center">
                                        <Bell className="w-12 h-12 text-white/5 mx-auto mb-4" />
                                        <p className="text-sm text-white/20 italic">Inga notiser ännu.</p>
                                    </div>
                                )}
                            </div>

                            <Link
                                href="/profil"
                                onClick={() => setIsOpen(false)}
                                className="block p-4 text-center text-xs font-bold text-emerald-400 hover:bg-white/[0.04] transition-colors"
                            >
                                Visa alla i profilen
                            </Link>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
