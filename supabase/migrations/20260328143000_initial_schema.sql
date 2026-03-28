create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  plan text not null default 'free' check (plan in ('free', 'basic', 'pro')),
  onboarding_completed boolean not null default false,
  billing_customer_id text,
  billing_subscription_id text,
  billing_status text,
  current_period_ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists plan text default 'free';
alter table public.profiles add column if not exists onboarding_completed boolean default false;
alter table public.profiles add column if not exists billing_customer_id text;
alter table public.profiles add column if not exists billing_subscription_id text;
alter table public.profiles add column if not exists billing_status text;
alter table public.profiles add column if not exists current_period_ends_at timestamptz;
alter table public.profiles add column if not exists created_at timestamptz default now();
alter table public.profiles add column if not exists updated_at timestamptz default now();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    coalesce(new.email, ''),
    new.raw_user_meta_data->>'full_name'
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(excluded.full_name, public.profiles.full_name),
        updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create table if not exists public.onboarding (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  niche text not null,
  target_audience text not null,
  tone text not null,
  goal text,
  reference_posts text[] not null default '{}',
  updated_at timestamptz not null default now()
);

alter table public.onboarding add column if not exists niche text;
alter table public.onboarding add column if not exists user_id uuid references public.profiles(id) on delete cascade;
alter table public.onboarding add column if not exists target_audience text;
alter table public.onboarding add column if not exists tone text;
alter table public.onboarding add column if not exists goal text;
alter table public.onboarding add column if not exists reference_posts text[] default '{}';
alter table public.onboarding add column if not exists updated_at timestamptz default now();

create table if not exists public.content_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  week_number integer not null,
  year integer not null,
  insights jsonb not null default '[]'::jsonb,
  ideas jsonb not null default '[]'::jsonb,
  hooks jsonb not null default '[]'::jsonb,
  posts jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  constraint content_history_user_week_year_key unique (user_id, week_number, year)
);

alter table public.content_history add column if not exists week_number integer;
alter table public.content_history add column if not exists user_id uuid references public.profiles(id) on delete cascade;
alter table public.content_history add column if not exists year integer;
alter table public.content_history add column if not exists insights jsonb default '[]'::jsonb;
alter table public.content_history add column if not exists ideas jsonb default '[]'::jsonb;
alter table public.content_history add column if not exists hooks jsonb default '[]'::jsonb;
alter table public.content_history add column if not exists posts jsonb default '[]'::jsonb;
alter table public.content_history add column if not exists created_at timestamptz default now();

create table if not exists public.usage_tracking (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  week_number integer not null,
  year integer not null,
  generations_used integer not null default 0,
  updated_at timestamptz not null default now(),
  constraint usage_tracking_user_week_year_key unique (user_id, week_number, year)
);

alter table public.usage_tracking add column if not exists week_number integer;
alter table public.usage_tracking add column if not exists user_id uuid references public.profiles(id) on delete cascade;
alter table public.usage_tracking add column if not exists year integer;
alter table public.usage_tracking add column if not exists generations_used integer default 0;
alter table public.usage_tracking add column if not exists updated_at timestamptz default now();

create table if not exists public.post_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  history_id uuid not null references public.content_history(id) on delete cascade,
  post_index integer not null,
  views integer not null default 0,
  likes integer not null default 0,
  comments integer not null default 0,
  reposts integer not null default 0,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.post_feedback add column if not exists post_index integer;
alter table public.post_feedback add column if not exists user_id uuid references public.profiles(id) on delete cascade;
alter table public.post_feedback add column if not exists history_id uuid references public.content_history(id) on delete cascade;
alter table public.post_feedback add column if not exists views integer default 0;
alter table public.post_feedback add column if not exists likes integer default 0;
alter table public.post_feedback add column if not exists comments integer default 0;
alter table public.post_feedback add column if not exists reposts integer default 0;
alter table public.post_feedback add column if not exists notes text;
alter table public.post_feedback add column if not exists created_at timestamptz default now();

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  provider text not null default 'stripe',
  provider_customer_id text,
  provider_subscription_id text unique,
  plan text not null default 'free' check (plan in ('free', 'basic', 'pro')),
  status text not null default 'inactive'
    check (status in ('inactive', 'trialing', 'active', 'past_due', 'canceled', 'incomplete')),
  current_period_starts_at timestamptz,
  current_period_ends_at timestamptz,
  cancel_at_period_end boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint subscriptions_user_provider_key unique (user_id, provider)
);

alter table public.subscriptions add column if not exists provider text default 'stripe';
alter table public.subscriptions add column if not exists user_id uuid references public.profiles(id) on delete cascade;
alter table public.subscriptions add column if not exists provider_customer_id text;
alter table public.subscriptions add column if not exists provider_subscription_id text;
alter table public.subscriptions add column if not exists plan text default 'free';
alter table public.subscriptions add column if not exists status text default 'inactive';
alter table public.subscriptions add column if not exists current_period_starts_at timestamptz;
alter table public.subscriptions add column if not exists current_period_ends_at timestamptz;
alter table public.subscriptions add column if not exists cancel_at_period_end boolean default false;
alter table public.subscriptions add column if not exists metadata jsonb default '{}'::jsonb;
alter table public.subscriptions add column if not exists created_at timestamptz default now();
alter table public.subscriptions add column if not exists updated_at timestamptz default now();

create unique index if not exists idx_onboarding_user_id
  on public.onboarding (user_id);

create unique index if not exists idx_content_history_user_week_year
  on public.content_history (user_id, week_number, year);

create unique index if not exists idx_usage_tracking_user_week_year_unique
  on public.usage_tracking (user_id, week_number, year);

create unique index if not exists idx_subscriptions_user_provider
  on public.subscriptions (user_id, provider);

create index if not exists idx_content_history_user_created_at
  on public.content_history (user_id, created_at desc);

create index if not exists idx_post_feedback_user_history
  on public.post_feedback (user_id, history_id);

create index if not exists idx_subscriptions_user_status
  on public.subscriptions (user_id, status);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

drop trigger if exists set_onboarding_updated_at on public.onboarding;
create trigger set_onboarding_updated_at
  before update on public.onboarding
  for each row execute procedure public.set_updated_at();

drop trigger if exists set_usage_tracking_updated_at on public.usage_tracking;
create trigger set_usage_tracking_updated_at
  before update on public.usage_tracking
  for each row execute procedure public.set_updated_at();

drop trigger if exists set_subscriptions_updated_at on public.subscriptions;
create trigger set_subscriptions_updated_at
  before update on public.subscriptions
  for each row execute procedure public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.onboarding enable row level security;
alter table public.content_history enable row level security;
alter table public.usage_tracking enable row level security;
alter table public.post_feedback enable row level security;
alter table public.subscriptions enable row level security;

drop policy if exists own_profile on public.profiles;
create policy own_profile
  on public.profiles
  for all
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists own_onboarding on public.onboarding;
create policy own_onboarding
  on public.onboarding
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists own_content_history on public.content_history;
create policy own_content_history
  on public.content_history
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists own_usage_tracking on public.usage_tracking;
create policy own_usage_tracking
  on public.usage_tracking
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists own_post_feedback on public.post_feedback;
create policy own_post_feedback
  on public.post_feedback
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists own_subscriptions on public.subscriptions;
create policy own_subscriptions
  on public.subscriptions
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
