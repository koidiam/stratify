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
        <h2 className="text-xl font-semibold text-foreground mb-2 tracking-tight">Who are you trying to reach?</h2>
        <p className="text-muted-foreground text-sm">The more specific you are, the more accurate and targeted the AI hooks will be.</p>
      </div>

      <div>
        <Textarea 
          placeholder="e.g. Co-founders of early stage B2B SaaS startups..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={200}
          className="min-h-[140px] bg-background border-border text-foreground focus-visible:ring-1 focus-visible:ring-primary text-[15px] rounded-[16px] p-5 leading-relaxed resize-y"
        />
        <div className="text-right mt-2 text[11px] font-medium text-muted-foreground/60">
          {value.length}/200
        </div>
      </div>

      <div className="flex justify-between mt-4">
        <Button onClick={onBack} variant="ghost" className="text-muted-foreground hover:text-foreground font-medium">
          Back
        </Button>
        <Button 
          onClick={onNext} 
          disabled={value.trim().length < 5} 
          className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[120px] font-medium"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
