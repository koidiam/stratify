import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createAdminClient, createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { DeleteAccountButton } from '@/components/settings/DeleteAccountButton';
import { ProfileForm } from '@/components/settings/ProfileForm';
import { PlanManager } from '@/components/settings/PlanManager';
import {
  getCurrentLayerStatus,
  getNextLayerStatus,
} from '@/lib/constants/plan-copy';

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) redirect('/login');

  async function deleteAccountAction() {
    'use server';

    const serverClient = await createClient();
    const {
      data: { session: currentSession },
    } = await serverClient.auth.getSession();

    if (!currentSession) {
      redirect('/login');
    }

    const adminClient = await createAdminClient();
    const { error } = await adminClient.auth.admin.deleteUser(currentSession.user.id);

    if (error) {
      throw new Error('Account deletion failed.');
    }

    await serverClient.auth.signOut();
    redirect('/');
  }

  async function resetOnboardingAction() {
    'use server';
    const serverClient = await createClient();
    const { data: { session: currentSession } } = await serverClient.auth.getSession();
    if (!currentSession) redirect('/login');
    const adminClient = await createAdminClient();
    await adminClient.from('profiles').update({ onboarding_completed: false }).eq('id', currentSession.user.id);
    redirect('/onboarding');
  }

  async function updateNameAction(fullName: string) {
    'use server';
    if (!fullName) return { error: "Name cannot be empty" };
    try {
      const serverClient = await createClient();
      const { data: { session: currentSession } } = await serverClient.auth.getSession();
      if (!currentSession) return { error: "Unauthorized" };
      
      const { error } = await serverClient.auth.updateUser({
        data: { full_name: fullName }
      });
      
      if (error) throw error;
      revalidatePath('/settings');
      return { success: true };
    } catch (err: unknown) {
      console.error("UPDATE_NAME_ERROR:", err);
      // Determine if it tells us something specific
      let msg = err instanceof Error ? err.message : 'Failed to update name';
      if (typeof err === "object" && err !== null) {
        msg = JSON.stringify(err);
      } else if (typeof err === 'string') {
        msg = err;
      }
      return { error: msg };
    }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', session.user.id)
    .maybeSingle();

  const { data: onboarding } = await supabase
    .from('onboarding')
    .select('niche, tone, target_audience')
    .eq('user_id', session.user.id)
    .maybeSingle();

  const plan = profile?.plan === 'basic' || profile?.plan === 'pro' ? profile.plan : 'free';
  const currentLayer = getCurrentLayerStatus(plan);
  const nextLayer = getNextLayerStatus(plan);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 animate-in fade-in duration-500">
      <header className="border-b border-white/5 pb-6">
        <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/35">
          Settings
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
          Configuration
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/50">
          Profile, plan, and access.
        </p>
      </header>

      <section className="rounded-sm border border-white/10 bg-[#020202] p-6">
        <div className="mb-8 text-[9px] font-bold uppercase tracking-[0.24em] text-white/20">
          System identity
        </div>
        <div className="flex flex-col gap-1">
          <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/35">
            Profile
          </div>
          <h2 className="text-xl font-medium text-white">Operator configuration</h2>
        </div>

        <div className="mt-5 grid gap-6 md:grid-cols-[minmax(0,1fr)_240px]">
          <div className="space-y-3">
            <ProfileForm
              initialName={session.user.user_metadata?.full_name || ''}
              updateName={updateNameAction}
            />
            <div className="px-0 py-1">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
                Email
              </div>
              <div className="mt-1 text-sm text-white/72">{session.user.email}</div>
            </div>
          </div>

          <dl className="space-y-3 border-t border-white/5 pt-4 md:border-l md:border-t-0 md:pl-6 md:pt-0">
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
                Niche
              </dt>
              <dd className="mt-1 text-sm text-white/72">
                {onboarding?.niche || 'Not set'}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
                Audience
              </dt>
              <dd className="mt-1 text-sm text-white/72">
                {onboarding?.target_audience || 'Not set'}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
                Tone
              </dt>
              <dd className="mt-1 text-sm text-white/72">
                {onboarding?.tone || 'Not set'}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="rounded-sm border border-white/5 p-6 opacity-80 hover:opacity-100 transition-opacity">
        <div className="flex flex-col gap-1">
          <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/35">
            Plan
          </div>
          <h2 className="text-xl font-medium text-white/80">Access and billing</h2>
        </div>

        <div className="mt-5 grid gap-4 border-b border-white/5 pb-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
              Current access
            </div>
            <p className="mt-2 text-sm font-medium text-white">{currentLayer.label}</p>
            <p className="mt-1 text-sm leading-relaxed text-white/50">{currentLayer.detail}</p>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
              Next access change
            </div>
            <p className="mt-2 text-sm font-medium text-white">{nextLayer.label}</p>
            <p className="mt-1 text-sm leading-relaxed text-white/50">{nextLayer.detail}</p>
          </div>
        </div>

        <div className="mt-5">
          <PlanManager currentPlan={plan} />
        </div>
      </section>

      <section className="pt-8 opacity-60 hover:opacity-100 transition-opacity">
        <div className="flex flex-col gap-1 mb-5">
          <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/35">
            System
          </div>
          <h2 className="text-xl font-medium text-white/80">Advanced controls</h2>
        </div>

        <div className="space-y-6">
          <div className="rounded-sm border border-white/5 bg-transparent p-5">
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">
              Retrain strategy model
            </div>
            <p className="mt-1 text-sm leading-relaxed text-white/40">
              Clear existing audience memory and retrain the strategy system basics.
            </p>
            <form action={resetOnboardingAction} className="mt-4">
              <Button
                type="submit"
                variant="outline"
                className="h-9 rounded-sm border-white/10 bg-white/5 px-4 text-[11px] font-bold uppercase tracking-[0.18em] text-white/70 hover:bg-white/10 hover:text-white transition-colors"
              >
                Retrain model
              </Button>
            </form>
          </div>

          <div className="pt-2">
            <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-red-500/50">
              Account destruction
            </div>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-white/30">
              Permanently removes profile, memory, and subscription access.
            </p>
            <div className="mt-4 max-w-sm">
              <DeleteAccountButton action={deleteAccountAction} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
