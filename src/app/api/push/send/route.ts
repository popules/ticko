import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';

// Configure web-push with VAPID keys
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
        'mailto:hello@tickomarkets.com',
        process.env.VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    );
}

interface SendPushRequest {
    userId: string;
    title: string;
    body: string;
    url?: string;
    tag?: string;
}

export async function POST(request: NextRequest) {
    try {
        // Verify authorization (internal calls only)
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body: SendPushRequest = await request.json();
        const { userId, title, body: messageBody, url, tag } = body;

        if (!userId || !title || !messageBody) {
            return NextResponse.json(
                { error: 'userId, title, and body are required' },
                { status: 400 }
            );
        }

        if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
            return NextResponse.json(
                { error: 'VAPID keys not configured' },
                { status: 500 }
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

        // Get user's push subscriptions
        const { data: subscriptions, error } = await supabase
            .from('push_subscriptions')
            .select('endpoint, p256dh, auth')
            .eq('user_id', userId);

        if (error || !subscriptions || subscriptions.length === 0) {
            return NextResponse.json(
                { success: false, message: 'No subscriptions found for user' },
                { status: 200 }
            );
        }

        const payload = JSON.stringify({
            title,
            body: messageBody,
            url: url || '/',
            tag: tag || 'ticko-notification',
            icon: '/icons/icon-192.png',
        });

        let sent = 0;
        let failed = 0;

        for (const sub of subscriptions) {
            try {
                await webpush.sendNotification(
                    {
                        endpoint: sub.endpoint,
                        keys: {
                            p256dh: sub.p256dh,
                            auth: sub.auth,
                        },
                    },
                    payload
                );
                sent++;
            } catch (err: any) {
                failed++;
                console.error('Push send failed:', err);

                // If subscription is invalid, delete it
                if (err.statusCode === 404 || err.statusCode === 410) {
                    await supabase
                        .from('push_subscriptions')
                        .delete()
                        .eq('endpoint', sub.endpoint);
                }
            }
        }

        return NextResponse.json({
            success: true,
            sent,
            failed,
        });
    } catch (error) {
        console.error('Push send error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
