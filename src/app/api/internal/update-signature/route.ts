// src/app/api/internal/update-signature/route.ts (for App Router)

export async function POST(req: Request) {
  const secret = process.env.HELUS_WEBHOOK_SECRET;

  if (!secret) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Server misconfiguration: missing HELUS_WEBHOOK_SECRET',
      }),
      { status: 500 }
    );
  }

  const body = await req.json();
  const { transactionId, signature } = body;

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/update-signature`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': secret,
      },
      body: JSON.stringify({ transactionId, signature }),
    });

    const result = await response.json();

    return new Response(JSON.stringify(result), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({
        success: false,
        error: message,
      }),
      { status: 500 }
    );
  }
}