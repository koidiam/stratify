'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Radar, Settings2, Fingerprint, Check, Zap } from 'lucide-react';
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
    <main className="min-h-screen text-foreground bg-background relative selection:bg-primary/20 font-sans">
      
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
        <div className="absolute inset-x-0 top-[40rem] -z-10 transform-gpu overflow-hidden blur-2xl">
           <div className="relative left-[calc(50%+11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[15deg] bg-gradient-to-tr from-primary/5 to-transparent opacity-30 sm:left-[calc(50%+15rem)] sm:w-[50rem]" />
        </div>
      </div>

      <div className="relative z-10 mx-auto flex flex-col w-full max-w-5xl px-6 pb-24 pt-6 md:px-8">
        
        {/* Navigation */}
        <motion.header 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-16 flex items-center justify-between py-4 relative"
        >
          <div className="flex flex-1 items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground text-background text-xs font-bold">
              S
            </div>
            <div>
              <div className="text-sm font-semibold tracking-tight text-foreground">Stratify OS</div>
            </div>
          </div>

          <nav className="hidden items-center gap-8 md:flex">
            <a href="#mechanisms" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">Mechanisms</a>
            <a href="#pipeline" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">Pipeline</a>
            <a href="#pricing" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">Configuration</a>
          </nav>

          <nav className="flex flex-1 items-center justify-end gap-4">
            <Link href="/login" className="hidden sm:block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Log in
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-md bg-foreground text-background px-4 py-2 text-sm font-medium transition-transform hover:bg-foreground/90 active:scale-95"
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
          className="flex flex-col items-center text-center mt-4 md:mt-12"
        >
          {/* Depth Container Setup */}
          <motion.div className="w-full max-w-4xl rounded-[24px] border border-border/40 bg-card/20 backdrop-blur-md p-8 md:p-16 shadow-sm relative overflow-hidden flex flex-col items-center">
            
            {/* Inner faint grid for structural feel */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

            <motion.div variants={itemVariants} className="relative z-10 mb-8 inline-flex items-center self-center gap-2 rounded-md bg-secondary/60 border border-border/50 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Signal-Driven Content System
            </motion.div>
            
            <motion.h1 variants={itemVariants} className="relative z-10 max-w-3xl text-center text-5xl font-extrabold leading-[1.1] tracking-tight text-foreground md:text-6xl">
              Stop posting into the void. <br className="hidden md:block" />
              Let data write your strategy.
            </motion.h1>

            <motion.p variants={itemVariants} className="relative z-10 mt-6 max-w-xl text-base md:text-lg text-muted-foreground leading-relaxed">
              For founders and creators tired of guesswork. Stratify scans your niche, extracts proven psychological triggers, and synthesizes your weekly LinkedIn drafts—all in one seamless pipeline.
            </motion.p>

            <motion.div variants={itemVariants} className="relative z-10 mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
              {/* Primary High Contrast */}
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-95"
              >
                Start Free
                <ArrowRight size={16} />
              </Link>
              {/* Secondary Ghost/Outline */}
              <a
                href="#mechanisms"
                className="w-full sm:w-auto inline-flex h-11 items-center justify-center gap-2 rounded-md border border-border/60 bg-transparent px-8 text-sm font-medium text-foreground transition-all hover:bg-secondary/50"
              >
                View Mechanisms
              </a>
            </motion.div>
          </motion.div>
        </motion.section>

        {/* Core System Mechanisms */}
        <motion.section 
          id="mechanisms"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mt-24 pt-24 border-t border-border/30"
        >
          <div className="text-center mb-16">
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">SYSTEM MECHANISMS</div>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground mb-4">How the system replaces guesswork</h2>
            <p className="text-muted-foreground text-base max-w-xl mx-auto">
              Generic ChatGPT prompts get you ignored. Stratify grounds every word in reality.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-[16px] border border-border/50 bg-card/40 p-6 flex flex-col hover:bg-card/80 transition-colors">
              <div className="mb-4 text-muted-foreground">
                <Radar size={18} />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-2">1. Signal Extraction</h3>
              <p className="text-muted-foreground text-sm leading-relaxed flex-grow">
                The engine scans your niche matrix to find what holds attention right now. It ignores noise and isolates underlying psychological triggers.
              </p>
              <div className="pt-4 mt-4 border-t border-border/40">
                <p className="text-xs font-medium text-foreground"><span className="text-primary font-semibold mr-1">Outcome:</span> Authority around validated topics, not random ideas.</p>
              </div>
            </div>

            <div className="rounded-[16px] border border-border/50 bg-card/40 p-6 flex flex-col hover:bg-card/80 transition-colors">
              <div className="mb-4 text-muted-foreground">
                <Fingerprint size={18} />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-2">2. Tone Calibration</h3>
              <p className="text-muted-foreground text-sm leading-relaxed flex-grow">
                Your profile, constraints, and reference texts act as hard borders for the AI. It applies the extracted signals purely through your lens.
              </p>
              <div className="pt-4 mt-4 border-t border-border/40">
                <p className="text-xs font-medium text-foreground"><span className="text-primary font-semibold mr-1">Outcome:</span> Drafts that sound like a sharper version of your natural voice.</p>
              </div>
            </div>

            <div className="rounded-[16px] border border-border/50 bg-card/40 p-6 flex flex-col hover:bg-card/80 transition-colors">
              <div className="mb-4 text-muted-foreground">
                <Settings2 size={18} />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-2">3. Weekly Batching</h3>
              <p className="text-muted-foreground text-sm leading-relaxed flex-grow">
                The pipeline synthesizes insights, engineered hooks, and final post drafts all at once. Run the engine every Monday and close the tab.
              </p>
              <div className="pt-4 mt-4 border-t border-border/40">
                <p className="text-xs font-medium text-foreground"><span className="text-primary font-semibold mr-1">Outcome:</span> Consistent posting without the daily blank-page panic.</p>
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
          className="mt-24 pt-24 border-t border-border/30"
        >
          <div className="text-center mb-16">
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">WORKFLOW OUTPUT</div>
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-4 flex items-center justify-center gap-3">
              Insight <ArrowRight className="w-5 h-5 text-muted-foreground/50 hidden sm:block" /> Hook <ArrowRight className="w-5 h-5 text-muted-foreground/50 hidden sm:block" /> Draft
            </h2>
            <p className="text-muted-foreground text-base max-w-xl mx-auto">
              Observe how raw data transforms into a ready-to-publish strategy for a SaaS founder context.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative cursor-default">
            
            {/* Step 1 */}
            <div className="rounded-[16px] border border-border/50 bg-card/40 p-6 z-10 relative flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-6 h-6 rounded bg-secondary text-muted-foreground font-mono text-xs flex items-center justify-center border border-border">01</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">The Raw Signal</div>
              </div>
              <p className="text-foreground text-sm leading-relaxed mb-4 flex-grow">
                Sharing failures builds stronger trust metrics than success stories. Readers connect deeply with vulnerability.
              </p>
              <div className="inline-flex items-center gap-1.5 rounded bg-secondary/60 px-2.5 py-1 text-[11px] font-semibold text-foreground border border-border/50 w-max">
                <Zap size={10} className="text-primary" /> Trigger: Relatability
              </div>
            </div>

            {/* Step 2 */}
            <div className="rounded-[16px] border border-border/50 bg-card/40 p-6 z-10 relative flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-6 h-6 rounded bg-secondary text-muted-foreground font-mono text-xs flex items-center justify-center border border-border">02</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">The Hook Synthesis</div>
              </div>
              <p className="text-foreground font-semibold text-base leading-snug flex-grow">
                &quot;The mistake that killed our first $10K MRR&quot;
              </p>
              <p className="text-muted-foreground text-xs leading-relaxed border-t border-border/40 pt-4 mt-4">
                Applies the extracted signal directly. Opens an immediate curiosity loop to drive expanded views.
              </p>
            </div>

            {/* Step 3 */}
            <div className="rounded-[16px] border border-border/50 bg-card/40 p-6 z-10 relative flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-6 h-6 rounded bg-secondary text-muted-foreground font-mono text-xs flex items-center justify-center border border-border">03</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">The Final Draft</div>
              </div>
              <div className="p-3 bg-background/50 border border-border/30 rounded-lg flex-grow">
                <p className="text-foreground/90 text-sm leading-relaxed whitespace-pre-line font-mono">
                  {`We hit $8K MRR in month 3.

Then we tried to scale too fast.

Hired 2 devs before repeatable sales.

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
          className="mt-24 pt-24 border-t border-border/30"
        >
          <div className="text-center mb-12">
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">PLAN CONFIGURATION</div>
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-4">Select system capacity</h2>
            <p className="text-muted-foreground text-base max-w-xl mx-auto">Align the extraction engine with your weekly operational needs.</p>
          </div>

          <div className="flex items-center justify-center gap-3 mb-12">
            <span className={`text-xs font-semibold uppercase tracking-wider transition-colors ${!isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>Monthly</span>
            <button 
              onClick={() => setIsYearly(!isYearly)}
              className={`w-10 h-5 rounded-full p-0.5 flex items-center transition-colors ${isYearly ? 'bg-primary' : 'bg-secondary border border-border'}`}
            >
               <div className={`w-4 h-4 rounded-full bg-background shadow-sm transition-transform duration-300 ${isYearly ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
            <span className={`text-xs font-semibold uppercase tracking-wider transition-colors ${isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
              Annual
            </span>
          </div>

          <div className="grid gap-6 lg:grid-cols-3 items-stretch">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`flex flex-col rounded-[20px] p-6 md:p-8 transition-all duration-300 ${
                  plan.featured
                    ? 'border border-primary/40 bg-primary/5 shadow-sm'
                    : 'border border-border/50 bg-card/40 hover:bg-card/80'
                }`}
              >
                {!isYearly && (plan.name === 'BASIC' || plan.name === 'PRO') && (
                  <FoundingStrip plan={plan.name as 'BASIC' | 'PRO'} status={status} claimed={claimed} total={total} />
                )}
                
                <div className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-2 mt-2">{plan.name}</div>
                <div className="mb-4 flex items-baseline gap-1 flex-wrap">
                  <span className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                    {isYearly ? plan.price.yearly : plan.price.monthly}
                  </span>
                  <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
                    {isYearly ? plan.frequency.yearly : plan.frequency.monthly}
                  </span>
                </div>
                
                <p className="text-sm text-foreground/80 mb-6 leading-relaxed flex-grow">{plan.description}</p>
                
                <div className="bg-background/50 border border-border/40 rounded-lg p-3 mb-6">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">CAPACITY</div>
                  <div className="text-sm font-mono font-medium text-foreground">{plan.capacity}</div>
                </div>

                {plan.unlocksText && (
                  <div className="mb-6 mb-auto text-xs font-medium text-primary">
                    + {plan.unlocksText}
                  </div>
                )}
                
                <div className="space-y-3 border-t border-border/40 pt-6 mb-8 mt-auto">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3 text-xs text-muted-foreground">
                      <Check size={14} className="text-foreground shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <Link
                  href="/register"
                  className={`flex w-full items-center justify-center gap-2 py-2.5 rounded-md text-sm font-semibold transition-all ${
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
        <footer className="mt-24 pt-8 border-t border-border/30 flex flex-col md:flex-row items-center justify-between text-muted-foreground text-xs font-medium">
          <div>© {new Date().getFullYear()} Stratify. Data-Backed OS.</div>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link href="/terms" className="hover:text-foreground transition-colors uppercase tracking-wider">Terms</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors uppercase tracking-wider">Privacy</Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
