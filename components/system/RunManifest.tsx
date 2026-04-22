'use client';

import React, { useState, useEffect } from 'react';
import { ResearchProvenance, LearningSummary, Plan } from '@/types';
import { 
  getLockedLayerHint 
} from '@/lib/constants/plan-copy';
import { 
  Shield, 
  Database, 
  Filter, 
  Zap, 
  History,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface RunManifestProps {
  researchSummary?: ResearchProvenance;
  learningSummary?: LearningSummary | null;
  runLogicSummary?: string | null;
  userPlan: Plan;
  weekNumber?: number;
  year?: number;
  manifestMode?: 'full' | 'compact' | 'sentence-only';
}

export function RunManifest({
  researchSummary,
  learningSummary,
  runLogicSummary,
  userPlan,
  weekNumber,
  year,
  manifestMode = 'full'
}: RunManifestProps) {
  const [isExpanded, setIsExpanded] = useState(manifestMode === 'full');

  useEffect(() => {
    setIsExpanded(manifestMode === 'full');
  }, [manifestMode]);

  if (!researchSummary && !runLogicSummary) return null;

  const sourceMode = researchSummary?.sourceMode ?? 'none';
  const analyzedCount = researchSummary?.analyzedPostCount ?? 0;
  const retainedCount = researchSummary?.retainedPostCount ?? 0;
  const trendSource = researchSummary?.trendSourceType ?? 'none';
  const referenceSource = researchSummary?.referenceSourceType ?? 'none';
  const timeWindow = researchSummary?.timeWindow ?? 'Current cycle';

  return (
    <div className={`str-elevated rounded-sm border border-white/10 bg-black/40 overflow-hidden transition-all duration-300 ${isExpanded ? 'p-5' : 'p-4'}`}>
      
      {/* ALWAYS VISIBLE HEADER: Provenance Sentence + Key Basis */}
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-white/35 mb-1.5">
              <Zap className="h-3 w-3" />
              Path Selection Basis
            </div>
            {runLogicSummary ? (
              <p className="text-sm font-medium leading-relaxed text-white/90">
                {runLogicSummary}
              </p>
            ) : (
              <p className="text-sm font-medium leading-relaxed text-white/50 italic">
                System operated using isolated profile logic. No market data available.
              </p>
            )}
          </div>
          {/* Expand toggle is always available as a subtle option */}
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-white/40 hover:text-white/80 transition-colors p-1"
            title={isExpanded ? "Collapse Logic" : "Expand Logic"}
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>

        {/* Condensed Basis Line (visible when collapsed or as part of header) if not sentence-only */}
        {!isExpanded && manifestMode !== 'sentence-only' && (
          <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono tracking-wide text-white/50 border-t border-white/5 pt-3 mt-1">
            <span className="flex items-center gap-1.5">
              <Database className="h-3 w-3 opacity-60" />
              {retainedCount > 0 ? `${retainedCount} posts retained` : 'Profile context only'}
            </span>
            <span className="opacity-40">•</span>
            <span>{timeWindow}</span>
            <span className="opacity-40">•</span>
            <span className={sourceMode === 'live' ? 'text-emerald-400/80' : 'text-white/50'}>
              {sourceMode.toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* EXPANDED DECISION LOGIC */}
      {isExpanded && (
        <div className="mt-5 border-t border-white/5 pt-5 animate-in fade-in duration-300 text-sm">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Market Input Bounds */}
            <div>
              <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-white/35">
                <Database className="h-3 w-3" />
                Market Input Bounds
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-white/45">Source Mode</span>
                  <span className={`font-medium ${sourceMode === 'live' ? 'text-emerald-400' : 'text-white/80'}`}>
                    {sourceMode.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/45">Time Window</span>
                  <span className="text-white/80">{timeWindow}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/45">Trend Layer</span>
                  <span className="text-white/80">{trendSource.toUpperCase()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/45">Reference Layer</span>
                  <span className="text-white/80">{referenceSource.toUpperCase()}</span>
                </div>
              </div>
            </div>

            {/* Data Scope */}
            <div>
              <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-white/35">
                <Filter className="h-3 w-3" />
                Data Scope
              </div>
              <div className="text-white/70 leading-relaxed text-[13px]">
                Analyzed an initial pool of <span className="text-white font-medium">{analyzedCount} posts</span> across the market layer. Retained a highest-density sample of <span className="text-white font-medium">{retainedCount} posts</span> from {timeWindow} after explicitly excluding {researchSummary?.jobPostsExcluded ?? 0} hiring-style announcements and {researchSummary?.lowSignalPostsFiltered ?? 0} broad low-signal occurrences.
              </div>
            </div>

            {/* Retained Context */}
            <div>
              <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-white/35">
                <History className="h-3 w-3" />
                Retained Context
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-white/45">Feedback Sync</span>
                  <span className="text-white/80">
                    {learningSummary?.feedbackEntryCount ?? 0} entries
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/45">Memory Depth</span>
                  <span className="text-white/80">
                    {learningSummary?.annotatedCycleCount ?? 0} cycles
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/45">Cycle ID</span>
                  <span className="text-[10px] font-mono text-white/40">
                    W{weekNumber}-{year}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Global Constraints / Locked Hints */}
          {userPlan !== 'pro' && (
            <div className="mt-6 flex items-start gap-2 rounded-sm border border-amber-500/10 bg-amber-500/5 p-3">
              <Shield className="mt-0.5 h-3.5 w-3.5 text-amber-400" />
              <div className="text-[11px] leading-relaxed text-amber-200/70">
                <span className="font-bold uppercase tracking-wider text-amber-300">System Constraint: </span>
                {(() => {
                  const hint = (researchSummary?.referenceInputCount && researchSummary.referenceInputCount > 0)
                    ? getLockedLayerHint(userPlan, 'reference')
                    : sourceMode === 'cached'
                      ? getLockedLayerHint(userPlan, 'cached')
                      : null;
                  
                  if (hint) {
                    return `${hint.title}. ${hint.detail}`;
                  }
                  return "Additional intelligence layers available in higher system tiers.";
                })()}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
