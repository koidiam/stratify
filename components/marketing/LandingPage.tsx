'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Radar, Settings2, Fingerprint, Check, Zap, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useFoundingStatus } from '@/hooks/useFoundingStatus';
import { FoundingStrip } from '@/components/billing/FoundingStrip';

type Plan = {
  name: string;
  price: { monthly: string; yearly: string };
  yearlySubtext: string | null;
  frequency: { monthly: string; yearly: string };
  description: string;
  capacity: string;
  unlocksText?: string;
  features: string[];
  buttonText: string;
  featured: boolean;
};

const PLANS: Plan[] = [
  {
    name: 'FREE',
    price: { monthly: '$0', yearly: '$0' },
    yearlySubtext: null,
    frequency: { monthly: '/mo', yearly: '/yr' },
    description: 'Try the weekly engine before you commit to a full content system.',
    capacity: '1 strategy run / week',
    features: [
      '1 weekly strategy pass',
      'Signal-backed hooks and draft output',
      'Best for evaluating product fit'
    ],
    buttonText: 'Start Free',
    featured: false,
  },
  {
    name: 'BASIC',
    price: { monthly: '$15', yearly: '$120' },
    yearlySubtext: '$180/yr',
    frequency: { monthly: '/mo', yearly: '/yr' },
    description: 'Run Stratify as your weekly LinkedIn content system.',
    capacity: '3 strategy runs / week',
    unlocksText: 'Unlocks full weekly history and more room to test angles',
    features: [
      '3 full strategy runs each week',
      'Tone-aware drafts aligned to your niche',
      'Full history vault access'
    ],
    buttonText: 'Choose Basic',
    featured: false,
  },
  {
    name: 'PRO',
    price: { monthly: '$29', yearly: '$240' },
    yearlySubtext: '$348/yr',
    frequency: { monthly: '/mo', yearly: '/yr' },
    description: 'For teams and operators who want live market inputs in every run.',
    capacity: '50 strategy runs / week',
    unlocksText: 'Unlocks live signal scanning and deeper strategic research',
    features: [
      'Live LinkedIn signal research',
      'Competitor and reference signal review',
      'High-frequency weekly strategy capacity'
    ],
    buttonText: 'Choose Pro',
    featured: true, // Pro gets the focus
  },
];

const PROOF_ITEMS = [
  {
    label: 'Input',
    value: 'Niche signals, references, and audience context',
  },
  {
    label: 'Engine Decision',
    value: 'Pattern + trigger + strategic angle for this week',
  },
  {
    label: 'Output',
    value: 'Hooks and drafts built for a weekly posting cycle',
  },
] as const;

