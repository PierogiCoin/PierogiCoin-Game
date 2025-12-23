// Plik: src/app/actions/prices.ts
'use server';

// Importujemy niestabilne cachowanie, aby wyniki były świeże, ale nie przy każdym wywołaniu
import { unstable_cache as cache } from 'next/cache';

// Funkcja będzie cachowana przez 60 sekund, aby uniknąć nadużywania API CoinGecko
export const getLiveCryptoPrices = cache(
  async () => {
    console.log('[PRICES ACTION] Pobieranie aktualnych cen...');
    try {
      // ID dla Solany i USDC w API CoinGecko
      const ids = 'solana,usd-coin';
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Błąd API CoinGecko: ${response.statusText}`);
      }

      const data = await response.json();

      // Zwracamy obiekt w formacie, którego oczekuje nasz front-end
      return {
        SOL: data.solana.usd,
        USDC: data['usd-coin'].usd, // Klucz zawiera myślnik, więc używamy nawiasów kwadratowych
      };

    } catch (error) {
      console.error("Nie udało się pobrać cen krypto:", error);
      // W razie błędu, zwróćmy ostatnie znane (lub domyślne) ceny, aby aplikacja nie padła
      return { SOL: 165.00, USDC: 1.00 };
    }
  },
  ['crypto-prices'], // Klucz cache'a
  { revalidate: 60 } // Czas życia cache'a w sekundach (1 minuta)
);