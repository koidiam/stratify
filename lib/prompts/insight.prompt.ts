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

For each insight, identify:
- insight: What pattern works? Name the format. (1 clear sentence)
- why: Why does it work? Reference specific engagement data if available. (2-3 sentences)
- trigger: The primary psychological trigger (choose one: Curiosity, Social proof, Scarcity, Relatability, Contrast, Progress)
- format_hint: The specific post format to use (choose one: list, story, hook-question, contrarian, data-driven)

RESPOND ONLY WITH VALID JSON. No markdown, no explanation, no preamble:
{
  "insights": [
    {
      "insight": "...",
      "why": "...",
      "trigger": "...",
      "format_hint": "..."
    },
    {
      "insight": "...",
      "why": "...",
      "trigger": "...",
      "format_hint": "..."
    },
    {
      "insight": "...",
      "why": "...",
      "trigger": "...",
      "format_hint": "..."
    }
  ]
}`;
}
