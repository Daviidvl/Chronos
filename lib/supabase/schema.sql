-- Chronos Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users profile (extends auth.users)
create table public.profiles (
  id uuid references auth.users primary key,
  name text not null default 'Usuário',
  avatar_url text,
  level int not null default 1,
  xp int not null default 0,
  created_at timestamptz default now()
);

-- Habits
create table public.habits (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  category text not null default 'health',
  frequency text not null default 'daily',
  target_per_week int not null default 7,
  icon text not null default '💪',
  color text not null default '#5E6AD2',
  archived boolean default false,
  created_at timestamptz default now()
);

-- Habit logs
create table public.habit_logs (
  id uuid primary key default uuid_generate_v4(),
  habit_id uuid references public.habits(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  date date not null,
  completed boolean default true,
  skipped boolean default false,
  note text,
  created_at timestamptz default now(),
  unique(habit_id, date)
);

-- Tasks
create table public.tasks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  priority text not null default 'medium',
  category text not null default 'personal',
  due_date date,
  completed boolean default false,
  completed_at timestamptz,
  important boolean default false,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- Goals
create table public.goals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  category text not null default 'health',
  priority text not null default 'medium',
  deadline date,
  progress int default 0,
  notes text,
  archived boolean default false,
  created_at timestamptz default now()
);

-- Goal milestones
create table public.goal_milestones (
  id uuid primary key default uuid_generate_v4(),
  goal_id uuid references public.goals(id) on delete cascade not null,
  title text not null,
  completed boolean default false,
  sort_order int default 0
);

-- Goal <-> Habit relations
create table public.goal_habit_relations (
  goal_id uuid references public.goals(id) on delete cascade,
  habit_id uuid references public.habits(id) on delete cascade,
  primary key (goal_id, habit_id)
);

-- Calendar events
create table public.calendar_events (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  start_time time not null,
  end_time time,
  date date not null,
  category text not null default 'personal',
  color text,
  all_day boolean default false,
  created_at timestamptz default now()
);

-- Journal entries
create table public.journal_entries (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  date date not null,
  content text default '',
  mood text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, date)
);

-- Achievements
create table public.achievements (
  id text primary key,
  name text not null,
  description text not null,
  icon text not null,
  xp_reward int not null default 0
);

-- User achievements
create table public.user_achievements (
  user_id uuid references public.profiles(id) on delete cascade,
  achievement_id text references public.achievements(id),
  earned_at timestamptz default now(),
  primary key (user_id, achievement_id)
);

-- RLS Policies
alter table public.profiles enable row level security;
alter table public.habits enable row level security;
alter table public.habit_logs enable row level security;
alter table public.tasks enable row level security;
alter table public.goals enable row level security;
alter table public.goal_milestones enable row level security;
alter table public.calendar_events enable row level security;
alter table public.journal_entries enable row level security;
alter table public.user_achievements enable row level security;

-- Profile policy: users can only see and edit their own
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Habits policies
create policy "Users can CRUD own habits" on public.habits for all using (auth.uid() = user_id);
create policy "Users can CRUD own logs" on public.habit_logs for all using (auth.uid() = user_id);
create policy "Users can CRUD own tasks" on public.tasks for all using (auth.uid() = user_id);
create policy "Users can CRUD own goals" on public.goals for all using (auth.uid() = user_id);
create policy "Users can CRUD own events" on public.calendar_events for all using (auth.uid() = user_id);
create policy "Users can CRUD own journal" on public.journal_entries for all using (auth.uid() = user_id);
create policy "Users can view own achievements" on public.user_achievements for select using (auth.uid() = user_id);
create policy "System inserts achievements" on public.user_achievements for insert with check (auth.uid() = user_id);

-- Goal milestones: accessible if parent goal is owned
create policy "Users can CRUD own milestones" on public.goal_milestones
  for all using (
    exists (select 1 from public.goals where goals.id = goal_milestones.goal_id and goals.user_id = auth.uid())
  );

-- Achievements are public readable
alter table public.achievements enable row level security;
create policy "Anyone can read achievements" on public.achievements for select using (true);

-- Insert default achievements
insert into public.achievements (id, name, description, icon, xp_reward) values
  ('a1', 'Primeiro Passo', 'Complete seu primeiro hábito', '👣', 25),
  ('a2', 'Semana Perfeita', 'Complete todos hábitos por 7 dias seguidos', '🔥', 50),
  ('a3', 'Mês de Ouro', '30 dias de streak', '🏆', 200),
  ('a4', 'Centenário', '100 dias de streak', '💎', 500),
  ('a5', 'Escritor', 'Escreva 10 entradas no diário', '✍️', 75),
  ('a6', 'Realizador', 'Conclua 100 tarefas', '✅', 100),
  ('a7', 'Visionário', 'Conclua sua primeira meta', '🎯', 100),
  ('a8', 'Mestre das Metas', 'Conclua 10 metas', '🌟', 500),
  ('a9', 'Madrugador', 'Complete 30 hábitos antes das 8h', '🌅', 75),
  ('a10', 'Equilibrado', 'Complete hábitos de 5 categorias diferentes', '⚖️', 100);

-- Trigger: auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer
as $$
begin
  insert into public.profiles (id, name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
