
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// Lazy init
const getStripe = () => new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

// Initialize Supabase Admin Client for recording transactions
// Use fallbacks to prevent build-time crashes if env vars are missing
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function POST(req: Request) {
  if (!webhookSecret) {
    console.error('Missing STRIPE_WEBHOOK_SECRET');
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
  }

  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  let event: Stripe.Event;

  try {
    if (!signature) throw new Error('Missing stripe-signature header');
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`⚠️  Webhook signature verification failed.`, err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    // Extract metadata
    const { walletAddress, amountUSD, productType, referrer } = session.metadata || {};
    const transactionId = session.payment_intent as string || session.id;

    console.log(`[Stripe Webhook] Payment succeeded for ${productType}. ID: ${transactionId}`);

    if (productType === 'token' && walletAddress && amountUSD) {
       // Logic to record purchase in Supabase
       
       // Calculate tokens again to be safe
       const usdVal = parseFloat(amountUSD);
       const BASE_RATE = 25000;
       
       // Recalculate bonus logic
       // Recalculate bonus logic
       let bonusPct = 0;
       // Flat 5% bonus for $100+ as per Audit Fund rules
       if (usdVal >= 100) bonusPct += 5;
       
       if (referrer) bonusPct += 2; // +2% for utilizando a referral link

       const baseTokens = usdVal * BASE_RATE;
       const bonusTokens = Math.floor((baseTokens * bonusPct) / 100);
       const totalTokens = baseTokens + bonusTokens;

       try {
         const { error } = await supabaseAdmin.from('purchases').insert({
            buyer_wallet: walletAddress,
            transaction_signature: transactionId,
            usd_amount: usdVal,
            tokens_to_credit: totalTokens,
            status: 'success',
            crypto_type: 'CARD',
            project_tag: 'PRG',
            referrer_address: referrer || null,
            metadata: {
                source: 'stripe',
                session_id: session.id,
                bonus_percent: bonusPct
            }
         });

         if (error) {
            console.error('[Stripe Webhook] Failed to insert purchase:', error);
            return NextResponse.json({ error: 'Database insert failed' }, { status: 500 });
         }

         console.log(`[Stripe Webhook] Purchase recorded: ${totalTokens} PRG to ${walletAddress}`);

       } catch (dbError) {
         console.error('[Stripe Webhook] Database error:', dbError);
         return NextResponse.json({ error: 'Database exception' }, { status: 500 });
       }
    } else if (productType === 'game_item' && session.metadata?.userId && session.metadata?.itemId) {
         const { userId, itemId } = session.metadata;
         console.log(`[Stripe Webhook] Game Item Purchase: ${itemId} for user ${userId}`);

         // Determine Founder Tier
         let founderTier = 0;
         if (itemId === 'founder_tier_1') founderTier = 1;
         else if (itemId === 'founder_tier_2') founderTier = 2;
         else if (itemId === 'founder_tier_3') founderTier = 3;

         // Update User Profile
         if (founderTier > 0) {
             const { error: updateError } = await supabaseAdmin
                 .from('users')
                 .update({ founder_tier: founderTier })
                 .eq('id', userId);

             if (updateError) console.error('[Stripe Webhook] Failed to update user founder tier:', updateError);
             else console.log(`[Stripe Webhook] User ${userId} upgraded to Founder Tier ${founderTier}`);
         }

         // Record Transaction
         await supabaseAdmin.from('purchases').insert({
             buyer_wallet: userId,
             transaction_signature: transactionId,
             usd_amount: session.amount_total ? session.amount_total / 100 : 0,
             status: 'success',
             crypto_type: 'CARD',
             project_tag: 'PRG_GAME_ITEM',
             metadata: { itemId, userId, source: 'stripe_game' }
         });

    } else if (productType === 'coffee') {
        console.log(`[Stripe Webhook] Coffee donation received! Thank you.`);
    }
  }

  return NextResponse.json({ received: true });
}
