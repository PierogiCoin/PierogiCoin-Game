import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const supabase = createClient();
        
        // Get authenticated user
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !authUser) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        // 1. Try to find user by auth_user_id
        let { data: user, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('auth_user_id', authUser.id)
            .maybeSingle();

        // 2. If not found by auth_user_id, try by email
        if (!user && authUser.email) {
            console.log(`[my-stats] User not found by auth_user_id, trying email: ${authUser.email}`);
            const { data: userByEmail } = await supabase
                .from('users')
                .select('*')
                .eq('email', authUser.email)
                .maybeSingle();
            
            if (userByEmail) {
                user = userByEmail;
            }
        }

        // 3. If still not found, try by username derived from email
        if (!user && authUser.email) {
            const username = authUser.email.split('@')[0];
            console.log(`[my-stats] User not found by email, trying username: ${username}`);
            const { data: userByUsername } = await supabase
                .from('users')
                .select('*')
                .eq('username', username)
                .maybeSingle();
            
            if (userByUsername) {
                user = userByUsername;
            }
        }

        // Auto-link auth_user_id if we found the user but it wasn't linked
        if (user && user.auth_user_id !== authUser.id) {
            console.log(`[my-stats] Linking auth_user_id: ${authUser.id} to user: ${user.id}`);
            await supabase
                .from('users')
                .update({ auth_user_id: authUser.id, email: authUser.email })
                .eq('id', user.id);
        }

        if (userError) {
            console.error('[my-stats] Database error:', userError);
            return NextResponse.json({ error: 'Database error', details: userError.message }, { status: 500 });
        }

        if (!user) {
            // User is authenticated but doesn't have a game account yet
            // Return 200 instead of 404 to avoid scary browser console errors
            return NextResponse.json({ 
                stats: null,
                error: 'No game account found',
                message: 'Start playing the game to create your account!'
            });
        }

        // Fetch game state
        const { data: gameState } = await supabase
            .from('game_states')
            .select('tasks, achievement_progress, collected_items')
            .eq('user_id', user.id)
            .maybeSingle();

        // Fetch user's own purchases (investor bonuses)
        const { data: userPurchases } = await supabase
            .from('purchases')
            .select('usd_amount, tokens_to_credit, status, created_at')
            .or(`buyer_wallet.eq.${user.id},buyer_address.eq.${user.id},prg_delivery_address.eq.${user.id}`)
            .eq('status', 'success')
            .order('created_at', { ascending: false });

        // Calculate total invested and tokens purchased
        const totalInvested = (userPurchases || []).reduce((sum, p) => sum + (Number(p.usd_amount) || 0), 0);
        const totalTokensPurchased = (userPurchases || []).reduce((sum, p) => sum + (Number(p.tokens_to_credit) || 0), 0);

        // Determine investor tier
        let investorTier = 0;
        let investorTierName = '';
        if (totalInvested >= 2500) {
            investorTier = 4;
            investorTierName = 'Diamond Investor';
        } else if (totalInvested >= 1000) {
            investorTier = 3;
            investorTierName = 'Gold Investor';
        } else if (totalInvested >= 500) {
            investorTier = 2;
            investorTierName = 'Silver Investor';
        } else if (totalInvested >= 100) {
            investorTier = 1;
            investorTierName = 'Bronze Investor';
        }

        // Fetch referral purchases (only if referrer_address column exists)
        let referralPurchases = [];
        let referralTokensEarned = 0;
        let referralCount = 0;
        let totalReferralVolume = 0;

        try {
            const { data: refData, error: refError } = await supabase
                .from('purchases')
                .select('*')
                .eq('referrer_address' as any, user.id)
                .eq('status', 'success');
            
            if (!refError && refData) {
                referralPurchases = refData;
                referralTokensEarned = referralPurchases.reduce((sum, p) => sum + Math.floor((Number(p.tokens_to_credit) || 0) * 0.05), 0);
                referralCount = referralPurchases.length;
                totalReferralVolume = referralPurchases.reduce((sum, p) => sum + (Number(p.usd_amount) || 0), 0);
            }
        } catch (e) {
            console.warn('[my-stats] Referral system not yet migrated in DB');
        }

        // Format stats
        const anyUser = user as any;
        const stats = {
            username: anyUser.username,
            level: anyUser.level || 1,
            prg: anyUser.prg || 0,
            gems: anyUser.gems || 0,
            xp: anyUser.xp || 0,
            totalPrgEarned: anyUser.stats?.prgEarned || anyUser.prg || 0,
            arenaPoints: anyUser.arena_points || 0,
            duelsWon: anyUser.stats?.duelsWon || 0,
            achievementsClaimed: (gameState as any)?.claimed_achievements?.length || 0,
            tasksCompleted: (gameState?.tasks as any[])?.filter(t => t.claimed).length || 0,
            referrals: anyUser.helped_user_ids_today?.length || 0,
            avatarId: anyUser.avatar_id,
            founderTier: anyUser.founder_tier || 0,
            
            // Investment stats
            totalInvested,
            totalTokensPurchased,
            investorTier,
            investorTierName,
            purchaseCount: (userPurchases || []).length,
            
            // Referral stats
            referralCount,
            referralTokensEarned,
            totalReferralVolume
        };

        return NextResponse.json({ stats });
    } catch (error) {
        console.error('[my-stats] Fatal error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
