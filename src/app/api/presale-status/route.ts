import { createRouteHandlerClient } from '@/lib/supabase/route-handler-client';
// import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient();
    
    // Attempt to fetch from Supabase
    const { data, error } = await supabase
      .from('presale_stats')
      .select('*')
      .single();

    if (error) {
      // If table doesn't exist or other error, fallback to mock data silently
      console.warn('Supabase fetch failed (presale-status), using fallback:', error.message);
      return NextResponse.json({
        raisedUsd: 8450,
        bonusPercentage: 10,
        nextTierUsd: 15000,
        currentStage: 1
      });
    }

    // Return live data
    return NextResponse.json({
      raisedUsd: data?.raised_usd ?? 8450,
      bonusPercentage: data?.bonus_percentage ?? 10,
      nextTierUsd: data?.next_tier_usd ?? 15000,
      currentStage: data?.current_stage ?? 1
    });

  } catch (err) {
    console.error('API Error (presale-status):', err);
    // Ultimate fallback
    return NextResponse.json({
      raisedUsd: 8450,
      bonusPercentage: 10,
      nextTierUsd: 15000,
      currentStage: 1
    });
  }
}