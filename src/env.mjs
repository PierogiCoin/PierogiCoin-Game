import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  // Definiowanie zmiennych po stronie serwera
  server: {
    DATABASE_URL: z.string().optional(),
  },

  // Definiowanie zmiennych po stronie klienta
  // Należy je poprzedzić prefiksem NEXT_PUBLIC_
  client: {
    NEXT_PUBLIC_SOLANA_NETWORK: z.string().default('devnet'),
  },

  // Łączenie zmiennych środowiskowych
  // Next.js automatycznie łączy je z process.env
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NEXT_PUBLIC_SOLANA_NETWORK: process.env.NEXT_PUBLIC_SOLANA_NETWORK,
  },
});