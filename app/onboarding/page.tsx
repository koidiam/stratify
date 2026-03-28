export const dynamic = 'force-dynamic';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  // Check if onboarding is already completed
  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_completed')
    .eq('id', session.user.id)
    .maybeSingle();

  if (profile?.onboarding_completed) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col pt-20 pb-10 px-4">
      <div className="w-full max-w-2xl mx-auto mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-white">Sisteme Hoş Geldin.</h1>
        <p className="text-gray-400 mt-2">LinkedIn OS senin için en iyi şekilde çalışsın diye profilini birlikte tanıyalım.</p>
      </div>
      <OnboardingWizard />
    </div>
  );
}
