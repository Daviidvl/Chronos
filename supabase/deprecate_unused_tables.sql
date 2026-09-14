-- Run this in the Supabase SQL Editor
-- Quarantine step (audit cleanup, Fase 3) — renames tables that have zero
-- references anywhere in the current codebase to _deprecated_<name>,
-- instead of dropping them outright. Data is fully preserved; nothing in
-- the app reads from the new name, so this should have no visible effect.
-- Confirmed via `grep -rn ".from('<table>')" app components lib src`.
--
-- Tables covered (all leftovers from removed features — Hábitos, Metas,
-- Diário, Flashcards, Conquistas, Tarefas/Categorias, Calendário/Rotina):
--   habits, habit_logs, goals, goal_milestones, goal_habit_relations,
--   journal_entries, flashcards, achievements, user_achievements,
--   tasks, categories, calendar_events
--
-- `profiles` was in the original candidate list (zero frontend references)
-- but the preflight query below found it's NOT actually orphaned: the
-- `handle_new_user` trigger function does
--   insert into public.profiles (id, name) values (new.id, ...)
-- on every signup (auth.users insert trigger). Renaming it would break
-- signup, so it's excluded here — do not add it back without also
-- updating/removing that trigger first.

-- Preflight — run this first to check whether any Postgres function/trigger
-- references these tables outside the app's own code. If this returns
-- rows, read them before proceeding — a trigger relying on one of these
-- tables would start failing silently once it's renamed.
--
-- select proname, prosrc from pg_proc
-- where prosrc ~* 'habits|habit_logs|goals|goal_milestones|goal_habit_relations|journal_entries|flashcards|achievements|user_achievements|tasks|categories|calendar_events';

ALTER TABLE habits               RENAME TO _deprecated_habits;
ALTER TABLE habit_logs           RENAME TO _deprecated_habit_logs;
ALTER TABLE goals                RENAME TO _deprecated_goals;
ALTER TABLE goal_milestones      RENAME TO _deprecated_goal_milestones;
ALTER TABLE goal_habit_relations RENAME TO _deprecated_goal_habit_relations;
ALTER TABLE journal_entries      RENAME TO _deprecated_journal_entries;
ALTER TABLE flashcards           RENAME TO _deprecated_flashcards;
ALTER TABLE achievements         RENAME TO _deprecated_achievements;
ALTER TABLE user_achievements    RENAME TO _deprecated_user_achievements;
ALTER TABLE tasks                RENAME TO _deprecated_tasks;
ALTER TABLE categories           RENAME TO _deprecated_categories;
ALTER TABLE calendar_events      RENAME TO _deprecated_calendar_events;

-- Next step (separate migration, only after you've used the app for a
-- while with no issues): DROP TABLE _deprecated_<name> for each one above.
-- Not included here on purpose — that step is destructive and irreversible.
