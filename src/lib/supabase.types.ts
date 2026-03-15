// ============================================================
// PatenteHub — Supabase Database Types (schema v2)
// Regenerate with: npx supabase gen types typescript --linked
// ============================================================

// ────────────────────────────────────────────────────────────
// PRIMITIVE ENUMS / UNIONS
// ────────────────────────────────────────────────────────────
export type UserRole         = 'user' | 'manager' | 'admin';
export type LessonType       = 'theory' | 'video' | 'interactive';
export type Difficulty       = 'easy' | 'medium' | 'hard';
export type QuizType         = 'topic' | 'exam' | 'custom' | 'daily' | 'practice';
export type ProgressStatus   = 'not_started' | 'in_progress' | 'completed';
export type BadgeType        = 'achievement' | 'streak' | 'quiz' | 'social' | 'special';
export type PostType         = 'discussion' | 'question' | 'tip' | 'announcement';
export type LikeTargetType   = 'post' | 'comment';
export type ReportTargetType = 'post' | 'comment' | 'user';
export type ReportReason     = 'spam' | 'harassment' | 'inappropriate' | 'misinformation' | 'other';
export type ReportStatus     = 'pending' | 'reviewed' | 'resolved' | 'dismissed';
export type AuditOperation   = 'INSERT' | 'UPDATE' | 'DELETE';
export type DeviceType       = 'mobile' | 'tablet' | 'desktop';
export type ContactStatus    = 'new' | 'read' | 'replied' | 'archived';

// ────────────────────────────────────────────────────────────
// JSONB SHAPES (still embedded in profiles.settings)
// ────────────────────────────────────────────────────────────
export interface UserSettingsJson {
  language:      'ar' | 'it' | 'both' | 'en_it';
  theme:         'light' | 'dark';
  notifications: boolean;
  soundEffects:  boolean;
  fontSize:      'small' | 'medium' | 'large';
}

/** @deprecated Migrate to user_progress + user_badges tables */
export interface UserProgressJson {
  totalQuizzes:     number;
  correctAnswers:   number;
  wrongAnswers:     number;
  completedLessons: string[];
  completedTopics:  string[];
  currentStreak:    number;
  bestStreak:       number;
  lastStudyDate:    string;
  totalStudyDays:   number;
  level:            number;
  xp:               number;
  badges:           string[];
  examReadiness:    number;
}

// ────────────────────────────────────────────────────────────
// TABLE ROW TYPES
// ────────────────────────────────────────────────────────────

// ── profiles ─────────────────────────────────────────────────
export interface ProfileRow {
  id:                 string;
  email:              string;
  name:               string;
  first_name:         string;
  last_name:          string;
  username:           string | null;
  avatar:             string;
  bio:                string;
  role:               UserRole;
  permissions:        string[];
  is_banned:          boolean;
  verified:           boolean;
  following:          string[];
  profile_complete:   boolean;
  birth_date:         string;
  country:            string;
  province:           string;
  gender:             string;
  phone:              string;
  phone_code:         string;
  italian_level:      string;
  privacy_hide_stats: boolean;
  created_at:         string;
  last_login:         string;
  /** @deprecated Use user_progress table */
  progress:           UserProgressJson;
  settings:           UserSettingsJson;
}

// ── contact_messages ─────────────────────────────────────────
export interface ContactMessageRow {
  id:         string;
  name:       string;
  email:      string;
  subject:    string;
  message:    string;
  status:     ContactStatus;
  created_at: string;
}

// ── modules ───────────────────────────────────────────────────
export interface ModuleRow {
  id:             string;
  code:           string;
  title_it:       string;
  title_ar:       string | null;
  description_it: string | null;
  description_ar: string | null;
  icon:           string | null;
  color:          string;
  sort_order:     number;
  is_active:      boolean;
  created_at:     string;
  updated_at:     string;
}

// ── topics ────────────────────────────────────────────────────
export interface TopicRow {
  id:             string;
  module_id:      string;
  code:           string;
  title_it:       string;
  title_ar:       string | null;
  description_it: string | null;
  description_ar: string | null;
  icon:           string | null;
  sort_order:     number;
  is_active:      boolean;
  created_at:     string;
  updated_at:     string;
}

