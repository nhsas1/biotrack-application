create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default 'Researcher',
  role text not null default 'Biomedical Researcher',
  laboratory text not null default 'BioTrack Research Lab',
  created_at timestamptz not null default timezone('utc', now())
);

create table public.samples (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  sample_code text not null,
  sample_type text not null check (sample_type in ('Blood', 'DNA', 'RNA', 'Tissue')),
  collection_date date not null default current_date,
  status text not null default 'Stored' check (status in ('Stored', 'Processing', 'Completed')),
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  constraint samples_sample_code_owner_unique unique (owner_id, sample_code),
  constraint samples_sample_code_not_blank check (char_length(trim(sample_code)) between 2 and 80)
);

create table public.experiments (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  experiment_type text not null,
  status text not null default 'Planned' check (status in ('Planned', 'In Progress', 'Completed')),
  progress integer not null default 0 check (progress between 0 and 100),
  description text,
  created_at timestamptz not null default timezone('utc', now()),
  constraint experiments_title_not_blank check (char_length(trim(title)) between 2 and 120),
  constraint experiments_type_not_blank check (char_length(trim(experiment_type)) between 2 and 120)
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), 'Researcher')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.samples enable row level security;
alter table public.experiments enable row level security;

revoke all on table public.profiles, public.samples, public.experiments from anon;
grant select, insert, update, delete on table public.profiles, public.samples, public.experiments to authenticated;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own
on public.profiles for select
to authenticated
using (auth.uid() = id);

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own
on public.profiles for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists profiles_delete_own on public.profiles;
create policy profiles_delete_own
on public.profiles for delete
to authenticated
using (auth.uid() = id);

drop policy if exists samples_select_own on public.samples;
create policy samples_select_own
on public.samples for select
to authenticated
using (auth.uid() = owner_id);

drop policy if exists samples_insert_own on public.samples;
create policy samples_insert_own
on public.samples for insert
to authenticated
with check (auth.uid() = owner_id);

drop policy if exists samples_update_own on public.samples;
create policy samples_update_own
on public.samples for update
to authenticated
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

drop policy if exists samples_delete_own on public.samples;
create policy samples_delete_own
on public.samples for delete
to authenticated
using (auth.uid() = owner_id);

 drop policy if exists experiments_select_own on public.experiments;
create policy experiments_select_own
on public.experiments for select
to authenticated
using (auth.uid() = owner_id);

drop policy if exists experiments_insert_own on public.experiments;
create policy experiments_insert_own
on public.experiments for insert
to authenticated
with check (auth.uid() = owner_id);

drop policy if exists experiments_update_own on public.experiments;
create policy experiments_update_own
on public.experiments for update
to authenticated
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

drop policy if exists experiments_delete_own on public.experiments;
create policy experiments_delete_own
on public.experiments for delete
to authenticated
using (auth.uid() = owner_id);
