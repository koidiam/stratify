import { OnboardingData } from '@/types';

export function buildInsightPrompt(
  data: OnboardingData,
  linkedinContext?: string | null,
  feedbackContext?: string | null
): string {
  return `You are a decision-grade LinkedIn strategy engine specializing in the ${data.niche} niche.

User profile:
- Niche: ${data.niche}
- Target audience: ${data.target_audience}
- Tone: ${data.tone}
${data.goal ? `- Growth goal: ${data.goal}` : ''}
${linkedinContext ? `\nUse the following LinkedIn research as your primary evidence base:\n${linkedinContext}` : ''}
${feedbackContext ? `\nLearning context from prior post performance:\n${feedbackContext}` : ''}

Your task: Generate 3 decision-oriented strategic insights about what content advantage exists on LinkedIn for this specific niche RIGHT NOW.

Each insight must be:
1. Specific to the niche and audience — not generic LinkedIn advice
2. Grounded in observed evidence — if LinkedIn evidence is provided, anchor the pattern to repeated formats, engagement concentration, or recurring structure
3. Decision-oriented — convert the observation into a strategic implication and a recommended move
4. Honest about trade-offs — explain where the signal breaks, saturates, or becomes generic
5. Non-obvious — avoid broad truths like authenticity works, storytelling works, or specificity performs better unless the niche-specific edge is clearly stated
6. Adaptive when performance feedback exists — let prior outcomes influence the direction only when the evidence is real, and stay explicit when that evidence is sparse

The 3 insights should not all say the same thing. When evidence allows, prefer a mix of:
- one clear opportunity to lean into
- one audience- or structure-specific advantage
- one saturation, downside, or boundary condition

Return exactly this JSON shape:
- insights: an array of exactly 3 objects
- insight: one single-line strategic headline
- pattern: one single-line description of the detected pattern or shift
- why: one single-line explanation of why this pattern exists structurally
- implication: one single-line explanation of what this changes strategically
- recommended_move: one single-line operator action to lean into, test, or avoid
- risk: one single-line boundary condition, downside, or trade-off
- trigger: one of Curiosity | Social proof | Scarcity | Relatability | Contrast | Progress
- format_hint: one of list | story | hook-question | contrarian | data-driven | other

CRITICAL:
- Return ONLY the JSON object below. No markdown. No explanation. No text before or after.
- Every string value must be on a single line with no unescaped quotes or newlines inside.
- Do not write motivational advice or generic platform truths.
- Do not fake metrics, citations, or post examples.
{
  "insights": [
    {
      "insight": "Data-backed retention postmortems are outperforming generic growth tips in this niche this week.",
      "pattern": "The retained high-response cluster is concentrating around data-driven breakdowns that expose one failed operating assumption before revealing the fix.",
      "why": "Concrete failure plus metric evidence creates a clearer credibility signal than broad advice, especially when recent data-driven posts carry higher engagement tiers.",
      "implication": "Clarity alone is no longer enough; the winning angle is proof-backed diagnosis rather than generic education.",
      "recommended_move": "Lean into firsthand breakdowns with one metric, one mistaken assumption, and one operating change instead of broad growth commentary.",
      "risk": "High upside, but it genericizes fast if the proof is abstract or borrowed instead of firsthand.",
      "trigger": "Social proof",
      "format_hint": "data-driven"
    },
    {
      "insight": "Founder stories that reveal a painful turning point are driving stronger response than polished outcome summaries.",
      "pattern": "Story-format posts are winning when the first beat centers on a specific decision failure or identity-level mistake rather than the final success state.",
      "why": "Visible tension creates faster self-recognition for this audience than polished wins, and the lesson lands harder when the before-state is concrete.",
      "implication": "The audience is responding to recognition and consequence, not just inspiration, so narrative tension is carrying more weight than polished outcomes.",
      "recommended_move": "Open with the misstep or turning point first, then connect it to the operating lesson before mentioning the result.",
      "risk": "Strong for this niche, but weak if the story takes too long to reach the tension or reads like generic founder folklore.",
      "trigger": "Relatability",
      "format_hint": "story"
    },
    {
      "insight": "Contrarian breakdowns of common playbooks are pulling more comments than standard how-to threads.",
      "pattern": "Comment-heavy posts are increasingly organized around a named default belief followed by a narrow, evidence-backed disagreement.",
      "why": "When the audience already knows the baseline advice, a specific disagreement creates more tension and discussion than another standard playbook.",
      "implication": "The edge is not contrarian tone by itself; it is a targeted reframe against an over-familiar default.",
      "recommended_move": "Use contrast where the niche already shares a common playbook, then back the disagreement with one concrete operating reason or result.",
      "risk": "Useful for engagement, but it underperforms if the disagreement is vague, theatrical, or unsupported.",
      "trigger": "Contrast",
      "format_hint": "contrarian"
    }
  ]
}`;
}
