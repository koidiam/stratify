import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createAdminClient();
    const basicFs = process.env.LEMON_SQUEEZY_FOUNDING_BASIC_VARIANT_ID;
    const proFs = process.env.LEMON_SQUEEZY_FOUNDING_PRO_VARIANT_ID;

    if (!basicFs || !proFs) {
      console.warn('[Availability API] Missing Founding Variant IDs in environment. Using fallback for local dev.');
    }

    const queryBasic = basicFs || 'dev_fallback_basic';
    const queryPro = proFs || 'dev_fallback_pro';

    const { count, error } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .in('variant_id', [queryBasic, queryPro])
      .in('status', ['active', 'past_due', 'on_trial']);
      
    if (error) {
      console.error('[Availability API] DB lookup failed:', error);
      // Graceful local dev fallback if the table doesn't exist yet
      return NextResponse.json({ 
        status: 'available', 
        remaining: 15, 
        claimed: 0, 
        total: 15 
      });
    }

    const claimed = count || 0;
    const remaining = Math.max(0, 15 - claimed);

    return NextResponse.json({ 
      status: remaining > 0 ? 'available' : 'sold_out',
      remaining, 
      claimed, 
      total: 15 
    });
  } catch (err: unknown) {
    console.error('[Availability API] Fatal server crash:', err);
    // If the server physically crashes, that's a real 'error' state
    return NextResponse.json({ status: 'error', error: 'Server Crash' });
  }
}
