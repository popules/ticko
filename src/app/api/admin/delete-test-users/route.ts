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
        // Get email from request body
        const body = await request.json().catch(() => ({}));
        const email = body.email;

        console.log('Delete test users - email:', email);

        if (!email || !ALLOWED_EMAILS.includes(email)) {
            console.log('Unauthorized - email not in allowed list');
            return NextResponse.json({ error: 'Unauthorized', email }, { status: 403 });
        }

        const supabase = getSupabaseAdmin();
        const results: { username: string; status: string }[] = [];

        for (const username of TEST_USERNAMES) {
            console.log(`Processing username: ${username}`);

            // Find the user profile
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('id')
                .eq('username', username)
                .single();

            if (profileError || !profile) {
                console.log(`  ${username}: not found (${profileError?.message || 'no profile'})`);
                results.push({ username, status: 'not found' });
                continue;
            }

            console.log(`  ${username}: found with id ${profile.id}, deleting...`);

            // Delete from auth.users (this will cascade to profiles due to FK)
            const { error: deleteError } = await supabase.auth.admin.deleteUser(profile.id);

            if (deleteError) {
                console.log(`  ${username}: delete error - ${deleteError.message}`);
                results.push({ username, status: `error: ${deleteError.message}` });
            } else {
                console.log(`  ${username}: deleted successfully`);
                results.push({ username, status: 'deleted' });
            }
        }

        console.log('All done, results:', results);

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
