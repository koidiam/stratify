import { createClient, createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getUsageStatus, incrementUsage } from '@/lib/utils/usage';
import { generateStructuredJSON } from '@/lib/groq/client';
import { buildLinkedInResearchContext, enrichInsightsWithResearchBasis } from '@/lib/apify/linkedin';
import { buildInsightPrompt } from '@/lib/prompts/insight.prompt';
import { buildContentPrompt } from '@/lib/prompts/content.prompt';
import { StoredCycleRecord } from '@/lib/utils/history';
import { buildLearningPromptContext, StoredFeedbackRecord } from '@/lib/utils/learning';
import { getISOWeek } from '@/lib/utils/week';
import { getErrorMessage, isInsightItemArray, isWeeklyContent, isWeeklyGeneration } from '@/lib/utils/parsers';
import { InsightItem, LinkedInResearchContext, WeeklyContent } from '@/types';
import { sendLimitReachedEmail, sendPreLimitEmail } from '@/lib/resend/client';

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
      // --- Limit Reached Email (isolated side effect) ---
      // try/catch ensures email failure NEVER changes the 429 response.
      // Rate limit: limit_email_sent flag in usage_tracking prevents duplicates.
      // New week = new usage_tracking row = flag naturally resets via DEFAULT false.
      try {
        const { data: usageRow } = await adminClient
          .from('usage_tracking')
          .select('limit_email_sent')
          .eq('user_id', user.id)
          .eq('week_number', usageCheck.week)
          .eq('year', usageCheck.year)
          .maybeSingle();

        if (usageRow && !usageRow.limit_email_sent && user.email) {
          await sendLimitReachedEmail({ to: user.email, plan, used: usageCheck.used });
          await adminClient
            .from('usage_tracking')
            .update({ limit_email_sent: true })
            .eq('user_id', user.id)
            .eq('week_number', usageCheck.week)
            .eq('year', usageCheck.year);
        }
      } catch (emailErr) {
        console.warn('[Generate] Limit reached email failed (non-fatal):', emailErr);
      }

      return NextResponse.json({
        error: 'Weekly usage limit reached',
        code: 'limit_reached',
        plan,
        used: usageCheck.used,
        limit: usageCheck.limit,
        upgradeRequired: true
      }, { status: 429 });
    }

    const fallbackResearch: LinkedInResearchContext = {
      trendQuery: `${onboarding.niche} linkedin`,
      trendPosts: [],
      referencePosts: [],
      insightContext: null,
      contentContext: null,
      researchSummary: {
        sourceMode: 'none' as const,
        marketInputStatus: 'profile-only' as const,
        analyzedPostCount: 0,
        retainedPostCount: 0,
        filteredPostCount: 0,
        trendQuery: `${onboarding.niche} linkedin`,
        trendSourceType: 'none' as const,
        trendPostCount: 0,
        referenceSourceType: 'none' as const,
        referencePostCount: 0,
        referenceInputCount: onboarding.reference_posts?.length ?? 0,
        lowSignalFilterApplied: false,
        lowSignalPostsFiltered: 0,
        jobPostFilterApplied: false,
        jobPostsExcluded: 0,
      },
    };

    let linkedinResearch: LinkedInResearchContext = fallbackResearch;
    try {
      linkedinResearch = await buildLinkedInResearchContext(
        user.id,
        onboarding,
        adminClient,
        plan
      );
    } catch (err) {
      console.warn('[Apify Layer Fallback] Research failed completely. Proceeding Groq-only natively.', err);
    }

    const { data: recentHistory } = await adminClient
      .from('content_history')
      .select('id, week_number, year, created_at, insights, hooks, posts')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    const { data: recentFeedback } = await adminClient
      .from('post_feedback')
      .select('history_id, post_index, views, likes, comments, reposts, notes, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(8);

    const { learningSummary, promptContext: feedbackContext } = buildLearningPromptContext(
      (recentHistory ?? []) as StoredCycleRecord[],
      (recentFeedback ?? []) as StoredFeedbackRecord[]
    );

    const insightPromptText = buildInsightPrompt(
      onboarding,
      linkedinResearch?.insightContext ?? null,
      feedbackContext
    );
    let insights: InsightItem[];
    try {
      const rawInsightsResponse = await generateStructuredJSON<{ insights?: unknown }>(
        insightPromptText,
        'InsightStage'
      );
      const rawInsights = typeof rawInsightsResponse === 'object' && rawInsightsResponse !== null && 'insights' in rawInsightsResponse
        ? rawInsightsResponse.insights
        : rawInsightsResponse;

      if (!isInsightItemArray(rawInsights)) {
        console.error('[Generate API] Insight validation failed.', JSON.stringify(rawInsights).substring(0, 300));
        throw new Error('Insight response was not valid JSON');
      }

      insights = enrichInsightsWithResearchBasis(rawInsights, linkedinResearch);
    } catch (error) {
      console.error('[Generate API] Insight generation failed.', error);
      throw new Error('Insight response was not valid JSON');
    }

    const contentPromptText = buildContentPrompt(
      onboarding,
      insights,
      linkedinResearch?.contentContext ?? null
    );
    const rawContent = await generateStructuredJSON<unknown>(contentPromptText, 'ContentStage');

    if (!isWeeklyContent(rawContent)) {
      console.error('[Generate API] Content validation failed.', JSON.stringify(rawContent).substring(0, 300));
      throw new Error('Content response was not valid JSON.');
    }

    const content: WeeklyContent = rawContent;

    const { week, year } = getISOWeek();
    const { data: historyRecord, error: histErr } = await adminClient
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

    let historyId = typeof historyRecord?.id === 'string' ? historyRecord.id : null;
    if (!historyId) {
      const { data: persistedHistory, error: persistedHistoryError } = await adminClient
        .from('content_history')
        .select('id')
        .eq('user_id', user.id)
        .eq('week_number', week)
        .eq('year', year)
        .maybeSingle();

      if (persistedHistoryError) {
        throw persistedHistoryError;
      }

      if (typeof persistedHistory?.id !== 'string') {
        throw new Error('Generated history record did not return a usable id.');
      }

      historyId = persistedHistory.id;
    }

    await incrementUsage(
      user.id,
      adminClient,
      usageCheck.week,
      usageCheck.year,
      usageCheck.used
    );

    // --- Pre-Limit Warning Email (isolated side effect) ---
    // Triggers at >=80% usage. Only for Basic (2/3) and Pro (40/50).
    // Free has 1 limit so first generate = 100% = skip warning, go straight to limit.
    // try/catch ensures email failure NEVER affects the generate response.
    // Rate limit: warning_email_sent flag. New week = new row = flag resets via DEFAULT false.
    const newUsed = usageCheck.used + 1;
    const usagePercent = (newUsed / usageCheck.limit) * 100;
    if (usagePercent >= 80 && usagePercent < 100 && plan !== 'free') {
      try {
        const { data: usageRow } = await adminClient
          .from('usage_tracking')
          .select('warning_email_sent')
          .eq('user_id', user.id)
          .eq('week_number', usageCheck.week)
          .eq('year', usageCheck.year)
          .maybeSingle();

        if (usageRow && !usageRow.warning_email_sent && user.email) {
          await sendPreLimitEmail({ to: user.email, plan, used: newUsed, limit: usageCheck.limit });
          await adminClient
            .from('usage_tracking')
            .update({ warning_email_sent: true })
            .eq('user_id', user.id)
            .eq('week_number', usageCheck.week)
            .eq('year', usageCheck.year);
        }
      } catch (emailErr) {
        console.warn('[Generate] Pre-limit warning email failed (non-fatal):', emailErr);
      }
    }

    const responsePayload = {
      history_id: historyId,
      week_number: week,
      year,
      insights,
      ideas: content.ideas,
      hooks: content.hooks,
      posts: content.posts,
      researchUsed: linkedinResearch.researchSummary.retainedPostCount > 0,
      trendPostCount: linkedinResearch.trendPosts.length,
      researchSummary: linkedinResearch.researchSummary,
      learningSummary,
    };

    const responseCandidate: unknown = responsePayload;

    if (!isWeeklyGeneration(responseCandidate)) {
      console.error('[Generate API] Final payload failed WeeklyGeneration validation.', {
        history_id: responsePayload.history_id,
        week_number: responsePayload.week_number,
        year: responsePayload.year,
        insights_count: Array.isArray(responsePayload.insights) ? responsePayload.insights.length : null,
        ideas_count: Array.isArray(responsePayload.ideas) ? responsePayload.ideas.length : null,
        hooks_count: Array.isArray(responsePayload.hooks) ? responsePayload.hooks.length : null,
        posts_count: Array.isArray(responsePayload.posts) ? responsePayload.posts.length : null,
        researchUsed: responsePayload.researchUsed,
        trendPostCount: responsePayload.trendPostCount,
        researchSummary: responsePayload.researchSummary,
        learningSummary: responsePayload.learningSummary,
      });
      throw new Error('Generated response did not match WeeklyGeneration contract.');
    }

    return NextResponse.json(responsePayload);

  } catch (error: unknown) {
    console.error('[Generate API] Master Catch Block Error:', error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
