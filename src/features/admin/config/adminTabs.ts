/**
 * Admin tab configuration — single source of truth.
 * Used by AdminPage to build the tab bar and lazy-load tab components.
 */
import type { AdminTabConfig } from '../types/admin.types';

export const ADMIN_TAB_CONFIG: AdminTabConfig[] = [
  { id: 'overview',    icon: 'dashboard',      label: 'admin.tab_overview',    permKey: 'overview' },
  { id: 'sections',    icon: 'folder',         label: 'admin.tab_sections',    permKey: 'sections' },
  { id: 'lessons',     icon: 'school',         label: 'admin.tab_lessons',     permKey: 'lessons' },
  { id: 'questions',   icon: 'quiz',           label: 'admin.tab_questions',   permKey: 'questions' },
  { id: 'signs',       icon: 'traffic',        label: 'admin.tab_signs',       permKey: 'signs' },
  { id: 'dictionary',  icon: 'menu_book',      label: 'admin.tab_dictionary',  permKey: 'dictionary' },
  { id: 'users',       icon: 'group',          label: 'admin.tab_users',       permKey: 'users' },
  { id: 'posts',       icon: 'forum',          label: 'admin.tab_posts',       permKey: 'posts' },
  { id: 'comments',    icon: 'chat_bubble',    label: 'admin.tab_comments',    permKey: 'comments' },
  { id: 'reports',     icon: 'flag',           label: 'admin.tab_reports',     permKey: 'reports' },
  { id: 'logs',        icon: 'history',        label: 'admin.tab_logs',        permKey: 'logs' },
  { id: 'analytics',   icon: 'analytics',      label: 'admin.tab_analytics',   permKey: 'analytics' },
  { id: 'languages',   icon: 'translate',      label: 'admin.tab_languages' },
  { id: 'media',       icon: 'perm_media',     label: 'admin.tab_media' },
];
