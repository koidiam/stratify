import { OnboardingData, InsightItem } from '@/types';

export function buildContentPrompt(
  data: OnboardingData,
  insights: InsightItem[],
  linkedinContext?: string | null
): string {
  const insightSummary = insights
    .map((i, idx) => {
      const formatHint = i.format_hint ? `, Format: ${i.format_hint}` : '';
      const pattern = i.pattern ? `, Pattern: ${i.pattern}` : '';
      const implication = i.implication ? `, Implication: ${i.implication}` : '';
      const recommendedMove = i.recommended_move ? `, Move: ${i.recommended_move}` : '';
      const risk = i.risk ? `, Risk: ${i.risk}` : '';
      return `${idx + 1}. ${i.insight} (Trigger: ${i.trigger}${formatHint}${pattern}${implication}${recommendedMove}${risk})`;
    })
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
Examples of correct hooks:
- "5 things your B2C onboarding is silently killing"
- "90% of SaaS founders never audit this. Their churn shows it."
- "What separates a $1k freelancer from a $10k one isn't skill."

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
- You are writing AS the user, in their voice, from their direct first-person experience as a ${data.niche} professional. Never write as an observer, advisor, or analyst.
- Never open a post with a generic observation ("Data-driven analysis is key to...", "When developing an app, it is essential to..."). Start with the user's lived situation.
- Each post must begin with a concrete moment, decision, or result — not a principle.
- Maximum 1 sentence per paragraph. Most paragraphs should be a single line.
- No summarizing conclusions at the end. End on tension, a result, or a question — not a lesson.

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
