-- ============================================================
-- PatenteHub — Migration 001: JSON progress → Normalized tables
-- ============================================================
-- SAFE TO RUN MULTIPLE TIMES (idempotent via ON CONFLICT DO NOTHING)
-- Run AFTER schema_v2.sql has been applied.
--
-- What this does:
--   1. Migrates profiles.progress JSONB → user_progress (normalized)
--   2. Migrates profiles.progress.badges → user_badges (normalized)
--   3. Bootstraps user_streaks for all existing users
--   4. Bootstraps leaderboard cache
--   5. Seeds initial badge catalogue (idempotent)
-- ============================================================

BEGIN;

-- ────────────────────────────────────────────────────────────
-- STEP 1: Ensure every existing user has a user_progress row
-- Migrates JSONB fields to the normalized table.
-- ON CONFLICT DO NOTHING prevents double-migration on re-run.
-- ────────────────────────────────────────────────────────────
INSERT INTO public.user_progress (
  user_id,
  total_quizzes,
  correct_answers,
  wrong_answers,
  current_streak,
  best_streak,
  last_study_date,
  total_study_days,
  level,
  xp,
  exam_readiness,
  updated_at
)
SELECT
  p.id                                                         AS user_id,
  COALESCE((p.progress->>'totalQuizzes')::INT,    0)          AS total_quizzes,
  COALESCE((p.progress->>'correctAnswers')::INT,  0)          AS correct_answers,
  COALESCE((p.progress->>'wrongAnswers')::INT,    0)          AS wrong_answers,
  COALESCE((p.progress->>'currentStreak')::INT,   0)          AS current_streak,
  COALESCE((p.progress->>'bestStreak')::INT,      0)          AS best_streak,
  CASE
    WHEN p.progress->>'lastStudyDate' IS NOT NULL
     AND p.progress->>'lastStudyDate' <> ''
    THEN (p.progress->>'lastStudyDate')::DATE
    ELSE NULL
  END                                                          AS last_study_date,
  COALESCE((p.progress->>'totalStudyDays')::INT,  0)          AS total_study_days,
  GREATEST(1, COALESCE((p.progress->>'level')::INT, 1))       AS level,
  COALESCE((p.progress->>'xp')::INT,              0)          AS xp,
  COALESCE((p.progress->>'examReadiness')::NUMERIC, 0)        AS exam_readiness,
  NOW()                                                        AS updated_at
FROM public.profiles p
ON CONFLICT (user_id) DO UPDATE SET
  -- Re-apply only if JSON value is higher (safe incremental sync)
  total_quizzes   = GREATEST(user_progress.total_quizzes,   EXCLUDED.total_quizzes),
  correct_answers = GREATEST(user_progress.correct_answers, EXCLUDED.correct_answers),
  wrong_answers   = GREATEST(user_progress.wrong_answers,   EXCLUDED.wrong_answers),
  current_streak  = GREATEST(user_progress.current_streak,  EXCLUDED.current_streak),
  best_streak     = GREATEST(user_progress.best_streak,     EXCLUDED.best_streak),
  total_study_days= GREATEST(user_progress.total_study_days,EXCLUDED.total_study_days),
  level           = GREATEST(user_progress.level,           EXCLUDED.level),
  xp              = GREATEST(user_progress.xp,              EXCLUDED.xp),
  exam_readiness  = GREATEST(user_progress.exam_readiness,  EXCLUDED.exam_readiness),
  updated_at      = NOW();

-- ────────────────────────────────────────────────────────────
-- STEP 2: Ensure every existing user has a user_streaks row
-- ────────────────────────────────────────────────────────────
INSERT INTO public.user_streaks (
  user_id,
  current_streak,
  best_streak,
  last_activity_date,
  updated_at
)
SELECT
  p.id,
  COALESCE((p.progress->>'currentStreak')::INT, 0),
  COALESCE((p.progress->>'bestStreak')::INT,    0),
  CASE
    WHEN p.progress->>'lastStudyDate' IS NOT NULL
     AND p.progress->>'lastStudyDate' <> ''
    THEN (p.progress->>'lastStudyDate')::DATE
    ELSE NULL
  END,
  NOW()
FROM public.profiles p
ON CONFLICT (user_id) DO UPDATE SET
  current_streak     = GREATEST(user_streaks.current_streak,   EXCLUDED.current_streak),
  best_streak        = GREATEST(user_streaks.best_streak,      EXCLUDED.best_streak),
  last_activity_date = COALESCE(user_streaks.last_activity_date, EXCLUDED.last_activity_date),
  updated_at         = NOW();

-- ────────────────────────────────────────────────────────────
-- STEP 3: Migrate badges from JSONB array → user_badges table
-- profiles.progress->>'badges' is a JSON array of badge codes
-- e.g. ["newcomer", "first_quiz"]
-- ────────────────────────────────────────────────────────────
INSERT INTO public.user_badges (user_id, badge_id, earned_at)
SELECT DISTINCT
  p.id                          AS user_id,
  b.id                          AS badge_id,
  p.created_at                  AS earned_at   -- best approximation
FROM public.profiles p
CROSS JOIN LATERAL (
  SELECT jsonb_array_elements_text(
    COALESCE(p.progress->'badges', '[]'::jsonb)
  ) AS badge_code
) badge_codes
JOIN public.badges b ON b.code = badge_codes.badge_code
ON CONFLICT (user_id, badge_id) DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- STEP 4: Bootstrap leaderboard cache for all existing users
-- ────────────────────────────────────────────────────────────
INSERT INTO public.leaderboard (
  user_id, username, avatar, xp, level, current_streak, quiz_count, updated_at
)
SELECT
  p.id,
  p.username,
  p.avatar,
  up.xp,
  up.level,
  COALESCE(us.current_streak, 0),
  up.total_quizzes,
  NOW()
