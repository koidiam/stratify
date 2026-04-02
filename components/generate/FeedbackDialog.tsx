"use client";

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Eye, MessageSquare, Repeat2, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getApiError, getErrorMessage } from '@/lib/utils/parsers';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  historyId: string;
  postIndex: number;
}

function toMetric(value: string): number {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }

  return parsed;
}

export function FeedbackDialog({ open, onOpenChange, historyId, postIndex }: Props) {
  const [views, setViews] = useState('');
  const [likes, setLikes] = useState('');
  const [comments, setComments] = useState('');
  const [reposts, setReposts] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const engagementRate = useMemo(() => {
    const totalViews = toMetric(views);

    if (totalViews === 0) {
      return null;
    }

    const totalEngagement =
      toMetric(likes) + toMetric(comments) + toMetric(reposts);

    return ((totalEngagement / totalViews) * 100).toFixed(1);
  }, [comments, likes, reposts, views]);

  const reset = () => {
    setViews('');
    setLikes('');
    setComments('');
    setReposts('');
    setNotes('');
  };

  const handleSubmit = async () => {
    setSubmitting(true);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          history_id: historyId,
          post_index: postIndex,
          views: toMetric(views),
          likes: toMetric(likes),
          comments: toMetric(comments),
          reposts: toMetric(reposts),
          notes: notes.trim(),
        }),
      });

      const payload: unknown = await response.json();

      if (!response.ok) {
        throw new Error(getApiError(payload) ?? 'Failed to save feedback.');
      }

      toast.success('Performance metrics added.');
      setIsSuccess(true);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      reset();
      setIsSuccess(false);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl str-panel bg-[#050505] p-0 text-white shadow-2xl overflow-y-auto max-h-[90vh] rounded-sm">
        <div className="border-b border-emerald-500/20 bg-emerald-500/5 px-6 py-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 h-full w-32 bg-gradient-to-r from-transparent to-emerald-500/5 mix-blend-overlay pointer-events-none" />
          <DialogHeader className="relative z-10">
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-sm border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-emerald-500 w-max">
              <TrendingUp className="h-3 w-3" />
              SYSTEM METRICS
            </div>
             <DialogTitle className="text-sm font-bold text-white uppercase tracking-widest mt-2">
              Performance Telemetry
             </DialogTitle>
            <DialogDescription className="max-w-xl text-[11px] font-light leading-relaxed text-white/50 mt-2 font-mono">
              Entering historical metrics locks them into your AI model&apos;s training loop database. 
              The computational engine parses impressions and engagement velocity to optimize strategy arrays iteratively.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-6 px-6 py-6 border-x border-x-white/5">
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="rounded-sm border border-emerald-500/30 bg-emerald-500/10 p-6 text-center mb-6 w-full max-w-sm">
                <div className="text-emerald-500 font-mono text-sm mb-2 font-bold uppercase tracking-widest">
                  Metrics Logged
                </div>
                <p className="text-xs text-white/50 font-mono">
                  Future generation cycles will adapt based on this data.
                </p>
              </div>
              <Button onClick={() => handleOpenChange(false)} className="rounded-sm bg-white text-black h-10 px-8 font-bold text-[9px] uppercase tracking-widest shadow-none">
                Close
              </Button>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-sm border border-white/5 bg-white/[0.02] p-4">
                  <Label htmlFor="views" className="mb-3 text-white/40 flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest">
                    <Eye className="h-3 w-3 text-white/20" />
                    Impressions
                  </Label>
                  <Input
                    id="views"
                    inputMode="numeric"
                    min={0}
                    placeholder="e.g. 12450"
                    value={views}
                    onChange={(event) => setViews(event.target.value)}
                    className="h-10 rounded-sm border-white/10 bg-[#000000]/40 px-3 text-[11px] font-mono text-white placeholder:text-white/20 focus-visible:ring-1 focus-visible:ring-emerald-500 shadow-none hover:bg-white/5 transition-colors"
                  />
                </div>

                <div className="rounded-sm border border-white/5 bg-white/[0.02] p-4">
                  <Label htmlFor="likes" className="mb-3 text-white/40 flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest">
                    <TrendingUp className="h-3 w-3 text-white/20" />
                    Likes
                  </Label>
                  <Input
                    id="likes"
                    inputMode="numeric"
                    min={0}
                    placeholder="e.g. 311"
                    value={likes}
                    onChange={(event) => setLikes(event.target.value)}
                    className="h-10 rounded-sm border-white/10 bg-[#000000]/40 px-3 text-[11px] font-mono text-white placeholder:text-white/20 focus-visible:ring-1 focus-visible:ring-emerald-500 shadow-none hover:bg-white/5 transition-colors"
                  />
                </div>

                <div className="rounded-sm border border-white/5 bg-white/[0.02] p-4">
                  <Label htmlFor="comments" className="mb-3 text-white/40 flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest">
                    <MessageSquare className="h-3 w-3 text-white/20" />
                    Comments
                  </Label>
                  <Input
                    id="comments"
                    inputMode="numeric"
                    min={0}
                    placeholder="e.g. 28"
                    value={comments}
                    onChange={(event) => setComments(event.target.value)}
                    className="h-10 rounded-sm border-white/10 bg-[#000000]/40 px-3 text-[11px] font-mono text-white placeholder:text-white/20 focus-visible:ring-1 focus-visible:ring-emerald-500 shadow-none hover:bg-white/5 transition-colors"
                  />
                </div>

                <div className="rounded-sm border border-white/5 bg-white/[0.02] p-4">
                  <Label htmlFor="reposts" className="mb-3 text-white/40 flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest">
                    <Repeat2 className="h-3 w-3 text-white/20" />
                    Reposts
                  </Label>
                  <Input
                    id="reposts"
                    inputMode="numeric"
                    min={0}
                    placeholder="e.g. 7"
                    value={reposts}
                    onChange={(event) => setReposts(event.target.value)}
                    className="h-10 rounded-sm border-white/10 bg-[#000000]/40 px-3 text-[11px] font-mono text-white placeholder:text-white/20 focus-visible:ring-1 focus-visible:ring-emerald-500 shadow-none hover:bg-white/5 transition-colors"
                  />
                </div>
              </div>

              <div className="rounded-sm border border-white/5 bg-white/[0.02] p-4">
                <Label htmlFor="notes" className="mb-3 text-[10px] uppercase font-bold tracking-widest text-white/40 block">
                  Operator Context Notes
                </Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="e.g. The first sentence hook worked extremely well..."
                  className="min-h-[100px] rounded-sm border-white/10 bg-[#000000]/40 p-3 text-[11px] font-mono text-white placeholder:text-white/20 focus-visible:ring-1 focus-visible:ring-emerald-500 shadow-none resize-y hover:bg-white/5 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-4 rounded-sm border border-white/5 bg-white/[0.02] p-5 text-sm md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-[9px] uppercase font-bold tracking-widest text-emerald-500/80">
                    Calculated Vector
                  </div>
                  <p className="mt-1.5 max-w-xl text-[10px] font-mono leading-relaxed text-white/50">
                    Telemetry mapped to artifact F_0{postIndex + 1}.
                    {engagementRate ? ` Estimated conversion velocity: ${engagementRate}%.` : ' Rate derived intrinsically from impressions.'}
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="ghost"
                    onClick={() => handleOpenChange(false)}
                    className="h-9 rounded-sm text-[9px] font-bold uppercase tracking-widest bg-transparent text-white/50 hover:bg-white/5 hover:text-white shadow-none"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="h-9 rounded-sm text-[9px] font-bold uppercase tracking-widest bg-white text-black hover:bg-white/90 shadow-none"
                  >
                    {submitting ? 'Saving...' : 'Save Metrics'}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
