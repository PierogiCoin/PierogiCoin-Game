
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

// Lazy init
const getStripe = () => new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

// Helper: Calculate Token Amount based on USD
const BASE_RATE_PER_USD = 25000;
const calculateTotalTokens = (amountUSD: number) => {
  // Simple logic: Base + Bonus. 
  // We can replicate frontend logic accurately or just trust the basics.
  // For simplicity here, we stick to base rate + static bonus estimation or just store the USD value 
  // and let the webhook finalize the token calculation to ensure consistency.
  // However, metadata is useful.
  
  let bonusPct = 0;
  // Flat 5% bonus for $100+ as per Audit Fund rules
  if (amountUSD >= 100) bonusPct = 5;

  // Add stage bonus (estimate or fetch - fetching might be slow/complex here, maybe pass from frontend?)
  // For now we will rely on 'amountUSD' being the source of truth for the webhook to calculate credentials.
  
  const baseTokens = amountUSD * BASE_RATE_PER_USD;
  const totalTokens = Math.floor(baseTokens * (1 + bonusPct / 100));
  return totalTokens;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amountUSD, walletAddress, productType, referrer, metadata: extraMetadata, successUrl, cancelUrl } = body;

    if (!amountUSD || amountUSD < 1) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('Missing STRIPE_SECRET_KEY');
      return NextResponse.json({ error: 'Server misconfiguration: Stripe key missing' }, { status: 500 });
    }

    // Determine Product Details
    let productName = 'PRG Tokens';
    let productDescription = `Purchase of $PRG Tokens worth $${amountUSD}`;
    const mode: Stripe.Checkout.SessionCreateParams.Mode = 'payment';

    if (productType === 'coffee') {
      productName = 'Support / Coffee';
      productDescription = 'Donation to PierogiCoin Audit Fund';
    } else if (productType === 'game_item') {
      productName = extraMetadata?.itemName || 'Game Item';
      productDescription = extraMetadata?.itemDescription || 'In-game item purchase';
    }


    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: productName,
              description: productDescription,
              images: ['https://pierogimeme.io/images/logo.png'], // Replace with actual logo URL if available
            },
            unit_amount: Math.round(amountUSD * 100), // cents
          },
          quantity: 1,
        },
      ],
      mode: mode,
      success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/buy-tokens?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/buy-tokens?canceled=true`,
      metadata: {
        walletAddress: walletAddress || '',
        amountUSD: amountUSD.toString(),
        productType: productType || 'token',
        referrer: referrer || '',
        ...extraMetadata,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe Checkout Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
