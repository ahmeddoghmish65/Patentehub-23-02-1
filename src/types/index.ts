// Re-export all database types so the rest of the app imports from here,
// not from the db layer directly.
export type {
  User,
  UserProgress,
  UserSettings,
  Section,
  Lesson,
  Question,
  Sign,
  SignSection,
  DictionarySection,
  DictionaryEntry,
  Post,
  Comment,
  Like,
  Report,
  QuizResult,
  UserMistake,
  TrainingSession,
  Notification,
  AdminLog,
} from '@/db/database';

// ─── App-level types ───────────────────────────────────────────────────────

/** Roles understood by the permission system */
export type Role = 'user' | 'admin' | 'manager';

/** Permission codes issued to managers */
export type Permission =
  | 'manage_content'
  | 'manage_users'
  | 'manage_community'
  | 'view_reports'
  | 'view_logs';

/** Navigation state passed via React Router location.state */
export interface NavigationState {
  lessonId?: string;
  sectionId?: string;
  userId?: string;
  openPostId?: string;
  [key: string]: string | undefined;
}
