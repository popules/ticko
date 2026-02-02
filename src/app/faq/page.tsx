"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, HelpCircle, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TickoLogo } from "@/components/ui/TickoLogo";
import { useAuth } from "@/providers/AuthProvider";
import { Sidebar } from "@/components/layout/Sidebar";
import { RightPanel } from "@/components/layout/RightPanel";
import { AppFooter } from "@/components/layout/AppFooter";

interface FAQItem {
    question: string;
    answer: string;
    category: string;
}

const faqs: FAQItem[] = [
    // Getting Started
    {
        category: "Getting Started",
        question: "What is Ticko?",
        answer: "Ticko is an educational platform where you can practice stock trading with virtual money ($10,000), compete on leaderboards, discuss investments with the community, and learn from AI-powered analysis. It's 100% risk-free — no real money involved."
    },
    {
        category: "Getting Started",
        question: "Is Ticko free?",
        answer: "Yes! Ticko is free to use. You get $10,000 in virtual money to trade with, access to the community feed, and basic AI features. We offer a Pro subscription for power users who want unlimited AI analysis and additional features."
    },
    {
        category: "Getting Started",
        question: "Do I need trading experience to use Ticko?",
        answer: "Not at all. Ticko is designed for beginners and experienced traders alike. Our Academy teaches you the basics, and the risk-free environment lets you learn by doing without losing real money."
    },
    // Paper Trading
    {
        category: "Paper Trading",
        question: "What is Paper Trading?",
        answer: "Paper trading (also called simulated trading) lets you buy and sell real stocks using virtual money. Your trades are tracked, and you can see how your portfolio would have performed if you'd used real money. It's the safest way to learn."
    },
    {
        category: "Paper Trading",
        question: "Is the market data real-time?",
        answer: "Market data may be delayed by up to 15 minutes. To ensure fair competition, we have a 30-minute lock on positions after purchase — you can't sell immediately. This prevents exploitation of data delays."
    },
    {
        category: "Paper Trading",
        question: "Can I convert my virtual profits to real money?",
        answer: "No. Virtual money on Ticko has no real-world value and cannot be exchanged, withdrawn, or transferred. Ticko is an educational platform, not a financial service."
    },
    {
        category: "Paper Trading",
        question: "What happens at the end of a season?",
        answer: "Seasons typically last one month. At the end, top performers are recognized on the Hall of Fame, and everyone's portfolio resets to $10,000 for the next season. Your track record and achievements are preserved."
    },
    // Leagues & Ranking
    {
        category: "Leagues & Ranking",
        question: "How does the league system work?",
        answer: "Your league (Bronze, Silver, Gold, Platinum, Diamond) is determined by your rating. Your rating changes weekly based on your trading performance. Positive returns = rating goes up. Negative returns = rating goes down. Better performance = faster climb."
    },
    {
        category: "Leagues & Ranking",
        question: "How do I get promoted to a higher league?",
        answer: "Make profitable trades! If you gain 10%+ in a week, you'll gain significant rating points. Cross a rating threshold (e.g., 1500 for Gold) and you're promoted immediately. No waiting for end of season."
    },
    // Ticko AI
    {
        category: "Ticko AI",
        question: "What is Ticko AI?",
        answer: "Ticko AI is our AI assistant that can analyze stocks, summarize news, explain market trends, and answer your trading questions. It knows your portfolio and can give personalized insights based on your holdings."
    },
    {
        category: "Ticko AI",
        question: "Is Ticko AI giving me financial advice?",
        answer: "No. Ticko AI provides information and analysis, never buy/sell recommendations. All AI outputs are for educational purposes only. You are responsible for your own investment decisions."
    },
    {
        category: "Ticko AI",
        question: "How many AI queries do I get for free?",
        answer: "Free users get 3 AI analyses per day. Pro subscribers get unlimited access to Ticko AI."
    },
    // Account & Privacy
    {
        category: "Account & Privacy",
        question: "Is my trading data public?",
        answer: "Yes, by design. Your paper trading activity (buys, sells, P&L) is visible to other users. This transparency is core to Ticko's mission: verifiable track records over anonymous hype. Your email and personal details remain private."
    },
    {
        category: "Account & Privacy",
        question: "Can I delete my account?",
        answer: "Yes. Go to Settings and request account deletion. Your personal data will be permanently deleted. Posts and comments may be retained in anonymized form ('Deleted User') to preserve discussion context."
    },
    {
        category: "Account & Privacy",
        question: "What data do you collect?",
        answer: "We collect your email, username, trading activity, and posts/comments. We use Supabase for auth, Vercel for hosting, and OpenAI for AI features. We never sell your data to advertisers. See our Privacy Policy for full details."
    },
];

