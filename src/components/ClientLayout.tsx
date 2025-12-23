// src/components/ClientLayout.tsx
'use client';

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SocialProofToasts from './SocialProofToasts';

import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { SolflareWalletAdapter }
  from '@solana/wallet-adapter-solflare';

import type { Resource } from 'i18next';

import { PresaleProvider } from '@/context/PresaleContext';
import TranslationsProvider from './Providers/TranslationsProvider';
import Navigation from './Navigation';
import ModernBackground from './Backgrounds/ModernBackground';

const AppFooter = dynamic(() => import('./AppFooter'), { ssr: false });
const CookieBanner = dynamic(() => import('./CookieBanner'), { ssr: false });
const ScrollProgressBar = dynamic(() => import('./ScrollProgressBar'), { ssr: false });
const FloatingCTA = dynamic(() => import('./FloatingCTA'), { ssr: false });
const ScrollToTopButton = dynamic(() => import('./ScrollToTopButton'), { ssr: false });

interface ClientLayoutProps {
  children: React.ReactNode;
  locale: string;
  namespaces: string[];
  resources: Resource;
}

// Twarde sprawdzenie klucza – disabled for dev safety
if (!process.env.NEXT_PUBLIC_HELIUS_API_KEY) {
  console.warn('NEXT_PUBLIC_HELIUS_API_KEY is missing. RPC functionality may be limited.');
}

export default function ClientLayout({
  children,
  locale,
  namespaces,
  resources,
}: ClientLayoutProps) {
  // pathname and reduce removed as they are unused by ModernBackground

  // --- Solana / Helius (Mainnet) ---
  const network = WalletAdapterNetwork.Mainnet;
  const endpoint = useMemo(() => {
    const apiKey = process.env.NEXT_PUBLIC_HELIUS_API_KEY!;
    return `https://mainnet.helius-rpc.com/?api-key=${apiKey}`;
  }, []);
  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter({ network })],
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {/* KLUCZ po locale -> wymusza remount providera i odświeżenie napisów */}
          <TranslationsProvider key={locale} locale={locale} namespaces={namespaces} resources={resources}>
            <PresaleProvider>

              {/* New Global Modern Background */}
              <ModernBackground />

              <ScrollProgressBar />

              <div className="relative z-0 flex flex-col min-h-screen">
                {/* Navigation is fixed, so we render it directly */}
                <Navigation key={locale} />

                {/* Add top padding to main so content starts below the fixed nav */}
                <main className="flex-grow relative z-10 pt-24">{children}</main>

                <div className="relative z-20">
                  <AppFooter />
                </div>
              </div>

              <CookieBanner />
              <FloatingCTA />
              <ScrollToTopButton />

              <SocialProofToasts />
              <ToastContainer position="bottom-right" autoClose={5000} theme="dark" limit={3} pauseOnFocusLoss={false} />
            </PresaleProvider>
          </TranslationsProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}