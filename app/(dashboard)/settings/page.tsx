import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { CreditCard, Shield, Sparkles, User, AlertTriangle } from 'lucide-react';
import { createAdminClient, createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DeleteAccountButton } from '@/components/settings/DeleteAccountButton';
import { ProfileForm } from '@/components/settings/ProfileForm';

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
      
      const { data, error } = await serverClient.auth.updateUser({
        data: { full_name: fullName }
      });
      
      if (error) throw error;
      revalidatePath('/settings');
      return { success: true };
    } catch (err: any) {
      console.error("UPDATE_NAME_ERROR:", err);
      // Determine if it tells us something specific
      let msg = err.message || 'Failed to update name';
      if (typeof err === "object" && err !== null) {
        msg = JSON.stringify(err);
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
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Settings</h1>
        <p className="mt-2 text-lg text-muted-foreground leading-relaxed">
          Manage your profile, subscription plan, and account preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="relative overflow-hidden border border-border bg-card shadow-sm p-6 rounded-[24px]">
          <div className="absolute -right-6 -top-6 flex items-start justify-end p-6 opacity-5 pointer-events-none">
            <CreditCard size={140} className="text-primary" />
          </div>
          <div className="relative z-10">
            <h3 className="mb-2 flex items-center gap-2 text-xl font-semibold text-foreground">
              <Shield className="text-primary w-5 h-5" /> Plan
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-[90%]">
              Manage your current subscription and access levels.
            </p>

            <div className="mb-8 mt-6">
              <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Current Plan
              </span>
              <span className={`text-2xl font-bold tracking-tight ${plan === 'pro' || plan === 'basic' ? 'text-primary' : 'text-foreground'}`}>
                {plan.toUpperCase()} TIER
              </span>
            </div>
          </div>
        </Card>

        <Card className="border border-border bg-card shadow-sm p-6 rounded-[24px]">
          <h3 className="mb-2 flex items-center gap-2 text-xl font-semibold text-foreground">
            <User className="text-muted-foreground w-5 h-5" /> Profile
          </h3>
          <p className="mb-6 text-sm text-muted-foreground leading-relaxed">
            Your Supabase identity details are managed here.
          </p>

          <div className="space-y-4">
            <ProfileForm 
              initialName={session.user.user_metadata?.full_name || ''} 
              updateName={updateNameAction} 
            />
            <div className="rounded-xl border border-border bg-secondary p-4">
              <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Email</span>
              <span className="text-[13px] font-medium text-foreground">{session.user.email}</span>
            </div>
          </div>
        </Card>
      </div>

      <Card className="border border-border bg-card shadow-sm p-6 rounded-[24px]">
        <h3 className="mb-2 flex items-center gap-2 text-xl font-semibold text-foreground">
          <Sparkles className="text-primary w-5 h-5" /> AI Engine Configuration
        </h3>
        <p className="mb-6 text-sm text-muted-foreground leading-relaxed max-w-2xl">
          If you want to pivot your brand focus, change your niche, or alter your tone of voice, you can run the onboarding flow again to retrain your personalized model.
        </p>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[16px] border border-border bg-secondary p-4">
            <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Active Niche</span>
            <span className="text-sm font-medium text-foreground capitalize block truncate" title={onboarding?.niche || 'Not Set'}>{onboarding?.niche || 'Not Set'}</span>
          </div>
          <div className="rounded-[16px] border border-border bg-secondary p-4">
            <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Tone of Voice</span>
            <span className="text-sm font-medium text-foreground capitalize block truncate" title={onboarding?.tone || 'Not Set'}>{onboarding?.tone || 'Not Set'}</span>
          </div>
          <div className="rounded-[16px] border border-border bg-secondary p-4">
            <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Target Audience</span>
            <span className="text-sm font-medium text-foreground capitalize block truncate" title={onboarding?.target_audience || 'Not Set'}>{onboarding?.target_audience || 'Not Set'}</span>
          </div>
        </div>

        <form action={resetOnboardingAction} className="mt-6 block">
          <Button type="submit" variant="outline" className="w-full border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 hover:text-primary transition-colors font-medium">
            <Sparkles size={16} className="mr-2" />
            Retrain Strategy Model
          </Button>
        </form>
      </Card>

      <Card className="border border-destructive/20 bg-[linear-gradient(180deg,rgba(220,38,38,0.05),transparent)] p-6 rounded-[24px]">
        <h3 className="text-xl font-semibold text-destructive flex items-center gap-2">
           <AlertTriangle className="w-5 h-5" /> Danger Zone
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-destructive/80 max-w-2xl">
          Account deletion is permanent. Your Supabase user record, generation history, profiles, and associated API limits will be irrecoverably purged from our systems.
        </p>

        <div className="mt-6">
          <DeleteAccountButton action={deleteAccountAction} />
        </div>
      </Card>
    </div>
  );
}
