import { createAdminClient, createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { FeedbackPayload } from '@/types';
import { getErrorMessage } from '@/lib/utils/parsers';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = (await request.json()) as Partial<FeedbackPayload>;

    if (
      typeof body.history_id !== 'string' ||
      typeof body.post_index !== 'number'
    ) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const adminClient = await createAdminClient();
    const { error } = await adminClient.from('post_feedback').insert({
      user_id: session.user.id,
      history_id: body.history_id,
      post_index: body.post_index,
      views: typeof body.views === 'number' ? body.views : 0,
      likes: typeof body.likes === 'number' ? body.likes : 0,
      comments: typeof body.comments === 'number' ? body.comments : 0,
      reposts: typeof body.reposts === 'number' ? body.reposts : 0,
      notes: typeof body.notes === 'string' ? body.notes : null,
    });

    if (error) throw error;
    
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
