import { NextResponse } from 'next/server';
import { Connection, Keypair } from '@solana/web3.js';

// Avoid static evaluation during build
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

export async function GET() {
  try {
    const secret = process.env.TOKEN_SENDER_SECRET_KEY;
    if (!secret) {
      return NextResponse.json({ error: 'Missing TOKEN_SENDER_SECRET_KEY' }, { status: 500 });
    }

    // Expecting secret as JSON array (Uint8Array). If base58, we can add decoding.
    const secretKey = Uint8Array.from(JSON.parse(secret));
    const keypair = Keypair.fromSecretKey(secretKey);

    const rpc = process.env.SOLANA_RPC || 'https://api.mainnet-beta.solana.com';
    const connection = new Connection(rpc);

    const balanceLamports = await connection.getBalance(keypair.publicKey);
    const balanceSOL = balanceLamports / 1e9;

    return NextResponse.json({ wallet: keypair.publicKey.toBase58(), balanceSOL });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: 'Błąd pobierania salda', details: message },
      { status: 500 }
    );
  }
}