'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useMemo } from 'react';
import { differenceInSeconds } from 'date-fns';

// Ważne: Twój `getPresaleState` musi zwracać listę wszystkich etapów z bazy danych
import { getPresaleState } from '@/app/actions/presale';
import { getLiveCryptoPrices } from '@/app/actions/prices';

// --- DEFINICJE TYPÓW ---
interface CryptoPrices { SOL: number; USDC: number; }

// Zaktualizowany typ, aby odzwierciedlał dane z bazy
interface PresaleStage {
  id: number;
  name: string;
  is_active: boolean;
  current_price: number;
  bonus_pct: number;
  stage_ends_at: string;
}

interface PresaleContextState {
  dataFetchState: 'idle' | 'loading' | 'success' | 'error';
  fetchError: string | null;
  isBackgroundFetching: boolean;
  showConfetti: boolean;

  usdRaised: number;
  progressPercent: number;
  currentStage: PresaleStage | null;
  // Zaktualizowany typ, aby odzwierciedlał dane z bazy
  allStages: PresaleStage[] | null;

  nextPriceDisplayInfo: string | null;
  isPresaleActive: boolean;
  liveCryptoPrices: CryptoPrices | null;

  days: number;
  hours: number;
  minutes: number;
  seconds: number;

  presaleStatusMessageKey: string | null;

  retryFetch: () => void;
  setShowConfetti: (show: boolean) => void;
  refreshData: () => Promise<void>;
}

const PresaleContext = createContext<PresaleContextState | undefined>(undefined);

export const PresaleProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState({
    usdRaised: 0,
    currentStage: null as PresaleStage | null,
    liveCryptoPrices: null as CryptoPrices | null,
    isPresaleActive: false,
    progressPercent: 0,
    allStages: null as PresaleStage[] | null,
    nextPriceDisplayInfo: null as string | null,
  });

  const [uiState, setUiState] = useState({
    dataFetchState: 'idle' as 'idle' | 'loading' | 'success' | 'error',
    fetchError: null as string | null,
    isBackgroundFetching: false,
    showConfetti: false,
  });

  const [secondsLeft, setSecondsLeft] = useState<number>(0);

  const fetchData = useCallback(async (isBackgroundUpdate = false) => {
    if (!isBackgroundUpdate) {
      setUiState(prev => ({ ...prev, dataFetchState: 'loading' }));
    } else {
      setUiState(prev => ({ ...prev, isBackgroundFetching: true }));
    }

    try {
      // Zmieniono: Zakładamy, że getPresaleState zwraca wszystkie dane o etapach
      const [serverData, pricesData] = await Promise.all([getPresaleState(), getLiveCryptoPrices()]);
      if (serverData.error) throw new Error(serverData.error);

      // Zmieniono: Wykorzystujemy wszystkie etapy z bazy danych
      const { usdRaised, allStages } = serverData;
      const presaleGoal = 15000; // FOCUS ON AUDIT GOAL
      const progress = usdRaised > 0 ? (usdRaised / presaleGoal) * 100 : 0;

      const currentStage = allStages?.find((stage: PresaleStage) => stage.is_active) || null;

      let nextPriceInfo: string | null = null;
      if (currentStage && allStages) {
        const currentIndex = allStages.findIndex((s: PresaleStage) => s.id === currentStage.id);
        if (currentIndex !== -1 && currentIndex < allStages.length - 1) {
          const nextStage = allStages[currentIndex + 1];
          const priceFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 5 });
          nextPriceInfo = priceFormatter.format(nextStage.current_price);
        }
      }

      setData({
        usdRaised,
        currentStage,
        liveCryptoPrices: pricesData,
        isPresaleActive: !!currentStage,
        progressPercent: progress,
        allStages,
        nextPriceDisplayInfo: nextPriceInfo
      });

      if (currentStage?.stage_ends_at) {
        setSecondsLeft(differenceInSeconds(new Date(currentStage.stage_ends_at), new Date()));
      }
      setUiState(prev => ({ ...prev, dataFetchState: 'success', isBackgroundFetching: false }));

    } catch (error) {
      setUiState(prev => ({ ...prev, dataFetchState: 'error', fetchError: (error instanceof Error ? error.message : 'Wystąpił nieznany błąd.'), isBackgroundFetching: false }));
    }
  }, []);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => { setSecondsLeft(prev => (prev > 0 ? prev - 1 : 0)); }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(true), 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const retryFetch = useCallback(() => { fetchData(); }, [fetchData]);
  const setShowConfetti = useCallback((show: boolean) => setUiState(prev => ({ ...prev, showConfetti: show })), []);
  const refreshData = useCallback(async () => { await fetchData(true); }, [fetchData]);

  const timeValues = useMemo(() => {
    const d = Math.floor(secondsLeft / (3600 * 24));
    const h = Math.floor((secondsLeft % (3600 * 24)) / 3600);
    const m = Math.floor((secondsLeft % 3600) / 60);
    const s = Math.floor(secondsLeft % 60);
    return { d, h, m, s };
  }, [secondsLeft]);

  const value: PresaleContextState = {
    ...data, ...uiState,
    days: timeValues.d, hours: timeValues.h, minutes: timeValues.m, seconds: timeValues.s,
    retryFetch, setShowConfetti, refreshData,
    presaleStatusMessageKey: data.isPresaleActive ? 'presale.status_active' : 'presale.status_ended',
  };

  return (
    <PresaleContext.Provider value={value}>
      {children}
    </PresaleContext.Provider>
  );
};

export const usePresale = () => {
  const context = useContext(PresaleContext);
  if (context === undefined) {
    throw new Error('usePresale must be used within a PresaleProvider');
  }
  return context;
};