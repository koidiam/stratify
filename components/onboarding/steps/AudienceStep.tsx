import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface Props {
  value: string;
  onChange: (val: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export function AudienceStep({ value, onChange, onNext, onBack }: Props) {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-xl font-bold text-white mb-2 uppercase tracking-widest text-sm">Target Audience</h2>
        <p className="text-white/50 text-[11px] font-mono max-w-md">Precision targeting calibrates the hook generation models. Be highly specific.</p>
      </div>

      <div>
        <Textarea 
          placeholder="e.g. Co-founders of early stage B2B SaaS startups..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={200}
          className="min-h-[140px] bg-[#000000]/40 border-white/10 text-white focus-visible:ring-1 focus-visible:ring-emerald-500 text-[11px] font-mono rounded-sm p-4 leading-relaxed resize-y shadow-none transition-colors hover:border-white/20"
        />
        <div className="text-right mt-2 text-[10px] font-mono text-white/30 uppercase tracking-widest">
          {value.length} / 200 CHARACTERS
        </div>
      </div>

      <div className="flex justify-between mt-4 pt-4 border-t border-white/5">
        <Button onClick={onBack} variant="ghost" className="rounded-sm bg-transparent text-white/50 hover:bg-white/5 hover:text-white h-10 px-6 text-[10px] font-bold uppercase tracking-widest shadow-none">
          BACK
        </Button>
        <Button 
          onClick={onNext} 
          disabled={value.trim().length < 5} 
          className="rounded-sm bg-white text-black hover:bg-white/90 h-10 px-6 text-[10px] font-bold uppercase tracking-widest shadow-none disabled:opacity-50"
        >
          CONFIRM AUDIENCE
        </Button>
      </div>
    </div>
  );
}
