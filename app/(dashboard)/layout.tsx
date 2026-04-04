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

  return (
    <div className="dark-premium relative flex min-h-screen bg-[#050505] text-sm text-foreground selection:bg-white/20">
      <AnimatedBackground />

      <Sidebar email={session.user.email} plan={plan} />

      <main className="relative z-10 flex min-h-screen w-full flex-1 flex-col md:pl-64">
        <div className="flex-1 px-4 pb-8 pt-20 md:px-8 md:pb-10 md:pt-8 lg:px-10">
          {children}
        </div>
      </main>
    </div>
  );
}
