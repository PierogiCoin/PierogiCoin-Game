// src/hooks/usePresaleTimer.ts
'use client';

import { useState, useEffect, useCallback } from 'react';

// Definicja typów dla propsów przyjmowanych przez hook
interface UsePresaleTimerProps {
  endDateString: string;
  currentUsdRaised: number;
  presaleGoalUsd: number;
  soldTokens: number;
  totalTokensForPresale: number;
  isLoading: boolean;
  // Opcjonalne callbacki, które mogą być wywołane po zakończeniu
  onTimerEnd?: () => void;
  onGoalReached?: () => void;
  onTokensSoldOut?: () => void;
}

// Definicja typów dla wartości zwracanych przez hook
interface UsePresaleTimerReturn {
  timeLeft: string;
  isPresaleActive: boolean;
  presaleStatusMessageKey: string;
}

export function usePresaleTimer({
  endDateString,
  currentUsdRaised,
  presaleGoalUsd,
  soldTokens,
  totalTokensForPresale,
  isLoading,
  onTimerEnd,
  onGoalReached,
  onTokensSoldOut,
}: UsePresaleTimerProps): UsePresaleTimerReturn {
  const [timeLeft, setTimeLeft] = useState<string>('--d --h --m --s');
  const [isPresaleActive, setIsPresaleActive] = useState<boolean>(true);
  const [presaleStatusMessageKey, setPresaleStatusMessageKey] = useState<string>('presale_active');

  const calculateTimeLeft = useCallback(() => {
    const presaleEndDate = new Date(endDateString).getTime();
    const now = new Date().getTime();
    const distance = presaleEndDate - now;

    // Sprawdzanie warunków zakończenia przedsprzedaży
    if (isLoading) {
      // Jeśli dane się ładują, nie aktualizuj statusu
      return;
    }
    
    if (presaleGoalUsd > 0 && currentUsdRaised >= presaleGoalUsd) {
      setIsPresaleActive(false);
      setPresaleStatusMessageKey('presale_ended_goal_reached');
      setTimeLeft('00d 00h 00m 00s');
      onGoalReached?.();
      return;
    }

    if (totalTokensForPresale > 0 && soldTokens >= totalTokensForPresale) {
        setIsPresaleActive(false);
        setPresaleStatusMessageKey('presale_ended_sold_out');
        setTimeLeft('00d 00h 00m 00s');
        onTokensSoldOut?.();
        return;
    }

    if (distance < 0) {
      setIsPresaleActive(false);
      setPresaleStatusMessageKey('presale_ended_time_up');
      setTimeLeft('00d 00h 00m 00s');
      onTimerEnd?.();
      return;
    }

    // Jeśli żaden warunek nie jest spełniony, przedsprzedaż jest aktywna
    setIsPresaleActive(true);
    setPresaleStatusMessageKey('presale_active');

    // Obliczanie pozostałego czasu
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Formatowanie stringa
    const formattedTime = 
      `${String(days).padStart(2, '0')}d ` +
      `${String(hours).padStart(2, '0')}h ` +
      `${String(minutes).padStart(2, '0')}m ` +
      `${String(seconds).padStart(2, '0')}s`;

    setTimeLeft(formattedTime);
  }, [
    endDateString, currentUsdRaised, presaleGoalUsd, soldTokens, totalTokensForPresale,
    isLoading, onTimerEnd, onGoalReached, onTokensSoldOut
  ]);

  useEffect(() => {
    // Uruchom funkcję od razu, żeby nie było opóźnienia o 1 sekundę
    calculateTimeLeft();

    // Ustaw interwał, który będzie aktualizował czas co sekundę
    const timerInterval = setInterval(calculateTimeLeft, 1000);

    // Funkcja czyszcząca, która zatrzyma interwał, gdy komponent zostanie odmontowany
    return () => clearInterval(timerInterval);
  }, [calculateTimeLeft]); // Zależność od `calculateTimeLeft`

  return { timeLeft, isPresaleActive, presaleStatusMessageKey };
}