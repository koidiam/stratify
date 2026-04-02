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
    <div className="w-full flex-1 flex flex-col animate-in fade-in duration-500 -mt-2">
      
      {/* Structural HUD Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 flex-1 w-full border-t border-white/5 relative bg-[#020202]">
        
        {/* Architectural 1px grid lines */}
        <div className="hidden xl:block absolute inset-y-0 left-1/4 w-px bg-white/5 z-0" />
        <div className="hidden xl:block absolute inset-y-0 left-2/4 w-px bg-[linear-gradient(to_bottom,rgba(255,255,255,0.05)_50%,transparent_50%)] bg-[length:1px_8px] z-0" />
        <div className="hidden xl:block absolute inset-y-0 left-3/4 w-px bg-white/5 z-0" />

        {/* Column 1: Context & Parameters */}
        <div className="p-6 md:p-8 flex flex-col relative z-10 border-b xl:border-b-0 border-white/5">
          <div className="sticky top-6">
            <h2 className="text-[10px] font-bold tracking-widest text-white/30 uppercase mb-8 flex items-center gap-2">
              <span className="w-1 h-3 bg-white/20 inline-block" />
              Strategy Profile
            </h2>
            
            <div className="flex flex-col gap-1 mb-10 border-l border-emerald-500/30 pl-4 py-1.5 hover:border-emerald-500 transition-colors">
               <span className="text-[9px] uppercase tracking-widest text-emerald-500/80 font-bold">TARGET NICHE</span>
               <span className="font-mono text-white text-xs">{niche}</span>
            </div>

            <WelcomeGuide plan={plan} />
          </div>
        </div>

        {/* Column 2 & 3: Main Workbench Data */}
        <div className="xl:col-span-2 p-0 flex flex-col relative z-10 bg-gradient-to-b from-[#000000]/40 to-transparent backdrop-blur-xl shrink-0">
          <div className="p-6 md:p-8 flex-1 flex flex-col items-center justify-center min-h-[400px]">
            {latestHistory ? (
              <div className="w-full max-w-lg mx-auto flex flex-col">
                <div className="text-center mb-12">
                  <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 bg-white/[0.02] border border-white/5 rounded-sm">
                    <span className="text-[10px] text-emerald-500 uppercase font-medium tracking-widest">
                      {new Date(latestHistory.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric'})} — {
                        ((latestHistory.insights as { trigger: string }[])?.[0]?.trigger || 'Growth') + ' Focus'
                      }
                    </span>
                  </div>
                  <h4 className="text-3xl md:text-4xl font-semibold text-white tracking-tight mb-2 drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                    W{latestHistory.week_number}.{latestHistory.year} Report
                  </h4>
                  <div className="text-[10px] uppercase font-bold tracking-widest text-white/30 mt-3">
                    Latest Generation Output
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-px bg-white/10 border border-white/10 rounded-sm overflow-hidden shadow-2xl">
                  <div className="flex flex-col items-center bg-[#050505] p-8 group hover:bg-[#0A0A0A] transition-colors cursor-default">
                    <span className="text-5xl font-bold text-white font-mono mb-3 group-hover:text-emerald-500 transition-colors drop-shadow-[0_0_15px_rgba(16,185,129,0)] group-hover:drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                      {(latestHistory.insights as unknown[] | null)?.length ?? 0}
                    </span>
                    <span className="text-[9px] uppercase tracking-widest text-white/40 font-bold group-hover:text-white/60">Signals Mined</span>
                  </div>
                  <div className="flex flex-col items-center bg-[#050505] p-8 group hover:bg-[#0A0A0A] transition-colors cursor-default">
                    <span className="text-5xl font-bold text-white font-mono mb-3 group-hover:text-emerald-500 transition-colors drop-shadow-[0_0_15px_rgba(16,185,129,0)] group-hover:drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                      {(latestHistory.posts as unknown[] | null)?.length ?? 0}
                    </span>
                    <span className="text-[9px] uppercase tracking-widest text-white/40 font-bold group-hover:text-white/60">Drafts Crafted</span>
                  </div>
                </div>
              </div>
            ) : (
               <div className="flex flex-col items-center justify-center w-full max-w-sm mx-auto">
                 {/* Signal Snapshot */}
                 <div className="w-full border border-white/10 rounded-sm bg-white/[0.02] divide-y divide-white/5 mb-6">
                   <div className="px-4 py-2.5 text-[9px] font-bold uppercase tracking-widest text-white/30">
                     This week in your niche
                   </div>
                   <div className="px-4 py-2.5 text-xs text-white/60">Authority storytelling gaining traction</div>
                   <div className="px-4 py-2.5 text-xs text-white/60">Contrarian hooks outperform generic advice</div>
                   <div className="px-4 py-2.5 text-xs text-white/60">Personal proof posts getting more saves</div>
                 </div>

                 {/* System Status */}
                 <div className="w-full flex items-center justify-between text-[10px] text-white/25 mb-6 px-1">
                   <span>Last scan: recently cached signals</span>
                   <span className="flex items-center gap-1.5">
                     <span className="w-1 h-1 rounded-full bg-emerald-500" />
                     Ready to generate
                   </span>
                 </div>

                 {/* CTA */}
                 <Link href="/generate" className="text-xs font-medium text-white/50 hover:text-white transition-colors">
                   Generate your first strategy →
                 </Link>
               </div>
            )}
          </div>
          
          <div className="p-4 border-t border-white/5 bg-[#000000]/60 w-full flex items-center justify-between mt-auto">
            <Link href="/history" className="text-xs font-medium text-white/40 hover:text-white transition-colors">
              Access Full History Archive →
            </Link>
          </div>
        </div>

        {/* Column 4: Telemetry & Hard Controls */}
        <div className="p-6 md:p-8 flex flex-col relative z-10 border-t xl:border-t-0 border-white/5 bg-[#000000]/20">
          <div className="sticky top-6 flex flex-col h-full gap-10">
            <div>
              <h2 className="text-[10px] font-bold tracking-widest text-white/30 uppercase mb-8 flex items-center gap-2">
                <span className="w-1 h-3 bg-white/20 inline-block" />
                Usage Metrics
              </h2>
              <UsageCard plan={plan} usage={currentUsage} />
            </div>

            <div className="mt-auto pt-6 border-t border-white/5">
              <h2 className="text-[9px] font-bold tracking-widest text-white/30 uppercase mb-4">Quick Commands</h2>
              <QuickActions plan={plan} />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
