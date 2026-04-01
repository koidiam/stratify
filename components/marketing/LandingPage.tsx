'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Radar, Settings2, BarChart3, Fingerprint, Sparkles, Check, X, ArrowUpRight, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useFoundingStatus } from '@/hooks/useFoundingStatus';
import { FoundingStrip } from '@/components/billing/FoundingStrip';

type Plan = {
  name: string;
  price: { monthly: string; yearly: string };
  yearlySubtext: string | null;
  frequency: { monthly: string; yearly: string };
  description: string;
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
    description: 'Experience the baseline pipeline. See the system work before committing.',
    features: [
      '1 extraction cycle per week',
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
    description: 'For creators who need a consistent, data-[backed] weekly presence.',
    unlocksText: 'Unlocks full week coverage & history vault',
    features: [
      '3 extraction cycles per week',
      '3 full post drafts',
      'Automated tone matching',
      'Full history vault access'
    ],
    buttonText: 'Get Started',
    featured: true,
  },
  {
    name: 'PRO',
    price: { monthly: '$29', yearly: '$240' },
    yearlySubtext: '$348/yr',
    frequency: { monthly: '/mo', yearly: '/yr' },
    description: 'For founders scaling revenue through serious audience building.',
    unlocksText: 'Unlocks competitor tracking & deep psychology',
    features: [
      '50 extraction cycles per week',
      'Deep psychological mapping',
      'Competitor signal tracking',
      'Priority draft synthesis'
    ],
    buttonText: 'Get Started',
    featured: false,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
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
    <main className="min-h-screen text-foreground bg-background relative selection:bg-primary/20">
      
      {/* Background pattern */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30"
          style={{ maskImage: 'radial-gradient(circle at 50% 0%, black 20%, transparent 80%)', WebkitMaskImage: 'radial-gradient(circle at 50% 0%, black 20%, transparent 80%)' }}
        />
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
           <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-secondary/40 to-muted/20 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
        </div>
      </div>

      <div className="relative z-10 mx-auto flex flex-col w-full max-w-6xl px-6 pb-24 pt-6 md:px-8">
        
        {/* Navigation */}
        <motion.header 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-20 flex items-center justify-between py-4 relative"
        >
          <div className="flex flex-1 items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background text-xs font-bold shadow-sm">
              S
            </div>
            <div>
              <div className="text-base font-bold tracking-tight text-foreground">Stratify</div>
            </div>
          </div>

          <nav className="hidden items-center gap-6 md:flex border border-border bg-card/50 backdrop-blur-md px-6 py-2.5 rounded-full shadow-sm">
            <a href="#mechanisms" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">How it works</a>
            <a href="#pipeline" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">The Pipeline</a>
            <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Plans</a>
          </nav>

          <nav className="flex flex-1 items-center justify-end gap-4">
            <Link href="/login" className="hidden sm:block text-sm font-medium text-foreground hover:text-primary transition-colors">
              Log in
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-full bg-foreground text-background px-5 py-2.5 text-sm font-medium shadow-md transition-transform hover:scale-105 active:scale-95 hover:bg-foreground/90"
            >
              Get Started
            </Link>
          </nav>
        </motion.header>

        {/* Hero Section */}
        <motion.section 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center text-center mt-8 md:mt-16"
        >
          <motion.div variants={itemVariants} className="mb-8 inline-flex items-center self-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-xs font-semibold text-muted-foreground shadow-sm">
            <Radar size={14} className="opacity-80 text-primary" />
            Not an AI Writer. A Signal-Driven Content System.
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="max-w-4xl text-center text-5xl font-extrabold leading-[1.05] tracking-tight text-foreground md:text-6xl lg:text-7xl">
            Stop posting into the void. <br className="hidden md:block" />
            Let data write your strategy.
          </motion.h1>

          <motion.p variants={itemVariants} className="mt-8 max-w-2xl text-lg md:text-xl text-muted-foreground leading-relaxed">
            For founders and creators tired of guesswork. Stratify scans your niche, extracts proven psychological triggers, and synthesizes your weekly LinkedIn drafts—all in one seamless pipeline.
          </motion.p>

          <motion.div variants={itemVariants} className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex h-12 items-center justify-center gap-2 rounded-full bg-foreground px-8 text-sm font-medium text-background shadow-lg transition-all hover:bg-foreground/90 hover:scale-105 active:scale-95"
            >
              Start Free
              <ArrowRight size={16} />
            </Link>
            <a
              href="#mechanisms"
              className="w-full sm:w-auto inline-flex h-12 items-center justify-center gap-2 rounded-full border border-border bg-card px-8 text-sm font-medium text-foreground shadow-sm transition-all hover:bg-secondary"
            >
              See how it works
            </a>
          </motion.div>
        </motion.section>

        {/* Core System Mechanisms -> Replaced generic text with outcome-driven descriptions */}
        <motion.section 
          id="mechanisms"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mt-32 md:mt-40"
        >
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground mb-4">How the system replaces guesswork</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Generic ChatGPT prompts get you ignored. Stratify grounds every word in reality.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-[24px] border border-border bg-card p-8 shadow-sm flex flex-col">
              <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center mb-6 text-foreground border border-border">
                <Radar size={20} />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">1. Signal Extraction</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4 flex-grow">
                The engine scans your niche matrix to find what holds attention right now. It ignores noise and isolates the underlying psychological triggers.
              </p>
              <div className="pt-4 border-t border-border/50">
                <p className="text-xs font-semibold text-foreground"><span className="text-primary mr-1">Outcome:</span> You build authority around validated topics, not random ideas.</p>
              </div>
            </div>

            <div className="rounded-[24px] border border-border bg-card p-8 shadow-sm flex flex-col">
              <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center mb-6 text-foreground border border-border">
                <Fingerprint size={20} />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">2. Tone Calibration</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4 flex-grow">
                Your profile, constraints, and reference texts act as hard borders for the AI. It applies the extracted signals purely through your lens.
              </p>
              <div className="pt-4 border-t border-border/50">
                <p className="text-xs font-semibold text-foreground"><span className="text-primary mr-1">Outcome:</span> Your drafts sound like a sharper version of your natural voice.</p>
              </div>
            </div>

            <div className="rounded-[24px] border border-border bg-card p-8 shadow-sm flex flex-col">
              <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center mb-6 text-foreground border border-border">
                <Settings2 size={20} />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">3. Weekly Batching</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4 flex-grow">
                The pipeline synthesizes insights, engineered hooks, and final post drafts all at once. Run the engine every Monday and close the tab.
              </p>
              <div className="pt-4 border-t border-border/50">
                <p className="text-xs font-semibold text-foreground"><span className="text-primary mr-1">Outcome:</span> Consistent posting without the daily blank-page panic.</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Sample Output Section -> "Aha Moment" Insight to Draft Pipeline */}
        <motion.section
          id="pipeline"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mt-32 md:mt-48"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-4">
              The Insight <ArrowRight className="inline-block mx-1 w-6 h-6 text-muted-foreground/50" /> Hook <ArrowRight className="inline-block mx-1 w-6 h-6 text-muted-foreground/50" /> Draft Pipeline
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              See exactly how raw data transforms into a ready-to-publish strategy for a SaaS founder context.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto relative cursor-default">
            
            {/* Step 1 */}
            <div className="rounded-[24px] border border-border bg-card p-6 shadow-sm z-10 relative">
              <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center text-sm shadow-sm ring-4 ring-background">1</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4 ml-3">
                The Raw Signal
              </div>
              <p className="text-foreground font-medium text-sm leading-relaxed mb-3">
                Sharing failures builds stronger trust metrics than success stories. Readers connect deeply with vulnerability.
              </p>
              <div className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-secondary px-3 py-1.5 text-xs font-semibold text-foreground border border-border/50">
                <Zap size={12} className="text-primary" /> Trigger: Relatability
              </div>
            </div>

            {/* Step 2 */}
            <div className="rounded-[24px] border border-border bg-card p-6 shadow-sm z-10 relative">
              <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center text-sm shadow-sm ring-4 ring-background">2</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4 ml-3">
                The Hook Synthesis
              </div>
              <p className="text-foreground font-semibold text-lg leading-snug">
                &quot;The mistake that killed our first $10K MRR&quot;
              </p>
              <p className="text-muted-foreground text-xs mt-4 leading-relaxed">
                Applies the extracted signal directly. Opens an immediate curiosity loop to drive expanded views.
              </p>
            </div>

            {/* Step 3 */}
            <div className="rounded-[24px] border border-border bg-card p-6 shadow-sm z-10 relative">
              <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center text-sm shadow-sm ring-4 ring-background">3</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4 ml-3">
                The Final Draft
              </div>
              <div className="p-4 bg-secondary/30 border border-border/40 rounded-xl relative">
                <p className="text-foreground text-sm leading-relaxed whitespace-pre-line font-mono">
                  {`We hit $8K MRR in month 3.

Then we tried to scale too fast.

Hired 2 devs before we had repeatable sales.

3 months later: back to $2K.

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
          className="mt-32 md:mt-48"
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-4">Plan Options</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">Select the capacity that fits your operation.</p>
          </div>

          <div className="flex items-center justify-center gap-3 mb-10">
            <span className={`text-sm font-semibold transition-colors ${!isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>Monthly</span>
            <button 
              onClick={() => setIsYearly(!isYearly)}
              className={`w-11 h-6 rounded-full p-1 flex items-center transition-colors ${isYearly ? 'bg-foreground' : 'bg-secondary border border-border'}`}
            >
               <div className={`w-4 h-4 rounded-full bg-background shadow-sm transition-transform duration-300 ${isYearly ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
            <span className={`text-sm font-semibold transition-colors ${isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
              Annual
            </span>
          </div>

          <div className="grid gap-6 lg:grid-cols-3 items-stretch max-w-5xl mx-auto">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`flex flex-col rounded-[24px] p-8 relative border ${
                  plan.featured
                    ? 'border-border bg-secondary/20 shadow-sm'
                    : 'border-border bg-card shadow-sm'
                }`}
              >
                {!isYearly && (plan.name === 'BASIC' || plan.name === 'PRO') && (
                  <FoundingStrip plan={plan.name as 'BASIC' | 'PRO'} status={status} claimed={claimed} total={total} />
                )}
                
                <div className="text-sm font-bold tracking-wider uppercase text-muted-foreground mb-2 mt-2">{plan.name}</div>
                <div className="mb-2 flex items-baseline gap-1 flex-wrap">
                  <span className="text-4xl font-bold tracking-tight text-foreground">
                    {isYearly ? plan.price.yearly : plan.price.monthly}
                  </span>
                  <span className="text-muted-foreground text-sm font-medium">
                    {isYearly ? plan.frequency.yearly : plan.frequency.monthly}
                  </span>
                </div>
                
                <p className="text-sm text-muted-foreground mb-4 min-h-[40px] leading-relaxed">{plan.description}</p>
                
                {plan.unlocksText && (
                  <div className="mb-6 bg-primary/10 border border-primary/20 text-primary text-xs font-semibold px-3 py-2 rounded-lg">
                    {plan.unlocksText}
                  </div>
                )}
                
                <div className="space-y-4 flex-1 border-t border-border/50 pt-6 mb-8">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm text-foreground/90">
                      <Check size={16} className="text-muted-foreground mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <Link
                  href="/register"
                  className={`flex w-full items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all ${
                    plan.featured 
                      ? 'bg-foreground text-background hover:bg-foreground/90' 
                      : 'bg-secondary text-foreground hover:bg-secondary/80 border border-border'
                  }`}
                >
                  {plan.buttonText}
                </Link>
              </div>
            ))}
          </div>
        </motion.section>
        
        {/* Footer */}
        <footer className="mt-32 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between text-muted-foreground text-sm font-medium">
          <div>© {new Date().getFullYear()} Stratify. All rights reserved.</div>
          <div className="flex gap-8 mt-4 md:mt-0">
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
