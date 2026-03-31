import { createClient, createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getUsageStatus, incrementUsage } from '@/lib/utils/usage';
import { generateStructuredJSON } from '@/lib/groq/client';
import { buildLinkedInResearchContext } from '@/lib/apify/linkedin';
import { buildInsightPrompt } from '@/lib/prompts/insight.prompt';
import { buildContentPrompt } from '@/lib/prompts/content.prompt';
import { getISOWeek } from '@/lib/utils/week';
import { getErrorMessage, isInsightItemArray, isWeeklyContent } from '@/lib/utils/parsers';
import { InsightItem, WeeklyContent } from '@/types';

export const maxDuration = 60;

export async function POST() { // request nesnesi kullanılmadığı için kaldırıldı
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (!user || authError) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const adminClient = await createAdminClient();
    
    const { data: profile } = await adminClient
      .from('profiles')
      .select('plan, onboarding_completed')
      .eq('id', user.id)
      .maybeSingle();

    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    
    if (!profile.onboarding_completed) {
      return NextResponse.json({ error: 'onboarding_required' }, { status: 400 });
    }
    
    const { data: onboarding } = await adminClient
      .from('onboarding')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!onboarding) return NextResponse.json({ error: 'onboarding_required' }, { status: 400 });

    const plan = profile.plan === 'basic' || profile.plan === 'pro' ? profile.plan : 'free';
    const usageCheck = await getUsageStatus(user.id, plan, adminClient);

    if (!usageCheck.allowed) {
      return NextResponse.json({
        error: 'Weekly usage limit reached',
        code: 'limit_reached',
        plan,
        used: usageCheck.used,
        limit: usageCheck.limit,
        upgradeRequired: true
      }, { status: 429 });
    }

    let linkedinResearch = null;
    try {
      linkedinResearch = await buildLinkedInResearchContext(
        user.id,
        onboarding,
        adminClient
      );
    } catch {
      // Apify çökse de devam et, sadece onboarding verisiyle çalış
    }

    let feedbackContext: string | null = null;
    const { data: pastFeedback } = await adminClient
      .from('post_feedback')
      .select('views, likes, comments, reposts, notes')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);
      
    if (pastFeedback && pastFeedback.length > 0) {
      feedbackContext = pastFeedback.map(f => `Views: ${f.views}, Likes: ${f.likes}, Comments: ${f.comments}, Reposts: ${f.reposts}, Notes: ${f.notes || 'None'}`).join('\n');
    }

    const insightPromptText = buildInsightPrompt(
      onboarding,
      linkedinResearch?.insightContext ?? null,
      feedbackContext
    );
    const rawInsights = await generateStructuredJSON<unknown>(insightPromptText);

    if (!isInsightItemArray(rawInsights)) {
      throw new Error('Insight response was not valid JSON.');
    }

    const insights: InsightItem[] = rawInsights;

    const contentPromptText = buildContentPrompt(
      onboarding,
      insights,
      linkedinResearch?.contentContext ?? null
    );
    const rawContent = await generateStructuredJSON<unknown>(contentPromptText);

    if (!isWeeklyContent(rawContent)) {
      throw new Error('Content response was not valid JSON.');
    }

    const content: WeeklyContent = rawContent;

    const { week, year } = getISOWeek();
    const { data: historyRecord, error: histErr } = await supabase
      .from('content_history')
      .upsert({
        user_id: user.id,
        week_number: week,
        year: year,
        insights,
        ideas: content.ideas,
        hooks: content.hooks,
        posts: content.posts,
      }, { onConflict: 'user_id,week_number,year' })
      .select('id')
      .single();

    if (histErr) throw histErr;

    await incrementUsage(
      user.id,
      supabase,
      usageCheck.week,
      usageCheck.year,
      usageCheck.used
    );

    return NextResponse.json({
      history_id: historyRecord.id,
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
