import { buildEmailHTML } from './templates';

const RESEND_ENDPOINT = 'https://api.resend.com/emails';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://stratify-one-teal.vercel.app';

// ─── Internal helper ────────────────────────────────────────────────────────

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev';

  if (!apiKey || !to) return;

  const response = await fetch(RESEND_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to, subject, html }),
  });

  if (!response.ok) {
    throw new Error(`Resend request failed with status ${response.status}.`);
  }
}

// ─── 1. Welcome Email ───────────────────────────────────────────────────────

interface WelcomeParams {
  to: string;
  niche: string;
  tone: string;
}

export async function sendWelcomeEmail({ to, niche, tone }: WelcomeParams): Promise<void> {
  const html = buildEmailHTML({
    title: 'Your Stratify engine is ready',
    body: `
      <p>Onboarding is complete. Your engine is configured and ready to generate your first weekly LinkedIn strategy.</p>
      <p><strong>Niche:</strong> ${niche}</p>
      <p><strong>Tone:</strong> ${tone}</p>
      <p>Head to your dashboard to run the engine. It takes about 15 seconds to produce insights, hooks, and ready-to-publish drafts.</p>
    `,
    ctaText: 'Run your first strategy →',
    ctaUrl: `${APP_URL}/generate`,
  });

  await sendEmail(to, 'Your Stratify engine is ready', html);
}

// ─── 2. Billing Email — "What You Unlocked" ─────────────────────────────────

interface BillingParams {
  to: string;
  plan: 'basic' | 'pro';
}

export async function sendBillingEmail({ to, plan }: BillingParams): Promise<void> {
  const planName = plan === 'pro' ? 'Pro' : 'Basic';

  const basicUnlocked = `
    <ul style="padding-left: 18px; margin: 12px 0;">
      <li>You now get <strong>3 strategy sessions per week</strong> (was 1)</li>
      <li>Your insights are tuned deeper to your niche</li>
      <li>Full generation history access is active</li>
    </ul>
  `;

  const proUnlocked = `
    <ul style="padding-left: 18px; margin: 12px 0;">
      <li>You now get <strong>50 strategy sessions per week</strong></li>
      <li>Live LinkedIn signal scanning is active — your insights are powered by real-time data</li>
      <li>Competitor and reference post analysis is on</li>
      <li>Priority generation speed is enabled</li>
    </ul>
  `;

  const html = buildEmailHTML({
    title: `You just unlocked ${planName} — here's what changed`,
    body: `
      <p>Your ${planName} plan is now active. Here's what's different starting now:</p>
      ${plan === 'pro' ? proUnlocked : basicUnlocked}
      <p>Your engine is ready. Generate your first ${planName} strategy now.</p>
    `,
    ctaText: `Generate your first ${planName} strategy →`,
    ctaUrl: `${APP_URL}/generate`,
  });

  await sendEmail(to, `You just unlocked ${planName} — here's what changed`, html);
}

// ─── 3. Pre-Limit Warning Email ─────────────────────────────────────────────

interface PreLimitParams {
  to: string;
  plan: string;
  used: number;
  limit: number;
}

export async function sendPreLimitEmail({ to, plan, used, limit }: PreLimitParams): Promise<void> {
  const upgradeHint = plan === 'basic'
    ? '<p style="margin-top: 16px; color: #6B7280; font-size: 13px;">Want more? Pro gives you 50 sessions per week plus live LinkedIn signal scanning.</p>'
    : '';

  const html = buildEmailHTML({
    title: "You're almost at your weekly limit",
    body: `
      <p>You've used <strong>${used} of ${limit}</strong> strategy sessions this week.</p>
      <p>After your limit resets next Monday, you'll be ready to go again.</p>
      ${upgradeHint}
    `,
  });

  await sendEmail(to, "You're almost at your weekly limit", html);
}

// ─── 4. Limit Reached Email — Value Preview ─────────────────────────────────

interface LimitReachedParams {
  to: string;
  plan: string;
  used: number;
}

export async function sendLimitReachedEmail({ to, plan, used }: LimitReachedParams): Promise<void> {
  let valuePreview = '';

  if (plan === 'free') {
    valuePreview = `
      <p>This week, you generated <strong>${used} strategy session</strong>.</p>
      <p style="margin-top: 8px;">Here's what you're missing:</p>
      <ul style="padding-left: 18px; margin: 8px 0;">
        <li><strong>Basic:</strong> 2 more sessions waiting for you every week</li>
        <li><strong>Pro:</strong> 50 sessions per week + live LinkedIn signal scanning — sharper, data-driven insights every time</li>
      </ul>
    `;
  } else if (plan === 'basic') {
    valuePreview = `
      <p>This week, you generated <strong>${used} strategy sessions</strong>.</p>
      <p style="margin-top: 8px;">Here's what you're missing:</p>
      <ul style="padding-left: 18px; margin: 8px 0;">
        <li><strong>Pro:</strong> 47 more sessions per week</li>
        <li>Live LinkedIn data powering every insight</li>
        <li>Competitor and reference post analysis</li>
      </ul>
    `;
  } else {
    // Pro users hit 50 — no upsell, just info
    valuePreview = `
      <p>This week, you generated <strong>${used} strategy sessions</strong>. That's impressive.</p>
      <p>Your limit resets next Monday. We'll be ready when you are.</p>
    `;
  }

  const showCta = plan !== 'pro';

  const html = buildEmailHTML({
    title: "Your weekly limit is reached — here's what you're missing",
    body: valuePreview,
    ctaText: showCta ? 'See upgrade options →' : undefined,
    ctaUrl: showCta ? `${APP_URL}/settings` : undefined,
  });

  await sendEmail(to, "Your weekly limit is reached", html);
}
