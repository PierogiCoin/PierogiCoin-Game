
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

// Lazy init
const getStripe = () => new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia' as any,
});

const ITEMS: Record<string, { priceId?: string; amount: number; name: string }> = {
    'founder_tier_1': { amount: 4999, name: 'Founder Initiate Pack' }, // $49.99
    'founder_tier_2': { amount: 14999, name: 'Founder Visionary Pack' }, // $149.99
    'founder_tier_3': { amount: 49999, name: 'Genesis Legend Pack' }, // $499.99
    'prg_stars_s': { amount: 99, name: '50 Gems' },
    'prg_stars_m': { amount: 499, name: 'Season Pass Bundle' }, // Example mapping
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { itemId, userId } = body;

    if (!itemId || !ITEMS[itemId]) {
      return NextResponse.json({ error: 'Invalid item' }, { status: 400 });
    }

    if (!userId) {
        return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    const item = ITEMS[itemId];
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    // Success URL redirects back to the game (assuming hosted at /teleprg or root)
    const successUrl = `${appUrl}/teleprg?payment_success=true&item_id=${itemId}`;
    const cancelUrl = `${appUrl}/teleprg?payment_cancelled=true`;

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: item.name,
              images: ['https://pierogimeme.io/images/logo.png'],
            },
            unit_amount: item.amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId: userId,
        itemId: itemId,
        type: 'game_item', // Distinguish from token presale
      },
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error: any) {
    console.error('Create Stripe Session Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
