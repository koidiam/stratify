import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Check, ArrowLeft, BarChart3, Lightbulb, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { FeedbackDialog } from '@/components/generate/FeedbackDialog';

interface Props {
  initialContent: string;
  historyId: string;
  postIndex: number;
  onBack: () => void;
}

export function FinalPost({ initialContent, historyId, postIndex, onBack }: Props) {
  const [content, setContent] = useState(initialContent);
  const [copied, setCopied] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success("Post copied! Ready for LinkedIn.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy.");
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div className="flex items-start gap-4">
          <Button onClick={onBack} variant="ghost" size="icon" className="text-muted-foreground mt-1 hover:bg-secondary hover:text-foreground transition-colors">
            <ArrowLeft size={18} />
          </Button>
          <div>
            <h2 className="text-xl font-semibold text-foreground tracking-tight">
              Final Touches
            </h2>
            <p className="text-muted-foreground text-sm mt-1">Refine the copy in your own voice and publish.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 pl-12 md:pl-0">
          <Button
            onClick={() => setFeedbackOpen(true)}
            variant="outline"
            className="border-amber-500/30 bg-amber-500/5 text-amber-600 hover:bg-amber-500/10 font-medium"
          >
            <Lock className="mr-2 h-4 w-4 opacity-70" />
            Metrics (Pro)
          </Button>
          <Button 
            onClick={handleCopy} 
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
          >
            {copied ? <Check className="mr-2 w-4 h-4" /> : <Copy className="mr-2 w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy Text'}
          </Button>
        </div>
      </div>

      <div className="relative rounded-[20px] overflow-hidden border border-border bg-card shadow-sm">
        <div className="bg-secondary flex items-center gap-2 px-4 py-3 border-b border-border">
           <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
           <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
           <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
           <span className="ml-3 text-[11px] font-mono text-muted-foreground/60 tracking-wider">linkedin-post.txt</span>
        </div>
        <Textarea 
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[350px] w-full bg-transparent border-none text-foreground text-[15px] font-medium resize-y p-6 focus-visible:ring-0 leading-relaxed font-mono"
          style={{ whiteSpace: 'pre-wrap' }}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-[1.3fr_0.9fr]">
        <div className="rounded-[16px] bg-primary/5 border border-primary/20 p-5 text-sm text-primary/90 flex items-start gap-4">
          <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-primary/80" />
          <p className="leading-relaxed">We left line breaks because over 80% of readers are on mobile. Avoid falling into thick blocks of paragraph text.</p>
        </div>

        <div className="rounded-[16px] border border-amber-500/20 bg-gradient-to-b from-amber-500/5 to-transparent shadow-sm p-5 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-[0.03] pointer-events-none">
            <Lock size={120} />
          </div>
          <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-600">
            <Lock size={10} /> Pro Feature
          </p>
          <h3 className="mt-2 text-sm font-semibold text-foreground">AI Learning Loop</h3>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground max-w-[90%]">
            Entering post metrics here trains your specific Generation Model on what works best for your audience.
          </p>
          <Button
            onClick={() => setFeedbackOpen(true)}
            variant="outline"
            size="sm"
            className="mt-4 border-amber-500/30 bg-card text-amber-600 hover:bg-amber-500/10 transition-colors"
          >
            Open Performance Panel
          </Button>
        </div>
      </div>

      <FeedbackDialog
        open={feedbackOpen}
        onOpenChange={setFeedbackOpen}
        historyId={historyId}
        postIndex={postIndex}
      />
    </div>
  );
}
