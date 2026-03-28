import { SupabaseClient } from '@supabase/supabase-js';
import { getISOWeek } from './week';

export const PLAN_LIMITS: Record<string, number> = {
  free: 1,
  basic: 3,
  pro: 999, // "sınırsız" — yeterince büyük bir sayı
};

export async function getUsageStatus(
  userId: string,
  plan: string,
  supabase: SupabaseClient
): Promise<{ allowed: boolean; used: number; limit: number; week: number; year: number }> {
  const limit = PLAN_LIMITS[plan] ?? 1;
  const { week, year } = getISOWeek();

  // Mevcut kullanımı al
  const { data, error } = await supabase
    .from('usage_tracking')
    .select('generations_used')
    .eq('user_id', userId)
    .eq('week_number', week)
    .eq('year', year)
    .maybeSingle();

  if (error) throw new Error('Usage check failed');

  const used = data?.generations_used ?? 0;

  if (used >= limit) {
    return { allowed: false, used, limit, week, year };
  }

  return { allowed: true, used, limit, week, year };
}

export async function incrementUsage(
  userId: string,
  supabase: SupabaseClient,
  week: number,
  year: number,
  used: number
): Promise<number> {
  const { error } = await supabase
    .from('usage_tracking')
    .upsert({
      user_id: userId,
      week_number: week,
      year,
      generations_used: used + 1,
      updated_at: new Date().toISOString(),
    });

  if (error) throw new Error('Usage increment failed');

  return used + 1;
}
