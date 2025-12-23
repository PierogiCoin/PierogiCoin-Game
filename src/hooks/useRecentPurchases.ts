import { useState, useEffect } from 'react';

export interface Purchase {
  id: string | number;
  buyer: string;
  amountUSD: number;
  tokens: number;
  txSignature?: string;
  createdAt: string;
}

export const useRecentPurchases = (limit: number = 20) => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const res = await fetch(`/api/recent-purchases?limit=${limit}`);
        if (!res.ok) throw new Error('Failed to fetch purchases');
        const data = await res.json();
        setPurchases(data.items || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching recent purchases:', err);
        setError('Failed to load leaderboard');
        setLoading(false);
      }
    };

    fetchPurchases();
    const interval = setInterval(fetchPurchases, 15000); // Update every 15s
    return () => clearInterval(interval);
  }, [limit]);

  return { purchases, loading, error };
};
