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

export async function callGroq(prompt: string): Promise<string> {
  const strictPrompt = prompt + '\n\nIMPORTANT: Return ONLY valid, parseable JSON. Do not write markdown text. Ensure all string values are strictly escaped (e.g. use \\n instead of literal newlines inside strings, and escape quotes). No raw control characters.';

  const client = getGroqClient();
  const chatCompletion = await client.chat.completions.create({
    messages: [
      {
        role: 'user',
        content: strictPrompt,
      },
    ],
    model: 'llama-3.3-70b-versatile',
    temperature: 0.2, // Low temperature for code/JSON generation accuracy
    max_tokens: 3000,
  });

  return chatCompletion.choices[0]?.message?.content || '';
}

export function parseJSON<T>(text: string): T {
  // Strip any ```json or ``` marks from the LLM output safely
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```[a-zA-Z]*\n?/, '').replace(/\n?```$/, '');
  }

  try {
    return JSON.parse(cleaned) as T;
  } catch (err) {
    console.error('Initial JSON parse failed, trying cleanup...', err);
    
    // Remove invalid control characters but keep common structural formatting
    cleaned = cleaned.replace(/[\x00-\x09\x0B-\x1F]/g, '');
    
    try {
      return JSON.parse(cleaned) as T;
    } catch (err2) {
      // Fix bad escape sequences (e.g. \s -> s, \+ -> +) that are invalid in strict JSON
      cleaned = cleaned.replace(/\\([^"\\\/bfnrtu])/g, '$1');
      return JSON.parse(cleaned) as T;
    }
  }
}
