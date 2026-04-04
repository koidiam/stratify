import { OnboardingData } from '@/types';

export function buildInsightPrompt(
  data: OnboardingData,
  linkedinContext?: string | null,
  feedbackContext?: string | null
): string {
  return `You are a LinkedIn growth strategist specializing in the ${data.niche} niche.

User profile:
- Niche: ${data.niche}
- Target audience: ${data.target_audience}
- Tone: ${data.tone}
${data.goal ? `- Growth goal: ${data.goal}` : ''}
${linkedinContext ? `\nUse the following live LinkedIn research as your primary evidence base:\n${linkedinContext}` : ''}
${feedbackContext ? `\nUser's past post performance:\n${feedbackContext}` : ''}

Your task: Generate 3 strategic insights about what content works on LinkedIn for this specific niche RIGHT NOW.

Each insight must be:
1. Specific to the niche — not generic LinkedIn advice
2. Grounded in observed data — if LinkedIn evidence is provided, cite the format type and engagement tier
3. Actionable — specify both the content type AND the format pattern to use
4. If live LinkedIn evidence is available, explicitly state which format (list/story/contrarian/etc.) is winning this week and why

Return exactly this JSON shape:
- insights: an array of exactly 3 objects
- insight: one single-line string
- why: one single-line string
- trigger: one of Curiosity | Social proof | Scarcity | Relatability | Contrast | Progress
- format_hint: one of list | story | hook-question | contrarian | data-driven | other

CRITICAL: Return ONLY the JSON object below. No markdown. No explanation. No text before or after. Every string value must be on a single line with no unescaped quotes or newlines inside.
{
  "insights": [
    {
      "insight": "Data-backed retention postmortems are outperforming generic growth tips in this niche this week.",
      "why": "Posts that show a specific operating failure with concrete metrics create stronger credibility and higher attention than broad advice, especially when the format is data-driven and high-engagement examples are present.",
      "trigger": "Social proof",
      "format_hint": "data-driven"
    },
    {
      "insight": "Founder stories that reveal a painful turning point are driving stronger response than polished outcome summaries.",
      "why": "Narratives with a visible before-and-after gap create emotional tension and make the lesson easier to remember, especially when recent story-format posts show medium or high engagement.",
      "trigger": "Relatability",
      "format_hint": "story"
    },
    {
      "insight": "Contrarian breakdowns of common playbooks are pulling more comments than standard how-to threads.",
      "why": "When the audience already knows the default advice, a clear disagreement with that advice creates a stronger open loop and drives discussion, especially when contrarian posts are showing high-engagement tiers.",
      "trigger": "Contrast",
      "format_hint": "contrarian"
    }
  ]
}`;
}
