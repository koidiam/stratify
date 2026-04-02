import { Sidebar } from '@/components/layout/Sidebar';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AnimatedBackground } from '@/components/layout/AnimatedBackground';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', session.user.id)
    .maybeSingle();

  const plan = profile?.plan === 'basic' || profile?.plan === 'pro' ? profile.plan : 'free';

  // Dashboard hariç auth sayfaları bu layout'u kullanabilir ama Sidebar göstermeyiz 
  // (Fakat biz route grubunu /dashboard altında tuttuk)
  
  return (
    <div className="dark-premium min-h-screen bg-[#050505] flex relative selection:bg-white/20 text-foreground text-sm">
      <AnimatedBackground />


      <Sidebar email={session.user.email} plan={plan} />
      
      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 pt-16 md:pt-0 w-full overflow-y-auto relative z-10 flex flex-col h-screen">
        <div className="w-full flex-1 flex flex-col p-4 md:p-6 lg:p-8">
          {/* Real Metric Strip */}
          <div className="border-b border-white/5 pb-4 mb-6 md:mb-8 shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-medium tracking-tight text-white">Overview</h1>
                <div className="text-[11px] text-white/40 mt-1 font-medium">
                  Workspace
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="border border-white/5 bg-[#050505] px-3 py-1.5 flex items-center gap-2.5 rounded-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-xs font-medium text-white/80">Online</span>
                </div>
                {plan && (
                   <div className="border border-white/5 bg-[#050505] px-3 py-1.5 flex items-center gap-2 rounded-sm">
                     <span className="text-[9px] uppercase font-bold tracking-widest text-white/40">PLAN</span>
                     <span className="text-xs font-medium text-white capitalize">{plan}</span>
                   </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 w-full relative">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
