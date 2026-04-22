'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Database, Activity, Network, LineChart, FileText, ArrowRight, Zap, Target, ChevronDown } from 'lucide-react';
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
    description: 'Surface layer access. Establish your baseline memory chain without strategic depth.',
    capacity: '1 weekly execution cycle',
    features: [
      'Cached signal extraction',
      'Format and hook baselines',
      'Memory retention (1 cycle)'
    ],
    buttonText: 'Execute baseline',
    featured: false,
  },
  {
    name: 'BASIC',
    price: { monthly: '$15', yearly: '$120' },
    yearlySubtext: '$180/yr',
    frequency: { monthly: '/mo', yearly: '/yr' },
    description: 'Operating layer active. Unlock continuous learning and directional awareness.',
    capacity: '3 execution cycles / week',
    unlocksText: 'Unlocks full memory chain to increase system depth over time.',
    features: [
      'Full memory continuity',
      'Continuous learning state',
      'Refined structure extraction'
    ],
    buttonText: 'Activate operating layer',
    featured: false,
  },
  {
    name: 'PRO',
    price: { monthly: '$29', yearly: '$240' },
    yearlySubtext: '$348/yr',
    frequency: { monthly: '/mo', yearly: '/yr' },
    description: 'Intelligence layer active. Tap direct network signals before they become cached patterns.',
    capacity: '50 execution cycles / week',
    unlocksText: 'Unlocks live network intelligence and real-time market drift detection.',
    features: [
      'Live network signal ingestion',
      'Reference post intelligence',
      'Competitor structure mapping'
    ],
    buttonText: 'Activate intelligence layer',
    featured: true,
  },
];

