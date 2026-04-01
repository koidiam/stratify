"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight, LockKeyhole, Sparkles } from "lucide-react"
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
  const router = useRouter()
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-8 selection:bg-primary/30">
      {/* Ultra-minimal ambient background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-primary/5 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 flex w-full max-w-4xl overflow-hidden rounded-[24px] border border-border bg-card shadow-2xl md:flex-row"
      >
        <div className="hidden border-r border-border bg-secondary/30 p-10 md:flex md:w-1/2 md:flex-col md:justify-between relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="relative z-10">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-medium tracking-wide text-primary">
              <Sparkles size={14} className="opacity-70" />
              Stratify OS
            </div>
            <h2 className="mb-4 text-3xl font-semibold leading-tight text-foreground">
              Manage your LinkedIn
              <br />
              growth with a <span className="text-primary font-bold">system.</span>
            </h2>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground mr-6">
              Sign in to your account, complete your onboarding flow, and let the strategy engine map your weekly LinkedIn plan.
            </p>
          </div>

          <div className="space-y-4 relative z-10">
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-foreground">
                <LockKeyhole size={16} className="text-primary/80" />
                Dynamic Workspace
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Your profiles and outputs are encrypted and secure. Your strategies are exclusively yours.
              </p>
            </div>
          </div>
        </div>

        <div className="w-full p-8 md:w-1/2 md:p-10 bg-card z-10 flex flex-col justify-center">
          <div className="mx-auto w-full max-w-sm">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground tracking-tight mb-2">
                {type === 'login' ? 'Sign in to Stratify' : 'Create an account'}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {type === 'login'
                  ? 'Welcome back. Enter your details to continue.'
                  : 'Start your strategy engine in just 2 seconds.'}
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <Button
                onClick={handleGoogleAuth}
                variant="secondary"
                disabled={loading}
                className="h-10 w-full justify-center gap-2 rounded-lg border border-border bg-secondary text-foreground hover:bg-secondary/80 transition-colors font-medium text-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z"/></svg>
                Continue with Google
              </Button>
              
              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-border"></div>
                <span className="flex-shrink-0 mx-4 text-xs font-medium text-muted-foreground/60 uppercase">or</span>
                <div className="flex-grow border-t border-border"></div>
              </div>

              <form onSubmit={handleAuth} className="flex flex-col gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm font-medium text-foreground">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="h-10 rounded-lg border-input bg-background text-foreground shadow-sm focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-all text-sm"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-sm font-medium text-foreground">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-10 rounded-lg border-input bg-background text-foreground shadow-sm focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-all text-sm"
                    required
                  />
                </div>

                {error ? (
                  <motion.p 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg border border-destructive/20 bg-destructive/10 p-2.5 text-xs text-destructive/90"
                  >
                    {error}
                  </motion.p>
                ) : null}

                <Button
                  type="submit"
                  disabled={loading}
                  className="mt-2 h-10 w-full rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all font-medium text-sm"
                >
                  {loading ? 'Please wait...' : (type === 'login' ? 'Sign In' : 'Sign Up')}
                  {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </form>

              <p className="mt-4 text-center text-sm text-muted-foreground">
                {type === 'login' ? "Don't have an account? " : "Already have an account? "}
                <Link href={type === 'login' ? '/register' : '/login'} className="text-primary hover:text-primary/80 transition-colors">
                  {type === 'login' ? 'Sign up' : 'Sign in'}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
