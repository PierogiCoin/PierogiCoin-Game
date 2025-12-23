// Plik: src/config/presaleConfig.ts

// --- PHASE 0: GAME LAUNCH & AUDIT FUNDING ---
export const GAME_LAUNCH_DATE = "2024-11-27T00:00:00Z";      // Gra startuje 27 listopada 2024
export const AUDIT_FUNDING_GOAL = 15000;                      // Cel: $15k na audit + prawnika
export const AUDIT_FUNDING_DEADLINE = "2025-01-31T23:59:59Z"; // Deadline: koniec stycznia 2025

// --- GŁÓWNE STAŁE KONFIGURACYJNE PRZEDSPRZEDAŻY ---
// PRESALE STARTUJE DOPIERO PO AUDYCIE! (po zebraniu $15k)
export const PRESALE_START_DATE_STRING = "2025-02-01T00:00:00Z"; // Start presale: 1 lutego 2025 (PO AUDYCIE!)
export const PRESALE_END_DATE_STRING = "2025-05-31T23:59:59Z";   // Data końca: 31 maja 2025
export const PRESALE_GOAL_USD = 70000;                        // Całkowity cel USD dla całej przedsprzedaży (4 stages)
export const TOTAL_TOKENS_FOR_PRESALE = 400000000;           // 400M tokenów na presale (100M per stage)

// --- TYPY DANYCH ---

export interface PresaleStage {
  id: string;
  name: string;
  nameKey: string;
  tokenPrice: number;
  targetAmountUSD: number;
  bonusPercent?: number;
  descriptionKey?: string;
  usdRaisedStart?: number;
  usdRaisedEnd?: number;
}

export interface NextPriceInfo {
  name: string;
  price: number | null;
  needed: number | null;
  threshold?: number;
  isFinalGoal: boolean;
  nextStageNameKey?: string | null;
}

export interface PresaleStageInfo {
  currentStage: PresaleStage | null;
  nextStage: PresaleStage | null;
  nextTokenPrice: number | null;
  usdToNextStage: number | null;
  nextStageNameKey: string | null;
  isFinalStage: boolean;
  isPresaleGoalReached: boolean;
  progressInCurrentStagePercent?: number;
  overallProgressPercent?: number;
}

// --- KONFIGURACJA ETAPÓW PRZEDSPRZEDAŻY (PO AUDYCIE!) ---
// Presale startuje DOPIERO po zebraniu $15k na audit i wykonaniu audytu
export const STAGES_CONFIG: PresaleStage[] = [
  {
    id: 'stage1_audited',
    name: 'Stage 1: Community-Audited 🔒',
    nameKey: 'presale.stages.stage1.name',
    tokenPrice: 0.0001,                    // $0.0001 - najniższa cena!
    targetAmountUSD: 10000,                // $10k - Polski rynek + early gamers
    bonusPercent: 25,                      // +25% bonus dla game players!
    descriptionKey: 'presale.stages.stage1.description',
  },
  {
    id: 'stage2_global',
    name: 'Stage 2: Global Expansion 🌍',
    nameKey: 'presale.stages.stage2.name',
    tokenPrice: 0.00015,                   // $0.00015 - wzrost 50%
    targetAmountUSD: 15000,                // $15k - USA, Canada, Asia
    bonusPercent: 20,                      // +20% bonus
    descriptionKey: 'presale.stages.stage2.description',
  },
  {
    id: 'stage3_final',
    name: 'Stage 3: Final Call 🚀',
    nameKey: 'presale.stages.stage3.name',
    tokenPrice: 0.0002,                    // $0.0002 - last chance!
    targetAmountUSD: 20000,                // $20k - FOMO phase
    bonusPercent: 15,                      // +15% bonus
    descriptionKey: 'presale.stages.stage3.description',
  },
  {
    id: 'stage4_premium',
    name: 'Stage 4: Premium Round 💎',
    nameKey: 'presale.stages.stage4.name',
    tokenPrice: 0.00025,                   // $0.00025 - przed giełdą
    targetAmountUSD: 25000,                // $25k - larger investors
    bonusPercent: 10,                      // +10% bonus
    descriptionKey: 'presale.stages.stage4.description',
  },
];

// --- FUNKCJE BIZNESOWE ---

// POPRAWKA: Dodajemy brakujące funkcje i eksportujemy je.
export const getStageForUsdAmount = (usdAmount: number): PresaleStage | null => {
  let accumulatedUsd = 0;
  for (const stage of STAGES_CONFIG) {
    const stageEnd = accumulatedUsd + stage.targetAmountUSD;
    if (usdAmount < stageEnd) {
      return {
        ...stage,
        usdRaisedStart: accumulatedUsd,
        usdRaisedEnd: stageEnd,
      };
    }
    accumulatedUsd = stageEnd;
  }
  if (usdAmount < PRESALE_GOAL_USD) {
      const lastStage = STAGES_CONFIG[STAGES_CONFIG.length - 1];
      let startAmount = 0;
      for(let i=0; i < STAGES_CONFIG.length -1; i++){
          startAmount += STAGES_CONFIG[i].targetAmountUSD;
      }
      return {
          ...lastStage,
          usdRaisedStart: startAmount,
          usdRaisedEnd: PRESALE_GOAL_USD
      };
  }
  return null; // Przedsprzedaż zakończona
};

export const getInvestmentBonusPercent = (amount: number): number => {
  if (amount >= 2500) return 30;
  if (amount >= 1000) return 20;
  if (amount >= 500) return 12;
  if (amount >= 100) return 5;
  return 0;
};
