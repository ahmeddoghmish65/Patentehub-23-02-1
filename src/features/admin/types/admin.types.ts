/**
 * Admin feature — shared types and type aliases.
 * Augments the global types with admin-specific shapes.
 */

export type AdminTab =
  | 'overview'
  | 'sections'
  | 'lessons'
  | 'questions'
  | 'signs'
  | 'dictionary'
  | 'users'
  | 'posts'
  | 'comments'
  | 'reports'
  | 'logs'
  | 'analytics'
  | 'languages'
  | 'media';

export type ContentView = 'active' | 'archived' | 'deleted' | 'banned';

export type ModalType =
  | 'section'
  | 'lesson'
  | 'question'
  | 'sign'
  | 'signSection'
  | 'dictSection'
  | 'dictEntry';

export interface AdminModal {
  type: ModalType;
  data?: Record<string, unknown>;
}

export interface ConfirmDelete {
  type: string;
  id: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyItem = any;

export interface TableColumn {
  key: string;
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  render?: (v: any) => any;
}

export interface MediaItem {
  src: string;
  label: string;
  source: 'sections' | 'lessons' | 'signs' | 'questions';
  id: string;
}

export interface AdminTabConfig {
  id: AdminTab;
  icon: string;
  label: string;
  permKey?: string;
}

export interface AdminStats {
  totalUsers: number;
  totalPosts: number;
  totalQuestions: number;
  totalSections: number;
  totalLessons: number;
  totalSigns: number;
  totalReports: number;
  activeToday: number;
}

export interface VisitStats {
  totalVisits: number;
  last7DaysVisits: number;
  last30DaysVisits: number;
  sessions7: number;
  sessions30: number;
  dailyBreakdown: Record<string, number>;
  pageBreakdown: Record<string, number>;
}
