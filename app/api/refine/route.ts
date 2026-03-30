import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { callGroq } from '@/lib/groq/client';
import { getErrorMessage } from '@/lib/utils/parsers';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (!user || authError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { content, instruction } = body;

    if (!content || !instruction) {
      return NextResponse.json({ error: 'Missing content or instruction' }, { status: 400 });
    }

    const prompt = `Here is a LinkedIn post:
${content}

Instruction: ${instruction}

Return only the revised post text, no explanation. Do not wrap in quotes or markdown blocks unless it's part of the post.`;

    const revisedContent = await callGroq(prompt);

    return NextResponse.json({ content: revisedContent.trim() });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
