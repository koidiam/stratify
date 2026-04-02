"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { getErrorMessage } from "@/lib/utils/parsers"

export function AuthForm({ type }: { type: 'login' | 'register' }) {
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)
  const supabase = createClient()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (type === 'register') {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${typeof window !== 'undefined' ? location.origin : ''}/api/auth/callback`
          }
        })

        if (signUpError) throw signUpError
        window.location.href = '/dashboard'
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        })

        if (signInError) throw signInError
        window.location.href = '/dashboard'
      }
    } catch (error: unknown) {
      setError(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    setError(null)
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${typeof window !== 'undefined' ? location.origin : ''}/api/auth/callback`
        }
      })

      if (error) throw error
    } catch (error: unknown) {
      setError(getErrorMessage(error))
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050505] px-4 py-8 selection:bg-white/10">
      {/* Minimal grid background for depth */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_20%,transparent_100%)]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vw] max-w-[600px] max-h-[600px] bg-emerald-500/[0.02] blur-[80px] rounded-full mix-blend-screen" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 flex w-full max-w-4xl overflow-hidden rounded-sm str-panel shadow-[0_4px_40px_-10px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.05)] md:flex-row border-white/10 bg-[#0A0A0A]"
      >
        {/* Left Side: Strategic Output Preview (High Trust) */}
        <div className="hidden border-r border-white/5 bg-gradient-to-b from-[#0A0A0A] to-[#040404] p-10 md:flex md:w-1/2 flex-col justify-center relative overflow-hidden">
          {/* Subtle noise / grid */}
          <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none bg-[url('/noise.png')]" />
          
          <div className="relative z-10 w-full max-w-sm mx-auto flex flex-col gap-6 scale-95 origin-left">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                 <h3 className="text-[10px] font-bold tracking-widest uppercase text-white/40">Example Generation</h3>
              </div>
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white/10" />
                <span className="w-1.5 h-1.5 rounded-full bg-white/10" />
                <span className="w-1.5 h-1.5 rounded-full bg-white/10" />
              </div>
            </div>

            {/* Simulated Output Card 1: The Insight */}
            <div className="rounded-sm border border-white/10 bg-[#0A0A0A] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.4)]">
              <div className="flex justify-between items-start mb-4">
                 <span className="text-[9px] uppercase tracking-widest font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-sm">Signal Extracted</span>
                 <span className="text-[10px] font-mono text-white/30">12:04 PM</span>
              </div>
              <p className="text-white/80 text-xs leading-relaxed font-mono opacity-90">
                Audience engagement drops 40% when posts use theoretical frameworks without immediate, actionable examples.
              </p>
            </div>

            {/* Simulated Output Card 2: The Hook (Connecting wire logic) */}
            <div className="relative">
              <div className="absolute -top-6 left-6 w-px h-6 bg-emerald-500/20" />
              <div className="rounded-sm border border-white/10 bg-[#0A0A0A] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.4)] ml-4 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500/80" />
                <div className="flex justify-between items-start mb-4">
                   <span className="text-[9px] uppercase tracking-widest font-bold text-white/60">Generated Hook</span>
                   <span className="text-[10px] font-mono text-white/30">12:05 PM</span>
                </div>
                <p className="text-white font-serif italic text-sm leading-snug">
                  &quot;Stop sharing theories. Here are 3 tactical frameworks you can deploy before lunch today.&quot;
                </p>
              </div>
            </div>

            {/* Simulated Output Card 3: System Note */}
            <div className="mt-4 rounded-sm border border-white/5 bg-white/[0.02] p-4 flex items-start gap-3">
              <Sparkles size={14} className="text-emerald-500 mt-0.5 shrink-0" />
              <p className="text-[10px] font-mono leading-relaxed text-white/40">
                High-converting drafts generated instantly based on real data extracted from your specific SaaS niche.
              </p>
            </div>
          </div>
        </div>

        <div className="w-full p-8 md:w-1/2 md:p-12 z-10 flex flex-col justify-center bg-[#070707]">
          <div className="mx-auto w-full max-w-sm">
            <div className="mb-10 text-center md:text-left">
              <h2 className="text-2xl font-semibold text-white tracking-tight mb-2">
                {type === 'login' ? 'System Login' : 'Initialize Workspace'}
              </h2>
              <p className="text-sm text-white/50 leading-relaxed font-light">
                {type === 'login'
                  ? 'Input operator credentials to resume.'
                  : 'Start your strategy engine pipeline.'}
              </p>
            </div>

            <div className="flex flex-col gap-5">
              <Button
                onClick={handleGoogleAuth}
                variant="outline"
                disabled={loading}
                className="h-11 w-full justify-center gap-3 rounded-sm border border-white/10 bg-white/5 text-white hover:bg-white/10 transition-all text-[11px] font-bold uppercase tracking-widest shadow-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z"/></svg>
                CONTINUE WITH GOOGLE
              </Button>
              
              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-white/5"></div>
                <span className="flex-shrink-0 mx-4 text-[9px] font-bold text-white/30 uppercase tracking-widest">or</span>
                <div className="flex-grow border-t border-white/5"></div>
              </div>

              <form onSubmit={handleAuth} className="flex flex-col gap-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[10px] font-bold text-white/50 block">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="h-11 rounded-sm border-white/10 bg-[#000000]/40 text-white placeholder:text-white/20 focus-visible:ring-1 focus-visible:ring-white/30 transition-all text-sm shadow-none"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[10px] font-bold text-white/50 block">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-11 rounded-sm border-white/10 bg-[#000000]/40 text-white placeholder:text-white/20 focus-visible:ring-1 focus-visible:ring-white/30 transition-all text-sm shadow-none"
                    required
                  />
                </div>

                {error ? (
                  <motion.p 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-sm border border-red-500/20 bg-red-500/5 p-3 text-[11px] text-red-500"
                  >
                    {error}
                  </motion.p>
                ) : null}

                <Button
                  type="submit"
                  disabled={loading}
                  className="mt-2 h-11 w-full rounded-sm bg-white text-black hover:bg-white/90 hover:-translate-y-[1px] transition-all text-[11px] font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                >
                  {loading ? 'Processing...' : (type === 'login' ? 'Sign In' : 'Create Account')}
                  {!loading && <ArrowRight className="ml-3 h-4 w-4" />}
                </Button>
              </form>

              <p className="mt-4 text-center text-[10px] font-bold text-white/40">
                {type === 'login' ? "Don't have an account? " : "Already have an account? "}
                <Link href={type === 'login' ? '/register' : '/login'} className="text-white hover:text-white/80 transition-colors underline decoration-white/20 underline-offset-4">
                  {type === 'login' ? 'Sign up' : 'Log in'}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
