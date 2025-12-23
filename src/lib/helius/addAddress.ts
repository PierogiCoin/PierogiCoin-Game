// src/lib/helius/addAddress.ts

const HELIUS_API_KEY = process.env.HELIUS_API_KEY!;
const HELIUS_WEBHOOK_ID = process.env.HELIUS_WEBHOOK_ID!;

function withTimeout(ms: number) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  return { signal: ctrl.signal, done: () => clearTimeout(t) };
}

export default async function addAddress(address: string): Promise<boolean> {
  try {
    if (!HELIUS_API_KEY || !HELIUS_WEBHOOK_ID) {
      console.warn('[Helius addAddress] Missing env, skipping.');
      return false;
    }

    // GET: sprawdź czy już istnieje
    {
      const t = withTimeout(5000);
      const res = await fetch(
        `https://api.helius.xyz/v0/webhooks/${HELIUS_WEBHOOK_ID}?api-key=${HELIUS_API_KEY}`,
        { method: 'GET', cache: 'no-store', signal: t.signal }
      ).finally(t.done);
      if (!res.ok) {
        console.warn(`[Helius addAddress] Webhook not found (GET ${res.status}): ${address}`);
      } else {
        const json = await res.json();
        const exists = Array.isArray(json?.accountAddresses) && json.accountAddresses.includes(address);
        if (exists) return true;
      }
    }

    // PATCH: dopisz adres
    const t2 = withTimeout(5000);
    const res2 = await fetch(
      `https://api.helius.xyz/v0/webhooks/${HELIUS_WEBHOOK_ID}?api-key=${HELIUS_API_KEY}`,
      {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ accountAddresses: [address], webhookType: 'enhanced' }),
        signal: t2.signal,
      }
    ).finally(t2.done);

    if (!res2.ok) {
      const txt = await res2.text().catch(() => '');
      console.error('[Helius addAddress] PATCH failed:', res2.status, txt);
      return false;
    }
    return true;
  } catch (e) {
    console.error('[Helius addAddress] Unexpected error:', e);
    return false;
  }
}