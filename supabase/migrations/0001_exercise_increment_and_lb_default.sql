-- Run this in the Supabase SQL editor.

-- 1) Per-session-exercise weight increment.
--    The amount you want to automatically progress this exercise by each
--    session. Set it in the session editor. Defaults to 5.
alter table public.session_exercises
  add column if not exists increment numeric not null default 5;

-- If an earlier version added the increment on exercises, remove it so there
-- is a single source of truth on the session exercise.
alter table public.exercises
  drop column if exists increment;

-- 2) Default new users to pounds.
alter table public.profiles
  alter column unit_preference set default 'lb';

-- 3) Default new body-weight logs to pounds.
alter table public.body_weight_logs
  alter column unit set default 'lb';
