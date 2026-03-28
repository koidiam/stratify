import { createAdminClient, createClient } from '@/lib/supabase/server';
import { sendOnboardingEmail } from '@/lib/resend/client';
import { NextResponse } from 'next/server';
import { OnboardingData } from '@/types';
import { getErrorMessage } from '@/lib/utils/parsers';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as Partial<OnboardingData>;
    const referencePosts = Array.isArray(body.reference_posts)
      ? body.reference_posts.filter((post): post is string => typeof post === 'string' && post.trim().length > 0)
      : [];

    if (
      typeof body.niche !== 'string' ||
      typeof body.target_audience !== 'string' ||
      typeof body.tone !== 'string'
    ) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!body.niche.trim() || !body.target_audience.trim() || !body.tone.trim()) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const adminClient = await createAdminClient();

    await adminClient.from('profiles').upsert(
      {
        id: session.user.id,
        email: session.user.email ?? '',
        plan: 'free',
        onboarding_completed: false,
      },
      { onConflict: 'id' }
    );

    const { error: oe } = await adminClient.from('onboarding').upsert({
      user_id: session.user.id,
      niche: body.niche.trim(),
      target_audience: body.target_audience.trim(),
      tone: body.tone.trim(),
      goal: typeof body.goal === 'string' && body.goal.trim() ? body.goal.trim() : null,
      reference_posts: referencePosts,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

    if (oe) throw oe;

    const { error: pe } = await adminClient
      .from('profiles')
      .update({ onboarding_completed: true })
      .eq('id', session.user.id);
      
    if (pe) throw pe;

    try {
      await sendOnboardingEmail({
        to: session.user.email ?? '',
        niche: body.niche.trim(),
        tone: body.tone.trim(),
      });
    } catch {
      // Mail delivery is optional and should not block onboarding success.
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
