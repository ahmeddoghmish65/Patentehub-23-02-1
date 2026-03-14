/**
 * Centralised route path constants.
 * Use these everywhere instead of hard-coding strings.
 */
export const ROUTES = {
  // Public
  LANDING: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  RESET_PASSWORD: '/reset-password',
  CONTACT: '/contact',
  PRIVACY_POLICY: '/privacy-policy',
  TERMS_OF_SERVICE: '/terms-of-service',

  // Private
  DASHBOARD: '/dashboard',
  LESSONS: '/lessons',
  LESSON_DETAIL: '/lessons/:lessonId',
  QUIZ: '/quiz',
  SIGNS: '/signs',
  DICTIONARY: '/dictionary',
  TRAINING: '/training',
  COMMUNITY: '/community',
  PROFILE: '/profile',
  USER_PROFILE: '/profile/:username',
  MISTAKES: '/mistakes',
  EXAM_SIMULATOR: '/exam',
  QUESTIONS_BROWSE: '/questions',

  // Admin only
  ADMIN: '/admin',
} as const;

/** Helper to build concrete lesson-detail URL */
export const buildLessonUrl = (lessonId: string) =>
  `/lessons/${lessonId}`;

/** Helper to build user-profile URL using username */
export const buildUserProfileUrl = (username: string) =>
  `/profile/${username}`;
