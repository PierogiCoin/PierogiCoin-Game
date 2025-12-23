import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const identifier = searchParams.get('identifier');

        if (!identifier) {
            return NextResponse.json({ error: 'Missing identifier' }, { status: 400 });
        }

        const supabase = createAdminClient();

        // Search in 'users' table by username OR email (case-insensitive)
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('*')
            .or(`username.ilike.${identifier},email.ilike.${identifier}`)
            .maybeSingle();

        if (userError) {
            console.error('[user-stats] Error fetching user:', userError);
            return NextResponse.json({ error: 'Database error' }, { status: 500 });
        }

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Fetch game state for additional info if needed
        const { data: gameState, error: stateError } = await supabase
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

        // Determine investor tier based on total investment
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

        // Note: we fetch and then filter locally if column is missing, or catch if select fails
        try {
            const { data: refData, error: refError } = await (supabase
                .from('purchases') as any)
                .select('*')
                .eq('referrer_address', user.id)
                .eq('status', 'success');
            
            if (!refError && refData) {
                referralPurchases = refData;
                referralTokensEarned = referralPurchases.reduce((sum, p) => sum + Math.floor((Number(p.tokens_to_credit) || 0) * 0.05), 0);
                referralCount = referralPurchases.length;
                totalReferralVolume = referralPurchases.reduce((sum, p) => sum + (Number(p.usd_amount) || 0), 0);
            }
        } catch (e) {
            console.warn('[user-stats] Referral system not yet migrated in DB');
        }

        // Format stats for the dashboard
        const stats = {
            username: user.username,
            level: user.level || 1,
            prg: user.prg || 0,
            gems: user.gems || 0,
            xp: user.xp || 0,
            totalPrgEarned: user.stats?.prgEarned || user.prg || 0,
            arenaPoints: user.arena_points || 0,
            duelsWon: user.stats?.duelsWon || 0,
            achievementsClaimed: (gameState as any)?.claimed_achievements?.length || 0,
            tasksCompleted: (gameState?.tasks as any[])?.filter(t => t.claimed).length || 0,
            referrals: user.helped_user_ids_today?.length || 0,
            avatarId: user.avatar_id,
            founderTier: (user as any).founder_tier || 0,
            
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
        console.error('[user-stats] Fatal error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
