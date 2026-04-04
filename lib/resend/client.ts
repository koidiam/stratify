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
      <li>The <strong>continuity layer</strong> across retained cycles is now open</li>
      <li>You now have <strong>3 weekly strategy passes</strong> to test and compare directions</li>
      <li>The learning loop has more room to resolve over time</li>
    </ul>
  `;

  const proUnlocked = `
    <ul style="padding-left: 18px; margin: 12px 0;">
      <li>The <strong>full intelligence layer</strong> is now open</li>
      <li>Live LinkedIn signal scanning is active across your weekly runs</li>
      <li>Reference and competitor texture is available during research</li>
      <li>You now have <strong>50 weekly strategy passes</strong> for the deepest learning resolution</li>
    </ul>
  `;

  const html = buildEmailHTML({
    title: `You just opened ${planName} — here's what changed`,
    body: `
      <p>Your ${planName} plan is now active. Here is the deeper system layer that just opened:</p>
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
    ? '<p style="margin-top: 16px; color: #6B7280; font-size: 13px;">Pro opens the deepest live signal and reference layer if you want more system depth immediately.</p>'
    : '';

  const html = buildEmailHTML({
    title: "Your weekly system layer is nearing capacity",
    body: `
      <p>You have used <strong>${used} of ${limit}</strong> weekly strategy passes.</p>
      <p>After the cycle resets next Monday, the current layer will be ready again.</p>
      ${upgradeHint}
    `,
  });

  await sendEmail(to, "Your weekly system layer is nearing capacity", html);
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
      <p>This week, you generated <strong>${used} strategy pass</strong>.</p>
      <p style="margin-top: 8px;">Here is the deeper system depth still sealed above Free:</p>
      <ul style="padding-left: 18px; margin: 8px 0;">
        <li><strong>Basic:</strong> full continuity across retained cycles plus 2 more weekly passes</li>
        <li><strong>Pro:</strong> the full live signal and reference intelligence layer</li>
      </ul>
    `;
  } else if (plan === 'basic') {
    valuePreview = `
      <p>This week, you generated <strong>${used} strategy sessions</strong>.</p>
      <p style="margin-top: 8px;">Here is the deeper system depth still sealed above Basic:</p>
      <ul style="padding-left: 18px; margin: 8px 0;">
        <li><strong>Pro:</strong> the full live signal system plus reference intelligence</li>
        <li>Deeper strategy shaping from current market input</li>
        <li>More room for the learning loop to resolve over time</li>
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
    title: "Your current system layer is at capacity",
    body: valuePreview,
    ctaText: showCta ? 'See upgrade options →' : undefined,
    ctaUrl: showCta ? `${APP_URL}/settings` : undefined,
  });

  await sendEmail(to, "Your current system layer is at capacity", html);
}
