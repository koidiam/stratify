"use client";

import { useState } from 'react';
import { toast } from 'sonner';
import { ArrowRight, Check, CheckCircle2, Copy, Hash, LightbulbIcon, Lock } from 'lucide-react';
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
  userPlan?: string;
  weekNumber?: number;
  year?: number;
  dataSource?: string;
}

function classifyHookType(text: string): string {
  const lower = text.toLowerCase();
  if (/\?|how |why |what /.test(lower)) return 'Curiosity';
  if (/\d|%|\dx/.test(lower)) return 'Data-driven';
  if (/\bi |\bmy |\bwe /.test(lower)) return 'Personal';
  if (/stop|never|don't|quit|wrong/.test(lower)) return 'Contrarian';
  return 'Authority';
}

function assessHookStrength(text: string): 'High' | 'Medium' | 'Low' {
  let score = 0;
  if (text.length >= 15 && text.length <= 80) score++;
  if (/\d+|%/.test(text)) score++;
  if (/stop|never|don't|quit|wrong|secret|exactly|proven|truth|real|actually/i.test(text)) score++;
  if (/\?|:|\d+\s/.test(text)) score++;
  if (!/just|maybe|kind of|sort of|basically/i.test(text)) score++;
  if (score >= 4) return 'High';
  if (score >= 2) return 'Medium';
  return 'Low';
}

const STRENGTH_BARS: Record<string, number> = { 'High': 3, 'Medium': 2, 'Low': 1 };

function getSelectionReason(hook: string, idea?: Idea): string {
  const hookType = classifyHookType(hook);
  const ideaType = idea?.type ? `${idea.type} angle` : 'draft angle';
  return `This path stays closest to the observed pattern because the ${hookType.toLowerCase()} hook structure and ${ideaType.toLowerCase()} both follow the same behavior described in the signal notes.`;
}

export function ContentHooks({ historyId, hooks, ideas, posts, onSelectPost, onRefine, onBack, userPlan, weekNumber, year, dataSource }: Props) {
  const [copiedHookIndex, setCopiedHookIndex] = useState<number | null>(null);
  const [copiedPostIndex, setCopiedPostIndex] = useState<number | null>(null);
  const [feedbackPostIndex, setFeedbackPostIndex] = useState<number | null>(null);

  const sourceLabel = dataSource ?? 'Niche signals';
  const timeLabel = weekNumber && year ? `Week ${weekNumber}, ${year}` : 'This week';

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
      <div className="str-panel rounded-sm p-6 lg:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-l-emerald-500">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">Generation Workbench</h2>
          <p className="mt-2 text-sm text-white/50 max-w-xl font-light">
            Observed patterns are now being turned into working angles, hooks, and draft directions. Each path below shows how the same signal logic carries through the output.
          </p>
        </div>
        <div className="flex flex-col items-start md:items-end gap-1.5 focus:outline-none">
          <div className="str-mono text-emerald-500/80">
            <CheckCircle2 className="inline-block h-3 w-3 mr-1 mb-0.5" />
            Analysis Complete
          </div>
          <div className="str-mono text-white/40">
            {hooks.length} HOOKS · {posts.length} DRAFTS
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="str-panel rounded-sm p-6">
          <h3 className="mb-4 flex items-center gap-2 font-bold text-white uppercase text-sm tracking-widest">
            <Hash className="text-emerald-500" size={14} />
            Hook Layer
          </h3>
          <ul className="space-y-3">
            {hooks.map((hook, index) => {
              const hookType = classifyHookType(hook);
              const strength = assessHookStrength(hook);
              const bars = STRENGTH_BARS[strength];

              return (
                <li
                  key={index}
                  className="rounded-sm border border-white/10 bg-white/[0.02] hover:border-white/20 p-4 text-sm leading-relaxed transition-colors relative group text-white/90 font-light"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="block text-[9px] font-bold uppercase tracking-widest text-emerald-500/60">
                      TYPE: {hookType}
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm bg-white/5 text-white/40">
                      Option {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <p>{hook}</p>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className={`w-3 h-1 rounded-[1px] ${i <= bars ? 'bg-white/50' : 'bg-white/10'}`} />
                        ))}
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-white/40">
                        {strength}
                      </span>
                    </div>
                    <span className="text-[9px] text-white/20">structure estimate</span>
                  </div>
                  <Button
                    onClick={() => handleCopy(hook, 'hook', index)}
                    variant="ghost"
                    size="sm"
                    className="absolute top-8 right-2 px-2 h-7 text-white/40 hover:bg-white/10 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                  >
                    {copiedHookIndex === index ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="str-panel rounded-sm p-6 flex flex-col">
          <h3 className="mb-4 flex items-center gap-2 font-bold text-white uppercase text-sm tracking-widest">
            <LightbulbIcon className="text-amber-500/80" size={14} />
            Alternative Ideas
          </h3>
          <ul className="space-y-3 flex-1 overflow-y-auto pr-2" style={{ maxHeight: 'calc(100vh - 400px)' }}>
            {ideas.slice(0, 5).map((idea, index) => (
              <li key={index} className="rounded-sm border border-white/10 bg-white/[0.02] p-4 text-sm leading-relaxed text-white/90">
                <span className="mb-2 block text-[9px] font-bold uppercase tracking-widest text-amber-500/60 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-amber-500/50 rounded-full" />
                  {idea.type}
                </span>
                <p className="font-light">{idea.idea}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="pt-4 border-t border-white/10">
        <h2 className="mb-2 text-sm font-bold uppercase tracking-widest text-white">Strategy Paths</h2>
        <p className="mb-6 text-sm leading-relaxed text-white/50 font-light max-w-2xl">
          Each path combines a strategic opening, the draft direction, and the explanation for why it should work.
        </p>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {posts.map((post, index) => (
            <Card key={index} className="flex flex-col justify-between rounded-sm str-panel p-5 transition-colors hover:border-white/20 group">
              <div>
                <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="str-mono text-white/60">Path 0{index + 1}</span>
                  <span className="str-mono text-emerald-500/80 bg-emerald-500/10 px-2 py-0.5 rounded-sm">
                    {post.type}
                  </span>
                </div>
                <div className="mb-4 space-y-3">
                  <div className="rounded-sm border border-white/10 bg-black/30 p-3">
                    <div className="text-[9px] font-bold uppercase tracking-widest text-white/35">Opening Hook</div>
                    <p className="mt-2 text-sm leading-relaxed text-white/85">
                      {hooks[index] ?? hooks[0] ?? 'Hook not available.'}
                    </p>
                  </div>
                  {ideas[index]?.idea && (
                    <div className="rounded-sm border border-white/10 bg-black/30 p-3">
                      <div className="text-[9px] font-bold uppercase tracking-widest text-white/35">Draft Angle</div>
                      <p className="mt-2 text-sm leading-relaxed text-white/70">{ideas[index]?.idea}</p>
                    </div>
                  )}
                  <div className="rounded-sm border border-emerald-500/15 bg-emerald-500/5 p-3">
                    <div className="text-[9px] font-bold uppercase tracking-widest text-emerald-500/70">Why this path fits</div>
                    <p className="mt-2 text-sm leading-relaxed text-white/75">
                      {getSelectionReason(hooks[index] ?? hooks[0] ?? '', ideas[index])}
                    </p>
                  </div>
                </div>
                <div className="mb-6 line-clamp-6 whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-white/90">
                  {post.content}
                </div>
                <div className="mb-4 pt-3 border-t border-white/5">
                  <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-white/40">Observed pattern match</span>
                  <div className="text-xs leading-relaxed text-white/60 font-light">
                    {post.explanation}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/10 space-y-3 flex flex-col justify-end">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => handleCopy(post.content, 'post', index)}
                    variant="outline"
                    className="border-white/10 bg-transparent text-white/80 hover:bg-white/5 hover:text-white rounded-sm text-xs font-mono uppercase tracking-wider h-8"
                  >
                    {copiedPostIndex === index ? (
                      <Check className="h-3.5 w-3.5 mr-1 text-emerald-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 mr-1" />
                    )}
                    {copiedPostIndex === index ? 'Copied' : 'Copy'}
                  </Button>
                  {userPlan === 'pro' ? (
                    <Button
                      onClick={() => setFeedbackPostIndex(index)}
                      variant="outline"
                      className="border-white/10 bg-transparent text-white/80 hover:bg-white/5 hover:text-white rounded-sm text-xs font-mono uppercase tracking-wider h-8"
                    >
                      Metrics
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setFeedbackPostIndex(index)}
                      variant="outline"
                      className="border-amber-500/30 bg-amber-500/5 text-amber-500 hover:bg-amber-500/10 rounded-sm text-xs font-mono uppercase tracking-wider h-8"
                    >
                      <Lock className="mr-1 h-3 w-3 opacity-70" />
                      Metrics
                    </Button>
                  )}
                </div>

                <Button
                  onClick={() => onSelectPost(post.content, index)}
                  className="w-full rounded-sm bg-white text-black transition-all hover:bg-white/90 text-xs font-bold uppercase tracking-widest h-9"
                >
                  Edit Artifact
                  <ArrowRight className="ml-2 h-3.5 w-3.5" />
                </Button>

                <div className="flex flex-col mt-4 pt-4 border-t border-white/10">
                  <span className="str-mono text-white/40 mb-2">AUTO_REFINE:</span>
                  <div className="flex overflow-x-auto whitespace-nowrap gap-2 hide-scrollbar pb-1">
                  {[
                    { label: 'Condense', prompt: 'Make this post shorter. Keep the core message.' },
                    { label: 'Direct', prompt: 'Make this post more direct and punchy.' },
                    { label: 'Casual', prompt: 'Make this post more personal and conversational.' },
                    { label: 'Ask', prompt: 'Add an engaging question at the end of this post.' },
                  ].map((action) => (
                    <button
                      key={action.label}
                      type="button"
                      onClick={() => onRefine(action.prompt, index)}
                      className="flex-shrink-0 border border-white/10 bg-white/[0.02] px-3 py-1 text-[10px] font-mono text-white/60 hover:text-white hover:bg-white/10 transition-all uppercase tracking-wider rounded-sm"
                    >
                      {action.label}
                    </button>
                  ))}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="str-mono text-white/30 truncate">
                    {sourceLabel}
                  </span>
                  <span className="str-mono text-white/30">
                    {timeLabel}
                  </span>
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
