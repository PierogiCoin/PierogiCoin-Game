'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { toast } from 'react-toastify';
import { ShoppingCart, Users, Trophy, Zap, Shield } from 'lucide-react';

interface ActivityEvent {
    id: string;
    type: 'purchase' | 'achievement' | 'rare_drop' | 'level_up' | 'raid_win' | 'guild_join';
    user: string;
    description: string;
    value?: string;
    timestamp: string;
}

const LOCATIONS = [
    'Warsaw, PL', 'Krakow, PL', 'London, UK', 'New York, USA',
    'Berlin, DE', 'Gdansk, PL', 'Paris, FR', 'Wroclaw, PL',
    'Toronto, CA', 'Poznan, PL', 'Dubai, UAE', 'Chicago, USA',
    'Tokyo, JP', 'Seoul, KR', 'Madrid, ES', 'Rome, IT'
];

export default function SocialProofToasts() {
    const [events, setEvents] = useState<ActivityEvent[]>([]);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const eventsRef = useRef<ActivityEvent[]>([]);

    const fetchEvents = useCallback(async () => {
        try {
            const res = await fetch('/api/game-events');
            if (res.ok) {
                const data = await res.json();
                const fetchedEvents = data.events || [];
                setEvents(fetchedEvents);
                eventsRef.current = fetchedEvents;
            }
        } catch (error) {
            console.error('Error fetching social proof events:', error);
        }
    }, []);

    const triggerToast = useCallback(() => {
        const currentEvents = eventsRef.current;
        if (currentEvents.length === 0) return;

        // Pick a random event, but weight towards newer ones
        // (already sorted by API, so we can pick from top half)
        const randomIndex = Math.floor(Math.random() * Math.min(currentEvents.length, 10));
        const event = currentEvents[randomIndex];
        const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];

        let title = '';
        let message = '';
        let icon = <Users size={18} className="text-blue-400" />;

        switch (event.type) {
            case 'purchase':
                title = 'Live Purchase! 🥟';
                message = `${event.user} from ${location} contributed ${event.value || 'to Audit'}`;
                icon = <ShoppingCart size={18} className="text-green-400" />;
                break;
            case 'achievement':
                title = 'Player Achievement! 🏆';
                message = `${event.user} ${event.description}`;
                icon = <Trophy size={18} className="text-gold-400" />;
                break;
            case 'level_up':
                title = 'Level Up! ⚡';
                message = `${event.user} just reached ${event.description}`;
                icon = <Zap size={18} className="text-amber-400" />;
                break;
            case 'rare_drop':
                title = 'Rare Drop! 💎';
                message = `${event.user} found a ${event.description.replace('Found: ', '')}`;
                icon = <Shield size={18} className="text-purple-400" />;
                break;
            case 'raid_win':
                title = 'Raid Victory! 🔥';
                message = `${event.user} and their guild ${event.description}`;
                icon = <Users size={18} className="text-red-400" />;
                break;
            default:
                title = 'New Activity 💪';
                message = `${event.user} is active in the presale!`;
                icon = <Users size={18} className="text-blue-400" />;
        }

        toast(
            <div className="flex items-start gap-3">
                <div className="mt-1 p-1 bg-white/10 rounded-full shrink-0">
                    {icon}
                </div>
                <div>
                    <h4 className="font-bold text-sm text-gold-400">{title}</h4>
                    <p className="text-xs text-gray-300 leading-tight">{message}</p>
                </div>
            </div>,
            {
                position: 'bottom-left',
                autoClose: 6000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                style: {
                    background: 'rgba(10, 10, 18, 0.95)',
                    border: '1px solid rgba(251, 191, 36, 0.3)',
                    backdropFilter: 'blur(12px)',
                    color: '#fff',
                    borderRadius: '16px',
                    boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)'
                }
            }
        );
    }, []);

    const scheduleNextToast = useCallback(() => {
        // Random delay between 20s and 60s to not be too annoying
        const delay = Math.floor(Math.random() * (60000 - 20000) + 20000);

        timeoutRef.current = setTimeout(() => {
            triggerToast();
            scheduleNextToast();
        }, delay);
    }, [triggerToast]);

    useEffect(() => {
        fetchEvents();

        // Initial toast after 8 seconds
        const initialTimer = setTimeout(triggerToast, 8000);

        // Start loop
        scheduleNextToast();

        // Refresh events every 2 minutes
        const refreshInterval = setInterval(fetchEvents, 120000);

        return () => {
            clearTimeout(initialTimer);
            clearInterval(refreshInterval);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [scheduleNextToast, triggerToast, fetchEvents]);

    return null;
}

