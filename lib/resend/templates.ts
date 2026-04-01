/**
 * Shared HTML email template builder for Stratify.
 *
 * Decision: plain HTML + inline styles (not React Email / MJML).
 * Rationale: 4 templates total. React Email adds a render pipeline,
 * package dependency, and preview server — overkill at this scale.
 * Inline styles are the safest option for Gmail/Outlook/Apple Mail compat.
 * All templates live in one file → single update point for branding.
 */

const BRAND_COLOR = '#4F6BF6';
const BG_COLOR = '#F8F9FC';
const CARD_BG = '#FFFFFF';
const TEXT_COLOR = '#111827';
const MUTED_COLOR = '#6B7280';

interface EmailTemplateParams {
  title: string;
  body: string;
  ctaText?: string;
  ctaUrl?: string;
}

export function buildEmailHTML({ title, body, ctaText, ctaUrl }: EmailTemplateParams): string {
  const ctaBlock = ctaText && ctaUrl
    ? `<div style="text-align: center; margin: 28px 0 12px 0;">
        <a href="${ctaUrl}" style="display: inline-block; background: ${BRAND_COLOR}; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 14px;">
          ${ctaText}
        </a>
      </div>`
    : '';

  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background: ${BG_COLOR}; font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 540px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: ${CARD_BG}; border-radius: 16px; padding: 32px; border: 1px solid #E5E7EB;">
      <div style="margin-bottom: 24px;">
        <span style="font-weight: 700; font-size: 18px; color: ${BRAND_COLOR};">Stratify</span>
      </div>
      <h1 style="font-size: 20px; font-weight: 700; color: ${TEXT_COLOR}; margin: 0 0 16px 0; line-height: 1.3;">
        ${title}
      </h1>
      <div style="font-size: 14px; line-height: 1.7; color: ${TEXT_COLOR};">
        ${body}
      </div>
      ${ctaBlock}
    </div>
    <div style="text-align: center; margin-top: 24px; font-size: 12px; color: ${MUTED_COLOR};">
      <p style="margin: 0;">Stratify — LinkedIn Growth System</p>
      <p style="margin: 4px 0 0 0;">You're receiving this because you signed up at stratify-one-teal.vercel.app</p>
    </div>
  </div>
</body>
</html>`.trim();
}
