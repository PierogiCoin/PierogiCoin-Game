import { useState, useEffect } from 'react';

export interface PresaleStatus {
  raisedUsd: number;
  bonusPct: number;
  nextTierUsd: number;
  currentStage: Record<string, unknown> | null;
}

export function usePresaleStatus() {
  const [status, setStatus] = useState<PresaleStatus>({
    raisedUsd: 0,
    bonusPct: 0,
    nextTierUsd: 0,
    currentStage: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch('/api/presale-status');
        if (!response.ok) throw new Error('Failed to fetch presale status');
        const data = await response.json();
        
        setStatus({
          raisedUsd: Number(data.raisedUsd || 0),
          bonusPct: Number(data.bonusPct || 0),
          nextTierUsd: Number(data.nextTierUsd || 0),
          currentStage: data.currentStage,
        });
        setLoading(false);
      } catch (err) {
        console.error('Error fetching presale status:', err);
        setError('Failed to load status');
        setLoading(false);
      }
    };

    fetchStatus();
    
    // Refresh every 60 seconds
    const interval = setInterval(fetchStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  return { status, loading, error };
}
