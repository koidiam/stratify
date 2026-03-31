import Groq from 'groq-sdk';

let groq: Groq | null = null;

function getGroqClient(): Groq {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not set in environment variables');
  }
  if (!groq) {
    groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }
  return groq;
}

/**
 * Clean and parse JSON from Groq outputs.
 * Removes markdown formatting, handles common serialization issues.
 * Throws a specific Error if parsing completely fails.
 */
function parseJSON<T>(text: string, contextName: string = 'Unknown'): T {
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```[a-zA-Z]*\n?/, '').replace(/\n?```$/, '');
  }

  try {
    return JSON.parse(cleaned) as T;
  } catch (_err) {
    cleaned = cleaned.replace(/[\x00-\x09\x0B-\x1F]/g, '');
    try {
      return JSON.parse(cleaned) as T;
    } catch (_err2) {
      cleaned = cleaned.replace(/\\([^"\\\/bfnrtu])/g, '$1');
      try {
        return JSON.parse(cleaned) as T;
      } catch (finalErr) {
        console.error(`[parseJSON] Failed in ${contextName}. Raw text sample:`, text.substring(0, 500));
        throw new Error(`Failed to parse Groq AI response as JSON in ${contextName}.`);
      }
    }
  }
}

/**
 * Generates Structured JSON.
 * Forces the model to respond in JSON format and parses the result.
 */
export async function generateStructuredJSON<T>(prompt: string, contextName: string = 'Unknown'): Promise<T> {
  const strictPrompt = prompt + '\n\nIMPORTANT: Return ONLY valid JSON. Do not write markdown text. Ensure all string values are strictly escaped.';

  const client = getGroqClient();
  const chatCompletion = await client.chat.completions.create({
    messages: [{ role: 'user', content: strictPrompt }],
    model: 'llama-3.3-70b-versatile',
    temperature: 0.2, // Low temperature for deterministic JSON structure
    max_tokens: 3000,
    response_format: { type: 'json_object' },
  });

  const content = chatCompletion.choices[0]?.message?.content || '{}';
  return parseJSON<T>(content, contextName);
}

/**
 * Generates plain text specifically (used for refine operations).
 * No JSON formatting forced.
 */
export async function generateText(prompt: string): Promise<string> {
  const client = getGroqClient();
  const chatCompletion = await client.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'llama-3.3-70b-versatile',
    temperature: 0.7, // Slightly higher for rewriting/refining text naturally
    max_tokens: 1500,
  });

  return chatCompletion.choices[0]?.message?.content || '';
}
