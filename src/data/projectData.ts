export const PROJECT_STATS = {
  // Funding
  currentFund: 0,
  targetFund: 15000,
  
  // Players/Community
  activePlayers: 150,
  telegramMembers: 12500,
  
  // Tokenomics (Live values simulation)
  prgEarnedToday: 28500000,
  burnedTokens: 12450000, // Deflationary feature
  
  // Dates
  launchDate: '2026-03-31',
  auditDeadline: '2025-12-31'
};

export const getProgressPercentage = () => {
    return Math.min((PROJECT_STATS.currentFund / PROJECT_STATS.targetFund) * 100, 100).toFixed(1);
};
