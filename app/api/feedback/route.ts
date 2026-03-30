import { createAdminClient, createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { FeedbackPayload } from '@/types';
import { getErrorMessage } from '@/lib/utils/parsers';

function parseMetric(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.floor(value));
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (!user || authError) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = (await request.json()) as Partial<FeedbackPayload>;

    if (
      typeof body.history_id !== 'string' ||
      typeof body.post_index !== 'number'
    ) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data: historyRecord, error: historyError } = await supabase
      .from('content_history')
      .select('id')
      .eq('id', body.history_id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (historyError) throw historyError;

    if (!historyRecord) {
      return NextResponse.json({ error: 'History record not found' }, { status: 404 });
    }

    const adminClient = await createAdminClient();
    const { error } = await adminClient.from('post_feedback').insert({
      user_id: user.id,
      history_id: body.history_id,
      post_index: body.post_index,
      views: parseMetric(body.views),
      likes: parseMetric(body.likes),
      comments: parseMetric(body.comments),
      reposts: parseMetric(body.reposts),
      notes: typeof body.notes === 'string' ? body.notes.trim().slice(0, 1500) : null,
    });

    if (error) throw error;
    
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
