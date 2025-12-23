export interface RoadmapPhase {
  id: number;
  i18nKey: string;   // np. "q4_2025.e2"
  quarter: string;   // np. "Q4 2025"
  startDate: string; // ISO (parsowane do daty/kwartału)
}

// Keys refer to "phases.{key}" in locales/../roadmap-page.json
export const allPhasesData: RoadmapPhase[] = [
  // --- FOUNDATION (Done) ---
  { id: 1, i18nKey: 'foundation.christmas', quarter: 'Q4 2024', startDate: '2024-12-24' },
  { id: 2, i18nKey: 'foundation.community', quarter: 'Q1 2025', startDate: '2025-01-01' },
  { id: 3, i18nKey: 'development.strategy', quarter: 'Q2 2025', startDate: '2025-04-01' },
  
  // --- EXECUTION (Coming Soon/Now) ---
  { id: 4, i18nKey: 'development.execution', quarter: 'Q3 2025', startDate: '2025-07-01' },

  // --- LAUNCH (Nov/Dec 2025) ---
  { id: 5, i18nKey: 'launch.game_start', quarter: 'Q4 2025', startDate: '2025-11-01' },
  { id: 6, i18nKey: 'launch.pierogi_power', quarter: 'Q1 2026', startDate: '2026-01-01' },

  // --- EXPANSION (2026) ---
  { id: 7, i18nKey: 'expansion.growth', quarter: 'Q2 2026', startDate: '2026-04-01' },
  { id: 8, i18nKey: 'expansion.second_game', quarter: 'Q4 2026', startDate: '2026-10-01' },
];
