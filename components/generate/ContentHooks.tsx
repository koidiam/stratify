"use client";

import { useState } from 'react';
import { toast } from 'sonner';
import { ArrowRight, Check, Copy, Lock, ChevronDown } from 'lucide-react';
import Link from 'next/link';
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
  userPlan,
}: Props) {
  const [copiedPostIndex, setCopiedPostIndex] = useState<number | null>(null);
  const [expandedPathIdx, setExpandedPathIdx] = useState<number | null>(null);

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

      <div className="flex flex-col border-y border-white/10 divide-y divide-white/10 bg-[#0a0a0a] rounded-sm overflow-hidden">
        {posts.map((post, index) => {
          const isSealed = userPlan !== 'pro' && index >= ((userPlan === 'basic' ? 2 : 1) || 1);
          const isExpanded = expandedPathIdx === index;
          
          return (
            <div 
              key={index} 
              className={`relative flex flex-col p-6 transition-all border-l-2 border-l-transparent hover:border-l-emerald-500 hover:bg-white/[0.02] ${isSealed ? 'opacity-60 bg-black/40' : ''}`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-mono uppercase tracking-widest text-white/50">PATH {String(index + 1).padStart(2, '0')}</span>
                <span className={`text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-sm ${isSealed ? 'bg-white/5 text-white/40' : 'bg-emerald-500/10 text-emerald-500/90'}`}>
                  {formatPathType(post.type)}
                </span>
              </div>

              <div className="mb-2">
                <p className="text-lg font-semibold text-white leading-snug line-clamp-2">
                  {hooks[index] ?? hooks[0] ?? 'Hook not available.'}
                </p>
              </div>

              {ideas[index]?.idea && (
                <div className="mb-4">
                  <p className="text-sm text-white/50 leading-relaxed">
                    {ideas[index]?.idea}
                  </p>
                </div>
              )}

              <div className="flex items-center gap-2 mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">Interpretation:</span>
                <span className="text-[11px] text-white/60 bg-white/5 px-2 py-1 rounded-sm">
                  {getPathInterpretation(
                    hooks[index] ?? hooks[0] ?? '',
                    ideas[index],
                    post.explanation || getSelectionReason(hooks[index] ?? hooks[0] ?? '', ideas[index]),
                  )}
                </span>
              </div>

              <button 
                onClick={() => setExpandedPathIdx(isExpanded ? null : index)}
                className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white/70 transition-colors w-fit mb-4"
              >
                {isExpanded ? 'Hide Details' : 'View Details'}
                {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ArrowRight className="w-3 h-3" />}
              </button>

              {isExpanded && (
                <div className="space-y-4 mb-4 animate-in fade-in duration-300">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-400/80 mb-1">
                      Why this exists
                    </div>
                    <div className="text-xs text-emerald-100/60">
                      Derived from current system shift toward {ideas[index]?.type || formatPathType(post.type)}
                    </div>
                  </div>

                  {isSealed ? (
                    <div className="relative group">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1">Draft Preview</div>
                      <p className="text-xs leading-relaxed text-transparent blur-[3px] select-none pointer-events-none bg-clip-text bg-gradient-to-b from-white/90 to-transparent">
                        {post.content.slice(0, 150)}...
                      </p>
                      <div className="absolute inset-0 flex flex-col items-start justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Lock className="w-4 h-4 text-white/50 mb-2" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">Restricted Depth</span>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">Draft Preview</div>
                      <p className="whitespace-pre-wrap text-xs leading-relaxed text-white/72 line-clamp-2">
                        {post.content}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end items-center gap-3 mt-2">
                {isSealed ? (
                  <div className="flex items-center gap-4">
                    <div className="text-[10px] uppercase tracking-widest text-white/40">Sealed Path</div>
                    <Link href="/settings" className="text-[10px] font-bold uppercase tracking-widest text-emerald-500/80 hover:text-emerald-400 transition-colors">
                      Unlock deeper layers →
                    </Link>
                  </div>
                ) : (
                  <>
                    <Button
                      onClick={() => handleCopy(post.content, index)}
                      variant="ghost"
                      className="text-white/60 hover:text-white hover:bg-white/10 text-[10px] font-bold uppercase tracking-widest h-8 px-3 rounded-sm"
                    >
                      {copiedPostIndex === index ? (
                        <Check className="h-3.5 w-3.5 mr-1 text-emerald-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5 mr-1" />
                      )}
                      {copiedPostIndex === index ? 'Copied' : 'Copy'}
                    </Button>
                    <Button
                      onClick={() => onSelectPost(post.content, index)}
                      className="bg-white text-black hover:bg-white/90 transition-all text-[10px] font-bold uppercase tracking-widest h-8 px-4 rounded-sm"
                    >
                      Open Draft Editor
                      <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-2">
        <Button onClick={onBack} variant="ghost" className="text-white/55 hover:text-white font-medium text-sm">
          Back To Signals
        </Button>
      </div>
    </div>
  );
}
