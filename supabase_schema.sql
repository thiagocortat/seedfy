-- Users table (extends auth.users usually, but here we keep it simple or sync with triggers)
-- Recommended: Use a profile table linked to auth.users. 
-- For this migration, we assume a 'users' table in public schema where ID matches auth.users.id

create table public.users (
  id uuid references auth.users(id) primary key,
  email text,
  name text,
  photo_url text,
  church_id text, -- or uuid if churches table uses uuid
  interests text[],
  created_at timestamptz default now(),
  onboarding_completed boolean default false,
  email_verified boolean default false,
  push_token text
);

create table public.churches (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  logo_url text,
  city text,
  state text
);

create table public.groups (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  image_url text,
  created_by uuid references public.users(id),
  created_at timestamptz default now()
);

create table public.group_members (
  group_id uuid references public.groups(id),
  user_id uuid references public.users(id),
  role text check (role in ('owner', 'member')),
  joined_at timestamptz default now(),
  primary key (group_id, user_id)
);

create table public.challenges (
  id uuid default gen_random_uuid() primary key,
  group_id uuid references public.groups(id),
  created_by uuid references public.users(id),
  type text check (type in ('reading', 'meditation', 'fasting', 'communion')),
  title text not null,
  duration_days int,
  start_date timestamptz,
  end_date timestamptz,
  status text check (status in ('active', 'completed', 'canceled')),
  created_at timestamptz default now()
);

create table public.challenge_participants (
  challenge_id uuid references public.challenges(id),
  user_id uuid references public.users(id),
  status text check (status in ('active', 'quit', 'completed')),
  joined_at timestamptz default now(),
  progress int default 0,
  primary key (challenge_id, user_id)
);

create table public.daily_checkins (
  challenge_id uuid references public.challenges(id),
  user_id uuid references public.users(id),
  date_key text, -- Format: YYYY-MM-DD
  completed_at timestamptz default now(),
  primary key (challenge_id, user_id, date_key)
);

create table public.group_activity (
  id uuid default gen_random_uuid() primary key,
  group_id uuid references public.groups(id),
  type text,
  message text,
  created_at timestamptz default now()
);

create table public.content_items (
  id uuid default gen_random_uuid() primary key,
  type text check (type in ('podcast', 'video', 'music')),
  title text not null,
  description text,
  cover_url text,
  media_url text,
  is_live boolean default false,
  created_at timestamptz default now(),
  play_count int default 0
);

-- Enable Row Level Security (RLS) - Basic Policy Examples
alter table public.users enable row level security;
create policy "Users can view their own profile" on public.users for select using (auth.uid() = id);
create policy "Users can update their own profile" on public.users for update using (auth.uid() = id);
create policy "Users can insert their own profile" on public.users for insert with check (auth.uid() = id);

-- (Add policies for other tables as needed)