// ── lessons ───────────────────────────────────────────────────
export interface LessonContentBlock {
  type:    'text' | 'image' | 'video' | 'highlight' | 'list';
  content: string | string[];
  meta?:   Record<string, unknown>;
}

export interface LessonRow {
  id:                string;
  topic_id:          string;
  code:              string;
  title_it:          string;
  title_ar:          string | null;
  content_it:        LessonContentBlock[] | null;
  content_ar:        LessonContentBlock[] | null;
  lesson_type:       LessonType;
  estimated_minutes: number;
  xp_reward:         number;
  sort_order:        number;
  is_active:         boolean;
  created_at:        string;
  updated_at:        string;
}

// ── questions ─────────────────────────────────────────────────
export interface QuestionRow {
  id:             string;
  topic_id:       string | null;
  external_id:    string | null;
  question_it:    string;
  question_ar:    string | null;
  explanation_it: string | null;
  explanation_ar: string | null;
  image_url:      string | null;
  difficulty:     Difficulty;
  tags:           string[];
  is_active:      boolean;
  times_shown:    number;
  times_correct:  number;
  created_at:     string;
  updated_at:     string;
}

// ── answers ───────────────────────────────────────────────────
export interface AnswerRow {
  id:          string;
  question_id: string;
  answer_it:   string;
  answer_ar:   string | null;
  is_correct:  boolean;
  sort_order:  number;
}

// ── quizzes ───────────────────────────────────────────────────
export interface QuizRow {
  id:                 string;
  title_it:           string;
  title_ar:           string | null;
  description_it:     string | null;
  description_ar:     string | null;
  quiz_type:          QuizType;
  topic_id:           string | null;
  time_limit_seconds: number | null;
  pass_score:         number;
  question_count:     number;
  is_active:          boolean;
  created_by:         string | null;
  created_at:         string;
  updated_at:         string;
}

// ── quiz_questions ────────────────────────────────────────────
export interface QuizQuestionRow {
  id:          string;
  quiz_id:     string;
  question_id: string;
  sort_order:  number;
}

// ── quiz_attempts ─────────────────────────────────────────────
export interface QuizAttemptRow {
  id:                 string;
  user_id:            string;
  quiz_id:            string | null;
  quiz_type:          string;
  topic_id:           string | null;
  started_at:         string;
  completed_at:       string | null;
  time_taken_seconds: number | null;
  total_questions:    number;
  correct_answers:    number;
  wrong_answers:      number;
  score_percentage:   number | null;
  passed:             boolean | null;
  xp_earned:          number;
  created_at:         string;
}

// ── user_answers ──────────────────────────────────────────────
export interface UserAnswerRow {
  id:                 string;
  attempt_id:         string;
  question_id:        string;
  selected_answer_id: string | null;
  is_correct:         boolean;
  time_taken_ms:      number | null;
  answered_at:        string;
}

// ── user_progress ─────────────────────────────────────────────
export interface UserProgressRow {
  user_id:          string;
  total_quizzes:    number;
  correct_answers:  number;
  wrong_answers:    number;
  current_streak:   number;
  best_streak:      number;
  last_study_date:  string | null;
  total_study_days: number;
  level:            number;
  xp:               number;
  exam_readiness:   number;
  updated_at:       string;
}

// ── user_lesson_progress ──────────────────────────────────────
export interface UserLessonProgressRow {
  id:                  string;
  user_id:             string;
  lesson_id:           string;
  status:              ProgressStatus;
  progress_percentage: number;
  completed_at:        string | null;
  xp_earned:           number;
  created_at:          string;
  updated_at:          string;
}

// ── user_topic_progress ───────────────────────────────────────
export interface UserTopicProgressRow {
  id:                    string;
  user_id:               string;
  topic_id:              string;
  status:                ProgressStatus;
  completion_percentage: number;
  completed_at:          string | null;
  created_at:            string;
  updated_at:            string;
}

