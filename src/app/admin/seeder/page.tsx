'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { Shield, Loader2 } from 'lucide-react';
import Link from 'next/link';

const ALLOWED_EMAILS = ['aberg.anton@gmail.com'];

export default function SeederPage() {
    const { user, isLoading: authLoading } = useAuth();
    const [logs, setLogs] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [ticker, setTicker] = useState('TSLA');
    const [count, setCount] = useState(5);

    // Check if user is authorized
    const isAuthorized = user && ALLOWED_EMAILS.includes(user.email || '');

    // Show loading state
    if (authLoading) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
            </div>
        );
    }

    // Show access denied
    if (!isAuthorized) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center">
                <div className="text-center max-w-md p-8">
                    <div className="w-16 h-16 rounded-full bg-rose-500/20 flex items-center justify-center mx-auto mb-4">
                        <Shield className="w-8 h-8 text-rose-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
                    <p className="text-white/50 mb-6">This page is restricted to administrators only.</p>
                    <Link href="/" className="px-6 py-3 bg-white/10 rounded-xl text-white font-bold hover:bg-white/20 transition-colors inline-block">
                        Go Home
                    </Link>
                </div>
            </div>
        );
    }

    const addLog = (msg: string) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);

    const handleCreateBots = async () => {
        setIsLoading(true);
        addLog('Creating bots...');
        try {
            const res = await fetch('/api/admin/create-bots', { method: 'POST' });
            const data = await res.json();
            addLog(`Result: ${JSON.stringify(data, null, 2)}`);
        } catch (e: any) {
            addLog(`Error: ${e.message}`);
        }
        setIsLoading(false);
    };

    const handleSeedComments = async () => {
        setIsLoading(true);
        addLog(`Generating ${count} comments for ${ticker}...`);
        try {
            const res = await fetch('/api/admin/seed-comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ticker, count })
            });
            const data = await res.json();
            addLog(`Generated ${data.count} posts!`);
        } catch (e: any) {
            addLog(`Error: ${e.message}`);
        }
        setIsLoading(false);
    };

    const handleDeleteTestUsers = async () => {
        if (!confirm('Are you sure you want to delete ALL test users? This cannot be undone.')) return;
        setIsLoading(true);
        addLog('Deleting test users...');
        try {
            const res = await fetch('/api/admin/delete-test-users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user?.email })
            });
            const data = await res.json();
            if (data.results) {
                data.results.forEach((r: any) => addLog(`  ${r.username}: ${r.status}`));
            }
            addLog('Cleanup complete!');
        } catch (e: any) {
            addLog(`Error: ${e.message}`);
        }
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#020617] text-white p-8 font-mono">
            <div className="max-w-2xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-emerald-400 mb-2">👻 Ghost Town Killer</h1>
                    <p className="text-white/60">Seed your database with users and content.</p>
                    <p className="text-xs text-white/30 mt-1">Logged in as: {user?.email}</p>
                </div>

                {/* Danger Zone - Delete Test Users */}
                <div className="p-6 border border-rose-500/30 rounded-xl bg-rose-500/10 space-y-4">
                    <h2 className="text-xl font-semibold text-rose-400">🗑️ Danger Zone</h2>
                    <p className="text-sm text-white/40">Delete all test/bot accounts (TickoBot, tester, testuser, etc.)</p>
                    <button
                        onClick={handleDeleteTestUsers}
                        disabled={isLoading}
                        className="px-4 py-2 bg-rose-500 hover:bg-rose-600 rounded-lg font-bold disabled:opacity-50"
                    >
                        {isLoading ? 'Working...' : 'Delete Test Users'}
                    </button>
                </div>

                <div className="p-6 border border-white/10 rounded-xl bg-white/5 space-y-4">
                    <h2 className="text-xl font-semibold">Step 1: Create Bots</h2>
                    <p className="text-sm text-white/40">Creates 5 bot accounts if they don't exist.</p>
                    <button
                        onClick={handleCreateBots}
                        disabled={isLoading}
                        className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-lg font-bold disabled:opacity-50"
                    >
                        {isLoading ? 'Working...' : 'Create Bots'}
                    </button>
                </div>

                <div className="p-6 border border-white/10 rounded-xl bg-white/5 space-y-4">
                    <h2 className="text-xl font-semibold">Step 2: Generate Content</h2>
                    <div className="flex gap-4">
                        <input
                            type="text"
                            value={ticker}
                            onChange={(e) => setTicker(e.target.value.toUpperCase())}
                            className="bg-black/50 border border-white/20 rounded-lg px-4 py-2 w-32"
                            placeholder="Ticker"
                        />
                        <input
                            type="number"
                            value={count}
                            onChange={(e) => setCount(Number(e.target.value))}
                            className="bg-black/50 border border-white/20 rounded-lg px-4 py-2 w-20"
                            min={1}
                            max={20}
                        />
                        <button
                            onClick={handleSeedComments}
                            disabled={isLoading}
                            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-lg disabled:opacity-50 flex-1"
                        >
                            {isLoading ? 'Generating...' : 'Generate Posts'}
                        </button>
                    </div>
                </div>

                <div className="p-4 bg-black rounded-xl border border-white/10 h-64 overflow-y-auto text-xs font-mono">
                    {logs.length === 0 && <span className="text-white/20">Logs will appear here...</span>}
                    {logs.map((log, i) => (
                        <div key={i} className="mb-1 text-white/80 border-b border-white/5 pb-1">{log}</div>
                    ))}
                </div>
            </div>
        </div>
    );
}
