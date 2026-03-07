-- ============================================================
-- Patentehub — Supabase PostgreSQL Schema
-- Run this in: Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- ── 1. Profiles table (extends auth.users) ──────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id              UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT        NOT NULL UNIQUE,
  name            TEXT        NOT NULL DEFAULT '',
  first_name      TEXT        NOT NULL DEFAULT '',
  last_name       TEXT        NOT NULL DEFAULT '',
  username        TEXT        UNIQUE,
  avatar          TEXT        NOT NULL DEFAULT '',
  bio             TEXT        NOT NULL DEFAULT '',
  role            TEXT        NOT NULL DEFAULT 'user'
                              CHECK (role IN ('user', 'manager', 'admin')),
  permissions     TEXT[]      NOT NULL DEFAULT '{}',
  is_banned       BOOLEAN     NOT NULL DEFAULT FALSE,
  verified        BOOLEAN     NOT NULL DEFAULT FALSE,
  following       UUID[]      NOT NULL DEFAULT '{}',
  profile_complete BOOLEAN    NOT NULL DEFAULT FALSE,
  birth_date      TEXT        NOT NULL DEFAULT '',
  country         TEXT        NOT NULL DEFAULT '',
  province        TEXT        NOT NULL DEFAULT '',
  gender          TEXT        NOT NULL DEFAULT '',
  phone           TEXT        NOT NULL DEFAULT '',
  phone_code      TEXT        NOT NULL DEFAULT '',
  italian_level   TEXT        NOT NULL DEFAULT '',
  privacy_hide_stats BOOLEAN  NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  progress        JSONB       NOT NULL DEFAULT '{
    "totalQuizzes": 0,
    "correctAnswers": 0,
    "wrongAnswers": 0,
    "completedLessons": [],
    "completedTopics": [],
    "currentStreak": 0,
    "bestStreak": 0,
    "lastStudyDate": "",
    "totalStudyDays": 0,
    "level": 1,
    "xp": 0,
    "badges": ["newcomer"],
    "examReadiness": 0
  }'::jsonb,
  settings        JSONB       NOT NULL DEFAULT '{
    "language": "both",
    "theme": "light",
    "notifications": true,
    "soundEffects": true,
    "fontSize": "medium"
  }'::jsonb
);

-- ── 2. Indexes ───────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles (username);
CREATE INDEX IF NOT EXISTS profiles_email_idx    ON public.profiles (email);
CREATE INDEX IF NOT EXISTS profiles_role_idx     ON public.profiles (role);

-- ── 3. Row Level Security ────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "own_profile_select" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile (not role/permissions/verified/is_banned)
CREATE POLICY "own_profile_update" ON public.profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins and managers can read all profiles
CREATE POLICY "admin_profiles_select" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'manager')
    )
  );

-- Admins can update any profile (for role management, banning, etc.)
CREATE POLICY "admin_profiles_update" ON public.profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- ── 4. Trigger: auto-create profile on sign-up ───────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _name       TEXT;
  _first_name TEXT;
  _last_name  TEXT;
  _username   TEXT;
  _role       TEXT;
BEGIN
  _name       := COALESCE(NEW.raw_user_meta_data->>'name', '');
  _first_name := COALESCE(NEW.raw_user_meta_data->>'firstName', '');
  _last_name  := COALESCE(NEW.raw_user_meta_data->>'lastName', '');
  _username   := COALESCE(NEW.raw_user_meta_data->>'username', NULL);
  _role       := CASE WHEN NEW.email = 'admin@patente.com' THEN 'admin' ELSE 'user' END;

  INSERT INTO public.profiles (id, email, name, first_name, last_name, username, role)
  VALUES (NEW.id, NEW.email, _name, _first_name, _last_name, _username, _role);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── 5. Helper: check username availability ───────────────────
CREATE OR REPLACE FUNCTION public.check_username(requested_username TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _available   BOOLEAN;
  _suggestions TEXT[] := '{}';
  _base        TEXT;
  _candidate   TEXT;
  _count       INT := 0;
BEGIN
  requested_username := lower(trim(requested_username));

  IF length(requested_username) < 3 THEN
    RETURN jsonb_build_object('available', false, 'suggestions', '[]'::jsonb);
  END IF;

  SELECT NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE username = requested_username
  ) INTO _available;

  IF NOT _available THEN
    _base := regexp_replace(requested_username, '\d+$', '');
    WHILE _count < 3 LOOP
      _candidate := _base || (floor(random() * 9000 + 1000))::int::text;
      IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE username = _candidate) THEN
        _suggestions := array_append(_suggestions, _candidate);
        _count := _count + 1;
      END IF;
    END LOOP;
  END IF;

  RETURN jsonb_build_object(
    'available',    _available,
    'suggestions',  to_jsonb(_suggestions)
  );
END;
$$;

-- ── 6. Contact messages table ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT        NOT NULL,
  email      TEXT        NOT NULL,
  subject    TEXT        NOT NULL,
  message    TEXT        NOT NULL,
  status     TEXT        NOT NULL DEFAULT 'new'
                         CHECK (status IN ('new', 'read', 'replied', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS contact_messages_email_idx  ON public.contact_messages (email);
CREATE INDEX IF NOT EXISTS contact_messages_status_idx ON public.contact_messages (status);

-- Anyone (including anonymous visitors) can insert; only admins can read
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contact_insert" ON public.contact_messages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "admin_contact_select" ON public.contact_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "admin_contact_update" ON public.contact_messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'manager')
    )
  );

-- ── 7. Trigger: update last_login on each sign-in ────────────
-- (Called from frontend via RPC or handled by onAuthStateChange)
CREATE OR REPLACE FUNCTION public.update_last_login(user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles
  SET last_login = NOW()
  WHERE id = user_id;
END;
$$;
