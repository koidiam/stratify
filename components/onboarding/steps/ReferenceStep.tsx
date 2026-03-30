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
        <h2 className="text-xl font-semibold text-foreground mb-2 tracking-tight">Got a reference post you liked?</h2>
        <p className="text-muted-foreground text-sm">Paste URLs to your favorite LinkedIn posts (Optional). We use these for deeper style analysis.</p>
      </div>

      <div className="flex flex-col gap-4">
        {urls.map((url, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input 
              placeholder="https://linkedin.com/posts/..."
              value={url}
              onChange={(e) => handleUrlChange(i, e.target.value)}
              className="bg-background border-border text-foreground focus-visible:ring-1 focus-visible:ring-primary rounded-lg h-11 px-4"
            />
            {urls.length > 1 && (
              <Button 
                onClick={() => removeField(i)} 
                variant="ghost" 
                size="icon"
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 h-11 w-11"
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
            className="w-full sm:w-auto border-border border-dashed text-muted-foreground hover:bg-secondary/50 hover:text-foreground h-11 rounded-lg"
          >
             <Plus className="mr-2 h-4 w-4" /> Add another example
          </Button>
        )}
      </div>

      <div className="flex justify-between items-center mt-8 pt-4 border-t border-border">
        <Button onClick={onBack} variant="ghost" disabled={loading} className="text-muted-foreground hover:text-foreground font-medium">
          Back
        </Button>
        <div className="flex flex-col-reverse sm:flex-row gap-3">
          <Button 
            onClick={() => { onChange([]); onSubmit(); }} 
            variant="ghost"
            disabled={loading}
            className="text-muted-foreground hover:bg-secondary/50 hover:text-foreground font-medium"
          >
            {loading ? 'Saving...' : 'Bu adımı şimdilik atla'}
          </Button>
          <Button 
            onClick={onSubmit} 
            disabled={loading} 
            className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[140px] font-medium"
          >
            {loading ? 'Processing...' : 'Save & Finish'}
          </Button>
        </div>
      </div>
    </div>
  );
}
