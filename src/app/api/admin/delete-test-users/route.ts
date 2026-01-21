'use server';

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

// Only allow these emails to use this endpoint
const ALLOWED_EMAILS = ['aberg.anton@gmail.com'];

// Usernames to delete (test/bot accounts)
const TEST_USERNAMES = [
    'tester',
    'testuser',
    'TickoBot',
    'tester_agent',
    'Ticko',
    'StockWizard',
    'MemeKing',
    'DiamondHands',
    'TrendHunter',
    'ValueSeeker'
];

export async function POST(request: NextRequest) {
    try {
        const supabase = getSupabaseAdmin();

        // Get the requesting user from the session cookie
        const { data: { user: requestingUser } } = await supabase.auth.getUser();

        // For now, we'll also accept from the request body for flexibility
        const body = await request.json().catch(() => ({}));
        const email = body.email || requestingUser?.email;

        if (!email || !ALLOWED_EMAILS.includes(email)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const results: { username: string; status: string }[] = [];

        for (const username of TEST_USERNAMES) {
            // Find the user profile
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('id')
                .eq('username', username)
                .single();

            if (profileError || !profile) {
                results.push({ username, status: 'not found' });
                continue;
            }

            // Delete from auth.users (this will cascade to profiles due to FK)
            const { error: deleteError } = await supabase.auth.admin.deleteUser(profile.id);

            if (deleteError) {
                results.push({ username, status: `error: ${deleteError.message}` });
            } else {
                results.push({ username, status: 'deleted' });
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Test users cleanup complete',
            results
        });

    } catch (error: any) {
        console.error('Delete test users error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
