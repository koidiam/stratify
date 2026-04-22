import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Check, ArrowLeft, Lock } from 'lucide-react';
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

function formatPathType(type?: string): string | null {
  if (!type) return null;
  if (type === 'Personal') return 'Firsthand';
  if (type === 'Contrarian') return 'Contrast';
  if (type === 'Soft Sell') return 'Offer';
  if (type === 'How-to') return 'How-To';
  return type;
}

function getHookEntryLabel(text?: string): string | null {
  const lower = text?.toLowerCase() ?? '';

  if (!lower) return null;
  if (/\?|how |why |what /.test(lower)) return 'Open-loop entry.';
  if (/\d|%|\dx/.test(lower)) return 'Data-led entry.';
  if (/\bi |\bmy |\bwe /.test(lower)) return 'Firsthand entry.';
  if (/stop|never|don't|quit|wrong/.test(lower)) return 'Contrast entry.';

  return 'Authority entry.';
}

function getExplanationSignal(explanation?: string): string | null {
  const lower = explanation?.toLowerCase() ?? '';

  if (!lower) return null;
  if (/(proof|result|evidence|example|case|experience)/.test(lower)) return 'Proof-backed.';
  if (/(data|metric|number|specific|concrete)/.test(lower)) return 'Concrete detail retained.';
  if (/(contrast|contrarian|wrong|default|myth)/.test(lower)) return 'Contrast retained.';
  if (/(story|personal|authentic|relatable|identity)/.test(lower)) return 'Identity match preserved.';
  if (/(authority|credibility|expertise)/.test(lower)) return 'Authority frame intact.';
  if (/(curiosity|question|gap|unknown)/.test(lower)) return 'Open loop preserved.';

  return null;
}

function getPathInterpretation(hook?: string, idea?: string, explanation?: string): string {
  const parts: string[] = [];
  const hookEntry = getHookEntryLabel(hook);

  if (hookEntry) parts.push(hookEntry);
  if (idea) parts.push(`${idea} direction.`);

  const explanationSignal = getExplanationSignal(explanation);
  if (explanationSignal) parts.push(explanationSignal);

  if (parts.length === 0) return 'Signal alignment intact.';
  return parts.join(' ');
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
  const [operatorNote, setOperatorNote] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);
  const [noteSaved, setNoteSaved] = useState(false);

  const nextCycleHook = useMemo(() => {
    const pType = postType?.toLowerCase() || '';
    if (pType.includes('contrarian') || pType.includes('contrast')) {
      return 'System will continue tracking whether contrast phrasing drives baseline engagement.';
    }
    if (pType.includes('personal') || pType.includes('firsthand')) {
      return 'System will observe if firsthand identity matching sustains under new weekly signals.';
    }
    if (pType.includes('how-to') || pType.includes('framework')) {
      return 'System will observe if structural breakdowns retain audience attention over broad hooks.';
    }
    if (pType.includes('soft sell') || pType.includes('offer')) {
      return 'System will track if soft-sell conversion patterns persist through friction.';
    }
    return 'System will monitor whether this baseline authority pattern sustains under new signals.';
  }, [postType]);

  const handleSaveNote = async () => {
    if (!operatorNote.trim()) return;
    setSubmittingNote(true);
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history_id: historyId,
          post_index: postIndex,
          notes: operatorNote.trim(),
        }),
      });
      if (!response.ok) throw new Error('Failed to save note');
      setNoteSaved(true);
      toast.success('Operator note saved for next cycle.');
    } catch {
      toast.error('Failed to save note.');
    } finally {
      setSubmittingNote(false);
    }
  };

  const wordCount = useMemo(() => {
    return content.trim().split(/\s+/).filter(Boolean).length;
  }, [content]);

  const readingTime = useMemo(() => {
    return Math.max(Math.ceil((wordCount / 200) * 60), 5);
  }, [wordCount]);

  const timeLabel = weekNumber && year ? `Week ${weekNumber}, ${year}` : 'Current strategy cycle';
  const contextParts: string[] = [];
  const displayPostType = formatPathType(postType);
  if (displayPostType) contextParts.push(displayPostType);
  contextParts.push(timeLabel);
  const contextLine = contextParts.join(' · ');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success('Draft copied.');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy.');
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
            <div className="text-[10px] font-mono uppercase tracking-widest text-emerald-500/80">Step 3 of 3 · Draft Editor</div>
            <h2 className="text-xl font-bold tracking-tight text-white uppercase">
              Draft Editor
            </h2>
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
              Log Results
            </Button>
          ) : (
             <Button
               onClick={() => setFeedbackOpen(true)}
               variant="outline"
               className="border-white/10 bg-white/[0.02] text-white/50 hover:bg-white/5 rounded-sm text-xs font-mono uppercase tracking-wider h-10"
             >
               <Lock className="mr-2 h-3.5 w-3.5 opacity-40" />
               Log Results
             </Button>
          )}
          <Button 
            onClick={handleCopy} 
            className="rounded-sm bg-white text-black hover:bg-white/90 transition-all font-bold text-xs uppercase tracking-widest h-10"
          >
            {copied ? <Check className="mr-2 w-3.5 h-3.5" /> : <Copy className="mr-2 w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy Draft'}
          </Button>
        </div>
      </div>

      <div className="relative str-panel rounded-sm">
        <div className="bg-white/5 flex flex-col gap-3 px-6 py-3 border-b border-white/10">
           <div className="flex items-center gap-2">
             <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
             <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
             <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
             <span className="ml-3 str-mono">ARTIFACT_FILE_0{postIndex + 1}.TXT</span>
           </div>
           <div className="text-[11px] font-mono text-emerald-500/80 uppercase tracking-widest">
             This draft follows: {formatPathType(postType) || 'Baseline'} pattern derived from system shift
           </div>
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
        <div>
          <div className="str-panel rounded-sm p-5">
            <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/30">Selected Path</div>
            {hook && (
              <div className="mt-4">
                <div className="text-[9px] font-bold uppercase tracking-widest text-white/35">Entry Point</div>
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-white/80">{hook}</p>
              </div>
            )}
            {idea && (
              <div className="mt-4">
                <div className="text-[9px] font-bold uppercase tracking-widest text-white/35">Direction</div>
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-white/70">{idea}</p>
              </div>
            )}
            {explanation && (
              <div className="mt-4">
                <div className="text-[9px] font-bold uppercase tracking-widest text-white/35">Reasoning</div>
                <p className="mt-2 text-sm leading-relaxed text-white/70">Derived from current system logic parameters.</p>
              </div>
            )}
          </div>
        </div>

        {userPlan !== 'pro' && (
           <div className="str-panel border-white/5 bg-white/[0.02] rounded-sm p-5 relative overflow-hidden">
            <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-white/40">
              <Lock size={10} /> Learning Layer Sealed
            </p>
            <h3 className="mt-2 text-sm font-medium text-white tracking-wide">Metrics loop is sealed above current depth</h3>
            <p className="mt-2 text-[12px] leading-relaxed text-white/50 font-light max-w-[90%]">
              Feeding publication metrics back into the engine allows it to adapt to your audience over time. This learning resolution system opens in the Intelligence Layer.
            </p>
            <Button
              onClick={() => setFeedbackOpen(true)}
              variant="outline"
              size="sm"
              className="mt-4 border-white/10 bg-transparent text-white/60 hover:bg-white/5 hover:text-white transition-colors rounded-sm text-[10px] font-bold uppercase tracking-widest"
            >
              Review Intelligence Layer
            </Button>
          </div>
        )}
      </div>

      <div className="border-t border-white/5 pt-6 mt-8 flex flex-col gap-4 md:flex-row md:items-stretch">
        {/* Next Cycle Hook */}
        <div className="flex-1 rounded-sm border border-emerald-500/10 bg-emerald-500/5 p-5 flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-400 mb-3">Forward Dependency</div>
            <p className="text-[13px] leading-relaxed text-white/90">
              {nextCycleHook}
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-emerald-500/10 text-[10px] uppercase font-mono tracking-widest text-emerald-500/60">
            System will extract baseline for next pass.
          </div>
        </div>

        {/* Operator Note */}
        <div className="flex-1 str-panel rounded-sm p-5">
           <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/30 mb-3">Note for next cycle</div>
           {noteSaved ? (
             <div className="h-full flex items-center justify-center min-h-[80px]">
               <div className="text-[11px] font-mono text-emerald-500/80 uppercase tracking-widest">Note retained for next cycle.</div>
             </div>
           ) : (
             <div className="space-y-3">
               <Textarea 
                 value={operatorNote}
                 onChange={(e) => setOperatorNote(e.target.value)}
                 placeholder="Add anything you want the system to consider next cycle... (optional)"
                 className="min-h-[80px] bg-[#000000]/40 border-white/10 text-[12px] font-mono placeholder:text-white/20 resize-none hover:bg-white/5 transition-colors focus-visible:ring-1 focus-visible:ring-emerald-500 rounded-sm"
               />
               <p className="text-[11px] text-white/40 leading-snug">
                 This note helps shape how the next cycle is evaluated.
               </p>
               <Button onClick={handleSaveNote} disabled={submittingNote || !operatorNote.trim()} size="sm" className="w-full text-[10px] font-bold uppercase tracking-widest h-8 bg-white/5 hover:bg-white/10 text-white rounded-sm border border-white/10 shadow-none">
                 {submittingNote ? 'Saving...' : 'Save note'}
               </Button>
             </div>
           )}
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
