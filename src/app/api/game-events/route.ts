import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// Dynamic route setup
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export interface ActivityEvent {
  id: string;
  type: 'purchase' | 'achievement' | 'rare_drop' | 'level_up' | 'raid_win' | 'guild_join';
  user: string;
  description: string; // The main action text, e.g. "Bought 5000 PRG" or "Found Golden Pierogi"
  value?: string; // Optional value text, e.g. "+$50" or "Leg. Item"
  timestamp: string;
}

const MOCK_USERS = ['CryptoKing', 'PierogiLover', 'Hussar99', 'JanuszBiznesu', 'PolskiFiat', 'CyberWitch', 'MoonBoi', 'Alice', 'Bob', 'SatoshiN', 'VitalikL'];
const MOCK_ACHIEVEMENTS = ['First Blood', 'Tap Master', 'Guild Leader', 'Audit Supporter', 'Early Adopter', 'Gem Hunter'];
const MOCK_DROPS = ['Golden Pierogi', 'Diamond Rolling Pin', 'Ancient Recipe', 'Cyber Sauce', 'Neon Apron'];

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateMockEvents(count: number): ActivityEvent[] {
  const events: ActivityEvent[] = [];
  const now = Date.now();
  
  for (let i = 0; i < count; i++) {
    const timeOffset = Math.random() * 1000 * 60 * 60; // Up to 1 hour ago
    const rand = Math.random();
    let eventType: ActivityEvent['type'] = 'achievement';

    if (rand > 0.95) eventType = 'raid_win';
    else if (rand > 0.8) eventType = 'rare_drop';
    else if (rand > 0.5) eventType = 'level_up';
    else eventType = 'achievement';
    
    let description = '';
    let value = '';
    
    switch(eventType) {
        case 'achievement':
            description = `Unlocked: ${getRandomItem(MOCK_ACHIEVEMENTS)}`;
            value = '+50 Gems';
            break;
        case 'rare_drop':
            description = `Found: ${getRandomItem(MOCK_DROPS)}`;
            value = 'Legendary';
            break;
        case 'level_up':
            description = `Reached Level ${Math.floor(Math.random() * 50) + 5}`;
            value = 'Level Up';
            break;
        case 'raid_win': // Less frequent
            description = "Defeated the Cyber-Dragon!";
            value = "Guild Win";
            break;
    }

    events.push({
      id: `mock-${i}-${Date.now()}`,
      type: eventType as any,
      user: getRandomItem(MOCK_USERS),
      description,
      value,
      timestamp: new Date(now - timeOffset).toISOString()
    });
  }
  return events;
}

export async function GET() {
  try {
     const supabase = createAdminClient();
     
     // 1. Fetch Real Purchases (Last 5)
     const { data: purchases } = await supabase
        .from('purchases')
        .select('buyer_wallet, usd_amount, created_at')
        .eq('status', 'success')
        .order('created_at', { ascending: false })
        .limit(5);

     const realEvents: ActivityEvent[] = (purchases || []).map((p: any) => ({
        id: `purchase-${p.created_at}`,
        type: 'purchase',
        user: p.buyer_wallet ? `${p.buyer_wallet.slice(0,4)}...${p.buyer_wallet.slice(-4)}` : 'Anon',
        description: `Contributed to Audit`,
        value: `+$${p.usd_amount}`,
        timestamp: p.created_at
     }));

     // 2. Generate Simulated Game Events
     // Ensure we have at least 10 items total
     const neededMocks = Math.max(0, 15 - realEvents.length);
     const mockEvents = generateMockEvents(neededMocks);

     // 3. Merge and Sort
     const allEvents = [...realEvents, ...mockEvents].sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
     );

    return NextResponse.json({ events: allEvents });

  } catch (error) {
    console.error("Game events API error:", error);
    // Fallback if DB fails
    return NextResponse.json({ events: generateMockEvents(10) });
  }
}
