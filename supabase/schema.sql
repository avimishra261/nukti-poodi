-- Nukti Poodi (Indore Bhandara Finder) - Supabase Postgres Schema + RLS

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  avatar_url text,
  is_admin boolean not null default false,
  is_banned boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.bhandaras (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references public.profiles(id) on delete set null,
  title text not null check (char_length(title) >= 3),
  organizer_name text,
  food_items text[] not null default '{}',
  description text,
  area text not null,
  address text not null,
  landmark text not null,
  lat double precision not null,
  lng double precision not null,
  start_time timestamptz not null,
  end_time timestamptz not null check (
    end_time > start_time and end_time <= start_time + interval '24 hours'
  ),
  photo_url text,
  is_verified boolean not null default false,
  is_hidden boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.votes (
  bhandara_id uuid not null references public.bhandaras(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('chal_raha', 'khatam', 'fake')),
  created_at timestamptz not null default now(),
  primary key (bhandara_id, user_id)
);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.bhandaras enable row level security;
alter table public.votes enable row level security;

-- Public read for visible bhandaras
create policy "Anyone can view visible bhandaras"
  on public.bhandaras for select
  using (is_hidden = false);

-- Authenticated non-banned users can insert (max 5/day enforced via trigger)
create policy "Authenticated users can post bhandaras"
  on public.bhandaras for insert
  with check (
    auth.uid() = created_by
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_banned = false
    )
  );

-- Owner or admin can update/delete
create policy "Owner or admin can update bhandaras"
  on public.bhandaras for update
  using (
    auth.uid() = created_by
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  );

-- Daily 5-post rate limit trigger
create or replace function public.enforce_daily_bhandara_limit()
returns trigger as $$
begin
  if (
    select count(*) from public.bhandaras
    where created_by = new.created_by
      and created_at >= now() - interval '24 hours'
  ) >= 5 then
    raise exception 'Daily limit of 5 bhandara posts reached';
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_daily_bhandara_limit on public.bhandaras;
create trigger trg_daily_bhandara_limit
  before insert on public.bhandaras
  for each row execute function public.enforce_daily_bhandara_limit();

-- Auto-hide on >= 3 fake reports
create or replace function public.auto_moderate_bhandara()
returns trigger as $$
begin
  if (
    select count(*) from public.votes
    where bhandara_id = new.bhandara_id and type = 'fake'
  ) >= 3 then
    update public.bhandaras set is_hidden = true where id = new.bhandara_id;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_auto_moderate on public.votes;
create trigger trg_auto_moderate
  after insert or update on public.votes
  for each row execute function public.auto_moderate_bhandara();
