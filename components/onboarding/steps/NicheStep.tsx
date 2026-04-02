import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Props {
  value: string;
  onChange: (val: string) => void;
  onNext: () => void;
}

const NICHES = [
  { id: 'saas_founder', label: 'SaaS Founder', desc: 'B2B/B2C SaaS product founders' },
  { id: 'developer', label: 'Developer / Engineer', desc: 'Software engineers and coding experts' },
  { id: 'freelancer', label: 'Freelancer', desc: 'Independent contractors and consultants' },
  { id: 'creator', label: 'Creator / Solopreneur', desc: 'Digital creators and one-person armies' }
];

export function NicheStep({ value, onChange, onNext }: Props) {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-xl font-bold text-white mb-2 uppercase tracking-widest text-sm">Target Niche</h2>
        <p className="text-white/50 text-[11px] font-mono max-w-md">Select your primary focus area. This calibrates the baseline system weights for your logic loops.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
        {NICHES.map((niche) => (
          <div 
            key={niche.id}
            onClick={() => onChange(niche.id)}
            className={`p-5 cursor-pointer border transition-colors rounded-sm 
              ${value === niche.id 
                ? 'border-emerald-500/50 bg-emerald-500/5' 
                : 'border-white/5 bg-[#000000]/40 hover:border-white/20'}`}
          >
            <h3 className={`text-[11px] font-bold uppercase tracking-widest mb-1.5 ${value === niche.id ? 'text-emerald-500' : 'text-white/80'}`}>{niche.label}</h3>
            <p className="text-[10px] font-mono text-white/40">{niche.desc}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-end mt-4 pt-4 border-t border-white/5">
        <Button 
          onClick={onNext} 
          disabled={!value} 
          className="rounded-sm bg-white text-black hover:bg-white/90 h-10 px-6 text-[10px] font-bold uppercase tracking-widest shadow-none disabled:opacity-50"
        >
          Confirm Niche
        </Button>
      </div>
    </div>
  );
}
