"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { NicheStep } from './steps/NicheStep';
import { AudienceStep } from './steps/AudienceStep';
import { ToneStep } from './steps/ToneStep';
import { ReferenceStep } from './steps/ReferenceStep';
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
    reference_posts: []
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
      
      if (!res.ok) throw new Error(resData.error || 'Bir hata oluştu');

      toast.success("Profilin başarıyla oluşturuldu.");
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
      <div className="w-full bg-[#111] border border-[#222] rounded-2xl shadow-xl overflow-hidden p-6 md:p-10 relative">
        
        {/* Glow */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px] -z-10" />

        <div className="flex items-center justify-between mb-8">
          <div className="text-sm text-gray-400 font-medium tracking-widest uppercase">
            Adım 0{step} / 04
          </div>
          <div className="w-2/3">
            <div className="h-1 w-full overflow-hidden rounded-full bg-[#222]">
              <div
                className="h-full rounded-full bg-blue-500 transition-[width] duration-300"
                style={{ width: `${(step / 4) * 100}%` }}
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
              onSubmit={handleFinish} 
              onBack={() => setStep(3)}
              loading={loading}
            />
          )}
        </div>
      </div>
      <div className="mt-8 text-center text-gray-500 text-sm">
        🔒 Verileriniz uçtan uca güvendedir ve profilleme dışında kullanılmaz.
      </div>
    </div>
  );
}
