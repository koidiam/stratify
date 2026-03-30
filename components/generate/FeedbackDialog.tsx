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
      <DialogContent className="max-w-2xl border-border bg-card p-0 text-foreground shadow-xl overflow-y-auto max-h-[90vh] rounded-[24px]">
        <div className="border-b border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-amber-200/5 to-transparent px-6 py-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 h-full w-32 bg-gradient-to-r from-transparent to-amber-500/5 mix-blend-overlay pointer-events-none" />
          <DialogHeader className="relative z-10">
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-600 w-max">
              <TrendingUp className="h-3 w-3" />
              Pro Feature
            </div>
             <DialogTitle className="text-xl font-semibold text-foreground tracking-tight mt-1">
              AI Learning Loop (Metrics)
             </DialogTitle>
            <DialogDescription className="max-w-xl text-sm leading-relaxed text-muted-foreground mt-2">
              Entering these metrics locks them into your AI model's training loop history. 
              The engine analyzes impressions and click rates to mathematically design better hooks for you next week.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-6 px-6 py-6">
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center mb-6 w-full">
                <div className="text-emerald-500 font-semibold text-sm mb-1">
                  ✓ Performance logged
                </div>
                <p className="text-xs text-muted-foreground">
                  Next week's strategy will factor in this post's performance.
                </p>
              </div>
              <Button onClick={() => handleOpenChange(false)} className="bg-primary text-primary-foreground px-8 font-medium">
                Close
              </Button>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[16px] border border-border bg-secondary/50 p-4">
              <Label htmlFor="views" className="mb-3 text-muted-foreground flex items-center gap-2 font-medium">
                <Eye className="h-4 w-4 text-blue-500" />
                Impressions
              </Label>
              <Input
                id="views"
                inputMode="numeric"
                min={0}
                placeholder="e.g. 12450"
                value={views}
                onChange={(event) => setViews(event.target.value)}
                className="h-11 rounded-lg border-border bg-background px-4 text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>

            <div className="rounded-[16px] border border-border bg-secondary/50 p-4">
              <Label htmlFor="likes" className="mb-3 text-muted-foreground flex items-center gap-2 font-medium">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                Likes
              </Label>
              <Input
                id="likes"
                inputMode="numeric"
                min={0}
                placeholder="e.g. 311"
                value={likes}
                onChange={(event) => setLikes(event.target.value)}
                className="h-11 rounded-lg border-border bg-background px-4 text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>

            <div className="rounded-[16px] border border-border bg-secondary/50 p-4">
              <Label htmlFor="comments" className="mb-3 text-muted-foreground flex items-center gap-2 font-medium">
                <MessageSquare className="h-4 w-4 text-amber-500" />
                Comments
              </Label>
              <Input
                id="comments"
                inputMode="numeric"
                min={0}
                placeholder="e.g. 28"
                value={comments}
                onChange={(event) => setComments(event.target.value)}
                className="h-11 rounded-lg border-border bg-background px-4 text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>

            <div className="rounded-[16px] border border-border bg-secondary/50 p-4">
              <Label htmlFor="reposts" className="mb-3 text-muted-foreground flex items-center gap-2 font-medium">
                <Repeat2 className="h-4 w-4 text-fuchsia-500" />
                Reposts
              </Label>
              <Input
                id="reposts"
                inputMode="numeric"
                min={0}
                placeholder="e.g. 7"
                value={reposts}
                onChange={(event) => setReposts(event.target.value)}
                className="h-11 rounded-lg border-border bg-background px-4 text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>
          </div>

          <div className="rounded-[16px] border border-border bg-secondary/50 p-4">
            <Label htmlFor="notes" className="mb-3 text-muted-foreground font-medium block">
              Any notable observations?
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="e.g. The first sentence hook worked extremely well, but the CTA was slightly weak. Comments focused heavily on one specific objection..."
              className="min-h-[120px] rounded-lg border-border bg-background p-4 text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary resize-y"
            />
          </div>

          <div className="flex flex-col gap-4 rounded-[16px] border border-primary/20 bg-primary/5 p-5 text-sm md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-primary/80">
                Snapshot
              </div>
              <p className="mt-1.5 max-w-xl leading-relaxed text-muted-foreground">
                Metrics will be mapped to draft #{postIndex + 1}.
                {engagementRate ? ` Estimated engagement rate: ${engagementRate}%.` : ' Rate calculates automatically when views are entered.'}
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={() => handleOpenChange(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-medium"
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
