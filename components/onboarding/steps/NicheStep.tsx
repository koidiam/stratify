import type React from 'react';
import { Rocket, Code2, Briefcase, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  value: string;
  onChange: (val: string) => void;
  onNext: () => void;
}

const NICHES = [
  {
    id: 'saas_founder',
    label: 'SaaS Founder',
    desc: 'B2B/B2C SaaS product founders',
    icon: 'Rocket',
    signals: 'Product launches · growth metrics · founder lessons · B2C acquisition'
  },
  {
    id: 'developer',
    label: 'Developer / Engineer',
    desc: 'Software engineers and coding experts',
    icon: 'Code2',
    signals: 'Tutorials · tooling picks · career moves · build-in-public posts'
  },
  {
    id: 'freelancer',
    label: 'Freelancer',
    desc: 'Independent contractors and consultants',
    icon: 'Briefcase',
    signals: 'Client wins · pricing strategy · niche positioning · outreach patterns'
  },
  {
    id: 'creator',
    label: 'Creator / Solopreneur',
    desc: 'Digital creators and one-person armies',
    icon: 'Zap',
    signals: 'Audience growth · monetization · content systems · personal brand signals'
  }
];

export function NicheStep({ value, onChange, onNext }: Props) {
  const NICHE_ICONS: Record<string, React.ElementType> = {
    saas_founder: Rocket,
    developer: Code2,
    freelancer: Briefcase,
    creator: Zap,
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-xl font-bold text-white mb-2 uppercase tracking-widest text-sm">Target Niche</h2>
        <p className="text-white/50 text-[11px] font-mono max-w-md">Select your primary focus area. This calibrates the baseline system weights for your logic loops.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
        {NICHES.map((niche) => {
          const NicheIcon = NICHE_ICONS[niche.id] ?? Zap;

          return (
            <div
              key={niche.id}
              onClick={() => onChange(niche.id)}
              className={`relative p-5 cursor-pointer border border-l-2 transition-all rounded-sm group
                ${value === niche.id
                  ? 'border-l-[3px] border-l-emerald-500 border-emerald-500/20 bg-emerald-500/5'
                  : 'border-l-transparent border-white/5 bg-[#000000]/40 hover:border-white/10 hover:border-l-white/20'}`}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 ${value === niche.id ? 'text-emerald-500' : 'text-white/30 group-hover:text-white/50'} transition-colors`}>
                  <NicheIcon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`text-[11px] font-bold uppercase tracking-widest mb-1 ${value === niche.id ? 'text-emerald-500' : 'text-white/80'}`}>
                    {niche.label}
                  </h3>
                  <p className="text-[10px] font-mono text-white/35 mb-3">{niche.desc}</p>
                  <p className={`text-[9px] font-mono uppercase tracking-widest leading-relaxed ${value === niche.id ? 'text-white/45' : 'text-white/25'}`}>
                    Tracks: {niche.signals}
                  </p>
                </div>
                {value === niche.id && (
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1 shrink-0" />
                )}
              </div>
            </div>
          );
        })}
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
