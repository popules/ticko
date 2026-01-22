import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function PUT(request: Request) {
    try {
        const { username, bio, location } = await request.json();
        const supabase = await createSupabaseServerClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (!user || authError) {
            console.error('[Profile API] Auth failed:', authError?.message);
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Validate username
        if (!username || !username.trim()) {
            return NextResponse.json({ error: 'Username is required' }, { status: 400 });
        }

        // Check if username is taken by another user
        const { data: existingUser } = await (supabase as any)
            .from('profiles')
            .select('id')
            .eq('username', username.trim())
            .neq('id', user.id)
            .maybeSingle();

        if (existingUser) {
            return NextResponse.json({ error: 'Username is already taken' }, { status: 409 });
        }

        const { error: updateError } = await (supabase as any)
            .from('profiles')
            .update({
                username: username.trim(),
                bio: bio?.trim() || null,
                location: location?.trim() || null,
                updated_at: new Date().toISOString(),
            })
            .eq('id', user.id);

        if (updateError) {
            console.error('[Profile API] Update error:', updateError);
            return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
        }

        console.log(`[Profile API] Updated profile for user ${user.id}`);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Profile PUT failed:', error);
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }
}

export async function GET() {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: profile, error } = await (supabase as any)
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (error) throw error;

        return NextResponse.json({ profile });
    } catch (error) {
        console.error('Profile GET failed:', error);
        return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }
}
