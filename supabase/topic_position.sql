-- Run this in the Supabase SQL Editor
-- Adds manual ordering support for topics (drag-to-reorder within a subject's day).

ALTER TABLE topics ADD COLUMN IF NOT EXISTS position integer NOT NULL DEFAULT 0;

-- Backfill existing rows so current order (by creation time, within each
-- subject+day group) is preserved once the app starts sorting by position.
WITH ranked AS (
  SELECT id, row_number() OVER (
    PARTITION BY subject_id, day_of_week ORDER BY created_at
  ) - 1 AS rn
  FROM topics
)
UPDATE topics t
SET position = ranked.rn
FROM ranked
WHERE t.id = ranked.id;
