"use client"

import { useState } from 'react';
import { InsightViewer } from '@/components/generate/InsightViewer';
import { ContentHooks } from '@/components/generate/ContentHooks';
import { FinalPost } from '@/components/generate/FinalPost';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2, Radar, Sparkles, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { WeeklyGeneration } from '@/types';
import { getApiError, getErrorMessage, isWeeklyGeneration } from '@/lib/utils/parsers';

const STEPS = [
  { id: 1, label: 'Signal scan' },
  { id: 2, label: 'Hook design' },
  { id: 3, label: 'Final draft' },
];

export default function GeneratePage() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<WeeklyGeneration | null>(null);
  const [selectedPost, setSelectedPost] = useState<string>('');

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/generate', { method: 'POST' });
      const json: unknown = await res.json();
      
      if (!res.ok) {
        const error = getApiError(json);

        if (error === 'limit_reached') {
          throw new Error('Haftalık limitine ulaştın. Planını yükselterek devam edebilirsin.');
        }

        throw new Error(error ?? 'Bir hata oluştu');
      }

      if (!isWeeklyGeneration(json)) {
        throw new Error('AI yanıtı beklenen formatta gelmedi.');
      }

      setData(json);
      setStep(1); // İçgörüleri göster
      toast.success('Haftalık analiz başarıyla çekildi!');
      
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-8">
      <div className="overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-6 shadow-[0_25px_80px_rgba(0,0,0,0.32)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#0A66C2]/35 bg-[#0A66C2]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#7abfff]">
              <Radar size={14} />
              Weekly generation cockpit
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
              Bu haftanin LinkedIn strateji akisini buradan yonet.
            </h1>
            <p className="mt-3 text-sm leading-7 text-white/58 md:text-base">
              Onboarding baglamin, canli LinkedIn sinyallerin ve uretim limitin tek bir
              akista birlesir. Once insight, sonra hook, sonra son draft.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {STEPS.map((item) => {
              const active = step >= item.id;

              return (
                <div
                  key={item.id}
                  className={`rounded-2xl border px-4 py-3 text-sm ${
                    active
                      ? 'border-[#0A66C2]/40 bg-[#0A66C2]/12 text-white'
                      : 'border-white/10 bg-white/5 text-white/45'
                  }`}
                >
                  <div className="text-xs uppercase tracking-[0.18em] text-white/35">Step {item.id}</div>
                  <div className="mt-1 font-medium">{item.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Step 0 - Başlangıç */}
      {step === 0 && (
        <div className="mx-auto flex min-h-[60vh] max-w-4xl animate-in fade-in items-center justify-center rounded-[32px] border border-white/10 bg-[#08111d]/80 px-8 py-12 text-center shadow-[0_25px_80px_rgba(0,0,0,0.28)] duration-500">
          <div className="max-w-2xl">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[24px] bg-blue-500/10 text-blue-400">
            <Zap size={40} />
            </div>
            <h2 className="mb-4 text-4xl font-semibold tracking-tight text-white">
              Haftalik stratejini tek komutla uret
            </h2>
            <p className="mb-8 text-lg leading-8 text-white/58">
              Sistemin once baglami toplar, sonra paternleri cikarir, ardindan senin tonuna
              uygun hook ve taslaklara donusturur.
            </p>

            <div className="mx-auto mb-10 grid max-w-3xl gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left">
                <div className="mb-2 text-xs uppercase tracking-[0.2em] text-white/35">01</div>
                <div className="font-medium text-white">Signal scan</div>
                <p className="mt-2 text-sm leading-6 text-white/48">Nis ve hedef kitle baglamina gore stratejik sinyaller toplanir.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left">
                <div className="mb-2 text-xs uppercase tracking-[0.2em] text-white/35">02</div>
                <div className="font-medium text-white">Hook design</div>
                <p className="mt-2 text-sm leading-6 text-white/48">Dikkat ceken acilislar ve fikir acilari kristalize edilir.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left">
                <div className="mb-2 text-xs uppercase tracking-[0.2em] text-white/35">03</div>
                <div className="font-medium text-white">Final draft</div>
                <p className="mt-2 text-sm leading-6 text-white/48">Yayinlamaya yakin post taslagi son duzenlemeye hazir gelir.</p>
              </div>
            </div>
          
            <Button 
              onClick={handleGenerate} 
              disabled={loading}
              size="lg"
              className="h-14 min-w-[240px] rounded-full bg-[#0A66C2] text-lg text-white shadow-[0_18px_50px_rgba(10,102,194,0.32)] hover:bg-[#1176db]"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                  Analiz ediliyor...
                </>
              ) : (
                <>
                  Yeni hafta analizini baslat
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>

            <div className="mt-8 flex items-center justify-center gap-3 text-xs uppercase tracking-[0.22em] text-white/32">
              <Sparkles size={14} />
              Ortalama sure 10-15 saniye
            </div>
          </div>
        </div>
      )}

      {/* Step 1 - İçgörü Viewer */}
      {step === 1 && data && (
        <InsightViewer 
          insights={data.insights} 
          onNext={() => setStep(2)} 
        />
      )}

      {/* Step 2 - Kancalar ve Postlar */}
      {step === 2 && data && (
        <ContentHooks 
          hooks={data.hooks} 
          ideas={data.ideas} 
          posts={data.posts} 
          onSelectPost={(post: string) => {
            setSelectedPost(post);
            setStep(3);
          }} 
          onBack={() => setStep(1)} 
        />
      )}

      {/* Step 3 - Final Post Düzenle */}
      {step === 3 && selectedPost && (
        <FinalPost 
          initialContent={selectedPost} 
          onBack={() => setStep(2)} 
        />
      )}
      
    </div>
  );
}
