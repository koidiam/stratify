"use client";

import { useState } from 'react';
import { toast } from 'sonner';
import { ArrowRight, BarChart3, Check, Copy, Hash, LightbulbIcon, Lock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FeedbackDialog } from '@/components/generate/FeedbackDialog';

interface Post {
  content: string;
  type: string;
  explanation: string;
}

interface Idea {
  idea: string;
  type: string;
}

interface Props {
  historyId: string;
  hooks: string[];
  ideas: Idea[];
  posts: Post[];
  onSelectPost: (post: string, index: number) => void;
  onRefine: (prompt: string, index: number) => void;
  onBack: () => void;
}

export function ContentHooks({ historyId, hooks, ideas, posts, onSelectPost, onRefine, onBack }: Props) {
  const [copiedHookIndex, setCopiedHookIndex] = useState<number | null>(null);
  const [copiedPostIndex, setCopiedPostIndex] = useState<number | null>(null);
  const [feedbackPostIndex, setFeedbackPostIndex] = useState<number | null>(null);

  const handleCopy = async (value: string, kind: 'hook' | 'post', index: number) => {
    try {
      await navigator.clipboard.writeText(value);

      if (kind === 'hook') {
        setCopiedHookIndex(index);
      } else {
        setCopiedPostIndex(index);
      }

      toast.success(kind === 'hook' ? 'Hook copied.' : 'Draft copied.');

      window.setTimeout(() => {
        if (kind === 'hook') {
          setCopiedHookIndex((current) => (current === index ? null : current));
        } else {
          setCopiedPostIndex((current) => (current === index ? null : current));
        }
      }, 1800);
    } catch {
      toast.error('Failed to copy.');
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="rounded-[24px] border border-border bg-card p-6 lg:p-8">
        <h2 className="text-xl font-semibold text-foreground">Content Ideas & Hooks</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Attention-grabbing openings, alternative content angles, and customizable final drafts 
          generated specifically for your niche context.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-[20px] border border-border bg-card shadow-sm p-6">
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
            <Hash className="text-primary" size={16} />
            Strong Hooks
          </h3>
          <ul className="space-y-3">
            {hooks.map((hook, index) => (
              <li
                key={index}
                className="rounded-xl border border-border bg-secondary p-4 text-sm leading-relaxed text-foreground transition-colors hover:border-primary/30"
              >
                <p>{hook}</p>
                <Button
                  onClick={() => handleCopy(hook, 'hook', index)}
                  variant="ghost"
                  size="sm"
                  className="mt-3 px-2 h-8 text-primary hover:bg-secondary hover:text-primary transition-colors"
                >
                  {copiedHookIndex === index ? (
                    <Check className="mr-1.5 h-3.5 w-3.5" />
                  ) : (
                    <Copy className="mr-1.5 h-3.5 w-3.5" />
                  )}
                  {copiedHookIndex === index ? 'Copied' : 'Copy'}
                </Button>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-[20px] border border-border bg-card shadow-sm p-6">
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
            <LightbulbIcon className="text-yellow-500/80" size={16} />
            Alternative Ideas
          </h3>
          <ul className="space-y-3">
            {ideas.slice(0, 5).map((idea, index) => (
              <li key={index} className="rounded-xl border border-border bg-secondary p-4 text-sm leading-relaxed text-foreground">
                <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-yellow-500/80">{idea.type}</span>
                {idea.idea}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div>
        <h2 className="mb-2 text-xl font-semibold text-foreground">Ready-to-publish Drafts</h2>
        <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
          Select a draft below to edit, copy directly, or link metrics to it 
          after you publish it on LinkedIn.
        </p>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {posts.map((post, index) => (
            <Card key={index} className="flex flex-col justify-between rounded-[20px] border-border bg-card shadow-sm p-6 transition-colors hover:border-primary/30">
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <span className="rounded-md bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                    {post.type}
                  </span>
                </div>
                <div className="mb-5 line-clamp-6 whitespace-pre-wrap font-mono text-[13px] leading-relaxed text-foreground">
                  {post.content}
                </div>
                <div className="mb-4 rounded-xl border border-border bg-secondary p-3.5 text-xs leading-relaxed text-muted-foreground">
                  <span className="mb-1.5 block font-bold text-[10px] uppercase tracking-wider text-muted-foreground">Why this structure?</span>
                  {post.explanation}
                </div>
              </div>

              <div className="mt-4 space-y-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => handleCopy(post.content, 'post', index)}
                    variant="outline"
                    className="border-border bg-transparent text-foreground hover:bg-secondary"
                  >
                    {copiedPostIndex === index ? (
                      <Check className="mr-2 h-3.5 w-3.5" />
                    ) : (
                      <Copy className="mr-2 h-3.5 w-3.5" />
                    )}
                    {copiedPostIndex === index ? 'Copied' : 'Copy'}
                  </Button>
                  <Button
                    onClick={() => setFeedbackPostIndex(index)}
                    variant="outline"
                    className="border-amber-500/30 bg-amber-500/5 text-amber-600 hover:bg-amber-500/10 font-medium"
                  >
                    <Lock className="mr-1.5 h-3.5 w-3.5 opacity-70" />
                    Metrics (Pro)
                  </Button>
                </div>

                <Button
                  onClick={() => onSelectPost(post.content, index)}
                  className="w-full rounded-lg bg-primary text-primary-foreground transition-all hover:bg-primary/90 font-medium"
                >
                  Edit Draft
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                <div className="flex flex-col mt-3 pt-3 border-t border-border">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                    Refine:
                  </span>
                  <div className="flex overflow-x-auto whitespace-nowrap gap-2 hide-scrollbar pb-1">
                  {[
                    { label: 'Shorter', prompt: 'Make this post shorter. Keep the core message.' },
                    { label: 'More direct', prompt: 'Make this post more direct and punchy.' },
                    { label: 'More personal', prompt: 'Make this post more personal and conversational.' },
                    { label: 'Add a question', prompt: 'Add an engaging question at the end of this post.' },
                  ].map((action) => (
                    <button
                      key={action.label}
                      type="button"
                      onClick={() => onRefine(action.prompt, index)}
                      className="flex-shrink-0 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
                    >
                      {action.label}
                    </button>
                  ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="pt-2">
        <Button onClick={onBack} variant="ghost" className="text-muted-foreground hover:text-foreground font-medium text-sm">
          Go Back
        </Button>
      </div>

      {feedbackPostIndex !== null && (
        <FeedbackDialog
          open={feedbackPostIndex !== null}
          onOpenChange={(open) => {
            if (!open) {
              setFeedbackPostIndex(null);
            }
          }}
          historyId={historyId}
          postIndex={feedbackPostIndex}
        />
      )}
    </div>
  );
}
