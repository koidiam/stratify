export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { WelcomeGuide } from '@/components/dashboard/WelcomeGuide';
import { UsageCard } from '@/components/dashboard/UsageCard';
import { Plan } from '@/types';
import { redirect } from 'next/navigation';
import { getISOWeek } from '@/lib/utils/week';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, onboarding_completed')
    .eq('id', user.id)
    .maybeSingle();

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

  const { data: latestHistory } = await supabase
    .from('content_history')
    .select('week_number, year, insights, posts, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="relative z-10">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            {getGreeting()}, <span className="text-primary font-bold">Creator</span>
          </h1>
          <p className="text-muted-foreground mt-2 text-lg leading-relaxed">
            Ready to establish your weekly LinkedIn strategy?
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Active Niche: <span className="text-foreground">{niche}</span>
          </div>
        </div>
      </div>

      {currentUsage === 0 && (
        <div className="rounded-[24px] border border-primary/30 bg-gradient-to-b from-primary/10 to-transparent p-8 text-center mb-6 relative overflow-hidden group">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] opacity-20 group-hover:opacity-40 transition-opacity" />
          <div className="relative z-10">
            <div className="text-4xl mb-4 inline-block drop-shadow-md">⚙️</div>
            <h3 className="text-xl font-bold text-foreground mb-2 tracking-tight">
              Stratify Engine is Idle
            </h3>
            <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto leading-relaxed">
              Your niche matrix is primed. Run the engine to synthesize patterns, generate viral hooks, and produce ready-to-publish drafts.
            </p>
            <Link
              href="/generate"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 hover:scale-[1.02]"
            >
              Ignite Stratify Engine
              <ArrowRight size={16} className="ml-1" />
            </Link>
            
            {plan === 'free' && (
              <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground bg-background/50 w-max mx-auto px-3 py-1 rounded-full border border-border/50">
                Premium Live Scraping locked. <Link href="/settings" className="text-primary hover:underline ml-1 font-medium">Upgrade to Pro</Link>
              </p>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UsageCard plan={plan} usage={currentUsage} />
        <div className="bg-card border border-border rounded-[16px] p-6 shadow-sm flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10">
            <h3 className="text-muted-foreground mb-4 font-medium">Latest Generation</h3>
            {latestHistory ? (
              <>
                <p className="text-xl font-semibold text-foreground tracking-tight">
                  Week {latestHistory.week_number}, {latestHistory.year}
                </p>
                <div className="mt-3 flex gap-3">
                  <span className="text-sm font-medium text-foreground bg-secondary rounded-md px-2 py-1">
                    {(latestHistory.insights as unknown[] | null)?.length ?? 0} insights
                  </span>
                  <span className="text-sm font-medium text-foreground bg-secondary rounded-md px-2 py-1">
                    {(latestHistory.posts as unknown[] | null)?.length ?? 0} drafts
                  </span>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground leading-relaxed">
                No active generation for this week. Start your strategy engine to get insights and drafts.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <WelcomeGuide />
      </div>

      <div className="mt-8">
        <QuickActions />
      </div>
    </div>
  );
}
