import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { CreditCard, Shield, Sparkles, User, AlertTriangle } from 'lucide-react';
import { createAdminClient, createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { DeleteAccountButton } from '@/components/settings/DeleteAccountButton';
import { ProfileForm } from '@/components/settings/ProfileForm';

import { PlanManager } from '@/components/settings/PlanManager';

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

  return (
    <div className="mx-auto max-w-4xl space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white uppercase">System_Settings</h1>
        <p className="mt-2 text-sm text-white/50 leading-relaxed font-light">
          Manage your operational profile, feature access, and system preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="relative overflow-hidden str-panel rounded-sm p-6 flex flex-col">
          <div className="absolute -right-6 -top-6 flex items-start justify-end p-6 opacity-[0.02] pointer-events-none">
            <CreditCard size={140} className="text-white" />
          </div>
          <div className="relative z-10 flex-1 flex flex-col">
            <h3 className="mb-2 flex items-center gap-2 text-lg font-bold text-white uppercase tracking-wider">
              <Shield className="text-emerald-500 w-4 h-4" /> License Tier
            </h3>
            <p className="text-sm text-white/50 leading-relaxed font-light max-w-[90%]">
              Manage your computational boundaries and access levels.
            </p>

            <div className="mb-8 mt-6">
              <span className="mb-1 block text-[9px] font-bold uppercase tracking-widest text-emerald-500/80">
                Current Plan
              </span>
              <span className="text-2xl font-bold tracking-tight text-white uppercase">
                {plan}_PROFILE
              </span>
            </div>
            
            <div className="mt-auto">
              <PlanManager currentPlan={plan} />
            </div>
          </div>
        </div>

        <div className="str-panel rounded-sm p-6">
          <h3 className="mb-2 flex items-center gap-2 text-lg font-bold text-white uppercase tracking-wider">
            <User className="text-emerald-500 w-4 h-4" /> Operator Identity
          </h3>
          <p className="mb-6 text-sm text-white/50 leading-relaxed font-light">
            Your secure identity details are mapped below.
          </p>

          <div className="space-y-4">
            <ProfileForm 
              initialName={session.user.user_metadata?.full_name || ''} 
              updateName={updateNameAction} 
            />
            <div className="rounded-sm border border-white/5 bg-white/[0.02] p-4">
              <span className="mb-1 block text-[9px] font-bold uppercase tracking-widest text-white/30">Admin Email</span>
              <span className="text-xs font-mono text-white/80">{session.user.email}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="str-panel rounded-sm p-6">
        <h3 className="mb-2 flex items-center gap-2 text-lg font-bold text-white uppercase tracking-wider">
          <Sparkles className="text-emerald-500 w-4 h-4" /> AI Engine Configuration
        </h3>
        <p className="mb-6 text-sm text-white/50 leading-relaxed max-w-2xl font-light">
          Redeploy the configuration pipeline to retrain the generative model along a new strategic vector.
        </p>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-sm border border-white/5 bg-white/[0.02] p-4">
            <span className="mb-1 block text-[9px] font-bold uppercase tracking-widest text-emerald-500/80">Active Context</span>
            <span className="text-[11px] font-mono text-white/90 capitalize block truncate" title={onboarding?.niche || 'Not Set'}>{onboarding?.niche || 'Not Set'}</span>
          </div>
          <div className="rounded-sm border border-white/5 bg-white/[0.02] p-4">
            <span className="mb-1 block text-[9px] font-bold uppercase tracking-widest text-emerald-500/80">Tone Mapping</span>
            <span className="text-[11px] font-mono text-white/90 capitalize block truncate" title={onboarding?.tone || 'Not Set'}>{onboarding?.tone || 'Not Set'}</span>
          </div>
          <div className="rounded-sm border border-white/5 bg-white/[0.02] p-4">
            <span className="mb-1 block text-[9px] font-bold uppercase tracking-widest text-emerald-500/80">Target Vector</span>
            <span className="text-[11px] font-mono text-white/90 capitalize block truncate" title={onboarding?.target_audience || 'Not Set'}>{onboarding?.target_audience || 'Not Set'}</span>
          </div>
        </div>

        <form action={resetOnboardingAction} className="mt-6 block">
          <Button type="submit" variant="outline" className="w-full border-white/10 bg-transparent text-white pt-1 hover:bg-white/5 transition-colors font-bold uppercase tracking-widest text-xs h-10 rounded-sm">
            Retrain Strategy Model
          </Button>
        </form>
      </div>

      <div className="str-panel !border-red-500/20 bg-[linear-gradient(180deg,rgba(220,38,38,0.05),transparent)] p-6 rounded-sm">
        <h3 className="text-sm font-bold tracking-widest text-red-500 flex items-center gap-2 uppercase">
           <AlertTriangle className="w-4 h-4" /> Critical Destructive Actions
        </h3>
        <p className="mt-2 text-xs leading-relaxed text-red-500/70 max-w-2xl font-light">
          Account deletion executes a permanent purge. Your identity nodes, operational memory, and subscription vectors will be unrecoverable.
        </p>

        <div className="mt-6">
          <DeleteAccountButton action={deleteAccountAction} />
        </div>
      </div>
    </div>
  );
}
