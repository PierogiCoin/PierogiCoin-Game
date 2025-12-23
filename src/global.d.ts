// Plik: src/global.d.ts

// --- POPRAWKA: Zastępujemy 'any' bardziej bezpiecznymi typami ---

// Typ dla dostawcy portfela zgodnego z EIP-1193 (np. MetaMask)
interface EIP1193Provider {
  isMetaMask?: boolean;
  // request może przyjmować różne parametry, więc używamy `unknown[]`
  request: (request: { method: string; params?: unknown[] }) => Promise<unknown>;
  // Listenery również mogą przyjmować różne argumenty
  on: (event: string, listener: (...args: unknown[]) => void) => void;
  removeListener: (event: string, listener: (...args: unknown[]) => void) => void;
}

// Typ dla efektu Vanta
interface VantaEffect {
  destroy: () => void;
}

// Typ dla obiektu z opcjami dla Vanta
type VantaOptions = Record<string, unknown>;

// Typ dla głównego obiektu VANTA, który jest konstruktorem
type VantaConstructor = (options: VantaOptions) => VantaEffect;

// Rozszerzamy globalny interfejs Window
declare global {
  interface Window {
    // Portfel Ethereum (np. MetaMask)
    ethereum?: EIP1193Provider;

    // Obiekt Vanta, który jest mapą stringów (nazw efektów) na konstruktory
    VANTA?: Record<string, VantaConstructor>;

    // Biblioteka THREE.js
    // Jeśli nie masz @types/three, pozostawienie 'any' i wyłączenie reguły lintera
    // jest akceptowalnym kompromisem.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    THREE?: any;
  }
}

// Ten eksport jest potrzebny, aby TypeScript traktował ten plik jako moduł
export {};