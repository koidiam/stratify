import { createClient, createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getUsageStatus, incrementUsage } from '@/lib/utils/usage';
import { callClaude, parseJSON } from '@/lib/anthropic/client';
import { buildLinkedInResearchContext } from '@/lib/apify/linkedin';
import { buildInsightPrompt } from '@/lib/prompts/insight.prompt';
import { buildContentPrompt } from '@/lib/prompts/content.prompt';
import { getISOWeek } from '@/lib/utils/week';
import { getErrorMessage, isInsightItemArray, isWeeklyContent } from '@/lib/utils/parsers';
import { InsightItem, WeeklyContent } from '@/types';

export async function POST() { // request nesnesi kullanılmadığı için kaldırıldı
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const adminClient = await createAdminClient();
    
    const { data: profile } = await adminClient
      .from('profiles')
      .select('plan, onboarding_completed')
      .eq('id', session.user.id)
      .maybeSingle();

    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    
    if (!profile.onboarding_completed) {
      return NextResponse.json({ error: 'onboarding_required' }, { status: 400 });
    }
    
    const { data: onboarding } = await adminClient
      .from('onboarding')
      .select('*')
      .eq('user_id', session.user.id)
      .maybeSingle();

    if (!onboarding) return NextResponse.json({ error: 'onboarding_required' }, { status: 400 });

    const plan = profile.plan === 'basic' || profile.plan === 'pro' ? profile.plan : 'free';
    const usageCheck = await getUsageStatus(session.user.id, plan, adminClient);

    if (!usageCheck.allowed) {
      return NextResponse.json({ error: 'limit_reached', plan }, { status: 429 });
    }

    const linkedinResearch = await buildLinkedInResearchContext(
      session.user.id,
      onboarding,
      adminClient
    );

    const insightPromptText = buildInsightPrompt(
      onboarding,
      linkedinResearch?.insightContext ?? null
    );
    const insightResponseText = await callClaude(insightPromptText);
    const rawInsights = parseJSON<unknown>(insightResponseText);

    if (!isInsightItemArray(rawInsights)) {
      throw new Error('Insight response was not valid JSON.');
    }

    const insights: InsightItem[] = rawInsights;

    const contentPromptText = buildContentPrompt(
      onboarding,
      insights,
      linkedinResearch?.contentContext ?? null
    );
    const contentResponseText = await callClaude(contentPromptText);
    const rawContent = parseJSON<unknown>(contentResponseText);

    if (!isWeeklyContent(rawContent)) {
      throw new Error('Content response was not valid JSON.');
    }

    const content: WeeklyContent = rawContent;

    const { week, year } = getISOWeek();
    const { error: histErr } = await adminClient.from('content_history').upsert({
      user_id: session.user.id,
      week_number: week,
      year: year,
      insights,
      ideas: content.ideas,
      hooks: content.hooks,
      posts: content.posts,
    }, { onConflict: 'user_id,week_number,year' });

    if (histErr) throw histErr;

    await incrementUsage(
      session.user.id,
      adminClient,
      usageCheck.week,
      usageCheck.year,
      usageCheck.used
    );

    return NextResponse.json({
      week_number: week,
      year,
      insights,
      ideas: content.ideas,
      hooks: content.hooks,
      posts: content.posts,
    });

  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
