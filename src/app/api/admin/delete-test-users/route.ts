import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { verifyAdmin, isErrorResponse } from '@/lib/admin-auth';

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

export async function POST() {
    // Verify admin access
    const authResult = await verifyAdmin();
    if (isErrorResponse(authResult)) {
        return authResult;
    }

    try {
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

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('Delete test users error:', error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
