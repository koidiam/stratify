import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Check, ArrowLeft, Lightbulb, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { FeedbackDialog } from '@/components/generate/FeedbackDialog';

interface Props {
  initialContent: string;
  historyId: string;
  postIndex: number;
  onBack: () => void;
  userPlan?: string;
  weekNumber?: number;
  year?: number;
  postType?: string;
  hook?: string;
  idea?: string;
  explanation?: string;
}

export function FinalPost({
  initialContent,
  historyId,
  postIndex,
  onBack,
  userPlan,
  weekNumber,
  year,
  postType,
  hook,
  idea,
  explanation,
}: Props) {
  const [content, setContent] = useState(initialContent);
  const [copied, setCopied] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const wordCount = useMemo(() => {
    return content.trim().split(/\s+/).filter(Boolean).length;
  }, [content]);

  const readingTime = useMemo(() => {
    return Math.max(Math.ceil((wordCount / 200) * 60), 5);
  }, [wordCount]);

  const timeLabel = weekNumber && year ? `Week ${weekNumber}, ${year}` : 'Current strategy cycle';
  const contextParts: string[] = [];
  if (postType) contextParts.push(`${postType} format`);
  contextParts.push(timeLabel);
  const contextLine = contextParts.join(' · ');

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
          <Button onClick={onBack} variant="ghost" size="icon" className="text-white/50 mt-1 hover:bg-white/5 hover:text-white transition-colors rounded-sm">
            <ArrowLeft size={18} />
          </Button>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white uppercase">
              Artifact Editor
            </h2>
            <p className="text-white/50 text-sm mt-1 font-light">Refine the final output while keeping the strategy path visible.</p>
            <p className="str-mono text-emerald-500/80 mt-2 tracking-widest">
              {contextLine}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 md:justify-end">
          {userPlan === 'pro' ? (
            <Button
              onClick={() => setFeedbackOpen(true)}
              variant="outline"
              className="border-white/10 bg-transparent text-white/80 hover:bg-white/5 hover:text-white rounded-sm text-xs font-mono uppercase tracking-wider h-10"
            >
              Metrics
            </Button>
          ) : (
             <Button
               onClick={() => setFeedbackOpen(true)}
               variant="outline"
               className="border-amber-500/30 bg-amber-500/5 text-amber-500 hover:bg-amber-500/10 rounded-sm text-xs font-mono uppercase tracking-wider h-10"
             >
               <Lock className="mr-2 h-3.5 w-3.5 opacity-70" />
               Metrics (Pro)
             </Button>
          )}
          <Button 
            onClick={handleCopy} 
            className="rounded-sm bg-white text-black hover:bg-white/90 transition-all font-bold text-xs uppercase tracking-widest h-10"
          >
            {copied ? <Check className="mr-2 w-3.5 h-3.5" /> : <Copy className="mr-2 w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy Payload'}
          </Button>
        </div>
      </div>

      <div className="relative str-panel rounded-sm">
        <div className="bg-white/5 flex items-center gap-2 px-6 py-3 border-b border-white/10">
           <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
           <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
           <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
           <span className="ml-3 str-mono">ARTIFACT_FILE_0{postIndex + 1}.TXT</span>
        </div>
        <Textarea 
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[350px] w-full bg-transparent border-none text-white/90 text-[15px] font-medium resize-y p-6 focus-visible:ring-0 leading-relaxed font-mono"
          style={{ whiteSpace: 'pre-wrap' }}
        />
        <div className="px-6 py-3 border-t border-white/10 bg-white/[0.02] flex items-center gap-4 text-[11px] text-white/50 font-mono">
          <span>LEN: {wordCount} W</span>
          <span className="text-white/20">|</span>
          <span>EST_READ: {readingTime} S</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[1.3fr_0.9fr]">
        <div className="space-y-4">
          <div className="str-panel rounded-sm p-5 text-sm text-emerald-500/80 flex items-start gap-4">
            <Lightbulb className="max-h-5 max-w-5 shrink-0 text-emerald-500/60" />
            <p className="leading-relaxed font-light text-white/80">Formatting retained. Output structured for optimal mobile parsing while staying connected to the original strategy path.</p>
          </div>

          <div className="str-panel rounded-sm p-5">
            <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/30">Selected Strategy Path</div>
            {hook && (
              <div className="mt-4">
                <div className="text-[9px] font-bold uppercase tracking-widest text-white/35">Hook</div>
                <p className="mt-2 text-sm leading-relaxed text-white/80">{hook}</p>
              </div>
            )}
            {idea && (
              <div className="mt-4">
                <div className="text-[9px] font-bold uppercase tracking-widest text-white/35">Angle</div>
                <p className="mt-2 text-sm leading-relaxed text-white/70">{idea}</p>
              </div>
            )}
            {explanation && (
              <div className="mt-4">
                <div className="text-[9px] font-bold uppercase tracking-widest text-white/35">Why this path fits</div>
                <p className="mt-2 text-sm leading-relaxed text-white/70">{explanation}</p>
              </div>
            )}
          </div>
        </div>

        {userPlan !== 'pro' && (
           <div className="str-panel border-amber-500/30 bg-amber-500/5 rounded-sm p-5 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-[0.03] pointer-events-none">
              <Lock size={120} />
            </div>
            <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-amber-500/80">
              <Lock size={10} /> REQUIRED_UPGRADE
            </p>
            <h3 className="mt-2 text-sm font-bold text-white tracking-wide">METRICS PIPELINE</h3>
            <p className="mt-2 text-xs leading-relaxed text-white/50 font-light max-w-[90%]">
              Feeding publication metrics back into the system calibrates future generations specifically to your audience graph.
            </p>
            <Button
              onClick={() => setFeedbackOpen(true)}
              variant="outline"
              size="sm"
              className="mt-4 border-amber-500/30 bg-black text-amber-500 hover:bg-amber-500/10 hover:text-amber-400 transition-colors rounded-sm text-[10px] font-bold uppercase tracking-widest"
            >
              Unlock Analytics
            </Button>
          </div>
        )}
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
