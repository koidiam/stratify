import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Check, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  initialContent: string;
  onBack: () => void;
}

export function FinalPost({ initialContent, onBack }: Props) {
  const [content, setContent] = useState(initialContent);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success("Post kopyalandı! Artık LinkedIn'de paylaşabilirsin.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Kopyalama başarısız oldu.");
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-white">
            <Button onClick={onBack} variant="ghost" size="icon" className="text-gray-400 mr-2 hover:bg-[#222]">
               <ArrowLeft size={18} />
            </Button>
            Son Rötuşlar
          </h2>
          <p className="text-gray-400 text-sm mt-1 ml-11">Kendi dilinden son düzeltmelerini yap ve yayınla.</p>
        </div>
        <Button 
          onClick={handleCopy} 
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {copied ? <Check className="mr-2 w-4 h-4" /> : <Copy className="mr-2 w-4 h-4" />}
          {copied ? 'Kopyalandı!' : 'Metni Kopyala'}
        </Button>
      </div>

      <div className="relative rounded-xl overflow-hidden border border-[#222] shadow-2xl">
        <div className="bg-[#111] flex items-center gap-2 px-4 py-3 border-b border-[#222]">
           <div className="w-3 h-3 rounded-full bg-red-500/50" />
           <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
           <div className="w-3 h-3 rounded-full bg-green-500/50" />
           <span className="ml-2 text-xs text-gray-500 font-mono">linkedin-post.txt</span>
        </div>
        <Textarea 
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[400px] w-full bg-[#1A1A1A] border-none text-white text-sm md:text-base font-medium rounded-none resize-y p-6 focus-visible:ring-0 leading-relaxed"
          style={{ whiteSpace: 'pre-wrap' }}
        />
      </div>

      <div className="bg-blue-900/10 border border-blue-500/20 rounded-lg p-4 text-sm text-blue-200 flex items-start gap-3">
        <span className="text-xl">💡</span>
        <p>Aralara boşluklar bıraktık çünkü mobilden okuma oranı yuzde 80 uzerinde. Kalin paragraf bloklarindan kacinmaya devam et.</p>
      </div>

    </div>
  );
}
