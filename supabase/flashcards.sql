-- Run this in the Supabase SQL Editor

CREATE TABLE IF NOT EXISTS flashcards (
  id              uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         uuid        REFERENCES auth.users NOT NULL,
  topic_id        uuid        REFERENCES topics(id) ON DELETE CASCADE NOT NULL,
  question        text        NOT NULL,
  answer          text        NOT NULL,
  review_interval integer     DEFAULT 1,
  review_date     date        DEFAULT CURRENT_DATE,
  created_at      timestamptz DEFAULT now()
);

ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own flashcards"
  ON flashcards FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
