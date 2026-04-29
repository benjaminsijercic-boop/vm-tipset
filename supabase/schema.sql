-- VM-tipset 2026 schema
create extension if not exists pgcrypto;

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  name text,
  role text not null default 'participant' check (role in ('participant','admin')),
  created_at timestamptz not null default now()
);

create table if not exists teams (
  id bigserial primary key,
  name text not null unique
);

create table if not exists picks (
  user_id uuid primary key references profiles(id) on delete cascade,
  group_picks jsonb not null default '{}'::jsonb,
  knockout_picks jsonb not null default '{}'::jsonb,
  bonus_picks jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists actual_results (
  id int primary key default 1 check (id = 1),
  group_results jsonb not null default '{}'::jsonb,
  knockout_results jsonb not null default '{}'::jsonb,
  bonus_results jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

insert into actual_results(id) values (1) on conflict do nothing;

insert into teams(name) values
('Argentina'),('Frankrike'),('Spanien'),('England'),('Brasilien'),('Tyskland'),('Portugal'),('Nederländerna'),('Belgien'),('Italien'),('Kroatien'),('Uruguay'),('Colombia'),('Mexiko'),('USA'),('Kanada'),('Japan'),('Sydkorea'),('Marocko'),('Senegal'),('Ghana'),('Nigeria'),('Sverige'),('Danmark'),('Norge'),('Schweiz'),('Österrike'),('Polen'),('Turkiet'),('Serbien'),('Australien'),('Iran'),('Saudiarabien'),('Qatar'),('Egypten'),('Tunisien'),('Kamerun'),('Chile'),('Peru'),('Ecuador'),('Paraguay'),('Costa Rica'),('Panama'),('Jamaica'),('Skottland'),('Wales'),('Tjeckien'),('Ukraina')
on conflict (name) do nothing;

create or replace function score_json_array(picks jsonb, actual jsonb, stage text, pts int)
returns int language sql immutable as $$
  select coalesce(count(*)::int * pts, 0)
  from jsonb_array_elements_text(coalesce(picks -> stage, '[]'::jsonb)) p(team)
  where p.team in (select jsonb_array_elements_text(coalesce(actual -> stage, '[]'::jsonb)))
$$;

create or replace function score_group_results(picks jsonb, actual jsonb)
returns int language plpgsql immutable as $$
declare
  total int := 0;
  g text;
  pick_team text;
  pick_pos int;
  actual_pos int;
begin
  for g in select jsonb_object_keys(picks) loop
    pick_pos := 0;
    for pick_team in select jsonb_array_elements_text(coalesce(picks -> g, '[]'::jsonb)) loop
      pick_pos := pick_pos + 1;
      select idx into actual_pos
      from jsonb_array_elements_text(coalesce(actual -> g, '[]'::jsonb)) with ordinality a(team, idx)
      where a.team = pick_team;
      if actual_pos is not null then
        if actual_pos = pick_pos then total := total + 5;
        else total := total + 3;
        end if;
      end if;
      actual_pos := null;
    end loop;
  end loop;
  return total;
end;
$$;

create or replace function score_bonus_results(picks jsonb, actual jsonb)
returns int language sql immutable as $$
  select coalesce(count(*)::int * 5, 0)
  from jsonb_each_text(actual) a
  join jsonb_each_text(picks) p on p.key = a.key and lower(trim(p.value)) = lower(trim(a.value))
$$;

create or replace view leaderboard as
select
  pr.name,
  pr.email,
  coalesce(score_group_results(p.group_picks, ar.group_results), 0)
  + coalesce(score_json_array(p.knockout_picks, ar.knockout_results, 'quarter_finalists', 2), 0)
  + coalesce(score_json_array(p.knockout_picks, ar.knockout_results, 'semi_finalists', 5), 0)
  + coalesce(score_json_array(p.knockout_picks, ar.knockout_results, 'finalists', 10), 0)
  + coalesce(score_json_array(p.knockout_picks, ar.knockout_results, 'winner', 15), 0)
  + coalesce(score_bonus_results(p.bonus_picks, ar.bonus_results), 0) as points
from profiles pr
left join picks p on p.user_id = pr.id
cross join actual_results ar;

alter table profiles enable row level security;
alter table teams enable row level security;
alter table picks enable row level security;
alter table actual_results enable row level security;

create policy "Profiles are visible" on profiles for select using (true);
create policy "Users upsert own profile" on profiles for insert with check (auth.uid() = id);
create policy "Users update own profile" on profiles for update using (auth.uid() = id);

create policy "Teams are visible" on teams for select using (true);

create policy "Users read own picks" on picks for select using (auth.uid() = user_id);
create policy "Users upsert own picks" on picks for insert with check (auth.uid() = user_id);
create policy "Users update own picks" on picks for update using (auth.uid() = user_id);

create policy "Actual results visible" on actual_results for select using (true);
create policy "Admins update actual results" on actual_results for update using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Admins insert actual results" on actual_results for insert with check (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

grant usage on schema public to anon, authenticated;
grant select on teams, leaderboard, profiles, actual_results to anon, authenticated;
grant select, insert, update on picks to authenticated;
grant insert, update on profiles to authenticated;
grant update, insert on actual_results to authenticated;
