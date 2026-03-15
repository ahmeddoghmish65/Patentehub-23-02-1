-- ============================================================
-- PatenteHub — Supabase PostgreSQL Schema v2
-- Full normalized schema for production at scale
-- ============================================================
-- Run order:
--   1. supabase/schema_v2.sql           ← this file (full schema)
--   2. supabase/migrations/001_full_migration.sql  ← migrate JSON → tables
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 0. EXTENSIONS
-- ────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";      -- fuzzy text search
CREATE EXTENSION IF NOT EXISTS "btree_gin";    -- composite GIN indexes

-- ────────────────────────────────────────────────────────────
-- 0b. SHARED TRIGGER: auto-update updated_at column
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

-- ────────────────────────────────────────────────────────────
-- 1. PROFILES (existing — kept, progress JSONB preserved for
--    backward-compat during migration window, then deprecated)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id                 UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email              TEXT        NOT NULL UNIQUE,
  name               TEXT        NOT NULL DEFAULT '',
  first_name         TEXT        NOT NULL DEFAULT '',
  last_name          TEXT        NOT NULL DEFAULT '',
  username           TEXT        UNIQUE,
  avatar             TEXT        NOT NULL DEFAULT '',
  bio                TEXT        NOT NULL DEFAULT '',
  role               TEXT        NOT NULL DEFAULT 'user'
                                 CHECK (role IN ('user', 'manager', 'admin')),
  permissions        TEXT[]      NOT NULL DEFAULT '{}',
  is_banned          BOOLEAN     NOT NULL DEFAULT FALSE,
  verified           BOOLEAN     NOT NULL DEFAULT FALSE,
  following          UUID[]      NOT NULL DEFAULT '{}',
  profile_complete   BOOLEAN     NOT NULL DEFAULT FALSE,
  birth_date         TEXT        NOT NULL DEFAULT '',
  country            TEXT        NOT NULL DEFAULT '',
  province           TEXT        NOT NULL DEFAULT '',
  gender             TEXT        NOT NULL DEFAULT '',
  phone              TEXT        NOT NULL DEFAULT '',
  phone_code         TEXT        NOT NULL DEFAULT '',
  italian_level      TEXT        NOT NULL DEFAULT '',
  privacy_hide_stats BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- DEPRECATED: retained only during migration window (see 001_full_migration.sql)
  progress           JSONB       NOT NULL DEFAULT '{
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
  settings           JSONB       NOT NULL DEFAULT '{
    "language": "both",
    "theme": "light",
    "notifications": true,
    "soundEffects": true,
    "fontSize": "medium"
  }'::jsonb
);

CREATE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles (username);
CREATE INDEX IF NOT EXISTS profiles_email_idx    ON public.profiles (email);
CREATE INDEX IF NOT EXISTS profiles_role_idx     ON public.profiles (role);
CREATE INDEX IF NOT EXISTS profiles_country_idx  ON public.profiles (country);

-- ────────────────────────────────────────────────────────────
-- 2. CONTACT MESSAGES (existing — unchanged)
-- ────────────────────────────────────────────────────────────
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

-- ────────────────────────────────────────────────────────────
-- 3. LEARNING SYSTEM
-- ────────────────────────────────────────────────────────────

