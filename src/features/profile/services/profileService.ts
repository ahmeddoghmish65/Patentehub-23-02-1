/**
 * profileService.ts
 * All database / persistence operations for the profile feature.
 * Hooks & components must call this — never access the DB directly.
 */
import { getDB, verifyPassword, hashPassword } from '@/db/database';
import type { ProfileUpdatePayload, CompleteProfileForm, SocialUser } from '../types/profile.types';
import { DAYS_60_MS } from '../utils/profileUtils';

// ─── Read ──────────────────────────────────────────────────────────────────────

export async function getProfileChangeDates(
  userId: string,
): Promise<{ nameChangeDate?: string; usernameChangeDate?: string }> {
  const db = await getDB();
  const u = await db.get('users', userId);
  return { nameChangeDate: u?.nameChangeDate, usernameChangeDate: u?.usernameChangeDate };
}

export async function getSocialStats(
  userId: string,
): Promise<{ followersList: SocialUser[]; followingList: SocialUser[]; followingIds: string[] }> {
  const db = await getDB();
  const allUsers = await db.getAll('users');

  const followersList: SocialUser[] = allUsers
    .filter(u => {
      try {
        const raw = localStorage.getItem(`following_${u.id}`);
        return raw ? (JSON.parse(raw) as string[]).includes(userId) : false;
      } catch { return false; }
    })
    .map(u => ({ id: u.id, name: u.name, avatar: u.avatar, username: u.username }));

  const followingIds: string[] = (() => {
    try {
      const raw = localStorage.getItem(`following_${userId}`);
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch { return []; }
  })();

  const followingList: SocialUser[] = allUsers
    .filter(u => followingIds.includes(u.id))
    .map(u => ({ id: u.id, name: u.name, avatar: u.avatar, username: u.username }));

  return { followersList, followingList, followingIds };
}

export async function checkUsernameAvailability(
  username: string,
  currentUserId: string,
): Promise<boolean> {
  const db = await getDB();
  const all = await db.getAll('users');
  return !all.some(
    u => u.id !== currentUserId && (u.username || '').toLowerCase() === username.toLowerCase(),
  );
}

// ─── Write ─────────────────────────────────────────────────────────────────────

export interface SaveProfileResult {
  ok: boolean;
  error?: string;
}

export async function saveProfileEdit(
  userId: string,
  payload: ProfileUpdatePayload,
  originalName: string,
  originalUsername: string | undefined,
): Promise<SaveProfileResult> {
  const db = await getDB();
  const u = await db.get('users', userId);
  if (!u) return { ok: false, error: 'user_not_found' };

  const now = new Date();
  const newName = `${payload.firstName ?? ''} ${payload.lastName ?? ''}`.trim();

  // 60-day name cooldown
  if (newName && newName !== originalName && u.nameChangeDate) {
    const diff = now.getTime() - new Date(u.nameChangeDate).getTime();
    if (diff < DAYS_60_MS) {
      const daysLeft = Math.ceil((DAYS_60_MS - diff) / (24 * 60 * 60 * 1000));
      return { ok: false, error: `name_cooldown:${daysLeft}` };
    }
  }

  // 60-day username cooldown
  if (payload.username && payload.username !== originalUsername && u.usernameChangeDate) {
    const diff = now.getTime() - new Date(u.usernameChangeDate).getTime();
    if (diff < DAYS_60_MS) {
      const daysLeft = Math.ceil((DAYS_60_MS - diff) / (24 * 60 * 60 * 1000));
      return { ok: false, error: `username_cooldown:${daysLeft}` };
    }
  }

  if (newName && newName !== originalName) u.nameChangeDate = now.toISOString();
  if (payload.username && payload.username !== originalUsername) u.usernameChangeDate = now.toISOString();

  if (payload.firstName !== undefined) u.firstName = payload.firstName;
  if (payload.lastName !== undefined)  u.lastName  = payload.lastName;
  if (newName)                         u.name      = newName;
  if (payload.username !== undefined)  u.username  = payload.username;
  if (payload.bio !== undefined) {
    u.bio = payload.bio;
    localStorage.setItem(`bio_${userId}`, payload.bio);
  }
  if (payload.email !== undefined)         u.email         = payload.email;
  if (payload.phone !== undefined)         u.phone         = payload.phone;
  if (payload.phoneCode !== undefined)     u.phoneCode     = payload.phoneCode;
  if (payload.gender !== undefined)        u.gender        = payload.gender;
  if (payload.birthDate !== undefined)     u.birthDate     = payload.birthDate;
  if (payload.province !== undefined)      u.province      = payload.province;
  if (payload.italianLevel !== undefined)  u.italianLevel  = payload.italianLevel;
  if (payload.privacyHideStats !== undefined) u.privacyHideStats = payload.privacyHideStats;

  // Auto-complete profile when all required fields present
  if (u.birthDate && u.province && u.gender && u.phone && u.italianLevel) {
    u.profileComplete = true;
  }

  await db.put('users', u);
  return { ok: true };
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<SaveProfileResult> {
  const db = await getDB();
  const u = await db.get('users', userId);
  if (!u) return { ok: false, error: 'user_not_found' };

  const isValid = await verifyPassword(currentPassword, u.password);
  if (!isValid) return { ok: false, error: 'wrong_password' };

  u.password = await hashPassword(newPassword);
  await db.put('users', u);
  return { ok: true };
}

export async function saveCompleteProfile(
  userId: string,
  form: CompleteProfileForm,
): Promise<SaveProfileResult> {
  const db = await getDB();
  const u = await db.get('users', userId);
  if (!u) return { ok: false, error: 'user_not_found' };

  u.birthDate    = form.birthDate;
  u.country      = form.country || 'Italia';
  u.province     = form.province;
  u.gender       = form.gender;
  u.phoneCode    = form.phoneCode;
  u.phone        = form.phone;
  u.italianLevel = form.italianLevel;
  u.profileComplete = true;

  await db.put('users', u);
  return { ok: true };
}

export async function uploadAvatar(
  file: File,
  onSuccess: (dataUrl: string) => void,
): Promise<SaveProfileResult> {
  if (file.size > 5 * 1024 * 1024) return { ok: false, error: 'file_too_large' };
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = () => {
      onSuccess(reader.result as string);
      resolve({ ok: true });
    };
    reader.onerror = () => resolve({ ok: false, error: 'read_error' });
    reader.readAsDataURL(file);
  });
}

export async function getPublicUserProfile(userId: string) {
  const db = await getDB();
  return db.get('users', userId);
}

export async function getExamReadinessData(userId: string) {
  const db = await getDB();
  const [allResults, allMistakes, allLessons, allQuestions] = await Promise.all([
    db.getAllFromIndex('quizResults', 'userId', userId),
    db.getAllFromIndex('userMistakes', 'userId', userId),
    db.getAll('lessons'),
    db.getAll('questions'),
  ]);
  return { allResults, allMistakes, allLessons, allQuestions };
}
