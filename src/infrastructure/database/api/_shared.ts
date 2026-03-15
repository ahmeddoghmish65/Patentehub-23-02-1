import {
  getDB, generateId,
  type User, type AdminLog,
} from '../database';

// ============ BROWSER LANGUAGE DETECTION ============
export function detectDefaultContentLang(): 'ar' | 'it' | 'both' {
  const langs: readonly string[] =
    (navigator.languages?.length ? navigator.languages : [navigator.language]) as string[];
  for (const lang of langs) {
    if (!lang) continue;
    const prefix = lang.split('-')[0].toLowerCase();
    if (prefix === 'it') return 'it';
    if (prefix === 'ar') return 'both';
  }
  return 'both';
}

// ============ RATE LIMITING ============
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
export function checkRateLimit(key: string, max = 30, windowMs = 60000): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now > entry.resetTime) { rateLimitMap.set(key, { count: 1, resetTime: now + windowMs }); return true; }
  if (entry.count >= max) return false;
  entry.count++;
  return true;
}

// ============ VALIDATION ============
export function validateEmail(e: string): boolean { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }
export function sanitize(s: string): string { return s.replace(/<[^>]*>/g, '').trim(); }

// ============ API RESULT TYPES ============
export interface ApiRes<T = unknown> { success: boolean; data?: T; error?: string; code: number; }
export function ok<T>(data: T, code = 200): ApiRes<T> { return { success: true, data, code }; }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function err(error: string, code = 400): ApiRes<any> { return { success: false, error, code }; }

// ============ AUTH HELPERS ============
export async function getAuthUser(token: string): Promise<User | null> {
  const db = await getDB();
  const at = await db.get('authTokens', token);
  if (!at || new Date(at.expiresAt) < new Date()) return null;
  return db.get('users', at.userId);
}

export async function isAdmin(token: string): Promise<boolean> {
  const u = await getAuthUser(token);
  if (!u) return false;
  if (u.role === 'admin') return true;
  if (u.role === 'manager') return true;
  return false;
}

// ============ HELPERS ============
export async function logAdmin(token: string, action: string, details: string) {
  const user = await getAuthUser(token);
  if (!user) return;
  const db = await getDB();
  const log: AdminLog = { id: generateId(), adminId: user.id, action, details, createdAt: new Date().toISOString() };
  await db.put('adminLogs', log);
}
