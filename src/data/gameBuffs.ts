export interface GlobalBuff {
  id: string;
  name: string;
  description: string;
  effectType: 'gem_drop' | 'xp_multiplier' | 'daily_reward' | 'prg_drop';
  effectValue: number;
  minFundingPct: number;
  isActive: boolean;
}

export const ALL_BUFFS: GlobalBuff[] = [
  {
    id: 'initiate_luck',
    name: "Initiate's Luck",
    description: "+10% Gems from Tapping",
    effectType: 'gem_drop',
    effectValue: 0.10,
    minFundingPct: 10,
    isActive: false
  },
  {
    id: 'audit_momentum',
    name: "Audit Momentum",
    description: "+25% XP from all sources",
    effectType: 'xp_multiplier',
    effectValue: 0.25,
    minFundingPct: 25,
    isActive: false
  },
  {
    id: 'security_surge',
    name: "Security Surge",
    description: "+50% Daily Login Rewards",
    effectType: 'daily_reward',
    effectValue: 0.50,
    minFundingPct: 50,
    isActive: false
  },
  {
    id: 'golden_age',
    name: "Golden Age",
    description: "+20% PRG Drops from Games",
    effectType: 'prg_drop',
    effectValue: 0.20,
    minFundingPct: 75,
    isActive: false
  },
  {
    id: 'legendary_status',
    name: "Legendary Status",
    description: "2x Multiplier on EVERYTHING",
    effectType: 'gem_drop', 
    effectValue: 1.0, 
    minFundingPct: 100,
    isActive: false
  }
];
