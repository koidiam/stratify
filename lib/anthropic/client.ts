import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function callClaude(prompt: string): Promise<string> {
  const message = await client.messages.create({
    model: 'claude-3-5-haiku-20241022', // updated to the latest standard haiku
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  });

  const block = message.content[0];
  if (block.type !== 'text') throw new Error('Unexpected response type from Claude');
  return block.text;
}

// JSON parse — hata alırsa hemen throw et, route handler yakalasın
export function parseJSON<T>(text: string): T {
  // Bazen model ```json ``` ile sarar, temizle
  const cleaned = text.replace(/```json\n?/gi, '').replace(/```\n?/g, '').trim();
  return JSON.parse(cleaned) as T;
}
