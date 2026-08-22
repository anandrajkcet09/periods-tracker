-- ==============================================================================
-- Aura Period Tracker: Supabase Database Schema & Row Level Security (RLS)
-- Phase 2, Phase 3 & Phase 4: Profiles, Cycles, Symptoms, and Authentication
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. PROFILES TABLE (Phase 2)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

  -- Constraint: Username must be 3-20 characters, alphanumeric and underscore only
  CONSTRAINT username_length_check CHECK (char_length(username) >= 3 AND char_length(username) <= 20),
  CONSTRAINT username_format_check CHECK (username ~ '^[a-zA-Z0-9_]+$')
);

CREATE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles(username);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Function: Check username availability
CREATE OR REPLACE FUNCTION public.is_username_available(check_username TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  exists_count INTEGER;
BEGIN
  IF check_username IS NULL OR NOT (check_username ~ '^[a-zA-Z0-9_]{3,20}$') THEN
    RETURN FALSE;
  END IF;

  SELECT COUNT(*) INTO exists_count
  FROM public.profiles
  WHERE LOWER(username) = LOWER(check_username);

  RETURN exists_count = 0;
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_username_available(TEXT) TO anon, authenticated;

-- Function: Handle user registration trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  desired_username TEXT;
  final_username TEXT;
  counter INTEGER := 0;
BEGIN
  desired_username := NEW.raw_user_meta_data->>'username';

  IF desired_username IS NULL OR NOT (desired_username ~ '^[a-zA-Z0-9_]{3,20}$') THEN
    desired_username := 'user_' || substr(NEW.id::text, 1, 8);
  END IF;

  final_username := desired_username;

  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE LOWER(username) = LOWER(final_username)) LOOP
    counter := counter + 1;
    final_username := desired_username || '_' || counter;
  END LOOP;

  INSERT INTO public.profiles (id, username, created_at, updated_at)
  VALUES (NEW.id, final_username, timezone('utc'::text, now()), timezone('utc'::text, now()))
  ON CONFLICT (id) DO UPDATE
  SET username = EXCLUDED.username,
      updated_at = timezone('utc'::text, now());

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_profile_updated()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_profile_updated();


-- ------------------------------------------------------------------------------
-- 2. CYCLES TABLE (Phase 3)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE,
  cycle_length INTEGER,
  period_duration INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

  -- Validation constraints
  CONSTRAINT end_date_after_start CHECK (end_date IS NULL OR end_date >= start_date),
  CONSTRAINT cycle_length_range CHECK (cycle_length IS NULL OR (cycle_length >= 15 AND cycle_length <= 60)),
  CONSTRAINT period_duration_positive CHECK (period_duration IS NULL OR period_duration >= 1)
);

CREATE INDEX IF NOT EXISTS cycles_user_id_idx ON public.cycles(user_id);
CREATE INDEX IF NOT EXISTS cycles_user_start_date_idx ON public.cycles(user_id, start_date DESC);

ALTER TABLE public.cycles ENABLE ROW LEVEL SECURITY;

-- Cycles RLS Policies: Complete user data isolation
DROP POLICY IF EXISTS "Users can read own cycles" ON public.cycles;
CREATE POLICY "Users can read own cycles"
  ON public.cycles FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own cycles" ON public.cycles;
CREATE POLICY "Users can insert own cycles"
  ON public.cycles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own cycles" ON public.cycles;
CREATE POLICY "Users can update own cycles"
  ON public.cycles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own cycles" ON public.cycles;
CREATE POLICY "Users can delete own cycles"
  ON public.cycles FOR DELETE
  USING (auth.uid() = user_id);

-- Auto-update updated_at timestamp on cycles update
CREATE OR REPLACE FUNCTION public.handle_cycles_updated()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_cycles_updated_at ON public.cycles;
CREATE TRIGGER set_cycles_updated_at
  BEFORE UPDATE ON public.cycles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_cycles_updated();


-- ------------------------------------------------------------------------------
-- 3. SYMPTOMS TABLE (Phase 4)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.symptoms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cycle_id UUID REFERENCES public.cycles(id) ON DELETE SET NULL,
  symptom_date DATE NOT NULL,
  symptom TEXT NOT NULL,
  severity TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

  -- Severity constraint (optional, mild, moderate, severe)
  CONSTRAINT severity_check CHECK (severity IS NULL OR severity IN ('Mild', 'Moderate', 'Severe'))
);

CREATE INDEX IF NOT EXISTS symptoms_user_date_idx ON public.symptoms(user_id, symptom_date DESC);
CREATE INDEX IF NOT EXISTS symptoms_cycle_id_idx ON public.symptoms(cycle_id);

ALTER TABLE public.symptoms ENABLE ROW LEVEL SECURITY;

-- Symptoms RLS Policies: Complete user data isolation
DROP POLICY IF EXISTS "Users can read own symptoms" ON public.symptoms;
CREATE POLICY "Users can read own symptoms"
  ON public.symptoms FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own symptoms" ON public.symptoms;
CREATE POLICY "Users can insert own symptoms"
  ON public.symptoms FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own symptoms" ON public.symptoms;
CREATE POLICY "Users can update own symptoms"
  ON public.symptoms FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own symptoms" ON public.symptoms;
CREATE POLICY "Users can delete own symptoms"
  ON public.symptoms FOR DELETE
  USING (auth.uid() = user_id);

-- Auto-update updated_at timestamp on symptoms update
CREATE OR REPLACE FUNCTION public.handle_symptoms_updated()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_symptoms_updated_at ON public.symptoms;
CREATE TRIGGER set_symptoms_updated_at
  BEFORE UPDATE ON public.symptoms
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_symptoms_updated();

-- ------------------------------------------------------------------------------
-- 4. REMINDERS TABLE (Phase 6 & Phase 7)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  enabled BOOLEAN NOT NULL DEFAULT false,
  reminder_days_before INTEGER NOT NULL DEFAULT 2,
  reminder_time TIME NOT NULL DEFAULT '09:00:00',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

  CONSTRAINT reminder_days_check CHECK (reminder_days_before >= 1 AND reminder_days_before <= 14)
);

CREATE INDEX IF NOT EXISTS reminders_user_id_idx ON public.reminders(user_id);

ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

-- Reminders RLS Policies
DROP POLICY IF EXISTS "Users can read own reminders" ON public.reminders;
CREATE POLICY "Users can read own reminders"
  ON public.reminders FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own reminders" ON public.reminders;
CREATE POLICY "Users can insert own reminders"
  ON public.reminders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own reminders" ON public.reminders;
CREATE POLICY "Users can update own reminders"
  ON public.reminders FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own reminders" ON public.reminders;
CREATE POLICY "Users can delete own reminders"
  ON public.reminders FOR DELETE
  USING (auth.uid() = user_id);

-- Auto-update updated_at timestamp on reminders update
CREATE OR REPLACE FUNCTION public.handle_reminders_updated()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_reminders_updated_at ON public.reminders;
CREATE TRIGGER set_reminders_updated_at
  BEFORE UPDATE ON public.reminders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_reminders_updated();

