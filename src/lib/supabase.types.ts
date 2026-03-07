/** Auto-generated types for Supabase tables.
 *  Run `npx supabase gen types typescript --linked > src/lib/supabase.types.ts`
 *  to regenerate from your project schema. */

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: Partial<ProfileRow> & { id: string; email: string };
        Update: Partial<ProfileRow>;
      };
    };
    Views: Record<string, never>;
    Functions: {
      check_username: {
        Args: { requested_username: string };
        Returns: { available: boolean; suggestions: string[] };
      };
    };
    Enums: {
      user_role: 'user' | 'manager' | 'admin';
    };
  };
}

export interface ProfileRow {
  id: string;
  email: string;
  name: string | null;
  first_name: string | null;
  last_name: string | null;
  username: string | null;
  avatar: string;
  bio: string;
  role: 'user' | 'manager' | 'admin';
  permissions: string[];
  is_banned: boolean;
  verified: boolean;
  following: string[];
  profile_complete: boolean;
  birth_date: string;
  country: string;
  province: string;
  gender: string;
  phone: string;
  phone_code: string;
  italian_level: string;
  privacy_hide_stats: boolean;
  created_at: string;
  last_login: string;
  progress: UserProgressJson;
  settings: UserSettingsJson;
}

export interface UserProgressJson {
  totalQuizzes: number;
  correctAnswers: number;
  wrongAnswers: number;
  completedLessons: string[];
  completedTopics: string[];
  currentStreak: number;
  bestStreak: number;
  lastStudyDate: string;
  totalStudyDays: number;
  level: number;
  xp: number;
  badges: string[];
  examReadiness: number;
}

export interface UserSettingsJson {
  language: 'ar' | 'it' | 'both';
  theme: 'light' | 'dark';
  notifications: boolean;
  soundEffects: boolean;
  fontSize: 'small' | 'medium' | 'large';
}
