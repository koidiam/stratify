create table if not exists public.scrape_cache (
  id uuid default gen_random_uuid() primary key,
  cache_key text not null unique,
  actor_id text not null,
  results jsonb not null,
  scraped_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create table if not exists public.apify_usage (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  actor_id text not null,
  items_count integer not null,
  cost_usd numeric(8,4),
  triggered_at timestamptz not null default now()
);

alter table public.scrape_cache enable row level security;
alter table public.apify_usage enable row level security;

drop policy if exists "service_role_manage_scrape_cache" on public.scrape_cache;
create policy "service_role_manage_scrape_cache"
  on public.scrape_cache
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists "own_apify_usage" on public.apify_usage;
create policy "own_apify_usage"
  on public.apify_usage
  for select
  using (auth.uid() = user_id);

drop policy if exists "service_role_insert_apify_usage" on public.apify_usage;
create policy "service_role_insert_apify_usage"
  on public.apify_usage
  for insert
  with check (auth.role() = 'service_role');
