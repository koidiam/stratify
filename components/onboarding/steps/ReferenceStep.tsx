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
        <h2 className="text-xl font-bold text-white mb-2 uppercase tracking-widest text-sm">Reference Vectors</h2>
        <p className="text-white/50 text-[11px] font-mono max-w-md">Provide source URLs. We extract stylistic signatures from these inputs.</p>
      </div>

      <div className="flex flex-col gap-4 mt-2">
        {urls.map((url, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input 
              placeholder="https://linkedin.com/posts/..."
              value={url}
              onChange={(e) => handleUrlChange(i, e.target.value)}
              className="bg-[#000000]/40 border-white/10 text-white focus-visible:ring-1 focus-visible:ring-emerald-500 rounded-sm h-10 px-4 text-[11px] font-mono shadow-none transition-colors hover:border-white/20"
            />
            {urls.length > 1 && (
              <Button 
                onClick={() => removeField(i)} 
                variant="ghost" 
                size="icon"
                className="text-white/30 hover:text-red-500 hover:bg-red-500/10 shrink-0 h-10 w-10 rounded-sm shadow-none"
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
            className="w-full sm:w-auto border-white/10 border-dashed bg-transparent text-white/40 hover:bg-white/5 hover:text-white h-10 rounded-sm text-[10px] font-bold uppercase tracking-widest shadow-none"
          >
             <Plus className="mr-2 h-3 w-3" /> ADD REFERENCE
          </Button>
        )}
      </div>

      <div className="flex justify-between items-center mt-8 pt-4 border-t border-white/5">
        <Button onClick={onBack} variant="ghost" disabled={loading} className="rounded-sm bg-transparent text-white/50 hover:bg-white/5 hover:text-white h-10 px-6 text-[10px] font-bold uppercase tracking-widest shadow-none">
          BACK
        </Button>
        <div className="flex flex-col-reverse sm:flex-row gap-3">
          <Button 
            onClick={() => { onChange([]); onSubmit(); }} 
            variant="ghost"
            disabled={loading}
            className="rounded-sm bg-transparent text-white/50 hover:bg-white/5 hover:text-white h-10 px-6 text-[10px] font-bold uppercase tracking-widest shadow-none disabled:opacity-50"
          >
            {loading ? 'PROCESSING...' : 'SKIP FOR NOW'}
          </Button>
          <Button 
            onClick={onSubmit} 
            disabled={loading} 
            className="rounded-sm bg-white text-black hover:bg-white/90 h-10 px-6 text-[10px] font-bold uppercase tracking-widest shadow-none disabled:opacity-50"
          >
            {loading ? 'PROCESSING...' : 'CONFIRM SOURCES'}
          </Button>
        </div>
      </div>
    </div>
  );
}
