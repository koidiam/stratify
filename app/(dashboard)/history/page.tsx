import Link from 'next/link';
import { redirect } from 'next/navigation';
import { BarChart3, ChevronDown, Lock } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

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
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Generation History</h1>
        <p className="text-muted-foreground mt-2 text-lg leading-relaxed">Your strategy archives and performance notes from previous weeks.</p>
      </div>

      <div className="space-y-4">
        {!error && historyRecords.length > 0 ? (
          historyRecords.map((record, index) => {
            const isLocked = plan === 'free' && index > 0;

            if (isLocked) {
              return (
                <div key={record.id} className="relative group overflow-hidden rounded-[20px] border border-border bg-card shadow-sm p-5 blur-[2px] opacity-70 cursor-not-allowed">
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
                      <p className="text-sm font-semibold text-foreground bg-background px-4 py-2 rounded-full border border-border shadow-sm">Geçmiş haftalara erişmek için Pro'ya geçin</p>
                    </div>
                  )}
                </div>
              );
            }

            return (
            <details
              key={record.id}
              open={index === 0}
              className="group overflow-hidden rounded-[20px] border border-border bg-card shadow-sm transition-colors hover:border-primary/30"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 outline-none focus-visible:bg-secondary">
                <div>
                  <div className="text-lg font-semibold text-foreground tracking-tight">
                    Week {record.week_number}, {record.year}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span className="font-medium">{record.insights?.length ?? 0} insights</span>
                    <span className="font-medium">{record.posts?.length ?? 0} posts</span>
                    <span className="font-medium">{feedbackSummary[record.id]?.count ?? 0} metrics</span>
                    <span className="opacity-60">{new Date(record.created_at).toLocaleDateString('en-US')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-primary/80 font-medium group-hover:text-primary transition-colors">
                  <span>View Details</span>
                  <ChevronDown className="h-4 w-4 transition-transform duration-200 group-open:rotate-180" />
                </div>
              </summary>

              <div className="border-t border-border px-6 py-6 bg-secondary/30">
                <div className="grid gap-4 lg:grid-cols-3">
                  <Card className="border-border bg-card shadow-sm p-5 rounded-[16px]">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-4">Insights</div>
                    <ul className="space-y-3 text-sm leading-relaxed text-foreground">
                      {record.insights?.map((item, insightIndex) => (
                        <li key={`${record.id}-insight-${insightIndex}`} className="py-1">{item.insight}</li>
                      ))}
                    </ul>
                  </Card>

                  <Card className="border-border bg-card shadow-sm p-5 rounded-[16px]">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-4">Hooks</div>
                    <ul className="space-y-3 text-sm leading-relaxed text-foreground">
                      {record.hooks?.map((hook, hookIndex) => (
                        <li key={`${record.id}-hook-${hookIndex}`} className="py-1">{hook}</li>
                      ))}
                    </ul>
                  </Card>

                  <Card className="border-border bg-card shadow-sm p-5 rounded-[16px]">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-4">Drafts</div>
                    <div className="space-y-4">
                      {record.posts?.map((post, postIndex) => (
                        <div key={`${record.id}-post-${postIndex}`} className="rounded-[12px] border border-border bg-secondary p-3.5">
                          <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-primary/70">
                            {post.type}
                          </div>
                          <p className="line-clamp-4 whitespace-pre-wrap text-[13px] font-mono leading-relaxed text-foreground">
                            {post.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>

                <div className="mt-5 rounded-[16px] border border-border bg-primary/5 px-4 py-3.5 text-sm text-muted-foreground flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary/70" />
                  Latest Feedback:
                  <span className="font-medium text-foreground">
                    {feedbackSummary[record.id]?.lastSubmittedAt
                      ? new Date(feedbackSummary[record.id].lastSubmittedAt).toLocaleDateString('en-US')
                      : 'No performance metrics assigned yet'}
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
            <p className="text-muted-foreground text-lg mb-2">You haven't generated any content yet.</p>
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