export function LandingPage() {
  const [isYearly, setIsYearly] = useState(false);
  const { status, claimed, total, isFallback } = useFoundingStatus();

  return (
    <main className="dark-premium min-h-screen text-foreground bg-background relative selection:bg-primary/20 font-sans overflow-x-hidden">
      
      {/* Refined Background Gradients */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-[#000000]">
        {/* Subtle grid */}
        <div 
          className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]"
        />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto flex flex-col w-full max-w-5xl px-5 pb-20 pt-6 md:px-8">
        
        {/* Navigation */}
        <motion.header 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative z-30 mb-12 flex items-center justify-between gap-3 py-4 md:mb-16"
        >
          <div className="flex flex-1 items-center">
            <span className="text-lg font-medium tracking-tight text-foreground">Stratify</span>
          </div>

          <nav className="hidden items-center gap-8 md:flex">
            <a href="#mechanisms" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
            <a href="#pipeline" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">Output</a>
            <a href="#pricing" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">Plans</a>
          </nav>

          <nav className="flex flex-1 items-center justify-end gap-3">
            <Link href="/login" className="hidden h-9 items-center justify-center rounded-sm px-4 text-[10px] font-bold uppercase tracking-widest text-white/50 transition-colors duration-200 hover:bg-white/5 hover:text-white sm:flex">
              Login
            </Link>
            <Link
              href="/register"
              className="inline-flex h-9 items-center justify-center rounded-sm border border-white/10 bg-white/5 px-4 py-2 text-[9px] font-bold uppercase tracking-widest text-white transition-colors duration-200 hover:bg-white/10 sm:px-5 sm:text-[10px]"
            >
              <span className="sm:hidden">Start</span>
              <span className="hidden sm:inline">Get Started</span>
            </Link>
          </nav>
        </motion.header>

        {/* Inverted Command Hero */}
        <motion.section 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="relative z-0 mt-4 py-6 md:mt-6 md:py-8"
        >
          <div className="absolute inset-x-0 top-24 h-[28rem] bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.14)_0%,transparent_60%)] pointer-events-none md:top-32 md:h-[34rem]" />

          <div className="relative z-10 flex flex-col gap-10 md:gap-14">
             <motion.div 
               initial={{ opacity: 0, y: 20, scale: 0.98 }}
               animate={{ opacity: 1, y: 0, scale: 1 }}
               transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
               className="mx-auto w-full max-w-[20rem] px-4 sm:max-w-3xl"
             >
               <div className="w-full overflow-hidden rounded-xl border border-white/10 bg-[#0A0A0A]/95 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.05)_inset]">
                {/* Simulated Input */}
                  <div className="flex items-center gap-3 border-b border-white/5 px-4 py-4 sm:gap-4 sm:px-6 sm:py-5">
                  <Radar className="h-5 w-5 text-emerald-500 opacity-80" />
                  <div className="min-w-0 flex-1 font-mono text-[12px] md:text-sm text-white relative">
                     <span className="opacity-100">Review signals for</span>
                     <span className="text-emerald-500 ml-2 break-all sm:break-normal">&quot;B2B SaaS Growth&quot;</span>
                     <span className="ml-1 inline-block h-4 w-1.5 align-middle bg-emerald-500/80" />
                  </div>
                  <div className="hidden sm:inline-flex items-center gap-1.5 rounded-[4px] border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-bold font-sans text-white/50 tracking-widest">
                    <span>CMD</span> <span>K</span>
                  </div>
                </div>

                {/* Simulated Quick Action Results */}
                <div className="p-2">
                  <div className="px-4 py-3 text-[9px] font-bold uppercase tracking-widest text-white/30">Suggested Actions</div>
                  
                  <Link href="/register" className="flex items-center justify-between p-3 rounded-md bg-white/[0.04] text-white cursor-pointer transition-colors border-l-2 border-emerald-500 group group">
                     <div className="flex items-center gap-3">
                       <Zap className="w-4 h-4 text-emerald-500" />
                       <span className="text-[12px] font-mono tracking-wide">Start analysis</span>
                     </div>
                     <span className="text-[9px] uppercase font-bold tracking-widest text-white/50 group-hover:text-white transition-colors">Run</span>
                  </Link>

                  <div className="flex items-center justify-between p-3 rounded-md hover:bg-white/[0.02] text-white/40 hover:text-white/80 cursor-pointer transition-colors border-l-2 border-transparent">
                     <div className="flex items-center gap-3">
                       <Settings2 className="w-4 h-4" />
                       <span className="text-[12px] font-mono tracking-wide">Review niche focus</span>
                     </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-md hover:bg-white/[0.02] text-white/40 hover:text-white/80 cursor-pointer transition-colors border-l-2 border-transparent">
                     <div className="flex items-center gap-3">
                       <BarChart3 className="w-4 h-4" />
                       <span className="text-[12px] font-mono tracking-wide">Review past signals</span>
                     </div>
                  </div>
                </div>
               </div>
             </motion.div>

             <motion.div 
               initial={{ opacity: 0, y: 12 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.12, duration: 0.7 }}
               className="mx-auto w-full max-w-[20rem] px-4 text-center sm:max-w-2xl"
             >
               <div className="mb-4 inline-flex items-center gap-2 rounded-sm border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-500">
                 LinkedIn Strategy Engine
               </div>
               <h1 className="mb-4 text-[1.95rem] font-extrabold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
                 <span className="block">The weekly LinkedIn content system</span>
                 <span className="block text-white/40">for people who need strategy, not just copy.</span>
               </h1>
               <p className="text-sm md:text-base font-light text-white/40 max-w-2xl mx-auto break-words">
                 Stratify is built for founders, operators, consultants, and subject-matter experts who want a repeatable weekly LinkedIn system. It studies niche signals, explains the opportunity, and turns that into hooks and drafts without feeling like another AI writing tool.
               </p>
               <div className="mt-6 grid grid-cols-1 gap-2 text-left sm:grid-cols-3">
                 <div className="rounded-sm border border-white/10 bg-white/[0.02] px-4 py-3">
                   <div className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/30">What It Is</div>
                   <p className="mt-2 text-sm text-white/80">A LinkedIn Strategy Engine that turns signals into a weekly plan.</p>
                 </div>
                 <div className="rounded-sm border border-white/10 bg-white/[0.02] px-4 py-3">
                   <div className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/30">Who It&apos;s For</div>
                   <p className="mt-2 text-sm text-white/80">Teams and individuals building authority with a consistent weekly publishing rhythm.</p>
                 </div>
                 <div className="rounded-sm border border-white/10 bg-white/[0.02] px-4 py-3">
                   <div className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/30">Why It&apos;s Different</div>
                   <p className="mt-2 text-sm text-white/80">It starts from signal analysis and strategy logic, not a blank prompt in an AI writer.</p>
                 </div>
               </div>
               <div className="mt-8">
                <Link
                 href="/register"
                 className="inline-flex h-12 items-center justify-center gap-3 rounded-sm bg-white px-8 text-[11px] font-bold uppercase tracking-widest text-black shadow-[0_0_20px_rgba(255,255,255,0.08)] transition-colors duration-200 hover:bg-white/90"
                >
                  Get Started
                  <ArrowRight size={14} className="opacity-80" />
                </Link>
              </div>
             </motion.div>

             <motion.div
               initial={{ opacity: 0, y: 12 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.2, duration: 0.7 }}
               className="mx-auto w-full max-w-[20rem] px-4 sm:max-w-md"
             >
              <div className="w-full border border-white/10 rounded-sm bg-white/[0.02] divide-y divide-white/5">
                <div className="px-4 py-2.5 flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-emerald-500" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-white/30">Signal Snapshot</span>
                </div>
                 <div className="px-4 py-2.5 text-xs text-white/60">LinkedIn Strategy Engine: extracts a pattern before it suggests a post</div>
                 <div className="px-4 py-2.5 text-xs text-white/60">Weekly content system: strategy, hook, and draft in one pass</div>
                 <div className="px-4 py-2.5 text-xs text-white/60">Not an AI writer: the output is grounded in niche-specific signal review</div>
               </div>
               <p className="mt-3 text-center text-[10px] text-white/20">What Stratify is designed to do, every week</p>
             </motion.div>
          </div>
        </motion.section>

        <section aria-label="Illustrative system output" className="mt-12 md:mt-14">
          <div className="mx-auto w-full max-w-4xl rounded-sm border border-white/10 bg-[#050505]/80">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-white/40" />
                <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/35">
                  Example Output
                </span>
              </div>
              <span className="text-[9px] uppercase tracking-[0.18em] text-white/20">
                From a typical strategy pass
              </span>
            </div>

            <div className="grid grid-cols-1 divide-y divide-white/10 md:grid-cols-3 md:divide-x md:divide-y-0">
              {PROOF_ITEMS.map((item) => (
                <div key={item.label} className="px-4 py-4 md:px-5 md:py-5">
                  <div className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/35">
                    {item.label}
                  </div>
                  <p className="mt-2 text-sm font-medium tracking-tight text-white">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Core System Mechanisms */}
        <motion.section 
          id="mechanisms"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mt-20 md:mt-28 pt-16 md:pt-24 border-t border-border/30"
        >
          <div className="text-center mb-10 md:mb-16">
            <div className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">SYSTEM MECHANISMS</div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight text-foreground mb-3">Why this feels different from an AI writing tool</h2>
            <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto px-4">
              Generic writing tools start with a prompt box. Stratify starts with signal review, strategic reasoning, and weekly execution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className="rounded-sm str-panel border-white/5 bg-[#000000]/40 p-6 md:p-8 flex flex-col hover:-translate-y-1 transition-transform duration-300">
              <div className="mb-4 text-emerald-500 bg-emerald-500/10 w-8 h-8 rounded-sm flex items-center justify-center border border-emerald-500/20">
                <Radar size={16} />
              </div>
              <h3 className="text-sm font-bold text-white mb-2 uppercase tracking-wide">1. Signal Extraction</h3>
              <p className="text-white/50 text-[11px] font-mono leading-relaxed flex-grow">
                The engine reviews niche-level signal inputs to find the shifts actually worth writing about this week.
              </p>
              <div className="pt-4 mt-6 border-t border-white/5">
                <p className="text-[9px] font-bold uppercase tracking-widest text-white/50"><span className="text-emerald-500 mr-1">Outcome:</span> Authority around validated topics.</p>
              </div>
            </div>

            <div className="rounded-sm str-panel border-white/5 bg-[#000000]/40 p-6 md:p-8 flex flex-col hover:-translate-y-1 transition-transform duration-300">
              <div className="mb-4 text-emerald-500 bg-emerald-500/10 w-8 h-8 rounded-sm flex items-center justify-center border border-emerald-500/20">
                <Fingerprint size={16} />
              </div>
              <h3 className="text-sm font-bold text-white mb-2 uppercase tracking-wide">2. Tone Calibration</h3>
              <p className="text-white/50 text-[11px] font-mono leading-relaxed flex-grow">
                Each pattern is translated into a usable angle with trigger logic, so the output feels intentional instead of generic.
              </p>
              <div className="pt-4 mt-6 border-t border-white/5">
                <p className="text-[9px] font-bold uppercase tracking-widest text-white/50"><span className="text-emerald-500 mr-1">Outcome:</span> Drafts that inherit your natural voice.</p>
              </div>
            </div>

            <div className="rounded-sm str-panel border-white/5 bg-[#000000]/40 p-6 md:p-8 flex flex-col hover:-translate-y-1 transition-transform duration-300">
              <div className="mb-4 text-emerald-500 bg-emerald-500/10 w-8 h-8 rounded-sm flex items-center justify-center border border-emerald-500/20">
                <Settings2 size={16} />
              </div>
              <h3 className="text-sm font-bold text-white mb-2 uppercase tracking-wide">3. Weekly Batching</h3>
              <p className="text-white/50 text-[11px] font-mono leading-relaxed flex-grow">
                Insights, hook structures, and full drafts are compiled into one weekly operating loop instead of separate prompt sessions.
              </p>
              <div className="pt-4 mt-6 border-t border-white/5">
                <p className="text-[9px] font-bold uppercase tracking-widest text-white/50"><span className="text-emerald-500 mr-1">Outcome:</span> Consistent posting without daily panic.</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Sample Output Section */}
        <motion.section
          id="pipeline"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mt-20 md:mt-28 pt-16 md:pt-24 border-t border-border/30"
        >
          <div className="text-center mb-10 md:mb-16">
            <div className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">WORKFLOW OUTPUT</div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-foreground mb-3 flex items-center justify-center gap-2 md:gap-3">
              Signal <ArrowRight className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground/50" /> Insight <ArrowRight className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground/50" /> Hook <ArrowRight className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground/50" /> Draft
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto px-4">
              This is the product loop: signal review becomes a strategy angle, then a hook, then a post draft you can ship.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 relative cursor-default">
            {/* Step 1 */}
            <div className="rounded-sm str-panel border-white/5 bg-[#000000]/40 p-6 md:p-8 flex flex-col hover:-translate-y-1 transition-transform duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-6 h-6 rounded-sm bg-white/5 text-white/50 font-mono text-[9px] flex items-center justify-center border border-white/10">01</div>
                <div className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-white/50">The Raw Signal</div>
              </div>
              <p className="text-white text-[11px] leading-relaxed mb-6 flex-grow font-mono">
                Personal proof is outperforming generic advice in this niche because the audience wants real operator experience.
              </p>
              <div className="inline-flex items-center gap-2 rounded-sm bg-emerald-500/10 px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-widest text-emerald-500 border border-emerald-500/20 w-max">
                <Zap size={10} className="text-emerald-500" /> Trigger: Relatability
              </div>
            </div>

            {/* Step 2 */}
            <div className="rounded-sm str-panel border-white/5 bg-[#000000]/40 p-6 md:p-8 flex flex-col hover:-translate-y-1 transition-transform duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-6 h-6 rounded-sm bg-white/5 text-white/50 font-mono text-[9px] flex items-center justify-center border border-white/10">02</div>
                <div className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-white/50">The Hook</div>
              </div>
              <p className="text-white font-bold text-sm md:text-base leading-snug flex-grow font-serif italic">
                &quot;The lesson that hurt our growth more than any competitor did&quot;
              </p>
              <p className="text-white/40 text-[10px] font-mono leading-relaxed border-t border-white/5 pt-4 mt-4">
                Converts the signal into a strategic opening with tension, proof, and a clear angle.
              </p>
            </div>

            {/* Step 3 */}
            <div className="rounded-sm str-panel border-white/5 bg-[#000000]/40 p-6 md:p-8 flex flex-col hover:-translate-y-1 transition-transform duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-6 h-6 rounded-sm bg-white/5 text-white/50 font-mono text-[9px] flex items-center justify-center border border-white/10">03</div>
                <div className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-white/50">The Draft</div>
              </div>
              <div className="rounded-sm border border-white/5 bg-white/[0.02] p-4 flex-grow">
                <p className="text-white/80 text-[10px] leading-relaxed whitespace-pre-line font-mono">
                  {`We hit $8K MRR in month 3.

Then we tried to scale too fast.

Hired 2 devs before repeatable sales.

Back to $2K in 3 months.

Here's my expensive lesson —`}
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Pricing */}
        <motion.section 
          id="pricing"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mt-20 md:mt-28 pt-16 md:pt-24 border-t border-border/30"
        >
          <div className="text-center mb-10 md:mb-12">
            <div className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">PLANS</div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-foreground mb-3">Choose the weekly system that matches your workflow</h2>
            <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto px-4">Every plan uses the same core engine. Higher tiers increase run capacity, unlock deeper research, and make Stratify a stronger weekly operating system.</p>
          </div>

          <div className="flex items-center justify-center gap-2.5 mb-10 md:mb-12">
            <span className={`text-[11px] md:text-xs font-semibold uppercase tracking-wider transition-colors ${!isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>Monthly</span>
            <button 
              onClick={() => setIsYearly(!isYearly)}
              className={`w-9 h-5 rounded-full p-0.5 flex items-center transition-colors ${isYearly ? 'bg-primary' : 'bg-secondary border border-border'}`}
            >
               <div className={`w-3.5 h-3.5 rounded-full bg-background shadow-sm transition-transform duration-300 ${isYearly ? 'translate-x-4' : 'translate-x-0'}`} />
            </button>
            <span className={`text-[11px] md:text-xs font-semibold uppercase tracking-wider transition-colors ${isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
              Annual
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 max-w-sm md:max-w-5xl mx-auto border border-white/10 bg-[#020202] rounded-sm overflow-hidden shadow-2xl relative">
            {PLANS.map((plan, index) => (
              <div
                key={plan.name}
                className={`relative flex flex-col p-8 transition-colors duration-300
                  ${index !== 0 ? 'border-t lg:border-t-0 lg:border-l border-white/10' : ''}
                  ${plan.featured ? 'bg-white/[0.02]' : 'hover:bg-white/[0.01]'}
                `}
              >
                {/* Emphasis handled by RECOMMENDED label below */}

                {(plan.name === 'BASIC' || plan.name === 'PRO') && (
                  <div className="-mx-8 -mt-8 mb-6">
                    <FoundingStrip
                      plan={plan.name as 'BASIC' | 'PRO'}
                      status={status}
                      claimed={claimed}
                      total={total}
                      isYearly={isYearly}
                      isFallback={isFallback}
                    />
                  </div>
                )}
                
                <div className="text-[10px] font-bold tracking-widest uppercase text-white/40 mb-3 flex items-center justify-between">
                  {plan.name}
                  {plan.featured && <span className="text-[9px] font-bold text-emerald-500">RECOMMENDED</span>}
                </div>
                
                <div className="mb-4 flex items-baseline gap-1.5 flex-wrap">
                  <span className="text-4xl md:text-5xl font-medium tracking-tight text-white">
                    {isYearly ? plan.price.yearly : plan.price.monthly}
                  </span>
                  <span className="text-white/40 text-xs font-medium uppercase">
                    {isYearly ? plan.frequency.yearly : plan.frequency.monthly}
                  </span>
                </div>
                {isYearly && plan.yearlySubtext && (
                  <div className="mb-3 text-[11px] text-white/35">
                    Compare at {plan.yearlySubtext}
                  </div>
                )}
                
                <p className="text-sm text-white/50 mb-8 leading-relaxed flex-grow">{plan.description}</p>
                
                <div className="border-t border-white/5 pt-6 mb-8 mt-auto">
                  <div className="text-white font-medium text-sm mb-4">
                    {plan.capacity}
                  </div>

                  {plan.unlocksText && (
                    <div className="mb-4 text-xs font-medium text-emerald-500/90">
                      + {plan.unlocksText}
                    </div>
                  )}
                  
                  <div className="space-y-3.5">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-3 text-xs text-white/60">
                        <Check size={14} className="text-emerald-500 shrink-0 mt-[1px]" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Link
                  href="/register"
                  className={`flex h-10 w-full items-center justify-center gap-2 rounded-sm text-xs font-medium transition-colors duration-200 ${
                    plan.featured 
                      ? 'bg-white text-black hover:bg-white/90' 
                      : 'bg-white/5 text-white hover:bg-white/10'
                  }`}
                >
                  {plan.buttonText}
                </Link>
              </div>
            ))}
          </div>
        </motion.section>
        
        {/* Footer */}
        <footer className="mt-16 md:mt-24 pt-6 md:pt-8 border-t border-border/30 flex flex-col md:flex-row items-center justify-between text-muted-foreground text-[10px] md:text-xs font-medium pb-8 md:pb-0">
          <div>© 2026 Stratify. All rights reserved.</div>
          <div className="flex gap-4 md:gap-6 mt-4 md:mt-0">
            <Link href="/terms" className="hover:text-foreground transition-colors uppercase tracking-wider">Terms</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors uppercase tracking-wider">Privacy</Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
