import { useState, useEffect } from 'react';

interface FundStats {
  usdRaised: number;
  soldTokens: number;
  transactionCount: number;
  loading: boolean;
  error: string | null;
}

export const useFundStats = () => {
  const [stats, setStats] = useState<FundStats>({
    usdRaised: 0,
    soldTokens: 0,
    transactionCount: 0,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/get-sales-summary');
        if (!response.ok) throw new Error('Failed to fetch fund stats');
        const data = await response.json();
        
        setStats({
          usdRaised: data.usdRaised || 0,
          soldTokens: data.soldTokens || 0,
          transactionCount: data.transactionCount || 0,
          loading: false,
          error: null,
        });
      } catch (err) {
        console.error('Error fetching fund stats:', err);
        setStats(prev => ({ ...prev, loading: false, error: 'Failed to load stats' }));
      }
    };

    fetchStats();
    // Refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return stats;
};