// ── badges ────────────────────────────────────────────────────
export interface BadgeRow {
  id:                string;
  code:              string;
  name_it:           string;
  name_ar:           string | null;
  description_it:    string | null;
  description_ar:    string | null;
  icon:              string | null;
  badge_type:        BadgeType;
  xp_value:          number;
  requirement_type:  string | null;
  requirement_value: number | null;
  is_active:         boolean;
  created_at:        string;
}

// ── user_badges ───────────────────────────────────────────────
export interface UserBadgeRow {
  id:        string;
  user_id:   string;
  badge_id:  string;
  earned_at: string;
}

// ── user_streaks ──────────────────────────────────────────────
export interface UserStreakRow {
  user_id:            string;
  current_streak:     number;
  best_streak:        number;
  last_activity_date: string | null;
  streak_start_date:  string | null;
  updated_at:         string;
}

// ── leaderboard ───────────────────────────────────────────────
export interface LeaderboardRow {
  user_id:        string;
  username:       string | null;
  avatar:         string | null;
  xp:             number;
  level:          number;
  current_streak: number;
  quiz_count:     number;
  rank:           number | null;
  updated_at:     string;
}

// ── posts ─────────────────────────────────────────────────────
export interface PostRow {
  id:             string;
  author_id:      string;
  title:          string | null;
  content:        string;
  post_type:      PostType;
  topic_id:       string | null;
  image_url:      string | null;
  is_pinned:      boolean;
  is_locked:      boolean;
  is_deleted:     boolean;
  likes_count:    number;
  comments_count: number;
  views_count:    number;
  created_at:     string;
  updated_at:     string;
}

// ── comments ──────────────────────────────────────────────────
export interface CommentRow {
  id:          string;
  post_id:     string;
  author_id:   string;
  parent_id:   string | null;
  content:     string;
  is_deleted:  boolean;
  likes_count: number;
  created_at:  string;
  updated_at:  string;
}

// ── likes ─────────────────────────────────────────────────────
export interface LikeRow {
  id:          string;
  user_id:     string;
  target_type: LikeTargetType;
  target_id:   string;
  created_at:  string;
}

// ── reports ───────────────────────────────────────────────────
export interface ReportRow {
  id:          string;
  reporter_id: string;
  target_type: ReportTargetType;
  target_id:   string;
  reason:      ReportReason;
  description: string | null;
  status:      ReportStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at:  string;
}

// ── notifications ─────────────────────────────────────────────
export interface NotificationRow {
  id:         string;
  user_id:    string;
  type:       string;
  title:      string;
  body:       string | null;
  data:       Record<string, unknown>;
  is_read:    boolean;
  read_at:    string | null;
  created_at: string;
}

// ── admin_logs ────────────────────────────────────────────────
export interface AdminLogRow {
  id:          string;
  admin_id:    string;
  action:      string;
  target_type: string | null;
  target_id:   string | null;
  details:     Record<string, unknown>;
  ip_address:  string | null;
  created_at:  string;
}

// ── audit_logs ────────────────────────────────────────────────
export interface AuditLogRow {
  id:         string;
  table_name: string;
  row_id:     string;
  operation:  AuditOperation;
  old_data:   Record<string, unknown> | null;
  new_data:   Record<string, unknown> | null;
  changed_by: string | null;
  changed_at: string;
}

// ── analytics_events ─────────────────────────────────────────
export interface AnalyticsEventRow {
  id:          string;
  user_id:     string | null;
  event_type:  string;
  properties:  Record<string, unknown>;
  session_id:  string | null;
  device_type: DeviceType | null;
  created_at:  string;
}

// ── daily_stats ───────────────────────────────────────────────
export interface DailyStatRow {
  id:                      string;
  stat_date:               string;
  total_users:             number;
  new_users:               number;
  active_users:            number;
  total_quizzes_taken:     number;
  total_lessons_completed: number;
  total_posts_created:     number;
  avg_quiz_score:          number | null;
  created_at:              string;
  updated_at:              string;
}

// ────────────────────────────────────────────────────────────
// RPC RETURN TYPES
// ────────────────────────────────────────────────────────────
export interface CheckUsernameResult {
  available:   boolean;
  suggestions: string[];
}

