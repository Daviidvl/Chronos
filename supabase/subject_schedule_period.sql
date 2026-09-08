-- Run this in the Supabase SQL Editor
-- Lets a subject scheduled for a day (with no content yet) remember whether
-- it should show up under Manhã or Noite, so it can be switched from the
-- subject card before any conteúdo exists.

ALTER TABLE subject_schedules ADD COLUMN IF NOT EXISTS period text NOT NULL DEFAULT 'manha'
  CHECK (period IN ('manha', 'noite'));
