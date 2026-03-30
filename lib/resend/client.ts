interface SendOnboardingEmailParams {
  to: string;
  niche: string;
  tone: string;
}

const RESEND_ENDPOINT = 'https://api.resend.com/emails';

export async function sendOnboardingEmail({
  to,
  niche,
  tone,
}: SendOnboardingEmailParams): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev';

  if (!apiKey || !to) {
    return;
  }

  const response = await fetch(RESEND_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to,
      subject: 'Welcome to Stratify: Your setup is complete',
      html: `
        <div style="font-family: Inter, Arial, sans-serif; color: #111827; line-height: 1.6;">
          <h2>Your Stratify engine is ready</h2>
          <p>Onboarding is complete. You can now start generating your weekly LinkedIn strategies.</p>
          <p><strong>Niche:</strong> ${niche}</p>
          <p><strong>Tone:</strong> ${tone}</p>
          <p>Head over to your dashboard and generate this week's insights.</p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    throw new Error(`Resend request failed with status ${response.status}.`);
  }
}
