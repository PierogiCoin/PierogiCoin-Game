// Plik: src/data/tokenomicsData.tsx
// WAŻNE: Upewnij się, że nazwa tego pliku kończy się na .tsx
'use client';

import React from 'react';
import { FiShoppingCart, FiDroplet, FiUsers, FiBriefcase, FiZap, FiDatabase } from 'react-icons/fi';

export const MAX_SUPPLY = 7373000000;

// Główny interfejs, który będzie używany w komponencie TokenomicsSection
export interface TokenomicSegment {
  id: string;
  icon: React.ReactNode;
  titleKey: string;
  descriptionKey: string;
  numericPercentage: number;
  color: string;
  hoverColor: string;
  details: {
    rawAmount: number; // To pole jest dodawane dynamicznie w komponencie
    vestingKey: string;
    purposeKey: string;
  };
}

// Typ dla surowych danych w tym pliku
export type TokenomicsRawData = {
  id: string;
  icon: React.ReactNode;
  titleKey: string;
  descriptionKey: string;
  numericPercentage: number;
  color: string;
  hoverColor: string;
}[];

// Dane - Zaktualizowana paleta Gold + Cyber
export const tokenomicsRawData: TokenomicsRawData = [
  { id: 'presale', icon: <FiShoppingCart />, titleKey: 'segments.presale.name', descriptionKey: 'segments.presale.description', numericPercentage: 40, color: '#FBBF24', hoverColor: '#F59E0B' }, // Gold
  { id: 'liquidity', icon: <FiDroplet />, titleKey: 'segments.liquidity.name', descriptionKey: 'segments.liquidity.description', numericPercentage: 15, color: '#06B6D4', hoverColor: '#0891B2' }, // Cyber Cyan
  { id: 'game_rewards', icon: <FiUsers />, titleKey: 'segments.game_rewards.name', descriptionKey: 'segments.game_rewards.description', numericPercentage: 5, color: '#22D3EE', hoverColor: '#06B6D4' }, // Light Cyber
  { id: 'team', icon: <FiBriefcase />, titleKey: 'segments.team.name', descriptionKey: 'segments.team.description', numericPercentage: 10, color: '#D97706', hoverColor: '#B45309' }, // Deep Gold/Bronze
  { id: 'marketing', icon: <FiZap />, titleKey: 'segments.marketing.name', descriptionKey: 'segments.marketing.description', numericPercentage: 8, color: '#38BDF8', hoverColor: '#0EA5E9' }, // Sky Blue
  { id: 'ecosystem', icon: <FiDatabase />, titleKey: 'segments.ecosystem.name', descriptionKey: 'segments.ecosystem.description', numericPercentage: 12, color: '#0891B2', hoverColor: '#0E7490' }, // Deep Cyan
  { id: 'staking', icon: <FiDatabase />, titleKey: 'segments.staking.name', descriptionKey: 'segments.staking.description', numericPercentage: 10, color: '#F59E0B', hoverColor: '#D97706' }, // Amber
];