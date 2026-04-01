export const dynamic = 'force-dynamic';
import Link from 'next/link';
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      
      {/* 1. Compressed Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2 border-b border-border/50 pb-5">
        <h1 className="text-xl font-medium tracking-tight text-foreground/90 uppercase tracking-wider">
          Stratify Workspace
        </h1>
        <div className="inline-flex items-center gap-2 rounded-md border border-border bg-secondary/30 px-3 py-1.5 text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
          Active Profile Context: <span className="text-foreground max-w-[200px] sm:max-w-xs truncate">{niche}</span>
        </div>
      </div>

      {/* 2. State Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Usage Card (kept as is, handling limits) */}
        <UsageCard plan={plan} usage={currentUsage} />
        
        {/* Latest Generation (revamped into Operational Memory) */}
        <div className="bg-card border border-border rounded-[16px] p-6 shadow-sm flex flex-col relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Operational Memory</h3>
            </div>
            
            {latestHistory ? (
              <div className="space-y-4 flex-grow flex flex-col">
                <div>
                  <div className="text-xs text-muted-foreground font-mono mb-2">
                    {new Date(latestHistory.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                  </div>
                  <h4 className="text-xl font-semibold text-foreground tracking-tight mb-2">
                    Week {latestHistory.week_number}, {latestHistory.year} Extraction
                  </h4>
                  <p className="text-xs text-muted-foreground truncate max-w-full bg-secondary/50 rounded-md p-2 border border-border/50">
                    <span className="opacity-70 mr-1 font-semibold uppercase tracking-wider text-[10px]">Bound Context:</span> 
                    {niche}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-auto pt-4 border-t border-border/50">
                  <div className="flex flex-col gap-1 items-start bg-secondary/20 rounded-lg p-3 border border-border/30">
                    <span className="text-2xl font-semibold text-foreground">
                      {(latestHistory.insights as unknown[] | null)?.length ?? 0}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Signals Extracted</span>
                  </div>
                  <div className="flex flex-col gap-1 items-start bg-secondary/20 rounded-lg p-3 border border-border/30">
                    <span className="text-2xl font-semibold text-foreground">
                      {(latestHistory.posts as unknown[] | null)?.length ?? 0}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Drafts Synthesized</span>
                  </div>
                </div>
              </div>
            ) : (
               <div className="flex-grow flex flex-col justify-center h-full min-h-[140px]">
                 <p className="text-sm text-muted-foreground leading-relaxed border-l-2 border-primary/40 pl-4 py-1">
                   No operational memory log found.<br/>
                   <span className="text-xs opacity-70 mt-1 block">Initialize engine extraction to process the first weekly cycle.</span>
                 </p>
               </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Workflow Strip */}
      <WelcomeGuide plan={plan} />

      {/* 4. Action Bar */}
      <div className="pt-4 mt-8 border-t border-border/50">
        <QuickActions plan={plan} />
      </div>

    </div>
  );
}
