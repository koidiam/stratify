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
    capacity: '1 extraction cycle / week',
    features: [
      '1 validated insight',
      '1 final post draft',
      'Basic hook generation'
    ],
    buttonText: 'Initialize Sandbox',
    featured: false,
  },
  {
    name: 'BASIC',
    price: { monthly: '$15', yearly: '$120' },
    yearlySubtext: '$180/yr',
    frequency: { monthly: '/mo', yearly: '/yr' },
    description: 'Consistent, data-backed weekly presence.',
    capacity: '3 extraction cycles / week',
    unlocksText: 'Unlocks full week coverage & history vault',
    features: [
      '3 full post drafts',
      'Automated tone matching',
      'Full history vault access'
    ],
    buttonText: 'Configure Basic',
    featured: false,
  },
  {
    name: 'PRO',
    price: { monthly: '$29', yearly: '$240' },
    yearlySubtext: '$348/yr',
    frequency: { monthly: '/mo', yearly: '/yr' },
    description: 'For scaling revenue through audience building.',
    capacity: '50 extraction cycles / week',
    unlocksText: 'Unlocks competitor tracking & deep psychology',
    features: [
      'Deep psychological mapping',
      'Competitor signal tracking',
      'Priority draft synthesis'
    ],
    buttonText: 'Configure Pro',
    featured: true, // Pro gets the focus
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function LandingPage() {
  const [isYearly, setIsYearly] = useState(false);
  const { status, claimed, total } = useFoundingStatus();

  return (
    <main className="min-h-screen text-foreground bg-background relative selection:bg-primary/20 font-sans overflow-x-hidden">
      
      {/* Refined Background Gradients */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Subtle grid */}
        <div 
          className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20"
          style={{ maskImage: 'radial-gradient(circle at 50% 0%, black 20%, transparent 80%)', WebkitMaskImage: 'radial-gradient(circle at 50% 0%, black 20%, transparent 80%)' }}
        />
        {/* Top Glow - Toned Down */}
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-2xl sm:-top-80">
           <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-secondary/30 to-muted/10 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
        </div>
        {/* Second Lower Glow */}
        <div className="absolute inset-x-0 top-[40rem] -z-10 transform-gpu overflow-hidden blur-2xl flex justify-center">
           <div className="relative aspect-[1155/678] w-[36.125rem] rotate-[15deg] bg-gradient-to-tr from-primary/5 to-transparent opacity-30 sm:w-[50rem]" />
        </div>
      </div>

      <div className="relative z-10 mx-auto flex flex-col w-full max-w-5xl px-5 pb-20 pt-6 md:px-8">
        
        {/* Navigation */}
        <motion.header 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-12 md:mb-16 flex items-center justify-between py-4 relative"
        >
          <div className="flex flex-1 items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground text-background text-xs font-bold">
              S
            </div>
            <div>
              <div className="text-sm font-semibold tracking-tight text-foreground">Stratify</div>
            </div>
          </div>

          <nav className="hidden items-center gap-8 md:flex">
            <a href="#mechanisms" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">Mechanisms</a>
            <a href="#pipeline" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">Pipeline</a>
            <a href="#pricing" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">Configuration</a>
          </nav>

          <nav className="flex flex-1 items-center justify-end gap-3">
            <Link href="/login" className="hidden sm:block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Log in
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium transition-transform hover:bg-primary/90 active:scale-95"
            >
              Access System
            </Link>
          </nav>
        </motion.header>

        {/* Hero Section */}
        <motion.section 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center text-center mt-2 md:mt-8"
        >
          {/* Depth Container Setup */}
          <motion.div className="w-full max-w-4xl rounded-[20px] md:rounded-[24px] border border-border/40 bg-card/20 backdrop-blur-md p-6 sm:p-10 md:p-14 shadow-sm relative overflow-hidden flex flex-col items-center">
            
            {/* Inner faint grid for structural feel */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

            <motion.div variants={itemVariants} className="relative z-10 mb-6 inline-flex items-center self-center gap-2 rounded-md bg-secondary/60 border border-border/50 px-2.5 py-1 text-[9px] md:text-[10px] font-semibold uppercase tracking-widest text-muted-foreground leading-none">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              Signal-Driven Content System
            </motion.div>
            
            <motion.h1 variants={itemVariants} className="relative z-10 max-w-3xl text-center text-4xl sm:text-5xl font-extrabold leading-[1.1] tracking-tight text-foreground md:text-6xl">
              Stop posting into the void. <br className="hidden sm:block" />
              Let data write your strategy.
            </motion.h1>

            <motion.p variants={itemVariants} className="relative z-10 mt-5 md:mt-6 max-w-xl text-sm sm:text-base md:text-lg text-muted-foreground/90 leading-relaxed">
              For founders and creators tired of guesswork. Stratify scans your niche, extracts psychological triggers, and synthesizes your weekly LinkedIn drafts.
            </motion.p>

            <motion.div variants={itemVariants} className="relative z-10 mt-8 md:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
              {/* Primary High Contrast */}
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex h-11 md:h-12 items-center justify-center gap-2 rounded-md bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-95"
              >
                Start Free
                <ArrowRight size={16} />
              </Link>
              {/* Secondary Ghost/Outline */}
              <a
                href="#mechanisms"
                className="w-full sm:w-auto inline-flex h-11 md:h-12 items-center justify-center gap-2 rounded-md border border-border/60 bg-transparent px-8 text-sm font-medium text-foreground transition-all hover:bg-secondary/50"
              >
                View Mechanisms
              </a>
            </motion.div>
          </motion.div>
        </motion.section>

        {/* Interface Proof - The Visual Evidence */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-4xl mx-auto mt-12 md:mt-16 pointer-events-none select-none px-2 sm:px-0"
        >
          {/* Abstracted Product UI Composition */}
          <div className="rounded-[20px] md:rounded-[24px] border border-border/50 bg-card/40 p-4 sm:p-6 md:p-8 backdrop-blur-md shadow-2xl relative overflow-hidden flex flex-col gap-4 md:gap-6">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50" />
            
            {/* 1. Generate Step Strip */}
            <div className="relative z-10 grid grid-cols-3 gap-2 md:gap-4">
              {['Signal scan', 'Hook design', 'Final draft'].map((step, i) => (
                <div key={step} className={`rounded-[12px] border px-2.5 py-2 md:px-3 md:py-2.5 text-xs md:text-sm transition-all duration-150 ${i === 2 ? 'border-primary/30 bg-primary/10 text-primary font-medium' : 'border-border/60 bg-card/50 text-muted-foreground'}`}>
                  <div className="text-[8px] md:text-[10px] font-bold uppercase tracking-wider opacity-60 mb-1">Step 0{i+1}</div>
                  <div className="font-medium tracking-wide truncate">{step}</div>
                </div>
              ))}
            </div>

            {/* 2. State Cards */}
            <div className="relative z-10 grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2">
              <div className="rounded-[16px] border border-border/50 bg-background/60 p-4 md:p-5 flex flex-col justify-between">
                <div className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Latest Extraction</div>
                <div>
                  <p className="text-base md:text-lg font-semibold text-foreground tracking-tight">Week 14, 2026</p>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    <span className="text-[11px] md:text-xs font-medium text-foreground bg-secondary/80 rounded-md px-2 py-1 border border-border/30">3 insights</span>
                    <span className="text-[11px] md:text-xs font-medium text-foreground bg-secondary/80 rounded-md px-2 py-1 border border-border/30">3 drafts</span>
                  </div>
                </div>
              </div>
              
              <div className="rounded-[16px] border border-border/50 bg-background/60 p-4 md:p-5 flex flex-col justify-center items-start">
                 <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-primary mb-2">
                   <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                   Engine Ready
                 </div>
                 <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">System calibrated for active niche. Awaiting next cycle command.</p>
              </div>
            </div>

            {/* 3. Inline Action Bar */}
            <div className="relative z-10 flex items-center justify-between rounded-full border border-border/50 bg-background/80 p-1.5 md:p-2.5 shadow-sm">
              <div className="flex items-center">
                <div className="rounded-full bg-primary px-4 md:px-5 py-2 md:py-2.5 text-[11px] md:text-xs font-bold text-primary-foreground flex items-center gap-1.5 uppercase tracking-wide">
                   <Zap size={14} className="opacity-80" />
                   <span>Run Engine</span>
                </div>
              </div>
              <div className="flex items-center gap-3 md:gap-5 pr-4 md:pr-5 text-[11px] md:text-xs font-medium text-muted-foreground uppercase tracking-widest">
                <div className="flex items-center gap-1.5"><BarChart3 size={14} /> <span className="hidden xs:inline">History</span></div>
                <div className="w-px h-3 bg-border" />
                <div className="flex items-center gap-1.5"><Settings2 size={14} /> <span className="hidden xs:inline">Config</span></div>
              </div>
            </div>
          </div>
        </motion.div>

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
            <div className="rounded-[16px] border border-border/50 bg-card/40 p-5 md:p-6 flex flex-col">
              <div className="mb-3 text-muted-foreground">
                <Radar size={18} />
              </div>
              <h3 className="text-sm md:text-base font-semibold text-foreground mb-2">1. Signal Extraction</h3>
              <p className="text-muted-foreground text-xs md:text-sm leading-relaxed flex-grow">
                The engine scans your matrix to isolate underlying psychological triggers, ignoring the noise.
              </p>
              <div className="pt-3 mt-4 border-t border-border/40">
                <p className="text-[11px] md:text-xs font-medium text-foreground"><span className="text-primary font-semibold mr-1">Outcome:</span> Authority around validated topics.</p>
              </div>
            </div>

            <div className="rounded-[16px] border border-border/50 bg-card/40 p-5 md:p-6 flex flex-col">
              <div className="mb-3 text-muted-foreground">
                <Fingerprint size={18} />
              </div>
              <h3 className="text-sm md:text-base font-semibold text-foreground mb-2">2. Tone Calibration</h3>
              <p className="text-muted-foreground text-xs md:text-sm leading-relaxed flex-grow">
                Your profile constraints and references act as borders. The signal is applied purely through your lens.
              </p>
              <div className="pt-3 mt-4 border-t border-border/40">
                <p className="text-[11px] md:text-xs font-medium text-foreground"><span className="text-primary font-semibold mr-1">Outcome:</span> Drafts that inherit your natural voice.</p>
              </div>
            </div>

            <div className="rounded-[16px] border border-border/50 bg-card/40 p-5 md:p-6 flex flex-col">
              <div className="mb-3 text-muted-foreground">
                <Settings2 size={18} />
              </div>
              <h3 className="text-sm md:text-base font-semibold text-foreground mb-2">3. Weekly Batching</h3>
              <p className="text-muted-foreground text-xs md:text-sm leading-relaxed flex-grow">
                The pipeline synthesizes insights, hooks, and drafts in one sequence. Run once on Monday and close the tab.
              </p>
              <div className="pt-3 mt-4 border-t border-border/40">
                <p className="text-[11px] md:text-xs font-medium text-foreground"><span className="text-primary font-semibold mr-1">Outcome:</span> Consistent posting without daily panic.</p>
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
            <div className="rounded-[16px] border border-border/50 bg-card/40 p-5 md:p-6 flex flex-col">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-5 h-5 rounded bg-secondary text-muted-foreground font-mono text-[10px] flex items-center justify-center border border-border">01</div>
                <div className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-muted-foreground">The Raw Signal</div>
              </div>
              <p className="text-foreground text-xs md:text-sm leading-relaxed mb-4 flex-grow">
                Sharing failures builds stronger trust metrics than success stories. Readers connect with vulnerability.
              </p>
              <div className="inline-flex items-center gap-1.5 rounded bg-secondary/60 px-2 py-1 text-[10px] md:text-[11px] font-semibold text-foreground border border-border/50 w-max">
                <Zap size={10} className="text-primary" /> Trigger: Relatability
              </div>
            </div>

            {/* Step 2 */}
            <div className="rounded-[16px] border border-border/50 bg-card/40 p-5 md:p-6 flex flex-col">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-5 h-5 rounded bg-secondary text-muted-foreground font-mono text-[10px] flex items-center justify-center border border-border">02</div>
                <div className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-muted-foreground">The Hook</div>
              </div>
              <p className="text-foreground font-semibold text-sm md:text-base leading-snug flex-grow">
                &quot;The mistake that killed our first $10K MRR&quot;
              </p>
              <p className="text-muted-foreground text-[11px] md:text-xs leading-relaxed border-t border-border/40 pt-3 mt-3">
                Applies the signal directly. Opens a curiosity loop to drive views.
              </p>
            </div>

            {/* Step 3 */}
            <div className="rounded-[16px] border border-border/50 bg-card/40 p-5 md:p-6 flex flex-col">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-5 h-5 rounded bg-secondary text-muted-foreground font-mono text-[10px] flex items-center justify-center border border-border">03</div>
                <div className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-muted-foreground">The Draft</div>
              </div>
              <div className="p-3 bg-background/50 border border-border/30 rounded-lg flex-grow">
                <p className="text-foreground/90 text-[11px] md:text-xs leading-relaxed whitespace-pre-line font-mono">
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

          <div className="grid gap-4 md:gap-6 lg:grid-cols-3 items-stretch max-w-sm md:max-w-5xl mx-auto">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`flex flex-col rounded-[16px] md:rounded-[20px] p-5 md:p-6 transition-all duration-300 ${
                  plan.featured
                    ? 'border border-primary/40 bg-primary/5 shadow-sm'
                    : 'border border-border/50 bg-card/40'
                }`}
              >
                {(plan.name === 'BASIC' || plan.name === 'PRO') && (
                  <FoundingStrip plan={plan.name as 'BASIC' | 'PRO'} status={status} claimed={claimed} total={total} isYearly={isYearly} />
                )}
                
                <div className="text-[9px] md:text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-2 mt-1">{plan.name}</div>
                <div className="mb-3 flex items-baseline gap-1 flex-wrap">
                  <span className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                    {isYearly ? plan.price.yearly : plan.price.monthly}
                  </span>
                  <span className="text-muted-foreground text-[10px] md:text-xs font-medium uppercase tracking-wider">
                    {isYearly ? plan.frequency.yearly : plan.frequency.monthly}
                  </span>
                </div>
                
                <p className="text-xs md:text-sm text-foreground/80 mb-5 leading-relaxed flex-grow pr-2">{plan.description}</p>
                
                <div className="bg-background/50 border border-border/40 rounded-lg p-2.5 mb-5 md:mb-6">
                  <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1">CAPACITY</div>
                  <div className="text-xs md:text-sm font-mono font-medium text-foreground">{plan.capacity}</div>
                </div>

                {plan.unlocksText && (
                  <div className="mb-5 md:mb-6 mb-auto text-[11px] md:text-xs font-medium text-primary">
                    + {plan.unlocksText}
                  </div>
                )}
                
                <div className="space-y-2.5 border-t border-border/40 pt-5 mb-6 md:mb-8 mt-auto">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-2 md:gap-3 text-[11px] md:text-xs text-muted-foreground">
                      <Check size={12} className="text-foreground shrink-0 mt-0.5 md:mt-1" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <Link
                  href="/register"
                  className={`flex w-full items-center justify-center gap-2 py-2.5 rounded-md text-xs md:text-sm font-semibold transition-all ${
                    plan.featured 
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                      : 'bg-secondary text-foreground hover:bg-secondary/80 border border-border/50'
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
          <div>© {new Date().getFullYear()} Stratify. All rights reserved.</div>
          <div className="flex gap-4 md:gap-6 mt-4 md:mt-0">
            <Link href="/terms" className="hover:text-foreground transition-colors uppercase tracking-wider">Terms</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors uppercase tracking-wider">Privacy</Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
