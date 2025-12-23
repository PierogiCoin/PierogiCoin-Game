import { useState, useEffect } from 'react';
import { ActivityEvent } from '@/app/api/game-events/route';

export const useGameEvents = (limit: number = 20) => {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch(`/api/game-events?limit=${limit}`);
        if (!res.ok) return;
        const data = await res.json();
        setEvents(data.events || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching game events:', err);
        setLoading(false);
      }
    };

    fetchEvents();
    const interval = setInterval(fetchEvents, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, []);

  return { events, loading };
};
