import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Props {
  value: string;
  onChange: (val: string) => void;
  onNext: () => void;
}

const NICHES = [
  { id: 'saas_founder', label: 'SaaS Founder', desc: 'B2B/B2C SaaS ürün kurucuları' },
  { id: 'developer', label: 'Developer / Engineer', desc: 'Yazılım uzmanları ve mühendisler' },
  { id: 'freelancer', label: 'Freelancer', desc: 'Bağımsız çalışanlar ve danışmanlar' },
  { id: 'creator', label: 'Creator / Solopreneur', desc: 'İçerik üreticileri ve tek kişilik dev kadrolar' }
];

export function NicheStep({ value, onChange, onNext }: Props) {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Hangi alanda büyümek istiyorsun?</h2>
        <p className="text-gray-400">İçgörü sistemini sana özel ayarlayabilmemiz için odak noktanı seç.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {NICHES.map((niche) => (
          <Card 
            key={niche.id}
            onClick={() => onChange(niche.id)}
            className={`p-6 cursor-pointer border-2 transition-all duration-200 
              ${value === niche.id 
                ? 'border-blue-500 bg-blue-500/10' 
                : 'border-[#2A2A2A] bg-[#1A1A1A] hover:border-blue-500/50 hover:bg-[#2A2A2A]'}`}
          >
            <h3 className="text-lg font-medium text-white mb-1">{niche.label}</h3>
            <p className="text-sm text-gray-400">{niche.desc}</p>
          </Card>
        ))}
      </div>

      <div className="flex justify-end mt-4">
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
