import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

interface Insight {
  insight: string;
  why: string;
  trigger: string;
}

interface Props {
  insights: Insight[];
  onNext: () => void;
}

export function InsightViewer({ insights, onNext }: Props) {
  if (insights.length === 0) return null;

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-bold flex items-center gap-2 text-white">
          <Sparkles className="text-blue-500" />
          Haftalık Strateji Raporun
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-white/58">
          Sektöründeki son trendler, psikolojik çerçeveler ve kitle analizleri bu katmanda
          toplanır. Buradaki paternler bir sonraki hook ve taslak adımlarının temelidir.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {insights.map((item, idx) => (
          <Card 
            key={idx} 
            className="flex flex-col rounded-[28px] border-white/10 bg-[#09111b] p-6 transition-all hover:-translate-y-1 hover:border-blue-500/40"
          >
            <div className="flex-1">
              <div className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-400">İçgörü 0{idx + 1}</div>
              <h3 className="mb-3 text-lg font-semibold leading-tight text-white">{item.insight}</h3>
              <p className="mb-5 text-sm leading-7 text-white/58">{item.why}</p>
              
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-gray-300">
                <span className="mb-1 block font-semibold text-white/45">Psikolojik tetikleyici</span>
                {item.trigger}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex justify-end pt-4">
        <Button 
          onClick={onNext}
          className="min-w-[190px] rounded-full bg-blue-600 text-white group hover:bg-blue-700"
        >
          Hook ve taslaklara gec
          <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
}
