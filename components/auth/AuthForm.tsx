"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight, LockKeyhole, Sparkles } from "lucide-react"

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
        router.push('/dashboard')
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        })

        if (signInError) throw signInError
        router.push('/dashboard')
      }
    } catch (error: unknown) {
      setError(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    setError(null)

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
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#07111f] px-4 py-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(10,102,194,0.2),_transparent_35%),linear-gradient(180deg,_#07111f_0%,_#0a0f18_55%,_#05070b_100%)]" />
      <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.14)_1px,transparent_1px)] [background-size:56px_56px]" />

      <div className="relative flex w-full max-w-5xl overflow-hidden rounded-[32px] border border-white/10 bg-white/5 shadow-[0_40px_120px_rgba(0,0,0,0.45)] backdrop-blur-2xl md:flex-row">
        <div className="hidden border-r border-white/10 bg-[#0a1524]/75 p-12 md:flex md:w-1/2 md:flex-col md:justify-between">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#0A66C2]/35 bg-[#0A66C2]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#7abfff]">
              <Sparkles size={14} />
              Stratify access
            </div>
            <h2 className="mb-4 text-4xl font-semibold leading-tight text-white">
              LinkedIn buyumesini
              <br />
              sezgiyle degil
              <br />
              sistemle yonet.
            </h2>
            <p className="max-w-md text-sm leading-7 text-white/60">
              Hesabina gir, onboarding akisini tamamla ve haftalik strateji motorunu
              canli LinkedIn baglami ile besle. Bu alan urun operasyonunun kontrol paneli.
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-white">
                <LockKeyhole size={16} className="text-[#7abfff]" />
                Secure workspace
              </div>
              <p className="text-sm leading-6 text-white/55">
                Supabase auth, onboarding state, weekly generation and feedback loop tek omurgada.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <div className="text-xs uppercase tracking-[0.22em] text-white/35">Flow</div>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-white/70">
                <span className="rounded-full border border-white/10 px-3 py-1">Login</span>
                <span className="text-white/25">→</span>
                <span className="rounded-full border border-white/10 px-3 py-1">Onboarding</span>
                <span className="text-white/25">→</span>
                <span className="rounded-full border border-white/10 px-3 py-1">Generate</span>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full p-8 md:w-1/2 md:p-12">
          <div className="mx-auto flex w-full max-w-md flex-col justify-center">
            <div className="mb-8">
              <div className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-white/40">
                {type === 'login' ? 'Welcome back' : 'Create your workspace'}
              </div>
              <h2 className="text-3xl font-semibold text-white">
                {type === 'login' ? 'Giris yap' : 'Hesabini olustur'}
              </h2>
              <p className="mt-3 text-sm leading-6 text-white/55">
                {type === 'login'
                  ? 'Dashboarduna don ve bu haftanin stratejik uretim akisini baslat.'
                  : 'Dakikalar icinde onboardingi tamamla ve ilk strateji raporunu olustur.'}
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <Button
                onClick={handleGoogleAuth}
                variant="secondary"
                className="h-12 w-full justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 text-white hover:bg-white/8"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z"/></svg>
                Google ile devam et
              </Button>
              
              <div className="my-1 flex items-center gap-3 text-xs uppercase tracking-[0.16em] text-white/28">
                <span className="h-px flex-1 bg-white/10" />
                veya email ile
                <span className="h-px flex-1 bg-white/10" />
              </div>

              <form onSubmit={handleAuth} className="flex flex-col gap-4">
                <div>
                  <Label htmlFor="email" className="text-gray-300">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="isim@sirket.com"
                    className="mt-2 h-12 rounded-2xl border-white/10 bg-[#08111d] text-white focus-visible:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="text-gray-300">Sifre</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="mt-2 h-12 rounded-2xl border-white/10 bg-[#08111d] text-white focus-visible:ring-blue-500"
                    required
                  />
                </div>

                {error ? (
                  <p className="rounded-2xl border border-red-500/15 bg-red-500/10 p-3 text-xs text-red-300">
                    {error}
                  </p>
                ) : null}

                <Button
                  type="submit"
                  disabled={loading}
                  className="mt-2 h-12 w-full rounded-2xl bg-[#0A66C2] text-white hover:bg-[#1176db]"
                >
                  {loading ? 'Bekleniyor...' : (type === 'login' ? 'Giris Yap' : 'Kayit Ol')}
                  {!loading ? <ArrowRight className="ml-2 h-4 w-4" /> : null}
                </Button>
              </form>

              <p className="mt-4 text-center text-sm text-white/45">
                {type === 'login' ? 'Hesabin yok mu? ' : 'Zaten hesabin var mi? '}
                <Link href={type === 'login' ? '/register' : '/login'} className="text-[#7abfff] hover:text-white">
                  {type === 'login' ? 'Kayit Ol' : 'Giris Yap'}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
