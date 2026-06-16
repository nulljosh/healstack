create table if not exists dose_profiles (
  id uuid references auth.users on delete cascade primary key,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table dose_profiles enable row level security;

create policy "own dose profile"
  on dose_profiles
  for all
  using (auth.uid() = id)
  with check (auth.uid() = id);
