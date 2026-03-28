import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Plus } from 'lucide-react';

interface Props {
  value: string[];
  onChange: (val: string[]) => void;
  onSubmit: () => void;
  onBack: () => void;
  loading: boolean;
}

export function ReferenceStep({ value, onChange, onSubmit, onBack, loading }: Props) {
  const [urls, setUrls] = useState<string[]>(value.length > 0 ? value : ['']);

  const handleUrlChange = (index: number, val: string) => {
    const newUrls = [...urls];
    newUrls[index] = val;
    setUrls(newUrls);
    onChange(newUrls.filter(u => u.trim() !== ''));
  };

  const addField = () => {
    if (urls.length < 3) {
      setUrls([...urls, '']);
    }
  };

  const removeField = (index: number) => {
    const newUrls = urls.filter((_, i) => i !== index);
    setUrls(newUrls.length ? newUrls : ['']);
    onChange(newUrls.filter(u => u.trim() !== ''));
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Beğendiğin bir LinkedIn postu var mı?</h2>
        <p className="text-gray-400">Varsa URL adresini yapıştır (Opsiyonel). Stil analizi için bu örneklere bakacağız.</p>
      </div>

      <div className="flex flex-col gap-4">
        {urls.map((url, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input 
              placeholder="https://linkedin.com/posts/..."
              value={url}
              onChange={(e) => handleUrlChange(i, e.target.value)}
              className="bg-[#1A1A1A] border-[#2A2A2A] text-white focus-visible:ring-blue-500"
            />
            {urls.length > 1 && (
              <Button 
                onClick={() => removeField(i)} 
                variant="ghost" 
                size="icon"
                className="text-gray-500 hover:text-red-400 flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}

        {urls.length < 3 && (
          <Button 
            onClick={addField} 
            variant="outline" 
            className="w-full sm:w-auto border-[#2A2A2A] text-gray-400 hover:text-white"
          >
             <Plus className="mr-2 h-4 w-4" /> Başka bir örnek ekle
          </Button>
        )}
      </div>

      <div className="flex justify-between items-center mt-8">
        <Button onClick={onBack} variant="ghost" disabled={loading} className="text-gray-400 hover:text-white">
          Geri
        </Button>
        <div className="flex gap-3">
          <Button 
            onClick={onSubmit} 
            variant="secondary"
            disabled={loading}
            className="bg-[#2A2A2A] text-white hover:bg-[#3A3A3A] hidden sm:flex"
          >
            {loading ? 'Kaydediliyor...' : 'Atla ve Bitir'}
          </Button>
          <Button 
            onClick={onSubmit} 
            disabled={loading} 
            className="bg-blue-600 hover:bg-blue-700 text-white min-w-[140px]"
          >
            {loading ? 'Bekleniyor...' : 'Kaydet ve Bitir'}
          </Button>
        </div>
      </div>
    </div>
  );
}
