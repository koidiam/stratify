import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createAdminClient();
    const basicFs = process.env.LEMON_SQUEEZY_FOUNDING_BASIC_VARIANT_ID;
    const proFs = process.env.LEMON_SQUEEZY_FOUNDING_PRO_VARIANT_ID;

    // Both founding elements must be configured to fetch their status.
    if (!basicFs || !proFs) {
      return NextResponse.json({ available: false });
    }

    // Measure total claimed so far
    const { count, error } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .in('variant_id', [basicFs, proFs])
      .in('status', ['active', 'past_due', 'on_trial']);
      
    if (error) {
      console.error('Founding availability db lookup error:', error);
      return NextResponse.json({ available: false, remaining: 0 });
    }

    const claimed = count || 0;
    const remaining = Math.max(0, 15 - claimed);

    return NextResponse.json({ available: remaining > 0, remaining, claimed, total: 15 });
  } catch (err: unknown) {
    return NextResponse.json({ available: false, remaining: 0, claimed: 0, total: 15 });
  }
}
