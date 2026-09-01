-- Run this in the Supabase SQL Editor
-- Adds morning/night grouping for topics within a day (no clock time, just manhã/noite).

ALTER TABLE topics ADD COLUMN IF NOT EXISTS period text NOT NULL DEFAULT 'manha'
  CHECK (period IN ('manha', 'noite'));
