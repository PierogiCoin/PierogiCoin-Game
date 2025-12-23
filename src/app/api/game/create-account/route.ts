
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const supabase = createClient();
        const { data: { user: authUser } } = await supabase.auth.getUser();

        if (!authUser) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const { username } = await req.json();

        if (!username || username.length < 3) {
            return NextResponse.json({ error: 'Username too short' }, { status: 400 });
        }

        // Check if username already exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('username', username)
            .maybeSingle();

        if (existingUser) {
            // If user exists, try to link it if not already linked
            const { data: checkLink } = await supabase
                .from('users')
                .select('auth_user_id')
                .eq('username', username)
                .single();
            
            if (checkLink?.auth_user_id && checkLink.auth_user_id !== authUser.id) {
                return NextResponse.json({ error: 'Username already linked to another account' }, { status: 400 });
            }

            // Link it
            const { error: linkError } = await supabase
                .from('users')
                .update({ auth_user_id: authUser.id })
                .eq('username', username);
            
            if (linkError) throw linkError;
            return NextResponse.json({ success: true, message: 'Account linked successfully' });
        }

        // Create new user
        const { error: createError } = await supabase
            .from('users')
            .insert({
                id: authUser.id, // Use auth ID as primary ID for simplicity if possible, or new UUID
                username: username,
                auth_user_id: authUser.id,
                level: 1,
                prg: 0,
                gems: 0,
                xp: 0
            });

        if (createError) throw createError;

        // Create game state
        await supabase.from('game_states').insert({
            user_id: authUser.id,
            tasks: [],
            collected_items: []
        });

        return NextResponse.json({ success: true, message: 'Account created successfully' });
    } catch (error: any) {
        console.error('[create-account] Error:', error);
        return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
    }
}
