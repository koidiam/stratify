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
  'Direkt ve kısa',
  'Eğitici ve detaylı',
  'Kişisel ve samimi',
  'Analitik ve veri odaklı'
];

export function ToneStep({ value, onChange, onNext, onBack }: Props) {
  const [extraTone, setExtraTone] = useState('');

  const handleSelect = (tone: string) => {
    // Custom logic to handle tone if needed
    onChange(tone);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Nasıl bir ses tonu kullanıyorsun?</h2>
        <p className="text-gray-400">Üretimlerin senin ağzından çıkmış gibi doğal görünmesi için önemli.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {TONES.map((tone) => (
          <Card 
            key={tone}
            onClick={() => handleSelect(tone)}
            className={`p-4 cursor-pointer border-2 transition-all text-center
              ${value === tone 
                ? 'border-blue-500 bg-blue-500/10 text-white font-medium' 
                : 'border-[#2A2A2A] bg-[#1A1A1A] hover:border-blue-500/50 hover:bg-[#2A2A2A] text-gray-300'}`}
          >
            {tone}
          </Card>
        ))}
      </div>

      <div>
        <label className="text-sm text-gray-400 mb-2 block">Eklemek istediğin başka bir detay var mı? (İsteğe bağlı)</label>
        <Textarea 
          placeholder="Örn: Emojileri az kullanırım, fazla resmiyetten hoşlanmam..."
          value={extraTone}
          onChange={(e) => setExtraTone(e.target.value)}
          onBlur={() => extraTone && onChange(`${value} - Ek: ${extraTone}`)}
          className="min-h-[80px] bg-[#1A1A1A] border-[#2A2A2A] text-white focus-visible:ring-blue-500"
        />
      </div>

      <div className="flex justify-between mt-4">
        <Button onClick={onBack} variant="ghost" className="text-gray-400 hover:text-white">
          Geri
        </Button>
        <Button 
          onClick={onNext} 
          disabled={!value} 
          className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]"
        >
          Devam Et
        </Button>
      </div>
    </div>
  );
}