const categories = [...new Set(faqs.map(f => f.category))];

function FAQAccordion({ item, isOpen, onToggle }: { item: FAQItem; isOpen: boolean; onToggle: () => void }) {
    return (
        <div className="border border-white/10 rounded-2xl overflow-hidden bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
            <button
                onClick={onToggle}
                className="w-full px-6 py-5 flex items-center justify-between text-left"
            >
                <span className="font-semibold text-white pr-4">{item.question}</span>
                <ChevronDown className={`w-5 h-5 text-white/40 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="px-6 pb-5 text-white/60 leading-relaxed">
                            {item.answer}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function FAQPage() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);
    const { user } = useAuth();

    const content = (
        <div className="max-w-3xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-6">
                            <HelpCircle className="w-8 h-8 text-emerald-400" />
                        </div>
                        <h1 className="text-4xl font-bold text-white mb-4">Frequently Asked Questions</h1>
                        <p className="text-white/50 max-w-lg mx-auto">
                            Everything you need to know about Ticko. Can't find what you're looking for? <Link href="/contact" className="text-emerald-400 hover:underline">Contact us</Link>.
                        </p>
                    </div>

                    {/* FAQ by Category */}
                    {categories.map((category) => (
                        <div key={category} className="mb-12">
                            <h2 className="text-lg font-bold text-white/80 mb-4 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                {category}
                            </h2>
                            <div className="space-y-3">
                                {faqs
                                    .filter(f => f.category === category)
                                    .map((faq, idx) => {
                                        const globalIdx = faqs.findIndex(f => f.question === faq.question);
                                        return (
                                            <FAQAccordion
                                                key={idx}
                                                item={faq}
                                                isOpen={openIndex === globalIdx}
                                                onToggle={() => setOpenIndex(openIndex === globalIdx ? null : globalIdx)}
                                            />
                                        );
                                    })}
                            </div>
                        </div>
                    ))}

                    {/* CTA */}
                    <div className="mt-16 text-center p-8 rounded-3xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
                        <h3 className="text-xl font-bold mb-2">Ready to start your $10k challenge?</h3>
                        <p className="text-white/50 mb-6">Join thousands of traders learning risk-free.</p>
                        <Link
                            href="/register"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-[#020617] rounded-full font-bold hover:shadow-lg hover:shadow-emerald-500/20 transition-all"
                        >
                            Get Started Free
                        </Link>
                    </div>

                    {/* Footer Links */}
                    <div className="mt-12 flex justify-center gap-6 text-sm text-white/40">
                        <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
                        <span>|</span>
                        <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                        <span>|</span>
                        <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
                    </div>
                </div>
    );

    // Authenticated View
    if (user) {
        return (
            <div className="flex min-h-screen bg-[#020617]">
                <Sidebar />
                <main className="flex-1 border-x border-white/5 overflow-y-auto flex flex-col">
                    <div className="p-6 md:p-12 pb-8 flex-1">
                        {content}
                    </div>
                    <AppFooter />
                </main>
                <RightPanel />
            </div>
        );
    }

    // Public View
    return (
        <div className="min-h-screen bg-[#020617] text-white">
            {/* Nav */}
            <nav className="fixed top-0 w-full z-50 border-b border-white/[0.05] bg-[#020617]/70 backdrop-blur-xl">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm font-medium">Back</span>
                    </Link>
                    <TickoLogo />
                </div>
            </nav>

            <main className="pt-32 pb-24 px-6">
                {content}
            </main>

            {/* Simple Footer */}
            <footer className="border-t border-white/[0.05] bg-[#01040f] py-12 px-6">
                <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <TickoLogo />
                    <div className="flex gap-8 text-sm font-medium text-white/40">
                        <Link href="/" className="hover:text-white transition-colors">Home</Link>
                        <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
                        <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
