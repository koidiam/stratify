import Link from 'next/link';
import { redirect } from 'next/navigation';
import { BarChart3, ChevronDown } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';

interface HistoryRecord {
  id: string;
  week_number: number;
  year: number;
  hooks: string[] | null;
  insights: Array<{ insight: string; why: string; trigger: string }> | null;
  posts: Array<{ content: string; type: string; explanation?: string }> | null;
  created_at: string;
}

interface FeedbackRecord {
  history_id: string;
  created_at: string;
}

export default async function HistoryPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', session.user.id)
    .maybeSingle();

  const plan = profile?.plan === 'basic' || profile?.plan === 'pro' ? profile.plan : 'free';

  const { data: history, error } = await supabase
    .from('content_history')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });

  const { data: feedback } = await supabase
    .from('post_feedback')
    .select('history_id, created_at')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });

  const historyRecords = (history ?? []) as HistoryRecord[];
  const feedbackRecords = (feedback ?? []) as FeedbackRecord[];

  const feedbackSummary = feedbackRecords.reduce<Record<string, { count: number; lastSubmittedAt: string }>>((acc, item) => {
    const current = acc[item.history_id];

    acc[item.history_id] = {
      count: current ? current.count + 1 : 1,
      lastSubmittedAt: current?.lastSubmittedAt ?? item.created_at,
    };

    return acc;
  }, {});

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white uppercase">Generation_History</h1>
        <p className="text-white/50 mt-2 text-sm leading-relaxed font-light">Your strategy archives and performance notes from previous iterations.</p>
      </div>

      <div className="space-y-4">
        {!error && historyRecords.length > 0 ? (
          historyRecords.map((record, index) => {
            const isLocked = plan === 'free' && index > 0;

            if (isLocked) {
              return (
                <div key={record.id} className="relative group overflow-hidden rounded-sm str-panel p-5 blur-[2px] opacity-70 cursor-not-allowed">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-lg font-semibold text-foreground tracking-tight">Week {record.week_number}, {record.year}</div>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span className="font-medium">{record.insights?.length ?? 0} insights</span>
                        <span className="font-medium">{record.posts?.length ?? 0} posts</span>
                      </div>
                    </div>
                  </div>
                  {index === 1 && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/40 backdrop-blur-sm">
                      <div className="text-3xl mb-2">🔒</div>
                      <p className="text-sm font-semibold text-foreground bg-background px-4 py-2 rounded-full border border-border shadow-sm">Upgrade to Pro to access past weeks</p>
                    </div>
                  )}
                </div>
              );
            }

            return (
            <details
              key={record.id}
              open={index === 0}
              className="group overflow-hidden rounded-sm str-panel transition-colors hover:border-white/20"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 outline-none focus-visible:bg-white/[0.02]">
                <div>
                  <div className="text-lg font-bold text-white tracking-tight uppercase">
                    W_{record.week_number}.{record.year}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] font-mono uppercase tracking-widest text-emerald-500/80">
                    <span>{record.insights?.length ?? 0} signals</span>
                    <span className="text-white/20">|</span>
                    <span>{record.posts?.length ?? 0} drafts</span>
                    <span className="text-white/20">|</span>
                    <span>{feedbackSummary[record.id]?.count ?? 0} metrics</span>
                    <span className="text-white/20">|</span>
                    <span className="text-white/40">{new Date(record.created_at).toLocaleDateString('en-US')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-white/40 group-hover:text-white transition-colors">
                  <span>View Details</span>
                  <ChevronDown className="h-4 w-4 transition-transform duration-200 group-open:rotate-180" />
                </div>
              </summary>

              <div className="border-t border-white/10 px-6 py-6 bg-white/[0.01]">
                <div className="grid gap-4 lg:grid-cols-3">
                  <div className="str-panel rounded-sm bg-white/[0.02] shadow-none p-5 border border-white/5">
                    <div className="text-[9px] font-bold uppercase tracking-widest text-white/50 mb-4">Extracted Signals</div>
                    <ul className="space-y-4 text-sm leading-relaxed text-white/80 font-light list-disc list-inside marker:text-emerald-500/50">
                      {record.insights?.map((item, insightIndex) => (
                        <li key={`${record.id}-insight-${insightIndex}`} className="pl-1">
                          <span className="-ml-1">{item.insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="str-panel rounded-sm bg-white/[0.02] shadow-none p-5 border border-white/5">
                    <div className="text-[9px] font-bold uppercase tracking-widest text-white/50 mb-4">Generated Hooks</div>
                    <ul className="space-y-4 text-sm leading-relaxed text-white/80 font-light list-disc list-inside marker:text-emerald-500/50">
                      {record.hooks?.map((hook, hookIndex) => (
                        <li key={`${record.id}-hook-${hookIndex}`} className="pl-1">
                          <span className="-ml-1">{hook}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="str-panel rounded-sm bg-white/[0.02] shadow-none p-5 border border-white/5">
                    <div className="text-[9px] font-bold uppercase tracking-widest text-white/50 mb-4">Draft Artifacts</div>
                    <div className="space-y-4">
                      {record.posts?.map((post, postIndex) => (
                        <div key={`${record.id}-post-${postIndex}`} className="rounded-sm border border-white/10 bg-[#000000]/40 p-3.5">
                          <div className="mb-2 text-[9px] font-bold uppercase tracking-widest text-emerald-500/80">
                            F_0{postIndex + 1}_{post.type.substring(0,4)}
                          </div>
                          <p className="line-clamp-4 whitespace-pre-wrap text-[11px] font-mono leading-relaxed text-white/70">
                            {post.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-sm border border-emerald-500/20 bg-emerald-500/5 px-4 py-3.5 text-[11px] uppercase tracking-widest font-mono text-emerald-500/60 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-500" />
                  LAST_METRICS_SYNC:
                  <span className="font-bold text-emerald-500">
                    {feedbackSummary[record.id]?.lastSubmittedAt
                      ? new Date(feedbackSummary[record.id].lastSubmittedAt).toLocaleDateString('en-US')
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </details>
          )})
        ) : error ? (
          <div className="rounded-[24px] border border-dashed border-border bg-secondary/50 flex flex-col items-center justify-center min-h-[30vh] text-center p-8">
            <p className="text-muted-foreground">History records are temporarily unavailable.</p>
          </div>
        ) : (
          <div className="rounded-[24px] border border-dashed border-border bg-secondary/50 flex flex-col items-center justify-center min-h-[30vh] text-center p-8">
            <p className="text-muted-foreground text-lg mb-2">You haven&apos;t generated any content yet.</p>
            <Link href="/generate">
               <Button variant="link" className="text-primary hover:text-primary/80">
                 Run your first strategy engine
               </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
