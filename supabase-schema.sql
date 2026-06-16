-- ============================================================
-- 크리에이타이 - Supabase Database Schema
-- ============================================================

create extension if not exists "uuid-ossp";

-- PROFILES TABLE
create table if not exists profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  nickname text not null check (char_length(nickname) <= 16),
  avatar_config jsonb default '{}',
  points integer default 0 check (points >= 0),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table profiles enable rowlevel security;
create policy "profiles_view_all" on profiles for select using (true);
create policy "profiles_update_own" on profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles_insert_self" on profiles for insert with check (auth.uid() = id);

-- IMAGES TABLE
create table if not exists images (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null check (char_length(title) <= 100),
  category text not null check (category in ('animal', 'person', 'object')),
  url text not null,
  likes integer default 0 check (likes >= 0),
  reactions jsonb default '{}'::jsonb,
  comment_count integer default 0 check (comment_count >= 0),
  prompt text,
  created_at timestamptz default now()
);

alter table images enable rowlevel security;
create policy "images_view_all" on images for select using (true);
create policy "images_insert_own" on images for insert with check (auth.uid() = user_id);
create policy "images_update_own" on images for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "images_delete_own" on images for delete using (auth.uid() = user_id);

-- COMMENTS TABLE
create table if not exists comments (
  id uuid default gen_random_uuid() primary key,
  image_id uuid references images(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  content text not null check (char_length(content) <= 1000),
  created_at timestamptz default now()
);

alter table comments enable rowlevel security;
create policy "comments_view_all" on comments for select using (true);
create policy "comments_insert" on comments for insert with check (auth.uid() = user_id);
create policy "comments_delete_own" on comments for delete using (auth.uid() = user_id);

-- REACTIONS TABLE
create table if not exists reactions (
  id uuid default gen_random_uuid() primary key,
  image_id uuid references images(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  emoji text not null check (char_length(emoji) <= 10),
  created_at timestamptz default now(),
  unique(image_id, user_id, emoji)
);

alter table reactions enable rowlevel security;
create policy "reactions_view_all" on reactions for select using (true);
create policy "reactions_insert" on reactions for insert with check (auth.uid() = user_id);
create policy "reactions_delete" on reactions for delete using (auth.uid() = user_id);

-- LIKES TABLE
create table if not exists likes (
  id uuid default gen_random_uuid() primary key,
  image_id uuid references images(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(image_id, user_id)
);

alter table likes enable rowlevel security;
create policy "likes_view" on likes for select using (true);
create policy "likes_insert" on likes for insert with check (auth.uid() = user_id);
create policy "likes_delete" on likes for delete using (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, nickname)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'nickname', 'User' || substr(replace(uuid_generate_v4()::text, '-', ''), 0, 5)));
exception when unique_violation then null; end;
$$;

create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
grant select, insert, update, delete on all tables in schema public to postgres;
grant select, insert, update, delete on all tables in schema public to authenticated;