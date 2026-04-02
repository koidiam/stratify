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
    description: 'Experience the baseline pipeline without committing.',
    capacity: '1 strategy run / week',
    features: [
      '1 validated insight',
      '1 final post draft',
      'Basic hook generation'
    ],
    buttonText: 'Start Free',
    featured: false,
  },
  {
    name: 'BASIC',
    price: { monthly: '$15', yearly: '$120' },
    yearlySubtext: '$180/yr',
    frequency: { monthly: '/mo', yearly: '/yr' },
    description: 'Consistent, data-backed weekly presence.',
    capacity: '3 strategy runs / week',
    unlocksText: 'Unlocks full week coverage & saved history',
    features: [
      '3 full post drafts',
      'Automated tone matching',
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
    description: 'For scaling revenue through audience building.',
    capacity: '50 strategy runs / week',
    unlocksText: 'Unlocks competitor tracking & deeper signal review',
    features: [
      'Deep psychological mapping',
      'Competitor signal tracking',
      'Priority draft synthesis'
    ],
    buttonText: 'Choose Pro',
    featured: true, // Pro gets the focus
  },
];

const PROOF_ITEMS = [
  {
    label: 'Signal',
    value: 'Authority storytelling gaining traction',
  },
  {
    label: 'Strategy Direction',
    value: 'Contrarian + personal proof structure',
  },
  {
    label: 'Likely Outcome',
    value: 'Higher saves and profile clicks',
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
          className="relative z-30 mb-12 flex items-center justify-between py-4 md:mb-16"
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
              className="inline-flex h-9 items-center justify-center rounded-sm border border-white/10 bg-white/5 px-5 py-2 text-[10px] font-bold uppercase tracking-widest text-white transition-colors duration-200 hover:bg-white/10"
            >
              Get Started
            </Link>
          </nav>
        </motion.header>

        {/* Inverted Command Hero */}
        <motion.section 
          initial="hidden"
          animate="visible"
          className="relative z-0 mt-4 flex w-full min-h-[36rem] flex-col items-center justify-center py-10 md:mt-6 md:min-h-[40rem] md:py-12 lg:min-h-[calc(100svh-12rem)]"
        >
          {/* Background 3D Perspective Glow */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-96 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.15)_0%,transparent_50%)] pointer-events-none" />
          
          <div className="relative z-10 w-full max-w-2xl px-4 flex flex-col items-center">
             {/* The Command Palette simulation */}
             <motion.div 
               initial={{ opacity: 0, y: 30, scale: 0.95, rotateX: 10 }}
               animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
               transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
               style={{ perspective: 1000 }}
               className="w-full overflow-hidden rounded-xl border border-white/10 bg-[#0A0A0A]/95 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.05)_inset]"
             >
                {/* Simulated Input */}
                <div className="flex items-center gap-4 border-b border-white/5 px-6 py-5">
                  <Radar className="h-5 w-5 text-emerald-500 opacity-80" />
                  <div className="flex-1 font-mono text-[13px] md:text-sm text-white relative">
                     <span className="opacity-100">Review signals for</span>
                     <span className="text-emerald-500 ml-2">&quot;B2B SaaS Growth&quot;</span>
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
             </motion.div>

             <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.4, duration: 0.8 }}
               className="mt-14 text-center"
             >
               <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight">
                 Data-driven strategy, <br/><span className="text-white/40">compiled instantly.</span>
               </h1>
               <p className="text-sm md:text-base font-light text-white/40 max-w-lg mx-auto">
                 Stratify turns raw network signals into a clear weekly LinkedIn strategy.
               </p>
               <div className="mt-8">
                <Link
                 href="/register"
                 className="inline-flex h-12 items-center justify-center gap-3 rounded-sm bg-white px-8 text-[11px] font-bold uppercase tracking-widest text-black shadow-[0_0_20px_rgba(255,255,255,0.08)] transition-colors duration-200 hover:bg-white/90"
                >
                  Get Started
                  <ArrowRight size={14} className="opacity-80" />
                </Link>
              </div>

              {/* Live Signal Snapshot */}
              <div className="mt-10 w-full max-w-md mx-auto border border-white/10 rounded-sm bg-white/[0.02] divide-y divide-white/5">
                <div className="px-4 py-2.5 flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-emerald-500" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-white/30">Signal Snapshot</span>
                </div>
                 <div className="px-4 py-2.5 text-xs text-white/60">AI fatigue → authentic builder stories ↑</div>
                 <div className="px-4 py-2.5 text-xs text-white/60">Contrarian takes outperform generic advice</div>
                 <div className="px-4 py-2.5 text-xs text-white/60">Personal proof hooks getting more saves</div>
               </div>
               <p className="mt-3 text-[10px] text-white/20">Example signals from recent niche activity</p>
             </motion.div>
          </div>
        </motion.section>

        <section aria-label="Illustrative system output" className="mt-8 md:mt-10">
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
            <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight text-foreground mb-3">How the system replaces guesswork</h2>
            <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto px-4">
              Generic prompts get ignored. Stratify grounds every word in reality.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className="rounded-sm str-panel border-white/5 bg-[#000000]/40 p-6 md:p-8 flex flex-col hover:-translate-y-1 transition-transform duration-300">
              <div className="mb-4 text-emerald-500 bg-emerald-500/10 w-8 h-8 rounded-sm flex items-center justify-center border border-emerald-500/20">
                <Radar size={16} />
              </div>
              <h3 className="text-sm font-bold text-white mb-2 uppercase tracking-wide">1. Signal Extraction</h3>
              <p className="text-white/50 text-[11px] font-mono leading-relaxed flex-grow">
                The engine scans your matrix to isolate underlying psychological triggers, ignoring the noise.
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
                Your profile constraints and references act as borders. The signal is applied purely through your lens.
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
                The pipeline synthesizes insights, hooks, and drafts in one sequence. Run once on Monday and close the tab.
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
              Insight <ArrowRight className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground/50" /> Hook <ArrowRight className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground/50" /> Draft
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto px-4">
              Observe how raw data transforms into a published strategy.
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
                Sharing failures builds stronger trust metrics than success stories. Readers connect with vulnerability.
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
                &quot;The mistake that killed our first $10K MRR&quot;
              </p>
              <p className="text-white/40 text-[10px] font-mono leading-relaxed border-t border-white/5 pt-4 mt-4">
                Applies the signal directly. Opens a curiosity loop to drive views.
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
            <div className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">PLAN CONFIGURATION</div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-foreground mb-3">Select system capacity</h2>
            <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto px-4">Align the extraction engine with your weekly needs.</p>
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
