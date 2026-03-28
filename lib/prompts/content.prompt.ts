import { OnboardingData, InsightItem } from '@/types';

export function buildContentPrompt(
  data: OnboardingData,
  insights: InsightItem[],
  linkedinContext?: string | null
): string {
  const insightSummary = insights
    .map((i, idx) => `${idx + 1}. ${i.insight} (Trigger: ${i.trigger})`)
    .join('\n');

  return `You are a LinkedIn content strategist for ${data.niche} professionals.

User profile:
- Niche: ${data.niche}
- Target audience: ${data.target_audience}
- Tone: ${data.tone}

This week's strategic insights:
${insightSummary}
${linkedinContext ? `\nLinkedIn reference context:\n${linkedinContext}` : ''}

Your task: Generate the following based on these insights.

--- SECTION 1: IDEAS (5 content ideas) ---
Each idea must map to one of these types: Authority, Personal, Contrarian, How-to, Soft Sell
Ideas must be specific to the niche, not generic.

--- SECTION 2: HOOKS (5 hooks) ---
Rules:
- No "I", "We", "The truth about" openers — they're overused
- Start with a number, a surprising statement, or a direct question
- Under 12 words
- Must make the reader stop scrolling

--- SECTION 3: POSTS (3 full posts) ---
Rules:
- Use the user's tone: ${data.tone}
- Short paragraphs (1-2 sentences max)
- Use whitespace — each thought gets its own line
- No generic AI language ("In today's fast-paced world...")
- No forced CTA — if there's a natural one, use it. Otherwise skip.
- Each post must directly use one of the weekly insights
- If LinkedIn reference context is available above, reflect its structure and texture without copying any post verbatim

RESPOND ONLY WITH VALID JSON. No markdown, no explanation:
{
  "ideas": [
    { "idea": "...", "type": "Authority" }
  ],
  "hooks": ["...", "...", "...", "...", "..."],
  "posts": [
    {
      "content": "...",
      "type": "Personal",
      "explanation": "This post uses insight #1 because..."
    }
  ]
}`;
}