export interface LeaderboardPageRow {
  user_id:        string;
  username:       string | null;
  avatar:         string | null;
  xp:             number;
  level:          number;
  current_streak: number;
  quiz_count:     number;
  rank:           number;
}

// ────────────────────────────────────────────────────────────
// COMPOSITE / JOIN TYPES (convenience — not DB rows)
// ────────────────────────────────────────────────────────────

/** Question with its answers pre-joined */
export interface QuestionWithAnswers extends QuestionRow {
  answers: AnswerRow[];
}

/** Post with author profile data */
export interface PostWithAuthor extends PostRow {
  author: Pick<ProfileRow, 'id' | 'username' | 'avatar' | 'name'>;
}

/** Comment with author profile data and optional replies */
export interface CommentWithAuthor extends CommentRow {
  author:   Pick<ProfileRow, 'id' | 'username' | 'avatar' | 'name'>;
  replies?: CommentWithAuthor[];
}

/** Full quiz attempt with answered questions */
export interface AttemptWithAnswers extends QuizAttemptRow {
  user_answers: (UserAnswerRow & {
    question:        QuestionRow;
    selected_answer: AnswerRow | null;
  })[];
}

/** User badge with badge details */
export interface UserBadgeWithDetails extends UserBadgeRow {
  badge: BadgeRow;
}

/** Lesson with topic and module context */
export interface LessonWithContext extends LessonRow {
  topic: TopicRow & { module: ModuleRow };
}

