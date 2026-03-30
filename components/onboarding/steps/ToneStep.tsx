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
        <h2 className="text-xl font-semibold text-foreground mb-2 tracking-tight">What is your brand voice?</h2>
        <p className="text-muted-foreground text-sm">Crucial for matching your unique style and reducing final editing time.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {TONES.map((tone) => (
          <Card 
            key={tone}
            onClick={() => handleSelect(tone)}
            className={`p-4 cursor-pointer border transition-all text-center rounded-[16px] text-sm font-medium
              ${value === tone 
                ? 'border-primary bg-primary/5 text-foreground shadow-[0_0_20px_rgba(29,78,216,0.1)]' 
                : 'border-border bg-card hover:border-primary/40 text-muted-foreground'}`}
          >
            {tone}
          </Card>
        ))}
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60 mb-2 block">
          Any other special instructions? (Optional)
        </label>
        <Textarea 
          placeholder="e.g. I rarely use emojis. I prefer bullet points over numbers..."
          value={extraTone}
          onChange={(e) => setExtraTone(e.target.value)}
          onBlur={() => extraTone && onChange(`${value} - Extra: ${extraTone}`)}
          className="min-h-[100px] bg-background border-border text-foreground focus-visible:ring-1 focus-visible:ring-primary rounded-[16px] leading-relaxed resize-y p-5"
        />
      </div>

      <div className="flex justify-between mt-4">
        <Button onClick={onBack} variant="ghost" className="text-muted-foreground hover:text-foreground font-medium">
          Back
        </Button>
        <Button 
          onClick={onNext} 
          disabled={!value} 
          className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[120px] font-medium"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
