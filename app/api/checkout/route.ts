import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { initLemonSqueezy } from '@/lib/lemonsqueezy/client';
import { createCheckout } from '@lemonsqueezy/lemonsqueezy.js';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized. Please login.' }, { status: 401 });
    }

    const body = await req.json();
    const plan = body.plan;
    const storeId = process.env.LEMON_SQUEEZY_STORE_ID;
    
    let variantId;
    if (plan === 'basic') variantId = process.env.LEMON_SQUEEZY_BASIC_VARIANT_ID;
    else if (plan === 'pro') variantId = process.env.LEMON_SQUEEZY_PRO_VARIANT_ID;
    
    if (!storeId || !variantId) {
      // In development, gracefully fail without bringing down the system.
      return NextResponse.json({ error: 'Billing keys not configured yet.' }, { status: 400 });
    }

    // Initialize LS client wrapper
    initLemonSqueezy();

    // Create the checkout
    const newCheckout = await createCheckout(storeId, variantId, {
      checkoutData: {
        email: session.user.email,
        custom: {
          user_id: session.user.id
        }
      },
      productOptions: {
        redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/settings?success=true`,
        receiptButtonText: 'Return to Dashboard',
        receiptThankYouNote: 'Thank you for upgrading Stratify!'
      }
    });

    if (newCheckout.error) {
      throw new Error(newCheckout.error.message);
    }

    return NextResponse.json({ url: newCheckout.data?.data.attributes.url });

  } catch (error: unknown) {
    const err = error as Error;
    console.error('Checkout creation error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
