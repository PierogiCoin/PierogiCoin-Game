"use client"; // <-- KLUCZOWA DYREKTYWA

import React, { ReactNode } from 'react';

// W przyszłości możesz tutaj umieścić wszystkie swoje providery,
// np. dla react-query, Redux, Solana Wallet Adapter, etc.

// Na razie ten komponent po prostu renderuje swoje dzieci.
// Jego głównym zadaniem jest bycie "granicą" między serwerem a klientem.
export function ClientProviders({ children }: { children: ReactNode }) {
  // Wszelka logika kliencka, hooki itp. mogłyby być tutaj.
  // Na przykład, jeśli potrzebujesz `useState` na poziomie globalnym.
  
  return <>{children}</>;
}