// ────────────────────────────────────────────────────────────
// SUPABASE DATABASE MANIFEST
// ────────────────────────────────────────────────────────────
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row:    ProfileRow;
        Insert: Partial<ProfileRow> & { id: string; email: string };
        Update: Partial<ProfileRow>;
      };
      contact_messages: {
        Row:    ContactMessageRow;
        Insert: Omit<ContactMessageRow, 'id' | 'created_at' | 'status'> & { status?: ContactStatus };
        Update: Partial<ContactMessageRow>;
      };
      modules: {
        Row:    ModuleRow;
        Insert: Omit<ModuleRow, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<ModuleRow, 'id' | 'created_at'>>;
      };
      topics: {
        Row:    TopicRow;
        Insert: Omit<TopicRow, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<TopicRow, 'id' | 'created_at'>>;
      };
      lessons: {
        Row:    LessonRow;
        Insert: Omit<LessonRow, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<LessonRow, 'id' | 'created_at'>>;
      };
      questions: {
        Row:    QuestionRow;
        Insert: Omit<QuestionRow, 'id' | 'created_at' | 'updated_at' | 'times_shown' | 'times_correct'>;
        Update: Partial<Omit<QuestionRow, 'id' | 'created_at'>>;
      };
      answers: {
        Row:    AnswerRow;
        Insert: Omit<AnswerRow, 'id'>;
        Update: Partial<Omit<AnswerRow, 'id'>>;
      };
      quizzes: {
        Row:    QuizRow;
        Insert: Omit<QuizRow, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<QuizRow, 'id' | 'created_at'>>;
      };
      quiz_questions: {
        Row:    QuizQuestionRow;
        Insert: Omit<QuizQuestionRow, 'id'>;
        Update: Partial<Omit<QuizQuestionRow, 'id'>>;
      };
      quiz_attempts: {
        Row:    QuizAttemptRow;
        Insert: Omit<QuizAttemptRow, 'id' | 'created_at'>;
        Update: Partial<Omit<QuizAttemptRow, 'id' | 'created_at'>>;
      };
      user_answers: {
        Row:    UserAnswerRow;
        Insert: Omit<UserAnswerRow, 'id' | 'answered_at'>;
        Update: Partial<Omit<UserAnswerRow, 'id'>>;
      };
      user_progress: {
        Row:    UserProgressRow;
        Insert: Partial<UserProgressRow> & { user_id: string };
        Update: Partial<Omit<UserProgressRow, 'user_id'>>;
      };
      user_lesson_progress: {
        Row:    UserLessonProgressRow;
        Insert: Omit<UserLessonProgressRow, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserLessonProgressRow, 'id' | 'created_at'>>;
      };
      user_topic_progress: {
        Row:    UserTopicProgressRow;
        Insert: Omit<UserTopicProgressRow, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserTopicProgressRow, 'id' | 'created_at'>>;
      };
      badges: {
        Row:    BadgeRow;
        Insert: Omit<BadgeRow, 'id' | 'created_at'>;
        Update: Partial<Omit<BadgeRow, 'id' | 'created_at'>>;
      };
      user_badges: {
        Row:    UserBadgeRow;
        Insert: Omit<UserBadgeRow, 'id' | 'earned_at'>;
        Update: Partial<Omit<UserBadgeRow, 'id'>>;
      };
      user_streaks: {
        Row:    UserStreakRow;
        Insert: Partial<UserStreakRow> & { user_id: string };
        Update: Partial<Omit<UserStreakRow, 'user_id'>>;
      };
      leaderboard: {
        Row:    LeaderboardRow;
        Insert: Omit<LeaderboardRow, 'updated_at'>;
        Update: Partial<Omit<LeaderboardRow, 'user_id'>>;
      };
      posts: {
        Row:    PostRow;
        Insert: Omit<PostRow, 'id' | 'created_at' | 'updated_at' | 'likes_count' | 'comments_count' | 'views_count'>;
        Update: Partial<Omit<PostRow, 'id' | 'created_at'>>;
      };
      comments: {
        Row:    CommentRow;
        Insert: Omit<CommentRow, 'id' | 'created_at' | 'updated_at' | 'likes_count'>;
        Update: Partial<Omit<CommentRow, 'id' | 'created_at'>>;
      };
      likes: {
        Row:    LikeRow;
        Insert: Omit<LikeRow, 'id' | 'created_at'>;
        Update: never;
      };
      reports: {
        Row:    ReportRow;
        Insert: Omit<ReportRow, 'id' | 'created_at'>;
        Update: Partial<Omit<ReportRow, 'id' | 'created_at' | 'reporter_id'>>;
      };
      notifications: {
        Row:    NotificationRow;
        Insert: Omit<NotificationRow, 'id' | 'created_at'>;
        Update: Partial<Pick<NotificationRow, 'is_read' | 'read_at'>>;
      };
      admin_logs: {
        Row:    AdminLogRow;
        Insert: Omit<AdminLogRow, 'id' | 'created_at'>;
        Update: never;
      };
      audit_logs: {
        Row:    AuditLogRow;
        Insert: never;   // written by triggers only
        Update: never;
      };
      analytics_events: {
        Row:    AnalyticsEventRow;
        Insert: Omit<AnalyticsEventRow, 'id' | 'created_at'>;
        Update: never;   // append-only
      };
      daily_stats: {
        Row:    DailyStatRow;
        Insert: Omit<DailyStatRow, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<DailyStatRow, 'id' | 'created_at'>>;
      };
    };
    Views: Record<string, never>;
    Functions: {
      check_username: {
        Args:    { requested_username: string };
        Returns: CheckUsernameResult;
      };
      update_last_login: {
        Args:    { user_id: string };
        Returns: void;
      };
      get_leaderboard_page: {
        Args:    { p_limit?: number; p_offset?: number };
        Returns: LeaderboardPageRow[];
      };
      get_user_rank: {
        Args:    { p_user_id: string };
        Returns: number;
      };
      record_quiz_result: {
        Args: {
          p_attempt_id:   string;
          p_correct:      number;
          p_wrong:        number;
          p_total:        number;
          p_time_seconds: number;
          p_xp_earned:    number;
        };
        Returns: void;
      };
      is_admin: {
        Args:    Record<string, never>;
        Returns: boolean;
      };
      is_manager_or_admin: {
        Args:    Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: {
      user_role:         UserRole;
      lesson_type:       LessonType;
      difficulty:        Difficulty;
      quiz_type:         QuizType;
      progress_status:   ProgressStatus;
      badge_type:        BadgeType;
      post_type:         PostType;
      like_target_type:  LikeTargetType;
      report_reason:     ReportReason;
      report_status:     ReportStatus;
      audit_operation:   AuditOperation;
    };
  };
}
