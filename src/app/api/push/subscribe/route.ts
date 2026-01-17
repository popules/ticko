import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
    try {
        const { userId, subscription } = await request.json();

        if (!userId || !subscription) {
            return NextResponse.json(
                { error: 'userId and subscription are required' },
                { status: 400 }
            );
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            return NextResponse.json(
                { error: 'Supabase not configured' },
                { status: 500 }
            );
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        // Upsert the subscription (update if exists, insert if new)
        const { error } = await supabase
            .from('push_subscriptions')
            .upsert(
                {
                    user_id: userId,
                    endpoint: subscription.endpoint,
                    p256dh: subscription.keys.p256dh,
                    auth: subscription.keys.auth,
                    updated_at: new Date().toISOString(),
                },
                { onConflict: 'endpoint' }
            );

        if (error) {
            console.error('Failed to save push subscription:', error);
            return NextResponse.json(
                { error: 'Failed to save subscription' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Push subscribe error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
