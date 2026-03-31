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
2. Grounded in human psychology
3. Actionable — it should tell the user what kind of content to create
4. If live LinkedIn evidence is available above, explicitly prioritize those observed patterns over generic assumptions

For each insight, identify:
- insight: What pattern works? (1 clear sentence)
- why: Why does it work psychologically? (2-3 sentences, be specific)
- trigger: The primary psychological trigger (choose one: Curiosity, Social proof, Scarcity, Relatability, Contrast, Progress)

RESPOND ONLY WITH VALID JSON. No markdown, no explanation, no preamble:
{
  "insights": [
    {
      "insight": "...",
      "why": "...",
      "trigger": "..."
    },
    {
      "insight": "...",
      "why": "...",
      "trigger": "..."
    },
    {
      "insight": "...",
      "why": "...",
      "trigger": "..."
    }
  ]
}`;
}
