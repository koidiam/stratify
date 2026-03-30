"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { NicheStep } from './steps/NicheStep';
import { AudienceStep } from './steps/AudienceStep';
import { ToneStep } from './steps/ToneStep';
import { ReferenceStep } from './steps/ReferenceStep';
import { GoalStep } from './steps/GoalStep';
import { OnboardingData } from '@/types';
import { getErrorMessage } from '@/lib/utils/parsers';

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [data, setData] = useState<Partial<OnboardingData>>({
    niche: '',
    target_audience: '',
    tone: '',
    reference_posts: [],
    goal: ''
  });

  const updateData = <K extends keyof OnboardingData>(
    key: K,
    value: OnboardingData[K]
  ) => {
    setData(prev => ({ ...prev, [key]: value }));
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      const resData = await res.json();
      
      if (!res.ok) throw new Error(resData.error || 'An error occurred.');

      toast.success("Profile fully operational.");
      router.push('/dashboard');
      router.refresh();
      
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[70vh]">
      
      {/* Container Card */}
      <div className="w-full bg-card/40 backdrop-blur-md border border-white/5 rounded-[24px] shadow-2xl overflow-hidden p-6 md:p-10 relative">
        
        {/* Subtle Ambient Light instead of heavy blue glow */}
        <div className="absolute top-10 right-10 w-[200px] h-[200px] bg-primary/10 rounded-full blur-[80px] pointer-events-none -z-10 mix-blend-screen" />

        <div className="flex items-center justify-between mb-10">
          <div className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-widest">
            Step 0{step} / 05
          </div>
          <div className="w-2/3 max-w-[200px]">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
                style={{ width: `${(step / 5) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="min-h-[300px]">
          {step === 1 && (
            <NicheStep 
              value={data.niche || ''} 
              onChange={(val) => updateData('niche', val)} 
              onNext={() => setStep(2)} 
            />
          )}

          {step === 2 && (
            <AudienceStep 
              value={data.target_audience || ''} 
              onChange={(val) => updateData('target_audience', val)} 
              onNext={() => setStep(3)} 
              onBack={() => setStep(1)} 
            />
          )}

          {step === 3 && (
            <ToneStep 
              value={data.tone || ''} 
              onChange={(val) => updateData('tone', val)} 
              onNext={() => setStep(4)} 
              onBack={() => setStep(2)} 
            />
          )}

          {step === 4 && (
            <ReferenceStep 
              value={data.reference_posts || []} 
              onChange={(val) => updateData('reference_posts', val)} 
              onSubmit={() => setStep(5)} 
              onBack={() => setStep(3)}
              loading={false}
            />
          )}

          {step === 5 && (
            <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
              <GoalStep 
                value={data.goal || ''} 
                onChange={(val) => updateData('goal', val)} 
              />
              <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={handleFinish}
                  disabled={!data.goal || loading}
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-lg hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
                >
                  {loading ? 'Finalizing Profile...' : 'Complete Setup'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="mt-8 text-center text-muted-foreground text-[11px] font-medium opacity-80 uppercase tracking-wide">
        🔒 Your data is fully encrypted and never shared externally.
      </div>
    </div>
  );
}
