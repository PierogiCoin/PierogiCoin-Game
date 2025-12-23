function requiredEnv(name: string): string {
    const value = process.env[name];
    if (!value || value.trim() === '') {
      throw new Error(`Missing environment variable: ${name}`);
    }
    return value;
  }
  
  // Centralized environment configuration with early validation.
  export const ENV = {
    // 🔐 Prywatne
    SOLANA_PRIVATE_KEY: requiredEnv('SOLANA_PRIVATE_KEY'),
    SUPABASE_SERVICE_ROLE_KEY: requiredEnv('SUPABASE_SERVICE_ROLE_KEY'),
    SUPABASE_URL: requiredEnv('NEXT_PUBLIC_SUPABASE_URL'),
  
    // 🌐 Publiczne (mainnet)
    RPC_URL:
      process.env.NEXT_PUBLIC_RPC_URL ||
      'https://solana-mainnet.g.alchemy.com/v2/a30ctyvdP2cqN4hs689YzjPTmkbeCuW8',
    PRG_MINT: requiredEnv('NEXT_PUBLIC_TOKEN_MINT'), // Upewnij się, że to jest MINT z mainnetu!
    PRG_DECIMALS: parseInt(process.env.NEXT_PUBLIC_TOKEN_DECIMALS || '9', 10),
    PRG_PRICE_IN_USD: parseFloat(
      process.env.NEXT_PUBLIC_PRG_PRICE_IN_USD || '0.00005000',
    ),
  
    // 🔑 Wymagane sekrety aplikacji
    PRG_TOKEN_MINT_ADDRESS: requiredEnv('PRG_TOKEN_MINT_ADDRESS'),
    TOKEN_SENDER_SECRET_KEY: requiredEnv('TOKEN_SENDER_SECRET_KEY'),
    WORKER_SECRET: requiredEnv('WORKER_SECRET'),
  };
  