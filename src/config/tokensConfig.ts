// src/config/tokensConfig.ts

import { PublicKey } from '@solana/web3.js'; // Załóżmy, że będziesz używać PublicKey dla adresów

// --- Definicje Adresów Tokenów i Kont ---
// Pamiętaj, aby zastąpić te wartości rzeczywistymi adresami!

// USDC on Solana Mainnet (przykładowy, prawdziwy adres)
export const USDC_MINT_ADDRESS = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');

// PRG (PierogiCoin) token mint address
// ZASTĄP TO RZECZYWISTYM ADRESEM MINT TWOJEGO TOKENA PRG
export const PRG_MINT_ADDRESS = new PublicKey('TWOJ_PRG_MINT_ADDRESS_TUTAJ');

// Associated Token Account (ATA) for the project
// Może to być ATA projektu dla PRG lub inny ważny adres.
// ZASTĄP TO RZECZYWISTYM ADRESEM ATA
export const PROJECT_PRG_ATA = new PublicKey('TWOJ_PROJEKT_PRG_ATA_TUTAJ');

// Możesz dodać inne ważne adresy, np. adres skarbca, adres programu itp.
// export const TREASURY_ADDRESS = new PublicKey('...');

// --- Helpery ---

/**
 * Parses a stringified JSON array الناسخة a secret key into a Uint8Array.
 * The input string should be a JSON representation of an array of numbers.
 * Example input: "[10,20,30,...]"
 * @param secretKeyString The stringified secret key.
 * @returns Uint8Array representing the secret key.
 * @throws Error if the string is not a valid JSON array of numbers.
 */
export function parseSecretKeyFromString(secretKeyString: string): Uint8Array {
  try {
    // Parsujemy string JSON do tablicy liczb
    const byteArray = JSON.parse(secretKeyString); // UŻYWAMY secretKeyString

    // Sprawdzamy, czy wynik parsowania jest tablicą
    if (!Array.isArray(byteArray)) {
      throw new Error("Input string is not a valid JSON array.");
    }

    // Sprawdzamy, czy wszystkie elementy tablicy są liczbami
    if (!byteArray.every(item => typeof item === 'number')) {
      throw new Error("JSON array must contain only numbers.");
    }

    return Uint8Array.from(byteArray);
  } catch (error) { // ZMIENIONO 'e' na 'error' I JEST UŻYWANE
    console.error("Failed to parse secret key string:", error); // Logujemy oryginalny błąd
    throw new Error(`Invalid secret key format: ${(error as Error).message || 'Unknown parsing error'}`);
  }
}

// Jeśli masz klucz prywatny w formacie base58 (co jest częstsze dla Solana wallets),
// możesz potrzebować innej funkcji lub biblioteki (np. bs58) do jego sparsowania.
// Poniżej przykład, jeśli klucz jest w base58 i chcesz go sparsować do Uint8Array:
/*
import bs58 from 'bs58';

export function parseBase58SecretKey(secretKeyBase58: string): Uint8Array {
  try {
    return bs58.decode(secretKeyBase58);
  } catch (error) {
    console.error("Failed to parse base58 secret key:", error);
    throw new Error(`Invalid base58 secret key format: ${(error as Error).message}`);
  }
}
*/

// Inne konfiguracje specyficzne dla tokenów mogą być tu dodane
// np. dane do wyświetlania, metadane itp.

export interface TokenInfo {
  mintAddress: PublicKey;
  symbol: string;
  decimals: number;
  logoURI?: string; // opcjonalnie
}

export const TOKENS: Record<string, TokenInfo> = {
  USDC: {
    mintAddress: USDC_MINT_ADDRESS,
    symbol: 'USDC',
    decimals: 6, // Standardowe decimale dla USDC na Solanie
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png'
  },
  PRG: {
    mintAddress: PRG_MINT_ADDRESS,
    symbol: 'PRG',
    decimals: 9, // ZASTĄP RZECZYWISTĄ LICZBĄ DECIMALI TWOJEGO TOKENA PRG
    // logoURI: 'link_do_twojego_logo_prg.png' // Dodaj link do logo
  },
  // Możesz dodać więcej tokenów
};