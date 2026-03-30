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
    <div className="min-h-screen bg-background flex relative selection:bg-primary/30">
      {/* Onboarding ekranında Sidebar olmasın diye sadece dashboard routes'da */}
      <Sidebar email={session.user.email} plan={plan} />
      
      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 pt-16 md:pt-0 w-full overflow-y-auto relative z-10">
        <div className="max-w-6xl mx-auto p-6 md:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
