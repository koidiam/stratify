import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createAdminClient();
    const basicFs = process.env.LEMON_SQUEEZY_FOUNDING_BASIC_VARIANT_ID || 'missing_basic_fs';
    const proFs = process.env.LEMON_SQUEEZY_FOUNDING_PRO_VARIANT_ID || 'missing_pro_fs';

    const { count, error } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .in('variant_id', [basicFs, proFs])
      .in('status', ['active', 'past_due', 'on_trial']);
      
    if (error) {
      console.error('Founding availability db lookup error:', error);
      return NextResponse.json({ status: 'error', error: 'DB Error' });
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
    return NextResponse.json({ status: 'error', error: 'Server Crash' });
  }
}
