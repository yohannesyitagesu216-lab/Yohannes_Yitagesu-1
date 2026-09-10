-- Run this migration in the Supabase SQL editor.
create table if not exists public.academy_progress (
  user_id text not null references public.users(id) on delete cascade,
  lesson_id text not null,
  course_id text not null,
  completed boolean not null default false,
  quiz_score integer,
  last_visited_at timestamptz not null default now(),
  completed_at timestamptz,
  primary key (user_id, lesson_id)
);

create index if not exists academy_progress_user_course_idx
  on public.academy_progress(user_id, course_id);

-- Minimal user-owned farm context used by the authenticated AI Assistant.
create table if not exists public.farm_profiles (
  user_id text primary key references public.users(id) on delete cascade,
  farm_name text not null,
  farm_location text not null,
  latitude double precision not null,
  longitude double precision not null,
  region text,
  city text,
  country text,
  updated_at timestamptz not null default now(),
  constraint farm_profiles_latitude_range check (latitude between -90 and 90),
  constraint farm_profiles_longitude_range check (longitude between -180 and 180)
);

alter table public.predictions add column if not exists symptoms text;
alter table public.predictions add column if not exists causes text;
alter table public.predictions add column if not exists next_actions text;
alter table public.predictions add column if not exists chemical_safety text;

alter table public.academy_progress enable row level security;

-- The backend uses the Supabase service key, so no client policy is required.
-- Add authenticated policies here if this table is later accessed directly by the frontend.
