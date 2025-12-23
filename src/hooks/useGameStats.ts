import { useState, useEffect } from 'react';

export interface GameStats {
  activePlayers: number;
  totalEarned: number;
  gamesPlayed: number;
  topScore: number;
}

export function useGameStats() {
  const [stats, setStats] = useState<GameStats>({
    activePlayers: 0,
    totalEarned: 0,
    gamesPlayed: 0,
    topScore: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/game-stats');
        if (!response.ok) throw new Error('Failed to fetch stats');
        const data = await response.json();
        setStats({
          activePlayers: data.activePlayers,
          totalEarned: data.totalEarned,
          gamesPlayed: data.gamesPlayed,
          topScore: data.topScore,
        });
        setLoading(false);
      } catch (err) {
        console.error('Error fetching game stats:', err);
        setError('Failed to load stats');
        setLoading(false);
      }
    };

    fetchStats();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return { stats, loading, error };
}