export function LandingPage() {
  const [isYearly, setIsYearly] = useState(false);
  const { status, claimed, total, isFallback } = useFoundingStatus();
  const [loopStep, setLoopStep] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const runLoop = () => {
      setLoopStep(0);
      timeoutId = setTimeout(() => {
        setLoopStep(1);
        timeoutId = setTimeout(() => {
          setLoopStep(2);
          timeoutId = setTimeout(() => {
            setLoopStep(3);
            timeoutId = setTimeout(() => {
              setLoopStep(4);
              timeoutId = setTimeout(() => {
                runLoop();
              }, 3000);
            }, 1500);
          }, 1500);
        }, 1500);
      }, 1500);
    };

    runLoop();
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <main className="min-h-screen bg-[#090909] text-white font-sans overflow-x-hidden selection:bg-white/10">
      
      {/* 1. Header / Navigation */}
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-8">
        <div className="text-[13px] font-medium text-white">Stratify</div>
        <nav className="flex items-center gap-5">
          <Link href="/login" className="text-[12px] font-medium text-white/50 transition-colors hover:text-white">Login</Link>
          <Link href="/register" className="bg-transparent border border-white/80 text-white font-medium px-4 py-1.5 rounded-md hover:bg-white hover:text-black transition-all duration-200 text-[12px]">Start system</Link>
        </nav>
      </header>

      {/* 2. HERO */}
      <section className="mx-auto mt-6 mb-32 flex w-full max-w-6xl flex-col lg:flex-row items-center px-6 gap-12 lg:gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center lg:items-start text-center lg:text-left w-full lg:w-1/2"
        >
          <h1 className="max-w-2xl text-[2.5rem] font-medium leading-[1.15] tracking-tight text-white md:text-5xl">
            A system for your weekly LinkedIn strategy
          </h1>
          <p className="mt-6 text-[15px] leading-relaxed text-white/50 max-w-md">
            Signal extraction, pattern recognition, and adaptive learning to run your personal brand like an operating system.
          </p>
          <div className="mt-10 flex gap-4">
            <Link href="/register" className="bg-transparent border border-white/80 text-white font-medium px-6 py-3 rounded-md hover:bg-white hover:text-black transition-all duration-200">
              Start system
            </Link>
          </div>
        </motion.div>

        {/* Animated System Loop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="w-full lg:w-1/2 relative flex items-center justify-center p-4"
        >
          <div className="w-full max-w-[480px] bg-[#0a0a0a] border border-white/10 rounded-xl p-6 md:p-8 font-mono text-[13px] relative flex flex-col justify-center h-[280px]">
            <div className="flex flex-col gap-5">
              <AnimatePresence>
                {loopStep >= 1 && (
                  <motion.div key="loop-step-1" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="text-white/70">
                    <div className="flex items-center gap-2">
                      <span>● Ingesting signals from network...</span>
                    </div>
                    {loopStep === 1 && (
                      <div className="h-[2px] w-full max-w-[200px] bg-white/10 rounded-full mt-2 overflow-hidden">
                        <motion.div 
                          className="h-full bg-white/40" 
                          initial={{ width: "0%" }} 
                          animate={{ width: "100%" }} 
                          transition={{ duration: 1.5, ease: "linear" }}
                        />
                      </div>
                    )}
                  </motion.div>
                )}
                {loopStep >= 2 && (
                  <motion.div key="loop-step-2" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="text-white/70">
                    ● Pattern isolated: <span className="text-accent">+34% contrarian_advice</span>
                  </motion.div>
                )}
                {loopStep >= 3 && (
                  <motion.div key="loop-step-3" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="text-white/70">
                    ● Strategy formed: <span className="text-white">Lead with assumption challenge</span>
                  </motion.div>
                )}
                {loopStep >= 4 && (
                  <motion.div key="loop-step-4" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="text-accent flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 rounded-full bg-accent shadow-[0_0_8px_var(--color-accent)] animate-pulse" />
                    <span>✓ FINAL_DRAFT.MD — READY</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </section>

      {/* WHO THIS IS FOR */}
      <section className="mx-auto mb-32 w-full max-w-5xl px-6">
        <div className="mb-12 text-center sm:text-left">
          <h2 className="text-2xl font-medium text-white mb-3">Built for operators, not audiences</h2>
          <p className="text-[14px] text-white/50 max-w-2xl leading-relaxed">
            If you post on LinkedIn and wonder why some weeks work and others don't — this is the system.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="bg-[#111111] border border-white/8 rounded-lg p-5">
            <h3 className="text-sm font-medium text-white">The Founder</h3>
            <p className="text-xs text-white/50 mt-2 leading-relaxed">
              Building in public, no time for content theory. Needs signal, not inspiration.
            </p>
          </div>
          <div className="bg-[#111111] border border-white/8 rounded-lg p-5">
            <h3 className="text-sm font-medium text-white">The Consultant</h3>
            <p className="text-xs text-white/50 mt-2 leading-relaxed">
              Posts regularly but can't identify what drives inbound. Needs pattern recognition.
            </p>
          </div>
          <div className="bg-[#111111] border border-white/8 rounded-lg p-5">
            <h3 className="text-sm font-medium text-white">The Operator</h3>
            <p className="text-xs text-white/50 mt-2 leading-relaxed">
              Knows their niche, wants their content to compound over time. Needs memory.
            </p>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS */}
      <section className="mx-auto mb-32 w-full max-w-5xl px-6 relative">
        <div className="absolute top-0 bottom-0 left-6 sm:left-[50px] w-px bg-gradient-to-b from-transparent via-white/10 to-transparent hidden sm:block" />
        
        <div className="mb-16 text-center sm:text-left sm:ml-24">
          <div className="mb-2 text-[13px] font-medium text-white/50">System Architecture</div>
          <h2 className="text-2xl font-medium text-white">How the engine operates</h2>
        </div>

        <div className="flex flex-col gap-12 sm:gap-16 sm:ml-24">
          {/* Step 1 */}
          <div className="flex flex-col sm:flex-row gap-8 items-start relative group">
            <div className="hidden sm:flex absolute -left-[76px] top-6 w-3 h-3 rounded-full bg-[#020202] border-2 border-white/20 group-hover:border-white transition-colors" />
            <div className="w-full sm:w-1/2 rounded-sm border border-white/5 bg-white/[0.02] p-5 font-mono text-[11px]">
              <div className="text-white/30 mb-2">// INGESTING SIGNALS</div>
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-white/60"><span className="text-emerald-400">GET</span> /linkedin/posts?metrics=true</div>
                <div className="text-white/40 pl-4">{`{ "views": 12400, "hooks": "question_based" }`}</div>
                <div className="text-white/40 pl-4">{`{ "views": 800, "hooks": "story_led" }`}</div>
              </div>
            </div>
            <div className="w-full sm:w-1/2 pt-2">
              <h3 className="text-[15px] font-medium text-white mb-2">1. Signal Extraction</h3>
              <p className="text-[13px] text-white/50 leading-relaxed">The system ingests raw market performance data, separating signal (what actually works) from noise (vanity metrics).</p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col sm:flex-row gap-8 items-start relative group">
            <div className="hidden sm:flex absolute -left-[76px] top-6 w-3 h-3 rounded-full bg-[#020202] border-2 border-white/20 group-hover:border-emerald-500 transition-colors" />
            <div className="w-full sm:w-1/2 rounded-sm border border-emerald-500/10 bg-emerald-500/[0.02] p-5 font-mono text-[11px]">
              <div className="text-emerald-500/50 mb-2">// DETECTING PATTERNS</div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500/50 animate-pulse" />
                <span className="text-emerald-100/80">Anomaly isolated</span>
              </div>
              <div className="text-emerald-500/40 pl-4">"contrarian_advice" format shifting +42%</div>
            </div>
            <div className="w-full sm:w-1/2 pt-2">
              <h3 className="text-[15px] font-medium text-white mb-2">2. Pattern Recognition</h3>
              <p className="text-[13px] text-white/50 leading-relaxed">Raw data is synthesized into structural patterns. The memory engine identifies format shifts and structure fatigue across your network.</p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col sm:flex-row gap-8 items-start relative group">
            <div className="hidden sm:flex absolute -left-[76px] top-6 w-3 h-3 rounded-full bg-[#020202] border-2 border-white/20 group-hover:border-white transition-colors" />
            <div className="w-full sm:w-1/2 rounded-sm border border-white/5 bg-white/[0.02] p-5 font-mono text-[11px]">
              <div className="text-white/30 mb-2">// FORMING STRATEGY</div>
              <div className="border-l border-white/20 pl-3 text-white/70">
                <div className="mb-1 text-white/40">DIRECTION:</div>
                Abandon listicles. Lead with strong assertion on hiring processes.
              </div>
            </div>
            <div className="w-full sm:w-1/2 pt-2">
              <h3 className="text-[15px] font-medium text-white mb-2">3. Strategy Formation</h3>
              <p className="text-[13px] text-white/50 leading-relaxed">Patterns are converted into a direct strategy path. Every generated piece of content has a calculated reason to exist.</p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex flex-col sm:flex-row gap-8 items-start relative group">
            <div className="hidden sm:flex absolute -left-[76px] top-6 w-3 h-3 rounded-full bg-[#020202] border-2 border-white/20 group-hover:border-white transition-colors" />
            <div className="w-full sm:w-1/2 rounded-sm border border-white/10 bg-[#050505] p-5 text-[12px] text-white/80 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <div className="opacity-50 font-mono tracking-wider text-[10px] mb-2">DRAFT GENERATION COMPLETE</div>
              <div className="mt-3 leading-relaxed">
                Most founders over-index on raw skill when hiring.<br/><br/>But the actual bottleneck in early stage teams is velocity of decision making.
              </div>
            </div>
            <div className="w-full sm:w-1/2 pt-2">
              <h3 className="text-[15px] font-medium text-white mb-2">4. Draft Execution</h3>
              <p className="text-[13px] text-white/50 leading-relaxed">The final output isn't random AI generation. It's a precise assembly of grounded strategy, customized to your distinct tone.</p>
            </div>
          </div>
        </div>
      </section>


      {/* 4. WEEK EVOLUTION */}
      <section className="mx-auto mb-32 w-full max-w-5xl px-6">
        <div className="mb-12 text-center">
          <div className="mb-2 text-[13px] font-medium text-white/50">System Evolution</div>
          <h2 className="text-2xl font-medium text-white">Behavior adaptation over time</h2>
        </div>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 relative">
          <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#020202] border border-white/10 items-center justify-center z-10">
            <ArrowRight className="w-3.5 h-3.5 text-white/30" />
          </div>

          <div className="rounded-sm border border-white/5 bg-white/[0.02] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-white/5 bg-white/[0.01] flex items-center justify-between">
              <div className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/40">Week 1</div>
              <div className="flex gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                <span className="w-1.5 h-1.5 rounded-full bg-white/10" />
                <span className="w-1.5 h-1.5 rounded-full bg-white/10" />
              </div>
            </div>
            <div className="p-8 flex-grow flex flex-col gap-6">
              <div className="flex items-center justify-between text-[11px] font-mono text-white/30">
                <span>Memory state:</span>
                <span className="uppercase text-white/20">Empty</span>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 bg-white/[0.02] p-3 rounded-sm border border-white/5">
                  <div className="w-2 h-2 rounded-full bg-white/20" />
                  <div className="text-[12px] text-white/50">Extracting generic format baselines</div>
                </div>
                <div className="flex items-center gap-3 bg-white/[0.02] p-3 rounded-sm border border-white/5">
                  <div className="w-2 h-2 rounded-full bg-white/20" />
                  <div className="text-[12px] text-white/50">High volume generic market noise</div>
                </div>
                <div className="flex items-center gap-3 bg-white/[0.02] p-3 rounded-sm border border-white/5">
                  <div className="w-2 h-2 rounded-full bg-white/20" />
                  <div className="text-[12px] text-white/50">Strict industry standard templates</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="rounded-sm border border-emerald-500/20 bg-emerald-500/[0.02] overflow-hidden flex flex-col relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[50px] rounded-full pointer-events-none" />
            <div className="p-4 border-b border-emerald-500/10 bg-emerald-500/[0.02] flex items-center justify-between">
              <div className="text-[11px] font-medium uppercase tracking-[0.2em] text-emerald-500/70">Week 4</div>
              <div className="flex gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 animate-pulse" />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/30" />
              </div>
            </div>
            <div className="p-8 flex-grow flex flex-col gap-6 relative z-10">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-white/40">Memory state:</span>
                <span className="uppercase text-emerald-400">Context Active</span>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 bg-emerald-500/5 p-3 rounded-sm border border-emerald-500/10">
                  <div className="relative flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <div className="absolute w-4 h-4 rounded-full border border-emerald-500/30 animate-pulse" />
                  </div>
                  <div className="text-[12px] text-emerald-100/80">Signals filtered via past success loops</div>
                </div>
                <div className="flex items-center gap-3 bg-emerald-500/5 p-3 rounded-sm border border-emerald-500/10">
                  <LineChart className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <div className="text-[12px] text-emerald-100/80">Pattern confidence: <span className="text-emerald-400">84% ↑</span></div>
                </div>
                <div className="flex items-center gap-3 bg-emerald-500/5 p-3 rounded-sm border border-emerald-500/10">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <div className="text-[12px] text-emerald-100/80">Noise explicitly dropped by system</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SYSTEM OUTPUT PROOF BLOCK */}
      <section className="mx-auto mb-32 w-full max-w-4xl px-6">
        <div className="mb-12 text-center flex flex-col items-center">
          <div className="mb-2 text-[13px] font-medium text-white/50">Traceability</div>
          <h2 className="text-2xl font-medium text-white">Full cycle inspection</h2>
        </div>

        <div className="rounded-sm border border-white/10 bg-[#050505] overflow-hidden flex flex-col">
          {/* Top structural bar */}
          <div className="h-10 bg-white/[0.02] border-b border-white/5 flex items-center px-4 gap-4 text-[10px] font-mono tracking-widest text-white/30 uppercase">
            <span>Cycle ID: #8492</span>
            <span className="w-px h-3 bg-white/10" />
            <span className="text-emerald-500/70 flex items-center gap-1.5"><Zap className="w-3 h-3" /> Processed</span>
          </div>

          <div className="p-8 flex flex-col gap-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-6 border-b border-white/5">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-mono text-white/30 uppercase tracking-wider">Posts Parsed</span>
                <span className="text-xl text-white font-medium">1,248</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-mono text-white/30 uppercase tracking-wider">Anomalies</span>
                <span className="text-xl text-emerald-400 font-medium">3</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-mono text-white/30 uppercase tracking-wider">Format</span>
                <span className="text-[13px] mt-1 text-white/80 pr-2">Contrarian Framework</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-mono text-white/30 uppercase tracking-wider">Confidence</span>
                <span className="text-xl text-emerald-500 font-medium">92%</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Selected Strategy</div>
              <div className="text-[14px] text-white/90 leading-relaxed max-w-2xl">
                The network is over-saturated with "how-to" guides on hiring. 
                <br/>
                <span className="text-emerald-400 mt-1 inline-block">→ Shifted approach: Challenge the premise that hiring is the bottleneck. Focus on velocity instead.</span>
              </div>
            </div>

            <div className="mt-4 pt-6 border-t border-white/5 flex flex-col gap-3">
              <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest flex items-center gap-2">
                <FileText className="w-3 h-3" /> Draft Output Snippet
              </div>
              <div className="bg-[#020202] p-5 rounded-sm border border-white/5 text-[13px] text-white/60 leading-relaxed font-mono">
                "90% of early-stage startups think they have a hiring problem.
                <br/>They don't. They have a decision-velocity problem.
                <br/><br/>If you take 4 weeks to decide on an engineer, you're not 'maintaining a high bar'." 
                <span className="w-1.5 h-3 bg-emerald-500/50 inline-block align-middle ml-1 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* 6. BEFORE / AFTER */}
      <section className="mx-auto mb-20 w-full max-w-3xl px-6">
        <div className="bg-[#0d0d0d] border border-white/8 rounded-xl p-8">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-8 items-stretch relative">
            <div className="flex flex-col gap-6">
              <h3 className="text-[13px] font-medium text-white/50 uppercase tracking-widest text-center md:text-left">Without a system</h3>
              <ul className="space-y-4">
                <li className="text-sm text-white/45">Posting and hoping for traction</li>
                <li className="text-sm text-white/45">Repeating formats that stopped working</li>
                <li className="text-sm text-white/45">No memory of what actually performed</li>
                <li className="text-sm text-white/45">Weekly guessing, no direction</li>
              </ul>
            </div>
            
            <div className="hidden md:flex flex-col items-center justify-center relative">
              <div className="h-full w-px bg-white/5 absolute top-0 bottom-0" />
              <div className="w-8 h-8 rounded-full bg-[#111111] border border-white/10 flex items-center justify-center z-10 text-white/40">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <h3 className="text-[13px] font-medium text-white uppercase tracking-widest text-center md:text-left">With Stratify</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3"><Check className="w-4 h-4 text-accent shrink-0 mt-0.5" /><span className="text-sm text-white/80">Signal-backed direction before you write</span></li>
                <li className="flex items-start gap-3"><Check className="w-4 h-4 text-accent shrink-0 mt-0.5" /><span className="text-sm text-white/80">System detects format fatigue automatically</span></li>
                <li className="flex items-start gap-3"><Check className="w-4 h-4 text-accent shrink-0 mt-0.5" /><span className="text-sm text-white/80">Memory chain that compounds each cycle</span></li>
                <li className="flex items-start gap-3"><Check className="w-4 h-4 text-accent shrink-0 mt-0.5" /><span className="text-sm text-white/80">Weekly operating cadence with clear rationale</span></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 7. STATS BAR */}
      <section className="w-full mb-32 bg-[#111111] border-y border-white/8 py-8 px-6">
        <div className="mx-auto max-w-5xl flex flex-col md:flex-row items-center justify-between gap-8 md:gap-0 divide-y md:divide-y-0 md:divide-x divide-white/10 text-center">
          <div className="flex flex-col gap-1 w-full md:w-1/4 py-4 md:py-0">
            <span className="text-2xl font-semibold text-white">3,200+</span>
            <span className="text-[10px] text-white/40 tracking-[0.2em] uppercase mt-1">Signals processed weekly</span>
          </div>
          <div className="flex flex-col gap-1 w-full md:w-1/4 py-4 md:py-0">
            <span className="text-2xl font-semibold text-white">84%</span>
            <span className="text-[10px] text-white/40 tracking-[0.2em] uppercase mt-1">Avg pattern confidence by week 4</span>
          </div>
          <div className="flex flex-col gap-1 w-full md:w-1/4 py-4 md:py-0">
            <span className="text-2xl font-semibold text-white">&lt; 15 min</span>
            <span className="text-[10px] text-white/40 tracking-[0.2em] uppercase mt-1">Weekly operator time</span>
          </div>
          <div className="flex flex-col gap-1 w-full md:w-1/4 py-4 md:py-0">
            <span className="text-2xl font-semibold text-white">Week 3</span>
            <span className="text-[10px] text-white/40 tracking-[0.2em] uppercase mt-1">When strategy shift becomes visible</span>
          </div>
        </div>
      </section>

      {/* 8. PRICING */}
      <section className="mx-auto mb-32 w-full max-w-5xl px-6" id="pricing">
        <div className="mb-12 flex flex-col items-center text-center">
          <div className="mb-2 text-[13px] font-medium text-white/50">System access</div>
          <h2 className="mb-6 text-2xl font-medium text-white">Deeper system layers available</h2>
          <p className="max-w-md text-[13px] leading-relaxed text-white/40">
            After a few cycles, the system stops exploring and starts adapting.
          </p>
        </div>
        
        <div className="mb-10 flex items-center justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#020202] px-2 py-1.5">
            <span className={`rounded-full px-3 py-1 text-[12px] font-medium transition-all ${!isYearly ? 'bg-white text-black' : 'text-white/50'}`}>
              Monthly
            </span>
            <button 
              onClick={() => setIsYearly(!isYearly)}
              className={`flex h-6 w-10 items-center rounded-full border p-0.5 transition-colors ${isYearly ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-white/10 bg-white/5'}`}
              aria-label="Toggle billing period"
            >
              <div className={`h-4 w-4 rounded-full bg-white transition-transform duration-300 ${isYearly ? 'translate-x-4' : 'translate-x-[2px]'}`} />
            </button>
            <span className={`rounded-full px-3 py-1 text-[12px] font-medium transition-all ${isYearly ? 'bg-white text-black' : 'text-white/50'}`}>
              Annual
            </span>
          </div>
        </div>

        <div className="relative mx-auto grid max-w-sm grid-cols-1 overflow-hidden rounded-sm border border-border-subtle bg-background-panel shadow-2xl lg:max-w-5xl lg:grid-cols-3">
          {PLANS.map((plan, index) => {
            const isFoundingAvailable = status === 'available' && (plan.name === 'BASIC' || plan.name === 'PRO');
            return (
            <div
              key={plan.name}
              className={`relative flex flex-col p-8 transition-colors duration-300 overflow-hidden
                ${index !== 0 ? 'border-t border-white/10 lg:border-l lg:border-t-0' : ''}
                ${plan.featured ? 'bg-[#161616] lg:border-l border-accent/40 shadow-[inset_0_0_80px_rgba(0,200,150,0.03)]' : 'hover:bg-white/[0.02]'}
              `}
            >
              {plan.featured && <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent/0 via-accent/50 to-accent/0" />}

              {(plan.name === 'BASIC' || plan.name === 'PRO') && (
                <div className="-mx-8 -mt-8 mb-6 relative z-10">
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
              
              <div className="mb-4 flex items-center justify-between text-[11px] font-medium uppercase tracking-[0.2em] text-white/50 relative z-10">
                {plan.name}
                {plan.featured && <span className="text-[10px] text-accent">RECOMMENDED</span>}
              </div>
              
              <div className="mb-4 flex flex-wrap items-baseline gap-1.5 relative z-10">
                <span className={`${plan.featured ? 'text-4xl font-medium tracking-tight text-white md:text-5xl drop-shadow-md' : 'text-4xl font-medium tracking-tight text-white md:text-5xl'} ${isFoundingAvailable ? 'line-through text-white/30 text-2xl md:text-3xl' : ''}`}>
                  {isYearly ? plan.price.yearly : plan.price.monthly}
                </span>
                <span className={`text-xs font-medium uppercase ${isFoundingAvailable ? 'text-white/30 line-through' : 'text-white/50'}`}>
                  {isYearly ? plan.frequency.yearly : plan.frequency.monthly}
                </span>
              </div>
              
              {isYearly && plan.yearlySubtext && (
                <div className="mb-4 text-[12px] text-white/40 relative z-10">
                  Compare at {plan.yearlySubtext}
                </div>
              )}
              
              <p className="mb-6 flex-grow text-[13px] leading-relaxed text-white/60 relative z-10">{plan.description}</p>
              
              {/* Memory Indicators */}
              <div className="mb-8 relative z-10">
                {plan.name === 'FREE' && (
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[9px] font-mono uppercase tracking-widest text-white/40">
                     Memory: None
                  </div>
                )}
                {plan.name === 'BASIC' && (
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-accent/10 bg-accent/5 px-2.5 py-1 text-[9px] font-mono uppercase tracking-widest text-accent/80">
                     Memory: Cached
                  </div>
                )}
                {plan.name === 'PRO' && (
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 text-[9px] font-mono uppercase tracking-widest text-accent shadow-[0_0_10px_rgba(0,200,150,0.1)]">
                     <Network className="w-3 h-3" /> Memory: Networked
                  </div>
                )}
              </div>

              <div className="mt-auto border-t border-white/5 pt-6 pb-8 relative z-10">
                <div className="mb-4 text-[13px] font-medium text-white">
                  {plan.capacity}
                </div>

                {plan.unlocksText && (
                  <div className="mb-4 text-[12px] text-accent/90">
                    + {plan.unlocksText}
                  </div>
                )}
                
                <div className="space-y-3.5 flex-grow">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3 text-[12px] text-white/70">
                      <Check size={14} className="mt-[2px] shrink-0 text-white/30" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Link
                href="/register"
                className={`flex h-10 w-full items-center justify-center gap-2 rounded-sm text-[13px] font-medium transition-colors duration-200 relative z-10 ${
                  plan.featured 
                    ? 'bg-white text-black hover:bg-white/90 shadow-md shadow-white/10' 
                    : 'bg-white/5 text-white hover:bg-white/10'
                }`}
              >
                {plan.buttonText}
              </Link>
            </div>
            );
          })}
        </div>
      </section>
      
      {/* 8.2 FAQ */}
      <section className="mx-auto mb-32 w-full max-w-2xl px-6">
        <h2 className="text-xl font-medium text-white mb-8 text-center">Common questions</h2>
        <div className="flex flex-col divide-y divide-white/5 border-t border-b border-white/5">
          {[
            { q: "Is this an AI writing tool?", a: "No. Stratify doesn't write for you — it tells you what to write about and why. The strategy direction, format rationale, and signal basis are all system outputs. You write the actual post." },
            { q: "Does it connect to my LinkedIn account?", a: "Stratify analyzes market-level LinkedIn signal patterns — not your personal account. No OAuth, no data access. You bring your niche context; the system brings market intelligence." },
            { q: "How much time does it take each week?", a: "The weekly cycle runs in 10-15 seconds. Review takes 5-10 minutes. Total operator time: under 15 minutes per week." },
            { q: "When will I start seeing results?", a: "Pattern confidence increases each cycle. Most operators notice a measurable shift in their content direction by week 3-4, when the memory chain has enough data to form reliable signals." },
            { q: "What if I miss a week?", a: "The system retains memory across gaps. Missing a week doesn't reset your chain — it just means one less data point for pattern recognition." }
          ].map((faq, i) => (
            <div key={i} className="py-4">
              <button 
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between text-left group"
              >
                <span className="text-sm font-medium text-white group-hover:text-white/80 transition-colors">{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-white/40 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {openFaq === i && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }} 
                    animate={{ height: 'auto', opacity: 1 }} 
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="text-sm text-white/55 leading-relaxed pt-3 pb-1">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* 8.5 FINAL CTA */}
      <section className="mx-auto mb-32 w-full max-w-3xl px-6">
        <div className="flex flex-col items-center justify-center rounded-sm border border-accent/20 bg-[#111111] p-12 text-center">
          <h2 className="mb-4 text-2xl font-medium text-white">Run your first weekly strategy</h2>
          <p className="mb-8 text-[14px] text-white/60">Each cycle sharpens your strategy.</p>
          <Link href="/register" className="bg-transparent border border-white/70 text-white font-medium px-6 py-3 rounded-md hover:bg-white hover:text-black transition-all duration-200">
            Start your first cycle
          </Link>
        </div>
      </section>

      {/* 9. FOOTER */}
      <footer className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-4 border-t border-white/5 px-6 py-10 md:flex-row md:py-12">
        <div className="text-[12px] text-white/40">© 2026 Stratify. All rights reserved.</div>
        <div className="flex gap-6">
          <Link href="/login" className="text-[12px] text-white/40 hover:text-white transition-colors">Login</Link>
          <Link href="/terms" className="text-[12px] text-white/40 hover:text-white transition-colors">Terms</Link>
          <Link href="/privacy" className="text-[12px] text-white/40 hover:text-white transition-colors">Privacy</Link>
        </div>
      </footer>
      
    </main>
  );
}
