export const dynamic = 'force-dynamic';
import { createClient } from '@/lib/supabase/server';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { UsageCard } from '@/components/dashboard/UsageCard';
import { Plan } from '@/types';
import { redirect } from 'next/navigation';
import { getISOWeek } from '@/lib/utils/week';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) redirect('/login');

  // Profile yoksa oluştur (trigger bazen çalışmayabilir)
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, onboarding_completed')
    .eq('id', user.id)
    .maybeSingle();

  // Profil yoksa otomatik oluştur
  if (!profile) {
    await supabase.from('profiles').upsert({
      id: user.id,
      email: user.email ?? '',
      plan: 'free',
      onboarding_completed: false,
    });

    redirect('/onboarding');
  }

  if (!profile.onboarding_completed) {
    redirect('/onboarding');
  }

  const { data: onboarding } = await supabase
    .from('onboarding')
    .select('niche')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!onboarding?.niche) {
    redirect('/onboarding');
  }

  const { week, year } = getISOWeek();
  const { data: usageData } = await supabase
    .from('usage_tracking')
    .select('generations_used')
    .eq('user_id', user.id)
    .eq('week_number', week)
    .eq('year', year)
    .maybeSingle();

  const currentUsage = usageData?.generations_used ?? 0;
  const plan: Plan =
    profile.plan === 'basic' || profile.plan === 'pro' ? profile.plan : 'free';
  const niche = onboarding.niche;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Günaydın';
    if (hour < 18) return 'Tünaydın';
    return 'İyi Akşamlar';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            {getGreeting()}, <span className="text-blue-500">Stratify Üreticisi</span> 🚀
          </h1>
          <p className="text-gray-400 mt-2 text-lg">
            Bugün yeni bir ağ kurmak için harika bir gün.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UsageCard plan={plan} usage={currentUsage} />
        <div className="bg-[#111] border border-[#222] rounded-xl p-6 shadow-xl flex flex-col justify-center items-center text-center">
          <h3 className="text-gray-400 mb-2">Profil Nişi</h3>
          <p className="text-2xl font-bold text-white capitalize">{niche}</p>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-white mb-2">Hızlı İşlemler</h2>
        <QuickActions />
      </div>
    </div>
  );
}