-- 3a. Modules (top-level groupings: Segnali, Norme, Veicolo…)
CREATE TABLE IF NOT EXISTS public.modules (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  code           TEXT        NOT NULL UNIQUE,           -- e.g. 'SEGNALI'
  title_it       TEXT        NOT NULL,
  title_ar       TEXT,
  description_it TEXT,
  description_ar TEXT,
  icon           TEXT,
  color          TEXT        NOT NULL DEFAULT '#3B82F6', -- hex brand colour
  sort_order     INT         NOT NULL DEFAULT 0,
  is_active      BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS modules_sort_idx     ON public.modules (sort_order);
CREATE INDEX IF NOT EXISTS modules_active_idx   ON public.modules (is_active);

-- 3b. Topics (sub-groupings within modules)
CREATE TABLE IF NOT EXISTS public.topics (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id      UUID        NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  code           TEXT        NOT NULL UNIQUE,
  title_it       TEXT        NOT NULL,
  title_ar       TEXT,
  description_it TEXT,
  description_ar TEXT,
  icon           TEXT,
  sort_order     INT         NOT NULL DEFAULT 0,
  is_active      BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS topics_module_idx  ON public.topics (module_id);
CREATE INDEX IF NOT EXISTS topics_sort_idx    ON public.topics (module_id, sort_order);
CREATE INDEX IF NOT EXISTS topics_active_idx  ON public.topics (is_active);

-- 3c. Lessons (individual learning units within topics)
CREATE TABLE IF NOT EXISTS public.lessons (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id            UUID        NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  code                TEXT        NOT NULL UNIQUE,
  title_it            TEXT        NOT NULL,
  title_ar            TEXT,
  content_it          JSONB,      -- structured content blocks (text, image, video)
  content_ar          JSONB,
  lesson_type         TEXT        NOT NULL DEFAULT 'theory'
                                  CHECK (lesson_type IN ('theory', 'video', 'interactive')),
  estimated_minutes   INT         NOT NULL DEFAULT 10 CHECK (estimated_minutes > 0),
  xp_reward           INT         NOT NULL DEFAULT 10 CHECK (xp_reward >= 0),
  sort_order          INT         NOT NULL DEFAULT 0,
  is_active           BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS lessons_topic_idx   ON public.lessons (topic_id);
CREATE INDEX IF NOT EXISTS lessons_sort_idx    ON public.lessons (topic_id, sort_order);
CREATE INDEX IF NOT EXISTS lessons_active_idx  ON public.lessons (is_active);

-- ────────────────────────────────────────────────────────────
-- 4. QUESTION BANK
-- ────────────────────────────────────────────────────────────

-- 4a. Questions
CREATE TABLE IF NOT EXISTS public.questions (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id        UUID        REFERENCES public.topics(id) ON DELETE SET NULL,
  external_id     TEXT        UNIQUE,   -- official Italian exam question code
  question_it     TEXT        NOT NULL,
  question_ar     TEXT,
  explanation_it  TEXT,
  explanation_ar  TEXT,
  image_url       TEXT,
  difficulty      TEXT        NOT NULL DEFAULT 'medium'
                              CHECK (difficulty IN ('easy', 'medium', 'hard')),
  tags            TEXT[]      NOT NULL DEFAULT '{}',
  is_active       BOOLEAN     NOT NULL DEFAULT TRUE,
  times_shown     INT         NOT NULL DEFAULT 0,
  times_correct   INT         NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS questions_topic_idx      ON public.questions (topic_id);
CREATE INDEX IF NOT EXISTS questions_difficulty_idx ON public.questions (difficulty);
CREATE INDEX IF NOT EXISTS questions_active_idx     ON public.questions (is_active);
CREATE INDEX IF NOT EXISTS questions_tags_idx       ON public.questions USING GIN (tags);
CREATE INDEX IF NOT EXISTS questions_search_it_idx  ON public.questions USING GIN (to_tsvector('italian', question_it));

-- 4b. Answers (1 question → 2–4 answers; exactly 1 is_correct = TRUE)
CREATE TABLE IF NOT EXISTS public.answers (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id  UUID        NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  answer_it    TEXT        NOT NULL,
  answer_ar    TEXT,
  is_correct   BOOLEAN     NOT NULL DEFAULT FALSE,
  sort_order   INT         NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS answers_question_idx ON public.answers (question_id);

-- Enforce exactly one correct answer per question
CREATE UNIQUE INDEX IF NOT EXISTS answers_one_correct_idx
  ON public.answers (question_id)
  WHERE is_correct = TRUE;

-- ────────────────────────────────────────────────────────────
-- 5. QUIZ ENGINE
-- ────────────────────────────────────────────────────────────

-- 5a. Quiz templates / definitions
CREATE TABLE IF NOT EXISTS public.quizzes (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title_it             TEXT        NOT NULL,
  title_ar             TEXT,
  description_it       TEXT,
  description_ar       TEXT,
  quiz_type            TEXT        NOT NULL DEFAULT 'topic'
                                   CHECK (quiz_type IN ('topic', 'exam', 'custom', 'daily', 'practice')),
  topic_id             UUID        REFERENCES public.topics(id) ON DELETE SET NULL,
  time_limit_seconds   INT         CHECK (time_limit_seconds IS NULL OR time_limit_seconds > 0),
  pass_score           INT         NOT NULL DEFAULT 90
                                   CHECK (pass_score BETWEEN 1 AND 100),
  question_count       INT         NOT NULL DEFAULT 30 CHECK (question_count > 0),
  is_active            BOOLEAN     NOT NULL DEFAULT TRUE,
  created_by           UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS quizzes_type_idx   ON public.quizzes (quiz_type);
CREATE INDEX IF NOT EXISTS quizzes_topic_idx  ON public.quizzes (topic_id);
CREATE INDEX IF NOT EXISTS quizzes_active_idx ON public.quizzes (is_active);

-- 5b. Quiz questions (static assignments for non-random quizzes)
CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id           UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id      UUID  NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_id  UUID  NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  sort_order   INT   NOT NULL DEFAULT 0,
  UNIQUE (quiz_id, question_id)
);

CREATE INDEX IF NOT EXISTS quiz_questions_quiz_idx      ON public.quiz_questions (quiz_id);
CREATE INDEX IF NOT EXISTS quiz_questions_question_idx  ON public.quiz_questions (question_id);

-- 5c. Quiz attempts (one row per user session)
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id                   UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_id              UUID          REFERENCES public.quizzes(id) ON DELETE SET NULL,
  quiz_type            TEXT          NOT NULL DEFAULT 'topic',
  topic_id             UUID          REFERENCES public.topics(id) ON DELETE SET NULL,
  started_at           TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  completed_at         TIMESTAMPTZ,
  time_taken_seconds   INT,
  total_questions      INT           NOT NULL DEFAULT 0 CHECK (total_questions >= 0),
  correct_answers      INT           NOT NULL DEFAULT 0 CHECK (correct_answers >= 0),
  wrong_answers        INT           NOT NULL DEFAULT 0 CHECK (wrong_answers >= 0),
  score_percentage     NUMERIC(5,2),
  passed               BOOLEAN,
  xp_earned            INT           NOT NULL DEFAULT 0 CHECK (xp_earned >= 0),
  created_at           TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_score_range CHECK (score_percentage IS NULL OR score_percentage BETWEEN 0 AND 100),
  CONSTRAINT chk_answers_sum CHECK (correct_answers + wrong_answers <= total_questions)
);

CREATE INDEX IF NOT EXISTS quiz_attempts_user_idx       ON public.quiz_attempts (user_id);
CREATE INDEX IF NOT EXISTS quiz_attempts_user_date_idx  ON public.quiz_attempts (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS quiz_attempts_topic_idx      ON public.quiz_attempts (topic_id);
CREATE INDEX IF NOT EXISTS quiz_attempts_type_idx       ON public.quiz_attempts (quiz_type);

-- 5d. Individual user answers within an attempt
CREATE TABLE IF NOT EXISTS public.user_answers (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id           UUID        NOT NULL REFERENCES public.quiz_attempts(id) ON DELETE CASCADE,
  question_id          UUID        NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  selected_answer_id   UUID        REFERENCES public.answers(id) ON DELETE SET NULL,
  is_correct           BOOLEAN     NOT NULL DEFAULT FALSE,
  time_taken_ms        INT         CHECK (time_taken_ms IS NULL OR time_taken_ms >= 0),
  answered_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (attempt_id, question_id)
);

CREATE INDEX IF NOT EXISTS user_answers_attempt_idx   ON public.user_answers (attempt_id);
CREATE INDEX IF NOT EXISTS user_answers_question_idx  ON public.user_answers (question_id);
CREATE INDEX IF NOT EXISTS user_answers_wrong_idx     ON public.user_answers (attempt_id, is_correct)
  WHERE is_correct = FALSE;

-- ────────────────────────────────────────────────────────────
-- 6. USER PROGRESS
-- ────────────────────────────────────────────────────────────

-- 6a. Overall user stats (replaces progress JSONB in profiles)
CREATE TABLE IF NOT EXISTS public.user_progress (
  user_id          UUID          PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_quizzes    INT           NOT NULL DEFAULT 0 CHECK (total_quizzes >= 0),
  correct_answers  INT           NOT NULL DEFAULT 0 CHECK (correct_answers >= 0),
  wrong_answers    INT           NOT NULL DEFAULT 0 CHECK (wrong_answers >= 0),
  current_streak   INT           NOT NULL DEFAULT 0 CHECK (current_streak >= 0),
  best_streak      INT           NOT NULL DEFAULT 0 CHECK (best_streak >= 0),
  last_study_date  DATE,
  total_study_days INT           NOT NULL DEFAULT 0 CHECK (total_study_days >= 0),
  level            INT           NOT NULL DEFAULT 1  CHECK (level >= 1),
  xp               INT           NOT NULL DEFAULT 0  CHECK (xp >= 0),
  exam_readiness   NUMERIC(5,2)  NOT NULL DEFAULT 0
                                 CHECK (exam_readiness BETWEEN 0 AND 100),
  updated_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- 6b. Per-lesson completion tracking
CREATE TABLE IF NOT EXISTS public.user_lesson_progress (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id            UUID        NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  status               TEXT        NOT NULL DEFAULT 'not_started'
                                   CHECK (status IN ('not_started', 'in_progress', 'completed')),
  progress_percentage  INT         NOT NULL DEFAULT 0
                                   CHECK (progress_percentage BETWEEN 0 AND 100),
  completed_at         TIMESTAMPTZ,
  xp_earned            INT         NOT NULL DEFAULT 0 CHECK (xp_earned >= 0),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS ulp_user_idx    ON public.user_lesson_progress (user_id);
CREATE INDEX IF NOT EXISTS ulp_lesson_idx  ON public.user_lesson_progress (lesson_id);
CREATE INDEX IF NOT EXISTS ulp_status_idx  ON public.user_lesson_progress (user_id, status);

-- 6c. Per-topic completion tracking
CREATE TABLE IF NOT EXISTS public.user_topic_progress (
  id                     UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id               UUID        NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  status                 TEXT        NOT NULL DEFAULT 'not_started'
                                     CHECK (status IN ('not_started', 'in_progress', 'completed')),
  completion_percentage  INT         NOT NULL DEFAULT 0
                                     CHECK (completion_percentage BETWEEN 0 AND 100),
  completed_at           TIMESTAMPTZ,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, topic_id)
);

CREATE INDEX IF NOT EXISTS utp_user_idx   ON public.user_topic_progress (user_id);
CREATE INDEX IF NOT EXISTS utp_topic_idx  ON public.user_topic_progress (topic_id);
CREATE INDEX IF NOT EXISTS utp_status_idx ON public.user_topic_progress (user_id, status);

-- ────────────────────────────────────────────────────────────
-- 7. GAMIFICATION
-- ────────────────────────────────────────────────────────────

-- 7a. Badge catalogue
CREATE TABLE IF NOT EXISTS public.badges (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  code               TEXT        NOT NULL UNIQUE, -- 'newcomer', 'streak_7', 'quiz_master'…
  name_it            TEXT        NOT NULL,
  name_ar            TEXT,
  description_it     TEXT,
  description_ar     TEXT,
  icon               TEXT,
  badge_type         TEXT        NOT NULL DEFAULT 'achievement'
                                 CHECK (badge_type IN ('achievement', 'streak', 'quiz', 'social', 'special')),
  xp_value           INT         NOT NULL DEFAULT 0 CHECK (xp_value >= 0),
  requirement_type   TEXT,       -- 'quiz_count' | 'streak_days' | 'xp_total' | 'lesson_count' | NULL
  requirement_value  INT,        -- threshold to earn badge automatically
  is_active          BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS badges_type_idx   ON public.badges (badge_type);
CREATE INDEX IF NOT EXISTS badges_active_idx ON public.badges (is_active);

-- 7b. User badge awards
CREATE TABLE IF NOT EXISTS public.user_badges (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id   UUID        NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, badge_id)
);

CREATE INDEX IF NOT EXISTS user_badges_user_idx  ON public.user_badges (user_id);
CREATE INDEX IF NOT EXISTS user_badges_badge_idx ON public.user_badges (badge_id);

-- 7c. Streak tracking (denormalised for fast daily reads)
CREATE TABLE IF NOT EXISTS public.user_streaks (
  user_id             UUID  PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak      INT   NOT NULL DEFAULT 0 CHECK (current_streak >= 0),
  best_streak         INT   NOT NULL DEFAULT 0 CHECK (best_streak >= 0),
  last_activity_date  DATE,
  streak_start_date   DATE,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7d. Leaderboard (fast read cache; refreshed by trigger on user_progress update)
CREATE TABLE IF NOT EXISTS public.leaderboard (
  user_id         UUID  PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username        TEXT,
  avatar          TEXT,
  xp              INT   NOT NULL DEFAULT 0,
  level           INT   NOT NULL DEFAULT 1,
  current_streak  INT   NOT NULL DEFAULT 0,
  quiz_count      INT   NOT NULL DEFAULT 0,
  rank            INT,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS leaderboard_xp_idx    ON public.leaderboard (xp DESC);
CREATE INDEX IF NOT EXISTS leaderboard_level_idx ON public.leaderboard (level DESC);
CREATE INDEX IF NOT EXISTS leaderboard_rank_idx  ON public.leaderboard (rank);

-- ────────────────────────────────────────────────────────────
-- 8. COMMUNITY
-- ────────────────────────────────────────────────────────────

-- 8a. Posts
CREATE TABLE IF NOT EXISTS public.posts (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title           TEXT,
  content         TEXT        NOT NULL,
  post_type       TEXT        NOT NULL DEFAULT 'discussion'
                              CHECK (post_type IN ('discussion', 'question', 'tip', 'announcement')),
  topic_id        UUID        REFERENCES public.topics(id) ON DELETE SET NULL,
  image_url       TEXT,
  is_pinned       BOOLEAN     NOT NULL DEFAULT FALSE,
  is_locked       BOOLEAN     NOT NULL DEFAULT FALSE,
  is_deleted      BOOLEAN     NOT NULL DEFAULT FALSE,
  likes_count     INT         NOT NULL DEFAULT 0 CHECK (likes_count >= 0),
  comments_count  INT         NOT NULL DEFAULT 0 CHECK (comments_count >= 0),
  views_count     INT         NOT NULL DEFAULT 0 CHECK (views_count >= 0),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS posts_author_idx     ON public.posts (author_id);
CREATE INDEX IF NOT EXISTS posts_topic_idx      ON public.posts (topic_id);
CREATE INDEX IF NOT EXISTS posts_feed_idx       ON public.posts (is_deleted, is_pinned DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS posts_search_idx     ON public.posts USING GIN (to_tsvector('italian', COALESCE(title,'') || ' ' || content));

-- 8b. Comments (threaded via parent_id)
CREATE TABLE IF NOT EXISTS public.comments (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id      UUID        NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  author_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id    UUID        REFERENCES public.comments(id) ON DELETE CASCADE,
  content      TEXT        NOT NULL,
  is_deleted   BOOLEAN     NOT NULL DEFAULT FALSE,
  likes_count  INT         NOT NULL DEFAULT 0 CHECK (likes_count >= 0),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS comments_post_idx    ON public.comments (post_id, created_at);
CREATE INDEX IF NOT EXISTS comments_author_idx  ON public.comments (author_id);
CREATE INDEX IF NOT EXISTS comments_parent_idx  ON public.comments (parent_id);

-- 8c. Likes (polymorphic — post or comment)
CREATE TABLE IF NOT EXISTS public.likes (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_type  TEXT        NOT NULL CHECK (target_type IN ('post', 'comment')),
  target_id    UUID        NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, target_type, target_id)
);

CREATE INDEX IF NOT EXISTS likes_user_idx    ON public.likes (user_id);
CREATE INDEX IF NOT EXISTS likes_target_idx  ON public.likes (target_type, target_id);

-- 8d. Reports (content moderation)
CREATE TABLE IF NOT EXISTS public.reports (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id  UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_type  TEXT        NOT NULL CHECK (target_type IN ('post', 'comment', 'user')),
  target_id    UUID        NOT NULL,
  reason       TEXT        NOT NULL
               CHECK (reason IN ('spam', 'harassment', 'inappropriate', 'misinformation', 'other')),
  description  TEXT,
  status       TEXT        NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  reviewed_by  UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at  TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (reporter_id, target_type, target_id)  -- one report per user per target
);

CREATE INDEX IF NOT EXISTS reports_status_idx  ON public.reports (status);
CREATE INDEX IF NOT EXISTS reports_target_idx  ON public.reports (target_type, target_id);

-- ────────────────────────────────────────────────────────────
-- 9. NOTIFICATIONS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type        TEXT        NOT NULL,  -- 'badge_earned'|'comment_reply'|'post_like'|'streak_reminder'…
  title       TEXT        NOT NULL,
  body        TEXT,
  data        JSONB       NOT NULL DEFAULT '{}',
  is_read     BOOLEAN     NOT NULL DEFAULT FALSE,
  read_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS notifications_user_idx      ON public.notifications (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS notifications_unread_idx    ON public.notifications (user_id, is_read)
  WHERE is_read = FALSE;

-- ────────────────────────────────────────────────────────────
-- 10. ADMIN
-- ────────────────────────────────────────────────────────────

-- 10a. Admin action logs
CREATE TABLE IF NOT EXISTS public.admin_logs (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action       TEXT        NOT NULL,  -- 'ban_user'|'delete_post'|'award_badge'|'edit_question'…
  target_type  TEXT,                  -- 'user'|'post'|'question'|'badge'…
  target_id    UUID,
  details      JSONB       NOT NULL DEFAULT '{}',
  ip_address   INET,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS admin_logs_admin_idx   ON public.admin_logs (admin_id);
CREATE INDEX IF NOT EXISTS admin_logs_date_idx    ON public.admin_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS admin_logs_action_idx  ON public.admin_logs (action);
CREATE INDEX IF NOT EXISTS admin_logs_target_idx  ON public.admin_logs (target_type, target_id);

-- 10b. Audit logs (automatic immutable change history)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name  TEXT        NOT NULL,
  row_id      UUID        NOT NULL,
  operation   TEXT        NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data    JSONB,
  new_data    JSONB,
  changed_by  UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  changed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS audit_logs_table_idx   ON public.audit_logs (table_name, row_id);
CREATE INDEX IF NOT EXISTS audit_logs_date_idx    ON public.audit_logs (changed_at DESC);
CREATE INDEX IF NOT EXISTS audit_logs_user_idx    ON public.audit_logs (changed_by);

-- ────────────────────────────────────────────────────────────
-- 11. ANALYTICS
-- ────────────────────────────────────────────────────────────

-- 11a. Granular event stream (append-only)
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type   TEXT        NOT NULL,  -- 'quiz_started'|'lesson_completed'|'badge_earned'…
  properties   JSONB       NOT NULL DEFAULT '{}',
  session_id   TEXT,
  device_type  TEXT        CHECK (device_type IN ('mobile', 'tablet', 'desktop', NULL)),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
)
PARTITION BY RANGE (created_at);

-- Create initial monthly partitions (add more as needed via cron migration)
CREATE TABLE IF NOT EXISTS public.analytics_events_2025_01
  PARTITION OF public.analytics_events
  FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE IF NOT EXISTS public.analytics_events_2025_q2
  PARTITION OF public.analytics_events
  FOR VALUES FROM ('2025-02-01') TO ('2025-07-01');

CREATE TABLE IF NOT EXISTS public.analytics_events_2025_q3
  PARTITION OF public.analytics_events
  FOR VALUES FROM ('2025-07-01') TO ('2026-01-01');

CREATE TABLE IF NOT EXISTS public.analytics_events_2026_h1
  PARTITION OF public.analytics_events
  FOR VALUES FROM ('2026-01-01') TO ('2026-07-01');

CREATE TABLE IF NOT EXISTS public.analytics_events_2026_h2
  PARTITION OF public.analytics_events
  FOR VALUES FROM ('2026-07-01') TO ('2027-01-01');

CREATE TABLE IF NOT EXISTS public.analytics_events_future
  PARTITION OF public.analytics_events
  FOR VALUES FROM ('2027-01-01') TO ('2030-01-01');

CREATE INDEX IF NOT EXISTS analytics_user_idx   ON public.analytics_events (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS analytics_type_idx   ON public.analytics_events (event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS analytics_date_idx   ON public.analytics_events (created_at DESC);

-- 11b. Daily aggregated stats (populated by pg_cron or Edge Function)
CREATE TABLE IF NOT EXISTS public.daily_stats (
  id                        UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  stat_date                 DATE          NOT NULL UNIQUE,
  total_users               INT           NOT NULL DEFAULT 0,
  new_users                 INT           NOT NULL DEFAULT 0,
  active_users              INT           NOT NULL DEFAULT 0,
  total_quizzes_taken       INT           NOT NULL DEFAULT 0,
  total_lessons_completed   INT           NOT NULL DEFAULT 0,
  total_posts_created       INT           NOT NULL DEFAULT 0,
  avg_quiz_score            NUMERIC(5,2),
  created_at                TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS daily_stats_date_idx ON public.daily_stats (stat_date DESC);

-- ============================================================
-- TRIGGERS — updated_at automation
-- ============================================================
DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN
    SELECT unnest(ARRAY[
      'modules','topics','lessons',
      'questions',
      'quizzes',
      'user_lesson_progress','user_topic_progress',
      'posts','comments',
      'daily_stats'
    ])
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS trg_updated_at ON public.%I;
       CREATE TRIGGER trg_updated_at
         BEFORE UPDATE ON public.%I
         FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();',
      t, t
    );
  END LOOP;
END;
$$;

-- ============================================================
-- TRIGGER — update leaderboard on user_progress change
-- ============================================================
CREATE OR REPLACE FUNCTION public.sync_leaderboard()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.leaderboard (user_id, username, avatar, xp, level, current_streak, quiz_count, updated_at)
  SELECT
    NEW.user_id,
    p.username,
    p.avatar,
    NEW.xp,
    NEW.level,
    COALESCE(s.current_streak, NEW.current_streak),
    NEW.total_quizzes,
    NOW()
  FROM public.profiles p
  LEFT JOIN public.user_streaks s ON s.user_id = NEW.user_id
  WHERE p.id = NEW.user_id
  ON CONFLICT (user_id) DO UPDATE SET
    xp             = EXCLUDED.xp,
    level          = EXCLUDED.level,
    current_streak = EXCLUDED.current_streak,
    quiz_count     = EXCLUDED.quiz_count,
    updated_at     = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_leaderboard ON public.user_progress;
CREATE TRIGGER trg_sync_leaderboard
  AFTER INSERT OR UPDATE ON public.user_progress
  FOR EACH ROW EXECUTE FUNCTION public.sync_leaderboard();

-- ============================================================
-- TRIGGER — update likes_count / comments_count counters
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_like_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.target_type = 'post' THEN
      UPDATE public.posts SET likes_count = likes_count + 1 WHERE id = NEW.target_id;
    ELSIF NEW.target_type = 'comment' THEN
      UPDATE public.comments SET likes_count = likes_count + 1 WHERE id = NEW.target_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.target_type = 'post' THEN
      UPDATE public.posts SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.target_id;
    ELSIF OLD.target_type = 'comment' THEN
      UPDATE public.comments SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.target_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_like_counts ON public.likes;
CREATE TRIGGER trg_like_counts
  AFTER INSERT OR DELETE ON public.likes
  FOR EACH ROW EXECUTE FUNCTION public.update_like_counts();

-- ============================================================
-- TRIGGER — update comments_count on posts
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_comment_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' AND NOT OLD.is_deleted THEN
    UPDATE public.posts SET comments_count = GREATEST(0, comments_count - 1) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_comment_counts ON public.comments;
CREATE TRIGGER trg_comment_counts
  AFTER INSERT OR DELETE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.update_comment_counts();

-- ============================================================
-- TRIGGER — update question stats after user_answers insert
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_question_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.questions
  SET
    times_shown   = times_shown + 1,
    times_correct = times_correct + CASE WHEN NEW.is_correct THEN 1 ELSE 0 END
  WHERE id = NEW.question_id;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_question_stats ON public.user_answers;
CREATE TRIGGER trg_question_stats
  AFTER INSERT ON public.user_answers
  FOR EACH ROW EXECUTE FUNCTION public.update_question_stats();

-- ============================================================
-- TRIGGER — auto-award badges based on progress
-- ============================================================
CREATE OR REPLACE FUNCTION public.auto_award_badges()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _badge RECORD;
BEGIN
  -- Evaluate all active auto-award badges against the updated progress
  FOR _badge IN
    SELECT id, code, requirement_type, requirement_value
    FROM public.badges
    WHERE is_active = TRUE
      AND requirement_type IS NOT NULL
      AND requirement_value IS NOT NULL
  LOOP
    -- Check if already awarded
    IF EXISTS (SELECT 1 FROM public.user_badges WHERE user_id = NEW.user_id AND badge_id = _badge.id) THEN
      CONTINUE;
    END IF;

    -- Evaluate requirement
    IF (_badge.requirement_type = 'quiz_count'   AND NEW.total_quizzes  >= _badge.requirement_value) OR
       (_badge.requirement_type = 'xp_total'     AND NEW.xp             >= _badge.requirement_value) OR
       (_badge.requirement_type = 'lesson_count'  AND (
         SELECT COUNT(*) FROM public.user_lesson_progress
         WHERE user_id = NEW.user_id AND status = 'completed'
       ) >= _badge.requirement_value)
    THEN
      INSERT INTO public.user_badges (user_id, badge_id)
      VALUES (NEW.user_id, _badge.id)
      ON CONFLICT DO NOTHING;

      -- Notify the user
      INSERT INTO public.notifications (user_id, type, title, body, data)
      VALUES (
        NEW.user_id,
        'badge_earned',
        'Badge sbloccato!',
        'Hai ottenuto il badge: ' || _badge.code,
        jsonb_build_object('badge_id', _badge.id, 'badge_code', _badge.code)
      );
    END IF;
  END LOOP;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_award_badges ON public.user_progress;
CREATE TRIGGER trg_auto_award_badges
  AFTER INSERT OR UPDATE ON public.user_progress
  FOR EACH ROW EXECUTE FUNCTION public.auto_award_badges();

-- ============================================================
-- TRIGGER — update streak on quiz_attempts completion
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_streak_on_attempt()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _today        DATE := CURRENT_DATE;
  _streak       RECORD;
  _new_current  INT;
  _new_best     INT;
BEGIN
  -- Only fire on completion
  IF NEW.completed_at IS NULL OR OLD.completed_at IS NOT NULL THEN
    RETURN NEW;
  END IF;

  SELECT * INTO _streak FROM public.user_streaks WHERE user_id = NEW.user_id;

  IF NOT FOUND THEN
    -- Bootstrap streak row
    INSERT INTO public.user_streaks (user_id, current_streak, best_streak, last_activity_date, streak_start_date)
    VALUES (NEW.user_id, 1, 1, _today, _today);
  ELSE
    IF _streak.last_activity_date = _today THEN
      -- Already logged today — no change
      RETURN NEW;
    ELSIF _streak.last_activity_date = _today - 1 THEN
      -- Consecutive day
      _new_current := _streak.current_streak + 1;
      _new_best    := GREATEST(_streak.best_streak, _new_current);
    ELSE
      -- Streak broken
      _new_current := 1;
      _new_best    := _streak.best_streak;
    END IF;

    UPDATE public.user_streaks
    SET current_streak     = _new_current,
        best_streak        = _new_best,
        last_activity_date = _today,
        streak_start_date  = CASE WHEN _new_current = 1 THEN _today ELSE streak_start_date END,
        updated_at         = NOW()
    WHERE user_id = NEW.user_id;
  END IF;

  -- Also keep user_progress in sync
  UPDATE public.user_progress
  SET current_streak  = COALESCE((SELECT current_streak FROM public.user_streaks WHERE user_id = NEW.user_id), 0),
      best_streak     = COALESCE((SELECT best_streak    FROM public.user_streaks WHERE user_id = NEW.user_id), 0),
      last_study_date = _today,
      updated_at      = NOW()
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_streak ON public.quiz_attempts;
CREATE TRIGGER trg_update_streak
  AFTER UPDATE OF completed_at ON public.quiz_attempts
  FOR EACH ROW EXECUTE FUNCTION public.update_streak_on_attempt();

-- ============================================================
-- TRIGGER — auto-create user_progress & user_streaks on signup
-- ============================================================
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
BEGIN
  _name       := COALESCE(NEW.raw_user_meta_data->>'name', '');
  _first_name := COALESCE(NEW.raw_user_meta_data->>'firstName', '');
  _last_name  := COALESCE(NEW.raw_user_meta_data->>'lastName', '');
  _username   := COALESCE(NEW.raw_user_meta_data->>'username', NULL);

  -- SECURITY: Admin role MUST be assigned manually — never auto-granted
  INSERT INTO public.profiles (id, email, name, first_name, last_name, username, role)
  VALUES (NEW.id, NEW.email, _name, _first_name, _last_name, _username, 'user');

  -- Bootstrap normalized progress
  INSERT INTO public.user_progress (user_id) VALUES (NEW.id);
  INSERT INTO public.user_streaks  (user_id) VALUES (NEW.id);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- TRIGGER — protect profile sensitive fields (non-admins)
-- ============================================================
CREATE OR REPLACE FUNCTION public.protect_profile_sensitive_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _caller_role TEXT;
BEGIN
  SELECT role INTO _caller_role FROM public.profiles WHERE id = auth.uid();
  IF _caller_role = 'admin' THEN RETURN NEW; END IF;
  NEW.role        := OLD.role;
  NEW.permissions := OLD.permissions;
  NEW.is_banned   := OLD.is_banned;
  NEW.verified    := OLD.verified;
  NEW.email       := OLD.email;
  NEW.created_at  := OLD.created_at;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_profile_field_protection ON public.profiles;
CREATE TRIGGER enforce_profile_field_protection
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_sensitive_fields();

-- ============================================================
-- RPC FUNCTIONS
-- ============================================================

-- check_username (existing — unchanged)
CREATE OR REPLACE FUNCTION public.check_username(requested_username TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
  RETURN jsonb_build_object('available', _available, 'suggestions', to_jsonb(_suggestions));
END;
$$;

-- update_last_login (existing — unchanged)
CREATE OR REPLACE FUNCTION public.update_last_login(user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'authentication required';
  END IF;
  UPDATE public.profiles SET last_login = NOW() WHERE id = auth.uid();
END;
$$;

-- get_leaderboard_page — paginated leaderboard with rank
CREATE OR REPLACE FUNCTION public.get_leaderboard_page(
  p_limit  INT DEFAULT 20,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  user_id        UUID,
  username       TEXT,
  avatar         TEXT,
  xp             INT,
  level          INT,
  current_streak INT,
  quiz_count     INT,
  rank           BIGINT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT
    l.user_id, l.username, l.avatar, l.xp, l.level, l.current_streak, l.quiz_count,
    ROW_NUMBER() OVER (ORDER BY l.xp DESC, l.quiz_count DESC) AS rank
  FROM public.leaderboard l
  JOIN public.profiles p ON p.id = l.user_id AND p.privacy_hide_stats = FALSE AND p.is_banned = FALSE
  ORDER BY l.xp DESC, l.quiz_count DESC
  LIMIT p_limit OFFSET p_offset;
$$;

-- get_user_rank — single user rank lookup
CREATE OR REPLACE FUNCTION public.get_user_rank(p_user_id UUID)
RETURNS BIGINT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT rank FROM (
    SELECT user_id, ROW_NUMBER() OVER (ORDER BY xp DESC) AS rank
    FROM public.leaderboard
  ) r
  WHERE user_id = p_user_id;
$$;

-- record_quiz_result — atomic quiz completion: update progress, XP, streaks
CREATE OR REPLACE FUNCTION public.record_quiz_result(
  p_attempt_id       UUID,
  p_correct          INT,
  p_wrong            INT,
  p_total            INT,
  p_time_seconds     INT,
  p_xp_earned        INT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id UUID;
  _score   NUMERIC(5,2);
BEGIN
  -- Verify ownership
  SELECT user_id INTO _user_id
  FROM public.quiz_attempts
  WHERE id = p_attempt_id AND user_id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'attempt not found or unauthorized';
  END IF;

  _score := ROUND((p_correct::NUMERIC / NULLIF(p_total, 0)) * 100, 2);

  -- Mark attempt complete
  UPDATE public.quiz_attempts
  SET
    completed_at       = NOW(),
    time_taken_seconds = p_time_seconds,
    correct_answers    = p_correct,
    wrong_answers      = p_wrong,
    total_questions    = p_total,
    score_percentage   = _score,
    passed             = (_score >= pass_score),
    xp_earned          = p_xp_earned
  FROM public.quizzes q
  WHERE quiz_attempts.id = p_attempt_id
    AND quiz_attempts.quiz_id = q.id;

  -- Upsert user_progress
  INSERT INTO public.user_progress (user_id, total_quizzes, correct_answers, wrong_answers, xp)
  VALUES (_user_id, 1, p_correct, p_wrong, p_xp_earned)
  ON CONFLICT (user_id) DO UPDATE SET
    total_quizzes   = user_progress.total_quizzes   + 1,
    correct_answers = user_progress.correct_answers + p_correct,
    wrong_answers   = user_progress.wrong_answers   + p_wrong,
    xp              = user_progress.xp              + p_xp_earned,
    level           = GREATEST(1, (user_progress.xp + p_xp_earned) / 500 + 1),
    exam_readiness  = LEAST(100, ROUND(
      (user_progress.correct_answers + p_correct)::NUMERIC /
      NULLIF(user_progress.total_quizzes + 1, 0) / p_total * 100, 2
    )),
    updated_at      = NOW();
END;
$$;

-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================

-- Helper: is caller an admin?
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Helper: is caller a manager or admin?
CREATE OR REPLACE FUNCTION public.is_manager_or_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','manager')
  );
$$;

-- ── profiles ─────────────────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "own_profile_select"    ON public.profiles;
DROP POLICY IF EXISTS "own_profile_update"    ON public.profiles;
DROP POLICY IF EXISTS "admin_profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "admin_profiles_update" ON public.profiles;

CREATE POLICY "profiles_select_own"       ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own"       ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_select_staff"     ON public.profiles FOR SELECT USING (public.is_manager_or_admin());
CREATE POLICY "profiles_update_admin"     ON public.profiles FOR UPDATE USING (public.is_admin());

-- ── contact_messages ─────────────────────────────────────────
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "contact_insert"       ON public.contact_messages;
DROP POLICY IF EXISTS "admin_contact_select" ON public.contact_messages;
DROP POLICY IF EXISTS "admin_contact_update" ON public.contact_messages;

CREATE POLICY "contact_insert" ON public.contact_messages
  FOR INSERT WITH CHECK (
    (SELECT COUNT(*) FROM public.contact_messages cm
     WHERE cm.email = email AND cm.created_at > NOW() - INTERVAL '60 minutes') < 5
  );
CREATE POLICY "contact_select_staff" ON public.contact_messages FOR SELECT USING (public.is_manager_or_admin());
CREATE POLICY "contact_update_staff" ON public.contact_messages FOR UPDATE USING (public.is_manager_or_admin());

-- ── modules / topics / lessons (public read, admin write) ────
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "modules_select_all"    ON public.modules FOR SELECT USING (is_active = TRUE OR public.is_manager_or_admin());
CREATE POLICY "modules_insert_admin"  ON public.modules FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "modules_update_admin"  ON public.modules FOR UPDATE USING (public.is_admin());
CREATE POLICY "modules_delete_admin"  ON public.modules FOR DELETE USING (public.is_admin());

ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "topics_select_all"    ON public.topics FOR SELECT USING (is_active = TRUE OR public.is_manager_or_admin());
CREATE POLICY "topics_insert_admin"  ON public.topics FOR INSERT WITH CHECK (public.is_manager_or_admin());
CREATE POLICY "topics_update_admin"  ON public.topics FOR UPDATE USING (public.is_manager_or_admin());
CREATE POLICY "topics_delete_admin"  ON public.topics FOR DELETE USING (public.is_admin());

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lessons_select_all"    ON public.lessons FOR SELECT USING (is_active = TRUE OR public.is_manager_or_admin());
CREATE POLICY "lessons_insert_admin"  ON public.lessons FOR INSERT WITH CHECK (public.is_manager_or_admin());
CREATE POLICY "lessons_update_admin"  ON public.lessons FOR UPDATE USING (public.is_manager_or_admin());
CREATE POLICY "lessons_delete_admin"  ON public.lessons FOR DELETE USING (public.is_admin());

-- ── questions / answers (public read auth users, admin write) ─
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "questions_select_auth"   ON public.questions FOR SELECT USING (auth.uid() IS NOT NULL AND (is_active = TRUE OR public.is_manager_or_admin()));
CREATE POLICY "questions_insert_staff"  ON public.questions FOR INSERT WITH CHECK (public.is_manager_or_admin());
CREATE POLICY "questions_update_staff"  ON public.questions FOR UPDATE USING (public.is_manager_or_admin());
CREATE POLICY "questions_delete_admin"  ON public.questions FOR DELETE USING (public.is_admin());

ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "answers_select_auth"   ON public.answers FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "answers_insert_staff"  ON public.answers FOR INSERT WITH CHECK (public.is_manager_or_admin());
CREATE POLICY "answers_update_staff"  ON public.answers FOR UPDATE USING (public.is_manager_or_admin());
CREATE POLICY "answers_delete_admin"  ON public.answers FOR DELETE USING (public.is_admin());

-- ── quizzes (public read auth, admin write) ───────────────────
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "quizzes_select_auth"   ON public.quizzes FOR SELECT USING (auth.uid() IS NOT NULL AND (is_active = TRUE OR public.is_manager_or_admin()));
CREATE POLICY "quizzes_insert_staff"  ON public.quizzes FOR INSERT WITH CHECK (public.is_manager_or_admin());
CREATE POLICY "quizzes_update_staff"  ON public.quizzes FOR UPDATE USING (public.is_manager_or_admin());
CREATE POLICY "quizzes_delete_admin"  ON public.quizzes FOR DELETE USING (public.is_admin());

ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "quiz_questions_select_auth"  ON public.quiz_questions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "quiz_questions_write_staff"  ON public.quiz_questions FOR ALL USING (public.is_manager_or_admin());

-- ── quiz_attempts (own rows) ──────────────────────────────────
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "attempts_select_own"    ON public.quiz_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "attempts_insert_own"    ON public.quiz_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "attempts_update_own"    ON public.quiz_attempts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "attempts_select_staff"  ON public.quiz_attempts FOR SELECT USING (public.is_manager_or_admin());

-- ── user_answers (own rows) ───────────────────────────────────
ALTER TABLE public.user_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ua_select_own"    ON public.user_answers FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.quiz_attempts a WHERE a.id = attempt_id AND a.user_id = auth.uid()));
CREATE POLICY "ua_insert_own"    ON public.user_answers FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.quiz_attempts a WHERE a.id = attempt_id AND a.user_id = auth.uid()));
CREATE POLICY "ua_select_staff"  ON public.user_answers FOR SELECT USING (public.is_manager_or_admin());

-- ── user_progress (own row) ───────────────────────────────────
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "up_select_own"    ON public.user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "up_upsert_own"    ON public.user_progress FOR ALL    USING (auth.uid() = user_id);
CREATE POLICY "up_select_staff"  ON public.user_progress FOR SELECT USING (public.is_manager_or_admin());

-- ── user_lesson_progress ──────────────────────────────────────
ALTER TABLE public.user_lesson_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ulp_select_own"   ON public.user_lesson_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "ulp_upsert_own"   ON public.user_lesson_progress FOR ALL    USING (auth.uid() = user_id);
CREATE POLICY "ulp_select_staff" ON public.user_lesson_progress FOR SELECT USING (public.is_manager_or_admin());

-- ── user_topic_progress ───────────────────────────────────────
ALTER TABLE public.user_topic_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "utp_select_own"   ON public.user_topic_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "utp_upsert_own"   ON public.user_topic_progress FOR ALL    USING (auth.uid() = user_id);
CREATE POLICY "utp_select_staff" ON public.user_topic_progress FOR SELECT USING (public.is_manager_or_admin());

-- ── badges (public read) ──────────────────────────────────────
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "badges_select_all"    ON public.badges FOR SELECT USING (is_active = TRUE OR public.is_manager_or_admin());
CREATE POLICY "badges_write_admin"   ON public.badges FOR ALL USING (public.is_admin());

-- ── user_badges ───────────────────────────────────────────────
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ub_select_own"    ON public.user_badges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "ub_select_public" ON public.user_badges FOR SELECT
  USING (NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = user_id AND p.privacy_hide_stats = TRUE));
CREATE POLICY "ub_insert_system" ON public.user_badges FOR INSERT WITH CHECK (public.is_admin());

-- ── user_streaks ──────────────────────────────────────────────
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "streaks_select_own"   ON public.user_streaks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "streaks_upsert_own"   ON public.user_streaks FOR ALL    USING (auth.uid() = user_id);
CREATE POLICY "streaks_select_staff" ON public.user_streaks FOR SELECT USING (public.is_manager_or_admin());

-- ── leaderboard (public, respects privacy flag) ───────────────
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lb_select_public" ON public.leaderboard FOR SELECT
  USING (NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = user_id AND p.privacy_hide_stats = TRUE));
CREATE POLICY "lb_write_system"  ON public.leaderboard FOR ALL USING (public.is_admin());

-- ── posts ─────────────────────────────────────────────────────
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "posts_select_auth"    ON public.posts FOR SELECT USING (auth.uid() IS NOT NULL AND (is_deleted = FALSE OR public.is_manager_or_admin()));
CREATE POLICY "posts_insert_auth"    ON public.posts FOR INSERT WITH CHECK (auth.uid() = author_id AND auth.uid() IS NOT NULL);
CREATE POLICY "posts_update_own"     ON public.posts FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "posts_update_staff"   ON public.posts FOR UPDATE USING (public.is_manager_or_admin());
CREATE POLICY "posts_delete_admin"   ON public.posts FOR DELETE USING (public.is_admin());

-- ── comments ──────────────────────────────────────────────────
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "comments_select_auth"   ON public.comments FOR SELECT USING (auth.uid() IS NOT NULL AND (is_deleted = FALSE OR public.is_manager_or_admin()));
CREATE POLICY "comments_insert_auth"   ON public.comments FOR INSERT WITH CHECK (auth.uid() = author_id AND auth.uid() IS NOT NULL);
CREATE POLICY "comments_update_own"    ON public.comments FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "comments_update_staff"  ON public.comments FOR UPDATE USING (public.is_manager_or_admin());
CREATE POLICY "comments_delete_admin"  ON public.comments FOR DELETE USING (public.is_admin());

-- ── likes ─────────────────────────────────────────────────────
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "likes_select_auth"  ON public.likes FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "likes_insert_own"   ON public.likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "likes_delete_own"   ON public.likes FOR DELETE USING (auth.uid() = user_id);

-- ── reports ───────────────────────────────────────────────────
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reports_insert_auth"  ON public.reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "reports_select_own"   ON public.reports FOR SELECT USING (auth.uid() = reporter_id);
CREATE POLICY "reports_select_staff" ON public.reports FOR SELECT USING (public.is_manager_or_admin());
CREATE POLICY "reports_update_staff" ON public.reports FOR UPDATE USING (public.is_manager_or_admin());

-- ── notifications (own only) ──────────────────────────────────
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notif_select_own"  ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notif_update_own"  ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "notif_delete_own"  ON public.notifications FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "notif_insert_sys"  ON public.notifications FOR INSERT WITH CHECK (
  auth.uid() = user_id OR public.is_admin()
);

-- ── admin_logs (admin read/write) ─────────────────────────────
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_logs_select" ON public.admin_logs FOR SELECT USING (public.is_manager_or_admin());
CREATE POLICY "admin_logs_insert" ON public.admin_logs FOR INSERT WITH CHECK (public.is_manager_or_admin());

-- ── audit_logs (read-only for admins, written by triggers) ────
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_logs_select" ON public.audit_logs FOR SELECT USING (public.is_admin());

-- ── analytics (write-all-auth, read-admin) ───────────────────
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "analytics_insert_auth"  ON public.analytics_events FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND (user_id IS NULL OR user_id = auth.uid())
);
CREATE POLICY "analytics_select_admin" ON public.analytics_events FOR SELECT USING (public.is_admin());

ALTER TABLE public.daily_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "daily_stats_select_staff" ON public.daily_stats FOR SELECT USING (public.is_manager_or_admin());
CREATE POLICY "daily_stats_write_admin"  ON public.daily_stats FOR ALL    USING (public.is_admin());

-- ============================================================
-- SEED: default badges
-- ============================================================
INSERT INTO public.badges (code, name_it, name_ar, description_it, badge_type, xp_value, requirement_type, requirement_value) VALUES
  ('newcomer',      'Benvenuto!',          'أهلاً بك!',         'Hai completato il profilo.',              'achievement', 10,  NULL,           NULL),
  ('first_quiz',    'Primo Quiz',          'أول اختبار',        'Hai completato il tuo primo quiz.',       'quiz',        25,  'quiz_count',   1),
  ('quiz_10',       '10 Quiz',             '10 اختبارات',       'Hai completato 10 quiz.',                 'quiz',        50,  'quiz_count',   10),
  ('quiz_50',       'Quiz Master',         'خبير الاختبارات',   'Hai completato 50 quiz.',                 'quiz',        100, 'quiz_count',   50),
  ('quiz_100',      'Quiz Champion',       'بطل الاختبارات',    'Hai completato 100 quiz.',                'quiz',        200, 'quiz_count',   100),
  ('streak_3',      'In Forma',            'في الشكل',          '3 giorni di fila.',                       'streak',      30,  'streak_days',  3),
  ('streak_7',      'Settimana Perfetta',  'أسبوع مثالي',       '7 giorni consecutivi di studio.',        'streak',      75,  'streak_days',  7),
  ('streak_30',     'Mese di Fuoco',       'شهر من النار',      '30 giorni consecutivi!',                  'streak',      250, 'streak_days',  30),
  ('xp_500',        'In Crescita',         'في تقدم',           'Hai raggiunto 500 XP.',                   'achievement', 50,  'xp_total',    500),
  ('xp_2000',       'Esperto',             'خبير',              'Hai raggiunto 2000 XP.',                  'achievement', 100, 'xp_total',   2000),
  ('xp_10000',      'Patente Pro',         'محترف الرخصة',      'Hai raggiunto 10.000 XP.',                'special',     500, 'xp_total',  10000)
ON CONFLICT (code) DO NOTHING;

-- ============================================================
-- END OF SCHEMA v2
-- ============================================================
