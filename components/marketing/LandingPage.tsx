'use client';

import Link from 'next/link';
import { ArrowRight, ChartNoAxesColumn, Compass, Radar, Sparkles } from 'lucide-react';

const FEATURE_PILLARS = [
  {
    title: 'Canli LinkedIn sinyalleri',
    description: 'Apify destekli public veri katmani ile nişindeki son post desenlerini yakalar.',
    icon: Radar,
  },
  {
    title: 'Haftalik strateji akisi',
    description: 'Onboarding, insight, hook ve taslak akisini tek panelde toplar.',
    icon: Compass,
  },
  {
    title: 'Olculebilir cikti',
    description: 'Uretim hakki, icerik gecmisi ve geri bildirim akisi ayni omurgada calisir.',
    icon: ChartNoAxesColumn,
  },
];

const PLANS = [
  {
    name: 'Free',
    price: '0$',
    description: 'Temel strateji akisini kur ve ilk haftalik sistemini calistir.',
    items: ['Haftada 1 uretim', 'Tek oturum strateji akisi', 'LinkedIn icgoru ozetleri'],
  },
  {
    name: 'Basic',
    price: '12$',
    description: 'Haftalik ritim kurmak ve gecmisi acmak isteyenler icin.',
    items: ['Haftada 3 uretim', 'Gecmis erisimi', 'Daha genis strateji hacmi'],
    featured: true,
  },
  {
    name: 'Pro',
    price: '24$',
    description: 'Daha agresif buyume, style referansi ve daha derin operasyonlar icin.',
    items: ['Genis kullanim limiti', 'Reference style baglami', 'Phase 2 veri katmanina hazir'],
  },
];

function PrimaryLink({
  href,
  children,
  secondary = false,
}: {
  href: string;
  children: React.ReactNode;
  secondary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all ${
        secondary
          ? 'border border-white/12 bg-white/5 text-white hover:border-white/20 hover:bg-white/8'
          : 'bg-[#0A66C2] text-white shadow-[0_18px_50px_rgba(10,102,194,0.35)] hover:-translate-y-0.5 hover:bg-[#1176db]'
      }`}
    >
      {children}
    </Link>
  );
}

export function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#07111f] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(10,102,194,0.22),_transparent_38%),radial-gradient(circle_at_80%_20%,_rgba(71,167,255,0.12),_transparent_26%),linear-gradient(180deg,_#07111f_0%,_#0a0f18_55%,_#05070b_100%)]" />
      <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:72px_72px]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 pb-16 pt-6 md:px-10">
        <header className="mb-16 flex items-center justify-between rounded-full border border-white/10 bg-white/5 px-5 py-3 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0A66C2] text-sm font-bold">
              S
            </div>
            <div>
              <div className="text-sm font-semibold tracking-[0.24em] text-white/55">STRATIFY</div>
              <div className="text-xs text-white/45">Strategy OS for LinkedIn growth</div>
            </div>
          </div>

          <nav className="hidden items-center gap-3 md:flex">
            <PrimaryLink href="/login" secondary>
              Giriş Yap
            </PrimaryLink>
            <PrimaryLink href="/register">
              Ucretsiz Basla
            </PrimaryLink>
          </nav>
        </header>

        <section className="grid flex-1 items-center gap-14 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#0A66C2]/35 bg-[#0A66C2]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#77bfff]">
              <Sparkles size={14} />
              LinkedIn growth system
            </div>

            <h1 className="max-w-4xl text-5xl font-semibold leading-[0.98] tracking-[-0.05em] text-white md:text-7xl">
              Icerik degil,
              <br />
              karar kalitesi ureten
              <br />
              strateji motoru.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/65">
              Stratify, onboarding verinle ve public LinkedIn sinyalleriyle haftalik
              icerik yonunu cikarir. Ne yazman gerektigini, neden yazman gerektigini
              ve nasil paketlemen gerektigini tek bir akista verir.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <PrimaryLink href="/register">
                Ucretsiz Basla
                <ArrowRight size={16} />
              </PrimaryLink>
              <PrimaryLink href="/login" secondary>
                Dashboarda Git
              </PrimaryLink>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                <div className="text-3xl font-semibold text-white">3 adim</div>
                <p className="mt-2 text-sm leading-6 text-white/55">Onboarding, canli insight, hazir taslak akisi.</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                <div className="text-3xl font-semibold text-white">Live</div>
                <p className="mt-2 text-sm leading-6 text-white/55">Apify destekli LinkedIn baglami ile karar kalitesi.</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                <div className="text-3xl font-semibold text-white">Weekly</div>
                <p className="mt-2 text-sm leading-6 text-white/55">Tekrar eden haftalik ritim ve olculebilir cikti.</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 rounded-[36px] bg-[radial-gradient(circle_at_top,_rgba(10,102,194,0.22),_transparent_58%)] blur-2xl" />
            <div className="relative overflow-hidden rounded-[36px] border border-white/10 bg-white/6 p-6 shadow-[0_35px_120px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-white/40">Weekly cockpit</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">Bu haftanin strateji gorunumu</h2>
                </div>
                <div className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                  Live signals on
                </div>
              </div>

              <div className="space-y-4">
                {FEATURE_PILLARS.map((item) => (
                  <div key={item.title} className="rounded-3xl border border-white/10 bg-[#081320]/80 p-5">
                    <div className="mb-3 flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0A66C2]/15 text-[#78bfff]">
                        <item.icon size={18} />
                      </div>
                      <div className="text-lg font-medium text-white">{item.title}</div>
                    </div>
                    <p className="text-sm leading-6 text-white/58">{item.description}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-3xl border border-white/10 bg-gradient-to-br from-[#0A66C2]/18 to-white/0 p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-[#7ebfff]">Workflow</p>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-white/75">
                  <span className="rounded-full border border-white/10 px-3 py-1">Onboarding</span>
                  <span className="text-white/25">→</span>
                  <span className="rounded-full border border-white/10 px-3 py-1">LinkedIn data</span>
                  <span className="text-white/25">→</span>
                  <span className="rounded-full border border-white/10 px-3 py-1">Insights</span>
                  <span className="text-white/25">→</span>
                  <span className="rounded-full border border-white/10 px-3 py-1">Draft posts</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-24 grid gap-6 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-[32px] border p-7 ${
                plan.featured
                  ? 'border-[#0A66C2]/40 bg-[#0A66C2]/10 shadow-[0_20px_80px_rgba(10,102,194,0.18)]'
                  : 'border-white/10 bg-white/5'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="text-2xl font-semibold text-white">{plan.name}</div>
                {plan.featured ? (
                  <div className="rounded-full bg-[#0A66C2] px-3 py-1 text-xs font-semibold text-white">
                    Recommended
                  </div>
                ) : null}
              </div>
              <div className="mt-4 text-4xl font-semibold text-white">{plan.price}</div>
              <p className="mt-3 text-sm leading-6 text-white/58">{plan.description}</p>
              <div className="mt-6 space-y-3">
                {plan.items.map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 px-4 py-3 text-sm text-white/75">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
