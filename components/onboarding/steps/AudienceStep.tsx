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
        <h2 className="text-2xl font-bold text-white mb-2">Kimin dikkatini çekmek istiyorsun?</h2>
        <p className="text-gray-400">Ne kadar spesifik olursan, içgörüler o kadar isabetli olur.</p>
      </div>

      <div>
        <Textarea 
          placeholder="Örn: Erken aşama B2B SaaS şirketlerinin kurucu ortakları..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={200}
          className="min-h-[150px] bg-[#1A1A1A] border-[#2A2A2A] text-white resize-none text-base focus-visible:ring-blue-500"
        />
        <div className="text-right mt-2 text-xs text-gray-500">
          {value.length}/200
        </div>
      </div>

      <div className="flex justify-between mt-4">
        <Button onClick={onBack} variant="ghost" className="text-gray-400 hover:text-white">
          Geri
        </Button>
        <Button 
          onClick={onNext} 
          disabled={value.trim().length < 5} 
          className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]"
        >
          Devam Et
        </Button>
      </div>
    </div>
  );
}
