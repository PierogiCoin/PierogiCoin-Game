// src/lib/solanaConfig.ts
import { Connection, PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddressSync } from '@solana/spl-token';
import { env } from '@/env.mjs';

const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
export const connection = new Connection(SOLANA_RPC_URL, 'confirmed');

// Adresy mint tokenów USDC dla różnych sieci
export const SOLANA_DEVNET_USDC_MINT = new PublicKey('4zMMd9tFkC6bQ8gYv9mP7kG9D3bY6pL3rW8Y5s4a7sFz');
export const SOLANA_MAINNET_USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');

export const USDC_MINT_ADDRESS = env.NEXT_PUBLIC_SOLANA_NETWORK === 'mainnet-beta'
  ? SOLANA_MAINNET_USDC_MINT
  : SOLANA_DEVNET_USDC_MINT;

// Fallback to a valid PublicKey string (e.g. dummy or devnet address) to prevent crash
const DEFAULT_MINT = '4zMMd9tFkC6bQ8gYv9mP7kG9D3bY6pL3rW8Y5s4a7sFz'; // Default USDC devnet mint as placeholder
const PRG_TOKEN_MINT_ADDRESS = process.env.NEXT_PUBLIC_PRG_TOKEN_MINT_ADDRESS || DEFAULT_MINT;

export const TOKEN_MINT = new PublicKey(PRG_TOKEN_MINT_ADDRESS);

const DEFAULT_WALLET = 'So11111111111111111111111111111111111111112'; // Wrapped SOL as placeholder
const RECEIVE_WALLET = process.env.NEXT_PUBLIC_RECEIVE_WALLET || DEFAULT_WALLET;

export const payer = new PublicKey(RECEIVE_WALLET);
export const RECEIVE_WALLET_STRING = payer.toBase58();

export const payerATA = getAssociatedTokenAddressSync(TOKEN_MINT, payer);

const decimalsEnv = process.env.NEXT_PUBLIC_PRG_TOKEN_DECIMALS;
export const PRG_DECIMALS = (decimalsEnv && !isNaN(parseInt(decimalsEnv))) ? parseInt(decimalsEnv) : 9;

interface BonusLevel { minUSD: number; bonusPercent: number; }
export const bonusLevels: BonusLevel[] = [
  { minUSD: 1000, bonusPercent: 15 },
  { minUSD: 500, bonusPercent: 10 },
  { minUSD: 100, bonusPercent: 5 },
  { minUSD: 0, bonusPercent: 0 },
];
export const MANUAL_PAY_ADDRESSES = {
  SOL: process.env.NEXT_PUBLIC_MANUAL_PAY_SOL || RECEIVE_WALLET_STRING,
  USDC: process.env.NEXT_PUBLIC_MANUAL_PAY_USDC || RECEIVE_WALLET_STRING,
};