-- Run this in the Supabase SQL editor.

-- 1) Per-exercise weight increment.
--    The amount you want to automatically progress an exercise by each session.
--    Defaults to 5 (lb). Existing exercises get 5 as well.
alter table public.exercises
  add column if not exists increment numeric not null default 5;

-- 2) Default new users to pounds.
alter table public.profiles
  alter column unit_preference set default 'lb';

-- 3) Default new body-weight logs to pounds.
alter table public.body_weight_logs
  alter column unit set default 'lb';
