import { NextResponse } from 'next/server';
import { PROJECT_STATS } from "@/data/projectData";
import { ALL_BUFFS } from "@/data/gameBuffs";

// Dynamic route setup
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // 1. Calculate current funding percentage
    const currentFund = PROJECT_STATS.currentFund;
    const targetFund = PROJECT_STATS.targetFund;
    
    const percentage = (currentFund / targetFund) * 100;

    // 2. Determine active buffs
    const activeBuffs = ALL_BUFFS.map(buff => ({
      ...buff,
      isActive: percentage >= buff.minFundingPct
    })).filter(b => b.isActive);

    // 3. Return status
    return NextResponse.json({
      fundingPercentage: percentage,
      currentFund: currentFund,
      targetFund: targetFund,
      activeBuffs: activeBuffs,
      nextUnlock: ALL_BUFFS.find(b => percentage < b.minFundingPct) || null
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to calc global buffs' }, { status: 500 });
  }
}
