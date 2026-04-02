import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const TOTAL_FOUNDING_SLOTS = 15;

function json(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}

export async function GET() {
  try {
    const vercelEnv = process.env.VERCEL_ENV;
    const isStrictProduction =
      vercelEnv === 'production' || (!vercelEnv && process.env.NODE_ENV === 'production');

    const basicFs = process.env.LEMON_SQUEEZY_FOUNDING_BASIC_VARIANT_ID;
    const proFs = process.env.LEMON_SQUEEZY_FOUNDING_PRO_VARIANT_ID;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    // In preview/dev we intentionally fall back to a reviewable zero-claimed state.
    // In strict production we fail closed so we never fake scarcity.
    const missingConfig =
      !basicFs || !proFs || !serviceRoleKey || !supabaseUrl;

    if (missingConfig) {
      const code = !serviceRoleKey || !supabaseUrl
        ? 'missing_supabase_admin_config'
        : 'missing_founding_variant_ids';

      console.error('[Availability API] Missing founding availability configuration.', {
        code,
        hasBasicVariant: Boolean(basicFs),
        hasProVariant: Boolean(proFs),
        hasServiceRole: Boolean(serviceRoleKey),
        hasSupabaseUrl: Boolean(supabaseUrl),
        vercelEnv: vercelEnv ?? 'local',
      });

      if (isStrictProduction) {
        return json({
          status: 'error',
          code,
          error: 'Missing founding availability configuration',
          total: TOTAL_FOUNDING_SLOTS,
        }, 500);
      }

      return json({
        status: 'available',
        remaining: TOTAL_FOUNDING_SLOTS,
        claimed: 0,
        total: TOTAL_FOUNDING_SLOTS,
        fallback: true,
        code,
      });
    }

    const supabase = await createAdminClient();

    const { count, error } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .in('variant_id', [basicFs, proFs])
      .in('status', ['active', 'past_due', 'on_trial']);
      
    if (error) {
      console.error('[Availability API] DB lookup failed:', error);

      if (!isStrictProduction) {
        return json({
          status: 'available',
          remaining: TOTAL_FOUNDING_SLOTS,
          claimed: 0,
          total: TOTAL_FOUNDING_SLOTS,
          fallback: true,
          code: 'preview_db_fallback',
        });
      }

      return json({
        status: 'error',
        code: 'database_query_error',
        error: 'Database querying error',
        total: TOTAL_FOUNDING_SLOTS,
      }, 500);
    }

    const claimed = Math.min(count || 0, TOTAL_FOUNDING_SLOTS);
    const remaining = Math.max(0, TOTAL_FOUNDING_SLOTS - claimed);

    return json({
      status: remaining > 0 ? 'available' : 'sold_out',
      remaining, 
      claimed, 
      total: TOTAL_FOUNDING_SLOTS,
    });
  } catch (err: unknown) {
    console.error('[Availability API] Fatal server crash:', err);

    return json({
      status: 'error',
      code: 'server_crash',
      error: 'Server Crash',
      total: TOTAL_FOUNDING_SLOTS,
    }, 500);
  }
}
