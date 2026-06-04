-- ============================================================
-- SUB 1:28 — Supabase Schema
-- Kør dette i Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- LOGS: Alle træningspas logget i appen
CREATE TABLE IF NOT EXISTS logs (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date             DATE NOT NULL,
  type             TEXT,
  km               NUMERIC(6,2),
  time_str         TEXT,        -- "mm:ss" eller "h:mm:ss"
  hr               INTEGER,
  cadence          INTEGER,
  rpe              INTEGER,
  hrv              INTEGER,
  pain             INTEGER,
  pain_location    TEXT,
  notes            TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "logs_own" ON logs
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- PROFILE: Én række per bruger — gemmer hele profil-objektet som JSON
CREATE TABLE IF NOT EXISTS profile (
  user_id          UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  data             JSONB NOT NULL DEFAULT '{}',
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profile ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profile_own" ON profile
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- COMPLETED_WORKOUTS: Gemmer hvilke planlagte pas der er markeret som gennemført
-- key = "wk1-mon", "wk3-thu" osv.
CREATE TABLE IF NOT EXISTS completed_workouts (
  user_id          UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  key              TEXT NOT NULL,
  PRIMARY KEY (user_id, key)
);

ALTER TABLE completed_workouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "completed_own" ON completed_workouts
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
