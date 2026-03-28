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
      subject: 'Stratify onboarding tamamlandi',
      html: `
        <div style="font-family: Inter, Arial, sans-serif; color: #111827; line-height: 1.6;">
          <h2>Stratify hazir</h2>
          <p>Onboarding tamamlandi. Artik haftalik strateji akisini calistirabilirsin.</p>
          <p><strong>Nis:</strong> ${niche}</p>
          <p><strong>Ton:</strong> ${tone}</p>
          <p>Dashboard'a girip bu haftanin LinkedIn icgorulerini uretebilirsin.</p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    throw new Error(`Resend request failed with status ${response.status}.`);
  }
}
