"use client";

import { useState } from 'react';
import { toast } from 'sonner';
import { ArrowRight, Check, Copy } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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

function getSelectionReason(hook: string, idea?: Idea): string {
  const hookType = classifyHookType(hook);
  const ideaType = idea?.type ? `${idea.type.toLowerCase()} angle` : 'draft angle';
  return `Signal alignment intact. ${hookType} entry. ${ideaType}.`;
}

function formatPathType(type: string): string {
  if (type === 'Personal') return 'Firsthand';
  if (type === 'Contrarian') return 'Contrast';
  if (type === 'Soft Sell') return 'Offer';
  if (type === 'How-to') return 'How-To';
  return type;
}

function getHookEntryLabel(text: string): string {
  const hookType = classifyHookType(text);

  if (hookType === 'Curiosity') return 'Open-loop entry.';
  if (hookType === 'Data-driven') return 'Data-led entry.';
  if (hookType === 'Personal') return 'Firsthand entry.';
  if (hookType === 'Contrarian') return 'Contrast entry.';
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

function getPathInterpretation(hook: string, idea?: Idea, explanation?: string): string {
  const parts = [getHookEntryLabel(hook)];

  if (idea?.type) {
    parts.push(`${idea.type} direction.`);
  }

  const explanationSignal = getExplanationSignal(explanation);
  if (explanationSignal) {
    parts.push(explanationSignal);
  }

  return parts.join(' ');
}

export function ContentHooks({
  hooks,
  ideas,
  posts,
  onSelectPost,
  onBack,
  dataSource,
}: Props) {
  const [copiedPostIndex, setCopiedPostIndex] = useState<number | null>(null);

  const sourceLabel = dataSource ?? 'Niche signals';

  const handleCopy = async (value: string, index: number) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedPostIndex(index);
      toast.success('Draft copied.');

      window.setTimeout(() => {
        setCopiedPostIndex((current) => (current === index ? null : current));
      }, 1800);
    } catch {
      toast.error('Failed to copy.');
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="str-panel rounded-sm p-5 lg:p-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-l-4 border-l-emerald-500">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-emerald-500/80">Step 2 of 3 · Strategy Paths</div>
          <h2 className="mt-2 text-xl font-bold tracking-tight text-white">Strategy Paths</h2>
          <p className="mt-2 max-w-xl text-sm text-white/65">
            Paths compiled from extracted signals. Next: Draft Editor.
          </p>
        </div>

        <div className="text-[10px] uppercase tracking-widest text-white/50">
          {posts.length} paths · {sourceLabel}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {posts.map((post, index) => (
          <Card key={index} className="flex flex-col justify-between rounded-sm str-panel p-5 transition-colors hover:border-white/20">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="str-mono text-white/65">PATH 0{index + 1}</span>
                <span className="str-mono rounded-sm bg-emerald-500/10 px-2 py-0.5 text-emerald-500/90">
                  {formatPathType(post.type)}
                </span>
              </div>

              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-white/45">Entry Point</div>
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-white/88">
                  {hooks[index] ?? hooks[0] ?? 'Hook not available.'}
                </p>
              </div>

              {ideas[index]?.idea && (
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-white/45">Direction</div>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-white/72">{ideas[index]?.idea}</p>
                </div>
              )}

              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-white/45">Path Interpretation</div>
                <p className="mt-2 text-sm leading-relaxed text-white/68">
                  {getPathInterpretation(
                    hooks[index] ?? hooks[0] ?? '',
                    ideas[index],
                    post.explanation || getSelectionReason(hooks[index] ?? hooks[0] ?? '', ideas[index]),
                  )}
                </p>
              </div>

              <div className="rounded-sm border border-white/10 bg-black/30 p-4">
                <div className="text-[10px] font-bold uppercase tracking-widest text-white/40">Draft Preview</div>
                <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-[12px] leading-relaxed text-white/72">
                  {post.content}
                </p>
              </div>
            </div>

            <div className="mt-5 border-t border-white/10 pt-4 space-y-3">
              <Button
                onClick={() => onSelectPost(post.content, index)}
                className="w-full rounded-sm bg-white text-black transition-all hover:bg-white/90 text-[11px] font-bold uppercase tracking-widest h-10"
              >
                Open Draft Editor
                <ArrowRight className="ml-2 h-3.5 w-3.5" />
              </Button>

              <Button
                onClick={() => handleCopy(post.content, index)}
                variant="outline"
                className="w-full border-white/10 bg-transparent text-white/80 hover:bg-white/5 hover:text-white rounded-sm text-xs font-mono uppercase tracking-wider h-8"
              >
                {copiedPostIndex === index ? (
                  <Check className="h-3.5 w-3.5 mr-1 text-emerald-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5 mr-1" />
                )}
                {copiedPostIndex === index ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <div className="pt-1">
        <Button onClick={onBack} variant="ghost" className="text-white/55 hover:text-white font-medium text-sm">
          Back To Signals
        </Button>
      </div>
    </div>
  );
}
