import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface Props {
  value: string;
  onChange: (val: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const TONES = [
  'Direct and concise',
  'Educational and detailed',
  'Personal and authentic',
  'Analytical and data-driven'
];

export function ToneStep({ value, onChange, onNext, onBack }: Props) {
  const [extraTone, setExtraTone] = useState('');

  const handleSelect = (tone: string) => {
    onChange(tone);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-xl font-bold text-white mb-2 uppercase tracking-widest text-sm">Brand Voice Parameters</h2>
        <p className="text-white/50 text-[11px] font-mono max-w-md">Crucial for matching your unique style and reducing final editing layers.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
        {TONES.map((tone) => (
          <div 
            key={tone}
            onClick={() => handleSelect(tone)}
            className={`p-4 cursor-pointer border transition-colors text-center rounded-sm text-[10px] font-bold uppercase tracking-widest flex items-center justify-center
              ${value === tone 
                ? 'border-emerald-500/50 bg-emerald-500/5 text-emerald-500' 
                : 'border-white/5 bg-[#000000]/40 hover:border-white/20 text-white/80'}`}
          >
            {tone}
          </div>
        ))}
      </div>

      <div>
        <label className="text-[10px] uppercase font-bold tracking-widest text-white/30 mb-3 block">
          Custom Instruction Tags (Optional)
        </label>
        <Textarea 
          placeholder="e.g. I rarely use emojis. I prefer bullet points over numbers..."
          value={extraTone}
          onChange={(e) => setExtraTone(e.target.value)}
          onBlur={() => extraTone && onChange(`${value} - Extra: ${extraTone}`)}
          className="min-h-[100px] bg-[#000000]/40 border-white/10 text-white focus-visible:ring-1 focus-visible:ring-emerald-500 text-[11px] font-mono rounded-sm p-4 leading-relaxed resize-y shadow-none transition-colors hover:border-white/20"
        />
      </div>

      <div className="flex justify-between mt-4 pt-4 border-t border-white/5">
        <Button onClick={onBack} variant="ghost" className="rounded-sm bg-transparent text-white/50 hover:bg-white/5 hover:text-white h-10 px-6 text-[10px] font-bold uppercase tracking-widest shadow-none">
          BACK
        </Button>
        <Button 
          onClick={onNext} 
          disabled={!value} 
          className="rounded-sm bg-white text-black hover:bg-white/90 h-10 px-6 text-[10px] font-bold uppercase tracking-widest shadow-none disabled:opacity-50"
        >
          CONFIRM PARAMETERS
        </Button>
      </div>
    </div>
  );
}
