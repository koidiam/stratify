'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Radar, Settings2, BarChart3, Fingerprint, Sparkles, CheckCircle2, ArrowUpRight, Check, X, Info, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useFoundingStatus } from '@/hooks/useFoundingStatus';
import { FoundingStrip } from '@/components/billing/FoundingStrip';

type FeatureItem = { name: string; active: boolean; badge?: string; tooltip?: string };
type FeatureCategory = { title: string; items: FeatureItem[] };
type Plan = {
  name: string;
  price: { monthly: string; yearly: string };
  yearlySubtext: string | null;
  frequency: { monthly: string; yearly: string };
  description: string;
  featureCategories: FeatureCategory[];
  buttonText: string;
  featured: boolean;
  guaranteeText: string | null;
};

const PLANS: Plan[] = [
  {
    name: 'FREE',
    price: { monthly: '$0', yearly: '$0' },
    yearlySubtext: null,
    frequency: { monthly: '/mo', yearly: '/yr' },
    description: 'Experience the full output — 1 generation per week. See exactly what you get before upgrading.',
    featureCategories: [
      {
        title: 'CONTENT GENERATION',
        items: [
          { name: '1 generation per week', active: true },
          { name: '1 insight (of 3)', active: true },
          { name: '1 ready-to-publish post', active: true },
          { name: '5 hooks + 5 ideas (preview)', active: true },
        ]
      },
      {
        title: 'FEATURES',
        items: [
          { name: 'Full history access', active: false },
          { name: 'Tone profile saving', active: false },
          { name: 'Feedback Loop', active: false, tooltip: "Track how your posts perform. The more data you give it, the smarter your weekly strategy becomes." },
          { name: 'Deep competitor analysis', active: false, tooltip: "Shows you what's actually going viral in your niche this week, so you always know what to write and why it works.", badge: 'Coming soon' },
          { name: 'Signature Style Engine', active: false, tooltip: "The AI studies how you write — your rhythm, tone, and structure — then applies it to every post it generates for you.", badge: 'Coming soon' },
          { name: 'Priority support', active: false },
        ]
      }
    ],
    buttonText: 'Start for free',
    featured: false,
    guaranteeText: null,
  },
  {
    name: 'BASIC',
    price: { monthly: '$15', yearly: '$120' },
    yearlySubtext: '$180/yr',
    frequency: { monthly: '/mo', yearly: '/yr' },
    description: 'For creators who post consistently',
    featureCategories: [
      {
        title: 'CONTENT GENERATION',
        items: [
          { name: '3 generations per week', active: true },
          { name: '3 insights (full analysis)', active: true },
          { name: '3 ready-to-publish posts', active: true },
          { name: '5 hooks + 5 content ideas', active: true },
        ]
      },
      {
        title: 'FEATURES',
        items: [
          { name: 'Full history access', active: true },
          { name: 'Tone profile saving', active: true },
          { name: 'Feedback Loop', active: true, tooltip: "Track how your posts perform. The more data you give it, the smarter your weekly strategy becomes." },
          { name: 'Deep competitor analysis', active: false, tooltip: "Shows you what's actually going viral in your niche this week, so you always know what to write and why it works.", badge: 'Coming soon' },
          { name: 'Signature Style Engine', active: false, tooltip: "The AI studies how you write — your rhythm, tone, and structure — then applies it to every post it generates for you.", badge: 'Coming soon' },
          { name: 'Priority support', active: false },
        ]
      }
    ],
    buttonText: 'Upgrade to Basic',
    featured: true,
    guaranteeText: '✦ Price lock guarantee',
  },
  {
    name: 'PRO',
    price: { monthly: '$29', yearly: '$240' },
    yearlySubtext: '$348/yr',
    frequency: { monthly: '/mo', yearly: '/yr' },
    description: 'For founders who grow with data',
    featureCategories: [
      {
        title: 'CONTENT GENERATION',
        items: [
          { name: '50 generations per week', active: true },
          { name: '3 insights + psychological analysis', active: true },
          { name: '3 ready-to-publish posts + priority', active: true },
          { name: '5 hooks + 5 content ideas', active: true },
        ]
      },
      {
        title: 'FEATURES',
        items: [
          { name: 'Full history access', active: true },
          { name: 'Tone profile saving', active: true },
          { name: 'Feedback Loop', active: true, tooltip: "Track how your posts perform. The more data you give it, the smarter your weekly strategy becomes." },
          { name: 'Deep competitor analysis', active: true, tooltip: "Shows you what's actually going viral in your niche this week, so you always know what to write and why it works.", badge: 'Coming soon' },
          { name: 'Signature Style Engine', active: true, tooltip: "The AI studies how you write — your rhythm, tone, and structure — then applies it to every post it generates for you.", badge: 'Coming soon' },
          { name: 'Priority support', active: true },
        ]
      }
    ],
    buttonText: 'Upgrade to Pro',
    featured: false,
    guaranteeText: '✦ Price lock guarantee',
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
  const { loaded, available, claimed, total } = useFoundingStatus();

  return (
    <main className="min-h-screen text-foreground bg-background relative selection:bg-primary/20">
      
      {/* Precise grid background pattern */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30"
          style={{ maskImage: 'radial-gradient(circle at 50% 0%, black 20%, transparent 80%)', WebkitMaskImage: 'radial-gradient(circle at 50% 0%, black 20%, transparent 80%)' }}
        />
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
           <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary/20 to-primary/5 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
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
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary border border-primary text-white text-xs font-bold shadow-sm">
              S
            </div>
            <div>
              <div className="text-base font-bold tracking-tight text-foreground">Stratify</div>
            </div>
          </div>

          <nav className="hidden items-center gap-6 md:flex border border-border bg-card/50 backdrop-blur-md px-6 py-2.5 rounded-full shadow-sm">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
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
          className="flex flex-col items-center text-center mt-8 md:mt-20"
        >
          <motion.div variants={itemVariants} className="mb-8 inline-flex items-center self-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary shadow-sm">
            <Sparkles size={14} className="opacity-80" />
            The Data-Backed LinkedIn OS
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="max-w-4xl text-center text-5xl font-extrabold leading-[1.05] tracking-tight text-foreground md:text-6xl lg:text-7xl">
            Stop guessing. <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500 inline-block">
              Start writing with data.
            </span>
          </motion.h1>

          <motion.p variants={itemVariants} className="mt-6 max-w-2xl text-lg md:text-xl text-muted-foreground leading-relaxed">
            Every Monday, Stratify analyzes your niche, spots what's going viral, and writes you 3 posts — ready to publish.
          </motion.p>

          <motion.div variants={itemVariants} className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-8 text-sm font-medium text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:scale-105 active:scale-95"
            >
              Start for free
              <ArrowRight size={16} />
            </Link>
            <a
              href="#features"
              className="w-full sm:w-auto inline-flex h-12 items-center justify-center gap-2 rounded-full border border-border bg-card px-8 text-sm font-medium text-foreground shadow-sm transition-all hover:bg-secondary"
            >
              See how it works
            </a>
          </motion.div>
        </motion.section>

        {/* What makes us different - Distinct Features */}
        <motion.section 
          id="features"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mt-32 md:mt-48"
        >
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Why Stratify is different</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">We don't just use ChatGPT. We built an entire data OS around your brand.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="rounded-[24px] border border-border bg-card p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 text-blue-600 border border-blue-500/20">
                <Radar size={24} />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                <span className="block text-sm font-bold text-blue-500 mb-1">Signal Engine</span>
                You&apos;ll never post into the void again
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                Generic AI writes generic posts. Stratify scans your niche&apos;s real timeline — so every insight is grounded in what&apos;s actually working this week, not last year.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-[24px] border border-border bg-card p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6 text-emerald-600 border border-emerald-500/20">
                <Fingerprint size={24} />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                <span className="block text-sm font-bold text-emerald-500 mb-1">Signature Style Engine</span>
                Write at AI speed. Sound like yourself.
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                Your onboarding saves your tone, audience, and reference posts. Every hook and draft is calibrated to your voice — not a generic LinkedIn template.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-[24px] border border-border bg-card p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6 text-purple-600 border border-purple-500/20">
                <Settings2 size={24} />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                <span className="block text-sm font-bold text-purple-500 mb-1">Strategy & Draft Engine</span>
                30 minutes on Monday. The rest of the week, just post.
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                One click generates a week&apos;s worth of insights, hooks, and drafts. No more staring at a blank page on Tuesday morning.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Sample Output Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mt-32 md:mt-48"
        >
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary mb-6">
              <Zap size={12} />
              Live output example — SaaS Founders niche
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              This is what you get every week
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Real output. Real niche. Generated in under 60 seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Insight Card */}
            <div className="rounded-[24px] border border-border bg-card p-6 shadow-sm">
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">
                This week&apos;s insight
              </div>
              <p className="text-foreground font-semibold mb-3">
                Failure posts outperform success stories by 2.3x in the SaaS niche.
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Readers relate to struggle, not polish. Vulnerability signals
                authenticity — the highest-engagement trigger on LinkedIn right now.
              </p>
              <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                Trigger: Relatability
              </div>
            </div>

            {/* Hook Card */}
            <div className="rounded-[24px] border border-border bg-card p-6 shadow-sm">
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">
                Generated hook
              </div>
              <p className="text-foreground font-semibold text-lg leading-snug">
                &quot;The mistake that killed our first $10K MRR&quot;
              </p>
              <p className="text-muted-foreground text-sm mt-4 leading-relaxed">
                Directly applies the insight. Opens a curiosity loop the reader
                has to close.
              </p>
            </div>

            {/* Post Preview Card */}
            <div className="rounded-[24px] border border-border bg-card p-6 shadow-sm">
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">
                Ready-to-publish draft
              </div>
              <p className="text-foreground text-sm leading-relaxed whitespace-pre-line">
                {`We hit $8K MRR in month 3.

Then we tried to scale too fast.

Hired 2 devs before we had repeatable sales.

3 months later: back to $2K.

Here's what I'd do differently —`}
              </p>
              <div className="mt-4 flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Type:</span>
                <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-foreground">Personal Story</span>
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
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Your weekly LinkedIn engine — from $0</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">Start free. Upgrade when you see it working.</p>
          </div>

          <div className="flex items-center justify-center gap-3 mb-10">
            <span className={`text-sm font-bold transition-colors ${!isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>Monthly</span>
            <button 
              onClick={() => setIsYearly(!isYearly)}
              className={`w-12 h-6 rounded-full p-1 flex items-center transition-colors ${isYearly ? 'bg-primary' : 'bg-foreground'}`}
            >
               <div className={`w-4 h-4 rounded-full bg-background shadow-sm transition-transform duration-300 ${isYearly ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
            <span className={`text-sm font-bold flex items-center gap-2 transition-colors ${isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
              Annual
              <span className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-500 py-0.5 px-2.5 rounded-full text-xs font-semibold whitespace-nowrap">
                Save 30%
              </span>
            </span>
          </div>

          <div className="grid gap-6 lg:grid-cols-3 items-stretch">
            {PLANS.map((plan) => (
              <motion.div
                whileHover={{ y: -4 }}
                key={plan.name}
                className={`flex flex-col rounded-[24px] p-8 transition-all duration-300 relative border ${
                  plan.featured
                    ? 'border-primary/50 bg-primary/5 shadow-lg'
                    : 'border-border bg-card shadow-sm'
                }`}
              >
                {plan.featured && (
                  <div className="absolute -top-3 left-0 right-0 mx-auto w-max bg-primary text-primary-foreground text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-wider z-10">
                    MOST POPULAR
                  </div>
                )}
                
                {!isYearly && loaded && (plan.name === 'BASIC' || plan.name === 'PRO') && (
                  <FoundingStrip plan={plan.name} loaded={loaded} available={available} claimed={claimed} total={total} />
                )}
                
                <div className="text-xl font-bold text-foreground mb-2 mt-2">{plan.name}</div>
                <div className="mb-2 flex items-baseline gap-1 flex-wrap">
                  <span className="text-5xl font-bold tracking-tight text-foreground">
                    {isYearly ? plan.price.yearly : plan.price.monthly}
                  </span>
                  <span className="text-muted-foreground text-sm font-medium">
                    {isYearly ? plan.frequency.yearly : plan.frequency.monthly}
                  </span>
                </div>
                {isYearly && plan.yearlySubtext && (
                  <div className="text-xs font-semibold text-emerald-500 mt-1">
                    {plan.name === 'BASIC' ? 'Save $60 — 4 months free' : 'Save $108 — 4 months free'}
                  </div>
                )}
                <div className="text-sm text-muted-foreground/80 mb-6 h-5 font-medium mt-1">
                  {isYearly && plan.yearlySubtext ? (
                    <span className="line-through">{plan.yearlySubtext}</span>
                  ) : null}
                </div>
                <p className="text-sm text-muted-foreground mb-8 min-h-[40px] leading-relaxed">{plan.description}</p>
                <div className="space-y-8 mb-8 flex-1">
                  {plan.featureCategories.map((category) => (
                    <div key={category.title} className="space-y-4">
                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                        {category.title}
                      </div>
                      <div className="space-y-3">
                        {category.items.map((item) => (
                          <div key={item.name} className={`flex items-start gap-3 text-sm font-medium tracking-tight ${item.active ? 'text-foreground' : 'text-muted-foreground/60'}`}>
                            {item.active ? (
                              <Check size={16} className="text-blue-500 mt-0.5 shrink-0 stroke-[2.5]" />
                            ) : (
                              <X size={16} className="mt-0.5 shrink-0 opacity-50 stroke-[2.5]" />
                            )}
                            <div className="flex items-center gap-2 flex-wrap">
                              <span>{item.name}</span>
                              {item.tooltip && (
                                <Tooltip>
                                  <TooltipTrigger className="cursor-help inline-flex justify-center items-center h-full pt-px border-none bg-transparent p-0 m-0">
                                    <Info size={14} className="text-muted-foreground/60 transition-colors hover:text-foreground" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="max-w-[200px] text-xs font-medium text-center">{item.tooltip}</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                              {item.badge && (
                                <span className="bg-foreground/10 text-foreground/70 text-[10px] py-0.5 px-2 rounded-md font-semibold tracking-wide flex-shrink-0">
                                  {item.badge}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <Link
                  href="/register"
                  className={`flex w-full items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
                    plan.featured 
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md' 
                      : 'bg-secondary text-foreground hover:bg-secondary/80 border border-border'
                  }`}
                >
                  {plan.buttonText}
                  <ArrowUpRight size={16} />
                </Link>
                
                {plan.guaranteeText && (
                  <div className="text-center mt-4">
                    <Tooltip>
                      <TooltipTrigger className="text-[13px] font-semibold text-emerald-600 dark:text-emerald-500 flex items-center justify-center gap-1.5 mx-auto bg-transparent border-none p-0 cursor-help">
                        {plan.guaranteeText}
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p className="text-xs max-w-[200px] text-center">Lock in today&apos;s price — we never raise rates for existing subscribers.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center space-y-2">
            <div className="text-sm text-muted-foreground/70 font-medium max-w-lg mx-auto leading-relaxed">
              Deep competitor analysis and Signature Style Engine are launching to Pro members first. You&apos;ll be notified the moment they go live.
            </div>
          </div>
        </motion.section>
        
        {/* Footer */}
        <footer className="mt-32 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between text-muted-foreground text-sm font-medium">
          <div>© {new Date().getFullYear()} Stratify OS. All rights reserved.</div>
          <div className="flex gap-8 mt-4 md:mt-0">
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
