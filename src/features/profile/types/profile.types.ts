import type { ExamReadinessLevel } from '@/services/examReadinessService';

// ─── Form types ────────────────────────────────────────────────────────────────

export interface ProfileEditForm {
  firstName: string;
  lastName: string;
  username: string;
  bio: string;
  email: string;
  phone: string;
  phoneCode: string;
  gender: string;
  birthDate: string;
  province: string;
  italianLevel: string;
  privacyHideStats: boolean;
}

export interface CompleteProfileForm {
  birthDate: string;
  country: string;
  province: string;
  gender: string;
  phoneCode: string;
  phone: string;
  italianLevel: string;
}

export interface ProfileUpdatePayload {
  name?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  bio?: string;
  email?: string;
  phone?: string;
  phoneCode?: string;
  gender?: string;
  birthDate?: string;
  province?: string;
  italianLevel?: string;
  privacyHideStats?: boolean;
  profileComplete?: boolean;
  nameChangeDate?: string;
  usernameChangeDate?: string;
}

// ─── Social / stat types ───────────────────────────────────────────────────────

export interface SocialUser {
  id: string;
  name: string;
  avatar?: string;
  username?: string;
}

export interface ProfileStats {
  postsCount: number;
  quizzesCount: number;
  followersCount: number;
  followingCount: number;
  followersList: SocialUser[];
  followingList: SocialUser[];
}

// ─── Exam readiness types ─────────────────────────────────────────────────────

export interface ExamReadinessData {
  score: number;
  level: ExamReadinessLevel;
  factors: {
    examSimulation: number;
    quizAccuracy: number;
    coverage: number;
    consistency: number;
    trend: number;
  };
  weaknessPenalty: number;
}

// ─── UserProfile (public view, used in UserProfilePage) ───────────────────────

export interface UserProfile {
  name: string;
  username: string;
  avatar: string;
  bio: string;
  verified: boolean;
  postsCount: number;
  followersCount: number;
  followingCount: number;
  hideStats: boolean;
  joinedAt?: string;
  examReadiness?: number;
  totalQuizzes?: number;
  correctAnswers?: number;
  wrongAnswers?: number;
  level?: number;
  xp?: number;
}

// ─── UI state types ───────────────────────────────────────────────────────────

export type UsernameStatus = 'idle' | 'checking' | 'ok' | 'taken' | 'invalid';
export type ActiveStatView = null | 'posts' | 'quizzes' | 'followers' | 'following';
export type UserTabType = 'posts' | 'quizzes';
export type UserStatView = 'followers' | 'following' | null;
