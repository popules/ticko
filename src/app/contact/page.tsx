"use client";

import { useState } from "react";
import { Mail, MessageSquare, Send, Loader2, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { TickoLogo } from "@/components/ui/TickoLogo";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { AppLayout } from "@/components/layout/AppLayout";
import { AppFooter } from "@/components/layout/AppFooter";

export default function ContactPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const res = await fetch("/api/email/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, subject, message })
            });

            if (!res.ok) throw new Error("Could not send message");

            setIsSuccess(true);
        } catch (err: any) {
            setError(err.message || "An error occurred. Please try again later.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const content = (
        <div className="max-w-4xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-16"
            >
                <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Contact Us</h1>
                <p className="text-white/50 text-lg max-w-xl mx-auto">
                    Do you have questions, suggestions, or just want to say hi? We usually answer within 24 hours.
                </p>
            </motion.div>

            <div className="grid md:grid-cols-5 gap-12">
                {/* Contact Info */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="md:col-span-2 space-y-8"
                >
                    <div className="p-6 rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-xl">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4">
                            <Mail className="w-6 h-6 text-emerald-400" />
                        </div>
                        <h3 className="text-lg font-bold mb-1">Email</h3>
                        <p className="text-emerald-400 font-medium">hello@tickomarkets.com</p>
                    </div>

                    <div className="p-6 rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-xl">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-4">
                            <MessageSquare className="w-6 h-6 text-blue-400" />
                        </div>
                        <h3 className="text-lg font-bold mb-1">Support</h3>
                        <p className="text-white/50 text-sm leading-relaxed">
                            For technical help or reports, send an email and our team will help you as soon as possible.
                        </p>
                    </div>
                </motion.div>

                {/* Contact Form */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="md:col-span-3"
                >
                    {isSuccess ? (
                        <div className="h-full flex flex-col items-center justify-center p-12 text-center bg-emerald-500/5 border border-emerald-500/20 rounded-3xl backdrop-blur-xl">
                            <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mb-6">
                                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Thanks for your message!</h2>
                            <p className="text-white/50 mb-8 lowercase text-sm">We have received your message and will get back to you shortly.</p>
                            <button
                                onClick={() => setIsSuccess(false)}
                                className="px-8 py-3 bg-white text-black rounded-full font-bold text-sm transform transition-all active:scale-95"
                            >
                                Send another one
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1">Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-white/[0.06] border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                        placeholder="Your name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1">Email</label>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-white/[0.06] border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                        placeholder="your@email.com"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1">Subject</label>
                                <input
                                    type="text"
                                    required
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    className="w-full bg-white/[0.06] border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                    placeholder="What can we help you with?"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1">Message</label>
                                <textarea
                                    required
                                    rows={6}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className="w-full bg-white/[0.06] border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none"
                                    placeholder="Tell us more..."
                                />
                            </div>

                            {error && (
                                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-[#020617] rounded-full font-bold text-base shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 transform active:scale-[0.98] disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        Send message
                                        <Send className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </motion.div>
            </div>
        </div>
    );

    // Authenticated View
    if (user) {
        return (
            <AppLayout showRightPanel={true}>
                <div className="flex-1 overflow-y-auto flex flex-col">
                    <div className="p-6 md:p-12 pb-8 flex-1">
                        {content}
                    </div>
                    <AppFooter />
                </div>
            </AppLayout>
        );
    }

    // Public View
    return (
        <div className="min-h-screen bg-[#020617] text-white selection:bg-emerald-500/30 overflow-x-hidden font-sans">
            {/* Background Gradients */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[1000px] h-[1000px] bg-indigo-900/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-emerald-900/10 rounded-full blur-[120px]" />
            </div>

            <nav className="fixed top-0 w-full z-50 border-b border-white/[0.05] bg-[#020617]/70 backdrop-blur-xl transition-all">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <TickoLogo />
                    </Link>
                    <Link href="/login" className="text-sm font-medium text-white/60 hover:text-white transition-colors">
                        Log in
                    </Link>
                </div>
            </nav>

            <main className="relative pt-32 pb-20 px-6 z-10">
                {content}
            </main>

            {/* Simple Footer */}
            <footer className="border-t border-white/[0.05] bg-[#01040f] py-12 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <TickoLogo />
                    <div className="flex gap-8 text-sm font-medium text-white/40">
                        <Link href="/" className="hover:text-white transition-colors">Home</Link>
                        <Link href="/community-guidelines" className="hover:text-white transition-colors">Guidelines</Link>
                        <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
                        <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
