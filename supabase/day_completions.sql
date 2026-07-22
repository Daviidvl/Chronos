-- Run this in the Supabase SQL Editor

CREATE TABLE IF NOT EXISTS day_completions (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    uuid        REFERENCES auth.users NOT NULL,
  date       date        NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, date)
);

ALTER TABLE day_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own day completions"
  ON day_completions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