FROM public.profiles p
JOIN public.user_progress up ON up.user_id = p.id
LEFT JOIN public.user_streaks us ON us.user_id = p.id
ON CONFLICT (user_id) DO UPDATE SET
  username        = EXCLUDED.username,
  avatar          = EXCLUDED.avatar,
  xp              = EXCLUDED.xp,
  level           = EXCLUDED.level,
  current_streak  = EXCLUDED.current_streak,
  quiz_count      = EXCLUDED.quiz_count,
  updated_at      = NOW();

-- ────────────────────────────────────────────────────────────
-- STEP 5: Recompute leaderboard ranks (single pass)
-- ────────────────────────────────────────────────────────────
UPDATE public.leaderboard l
SET rank = ranked.row_num
FROM (
  SELECT user_id, ROW_NUMBER() OVER (ORDER BY xp DESC, quiz_count DESC) AS row_num
  FROM public.leaderboard
) ranked
WHERE l.user_id = ranked.user_id;

-- ────────────────────────────────────────────────────────────
-- STEP 6: Log migration in admin_logs (visible in dashboard)
-- (Only if a system admin account exists; skipped otherwise)
-- ────────────────────────────────────────────────────────────
DO $$
DECLARE
  _admin_id UUID;
BEGIN
  SELECT id INTO _admin_id FROM public.profiles WHERE role = 'admin' LIMIT 1;
  IF _admin_id IS NOT NULL THEN
    INSERT INTO public.admin_logs (admin_id, action, details)
    VALUES (
      _admin_id,
      'schema_migration',
      jsonb_build_object(
        'migration', '001_full_migration',
        'description', 'Migrated profiles.progress JSONB to normalized tables',
        'migrated_users', (SELECT COUNT(*) FROM public.user_progress),
        'migrated_badges', (SELECT COUNT(*) FROM public.user_badges),
        'run_at', NOW()
      )
    );
  END IF;
END;
$$;

-- ────────────────────────────────────────────────────────────
-- STEP 7: Post-migration validation assertions
-- These will RAISE EXCEPTION and ROLLBACK if data looks wrong.
-- ────────────────────────────────────────────────────────────
DO $$
DECLARE
  _profile_count      BIGINT;
  _progress_count     BIGINT;
  _streak_count       BIGINT;
BEGIN
  SELECT COUNT(*) INTO _profile_count  FROM public.profiles;
  SELECT COUNT(*) INTO _progress_count FROM public.user_progress;
  SELECT COUNT(*) INTO _streak_count   FROM public.user_streaks;

  IF _progress_count < _profile_count THEN
    RAISE EXCEPTION
      'Migration validation failed: % profiles but only % user_progress rows',
      _profile_count, _progress_count;
  END IF;

  IF _streak_count < _profile_count THEN
    RAISE EXCEPTION
      'Migration validation failed: % profiles but only % user_streaks rows',
      _profile_count, _streak_count;
  END IF;

  RAISE NOTICE 'Migration 001 validated OK: % users, % progress rows, % streak rows',
    _profile_count, _progress_count, _streak_count;
END;
$$;

COMMIT;

-- ============================================================
-- POST-MIGRATION NOTES
-- ============================================================
-- After confirming the app is running correctly with the new schema:
--
-- 1. Remove the progress JSONB column from profiles:
--    ALTER TABLE public.profiles DROP COLUMN progress;
--
-- 2. Keep settings JSONB (small, not worth normalizing):
--    It controls language/theme/notifications — fine as JSONB.
--
-- 3. Set up pg_cron to refresh daily_stats daily:
--    SELECT cron.schedule('0 1 * * *', $$
--      INSERT INTO public.daily_stats (stat_date, total_users, new_users, active_users,
--        total_quizzes_taken, total_lessons_completed, total_posts_created, avg_quiz_score)
--      SELECT
--        CURRENT_DATE - 1,
--        (SELECT COUNT(*) FROM public.profiles),
--        (SELECT COUNT(*) FROM public.profiles WHERE created_at::date = CURRENT_DATE - 1),
--        (SELECT COUNT(DISTINCT user_id) FROM public.quiz_attempts
--         WHERE created_at::date = CURRENT_DATE - 1),
--        (SELECT COUNT(*) FROM public.quiz_attempts WHERE created_at::date = CURRENT_DATE - 1),
--        (SELECT COUNT(*) FROM public.user_lesson_progress
--         WHERE status = 'completed' AND updated_at::date = CURRENT_DATE - 1),
--        (SELECT COUNT(*) FROM public.posts WHERE created_at::date = CURRENT_DATE - 1),
--        (SELECT AVG(score_percentage) FROM public.quiz_attempts
--         WHERE created_at::date = CURRENT_DATE - 1 AND completed_at IS NOT NULL)
--      ON CONFLICT (stat_date) DO UPDATE SET
--        total_users             = EXCLUDED.total_users,
--        new_users               = EXCLUDED.new_users,
--        active_users            = EXCLUDED.active_users,
--        total_quizzes_taken     = EXCLUDED.total_quizzes_taken,
--        total_lessons_completed = EXCLUDED.total_lessons_completed,
--        total_posts_created     = EXCLUDED.total_posts_created,
--        avg_quiz_score          = EXCLUDED.avg_quiz_score,
--        updated_at              = NOW();
--    $$);
--
-- 4. Drop the deprecated progress column once confirmed stable (see above).
-- ============================================================
