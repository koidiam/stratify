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

  // Check if onboarding is already completed and data exists
  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_completed')
    .eq('id', session.user.id)
    .maybeSingle();

  const { data: onboarding } = await supabase
    .from('onboarding')
    .select('niche')
    .eq('user_id', session.user.id)
    .maybeSingle();

  if (profile?.onboarding_completed && onboarding?.niche) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col pt-20 pb-10 px-4">
      <div className="w-full max-w-2xl mx-auto mb-10 text-center relative z-10">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Welcome to Stratify.</h1>
        <p className="text-muted-foreground mt-2 text-lg">Let&apos;s map out your profile so the strategy engine can work perfectly for you.</p>
      </div>
      <OnboardingWizard />
    </div>
  );
}
