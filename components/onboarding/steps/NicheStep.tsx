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
        <h2 className="text-xl font-semibold text-foreground mb-2 tracking-tight">What is your primary niche?</h2>
        <p className="text-muted-foreground text-sm">Select your focus area so we can tailor the insight system to your expertise.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {NICHES.map((niche) => (
          <Card 
            key={niche.id}
            onClick={() => onChange(niche.id)}
            className={`p-5 cursor-pointer border transition-all duration-200 rounded-[16px]
              ${value === niche.id 
                ? 'border-primary bg-primary/5 shadow-[0_0_20px_rgba(29,78,216,0.1)]' 
                : 'border-border bg-card hover:border-primary/40 hover:bg-secondary/50'}`}
          >
            <h3 className="text-[15px] font-medium text-foreground mb-1">{niche.label}</h3>
            <p className="text-[13px] text-muted-foreground">{niche.desc}</p>
          </Card>
        ))}
      </div>

      <div className="flex justify-end mt-4">
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
