import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { verifyAdmin, isErrorResponse } from '@/lib/admin-auth';

const BOTS = [
    { username: 'StockWizard', name: 'Stock Wizard', bio: 'I see charts in my sleep. 🧙‍♂️', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=StockWizard' },
    { username: 'NordicTrader', name: 'Sven Svensson', bio: 'Focusing on OMXS30. Long term.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=NordicTrader' },
    { username: 'BearHunter', name: 'Bear Hunter', bio: 'Looking for the crash. 🐻', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=BearHunter' },
    { username: 'ValueViking', name: 'Value Viking', bio: 'Fundamentals matter. Dividends are king.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ValueViking' },
    { username: 'MemeKing', name: 'Moon Boi', bio: 'To the moooon! 🚀', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MemeKing' },
];

export async function POST() {
    // Verify admin access
    const authResult = await verifyAdmin();
    if (isErrorResponse(authResult)) {
        return authResult;
    }

    try {
        const results = [];

        for (const bot of BOTS) {
            const email = `${bot.username.toLowerCase()}@tickomarkets.com`;

            // 1. Check if exists
            const { data: existingProfiles } = await getSupabaseAdmin()
                .from('profiles')
                .select('id')
                .eq('username', bot.username)
                .single();

            if (existingProfiles) {
                results.push({ username: bot.username, status: 'exists', id: existingProfiles.id });
                continue;
            }

            // 2. Create Auth User
            const { data: authData, error: authError } = await getSupabaseAdmin().auth.admin.createUser({
                email,
                password: crypto.randomUUID(), // Random password - bots don't log in
                email_confirm: true
            });

            if (authError) {
                console.error(`Failed to create auth for ${bot.username}:`, authError);
                results.push({ username: bot.username, status: 'error', error: authError.message });
                continue;
            }

            const userId = authData.user.id;

            // 3. Create or Update Profile
            const { error: profileError } = await getSupabaseAdmin()
                .from('profiles')
                .upsert({
                    id: userId,
                    username: bot.username,
                    display_name: bot.name,
                    bio: bot.bio,
                    avatar_url: bot.avatar,
                    reputation_score: Math.floor(Math.random() * 50) + 10
                });

            if (profileError) {
                console.error(`Failed to create profile for ${bot.username}:`, profileError);
                results.push({ username: bot.username, status: 'profile_error', error: profileError.message });
            } else {
                results.push({ username: bot.username, status: 'created', id: userId });
            }
        }

        return NextResponse.json({ success: true, results });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
