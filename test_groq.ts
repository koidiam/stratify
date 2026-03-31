import "dotenv/config";
import { generateStructuredJSON } from "./lib/groq/client";

async function run() {
  const p = `RESPOND ONLY WITH VALID JSON. No markdown, no explanation, no preamble:
{
  "insights": [
    {
      "insight": "...",
      "why": "...",
      "trigger": "..."
    }
  ]
}`;
  try {
    const rawInsightsResponse = await generateStructuredJSON<{ insights?: unknown }>(p, 'TestStage');
    console.log("Response:", JSON.stringify(rawInsightsResponse, null, 2));

    const rawInsights = typeof rawInsightsResponse === 'object' && rawInsightsResponse !== null && 'insights' in rawInsightsResponse
      ? rawInsightsResponse.insights
      : rawInsightsResponse;
    
    console.log("Extracted:", Array.isArray(rawInsights));
    console.log(rawInsights);
  } catch (err) {
    console.error("Caught error:", err);
  }
}
run();
