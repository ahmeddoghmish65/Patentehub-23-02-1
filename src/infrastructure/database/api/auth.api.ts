import {
  getDB, generateId, generateToken, hashPassword, verifyPassword,
  type User,
} from '../database';
import { checkRateLimit, validateEmail, sanitize, getAuthUser, isAdmin, logAdmin, ok, err, detectDefaultContentLang } from './_shared';
import type { ApiRes } from './_shared';

export async function apiCheckUsername(username: string): Promise<ApiRes<{ available: boolean; suggestions: string[] }>> {
  username = sanitize(username).toLowerCase().replace(/[^a-z0-9_.]/g, '');
  if (username.length < 3) return ok({ available: false, suggestions: [] });
  const db = await getDB();
  const all = await db.getAll('users');
  const taken = new Set(all.map(u => u.username?.toLowerCase()));
  const available = !taken.has(username);

  const suggestions: string[] = [];
  if (!available) {
    const base = username.replace(/\d+$/, '');
    const tried = new Set<string>();
    const rand = () => Math.floor(Math.random() * 900 + 100);
    const suffixes = [rand(), rand(), rand(), new Date().getFullYear() % 100, rand()];
    for (const s of suffixes) {
      const candidate = `${base}${s}`;
      if (!taken.has(candidate) && !tried.has(candidate)) {
        suggestions.push(candidate);
        tried.add(candidate);
      }
      if (suggestions.length >= 3) break;
    }
    const alt1 = `${base}_${rand()}`;
    if (!taken.has(alt1) && suggestions.length < 3) suggestions.push(alt1);
  }
  return ok({ available, suggestions });
}

export async function apiRegister(email: string, password: string, name: string, extra?: { firstName?: string; lastName?: string; username?: string }): Promise<ApiRes<{ user: Omit<User, 'password'>; token: string; refreshToken: string }>> {
  if (!checkRateLimit('reg_' + email, 5, 300000)) return err('تجاوز الحد المسموح', 429);
  email = sanitize(email).toLowerCase(); name = sanitize(name);
  if (!validateEmail(email)) return err('بريد إلكتروني غير صالح');
  if (password.length < 6) return err('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
  if (name.length < 2) return err('الاسم قصير جداً');

  const db = await getDB();
  const existing = await db.getFromIndex('users', 'email', email);
  if (existing) return err('البريد مسجل مسبقاً', 409);

  let requestedUsername = extra?.username ? sanitize(extra.username).toLowerCase().replace(/[^a-z0-9_.]/g, '') : '';
  if (requestedUsername.length < 3) {
    const baseFromName = (extra?.firstName || name.split(' ')[0] || 'user').toLowerCase().replace(/[^a-z0-9]/g, '');
    requestedUsername = `${baseFromName}_${Math.random().toString(36).substring(2, 6)}`;
  }

  const allUsers = await db.getAll('users');
  const takenUsernames = new Set(allUsers.map(u => u.username?.toLowerCase()));
  let finalUsername = requestedUsername;
  if (takenUsernames.has(finalUsername)) {
    let i = 1;
    while (takenUsernames.has(`${requestedUsername}_${i}`) && i < 100) i++;
    finalUsername = `${requestedUsername}_${i}`;
    if (extra?.username) {
      return err(`اسم المستخدم "${requestedUsername}" مستخدم بالفعل`, 409);
    }
  }

  const now = new Date().toISOString();
  const role = email === 'admin@patente.com' ? 'admin' : 'user';
  const user: User = {
    id: generateId(), email, password: await hashPassword(password), name,
    firstName: extra?.firstName || '', lastName: extra?.lastName || '',
    username: finalUsername, avatar: '', bio: '',
    role, permissions: [], isBanned: false, verified: false,
    following: [],
    profileComplete: false, birthDate: '', country: '', province: '',
    gender: '', phone: '', phoneCode: '', italianLevel: '',
    privacyHideStats: false,
    createdAt: now, lastLogin: now,
    progress: {
      totalQuizzes: 0, correctAnswers: 0, wrongAnswers: 0,
      completedLessons: [], completedTopics: [],
      currentStreak: 0, bestStreak: 0, lastStudyDate: '', totalStudyDays: 0,
      level: 1, xp: 0, badges: ['newcomer'], examReadiness: 0,
    },
    settings: { language: detectDefaultContentLang(), theme: 'light', notifications: true, soundEffects: true, fontSize: 'medium' },
  };
  await db.put('users', user);

  const token = generateToken();
  const refreshToken = generateToken();
  await db.put('authTokens', { token, refreshToken, userId: user.id, createdAt: now, expiresAt: new Date(Date.now() + 7 * 86400000).toISOString() });

  const regLog = { id: generateId(), adminId: user.id, action: 'تسجيل مستخدم جديد', details: `${user.name} (${email})`, createdAt: now };
  await db.put('adminLogs', regLog);

  const { password: _, ...safe } = user; void _;
  return ok({ user: safe, token, refreshToken }, 201);
}

export async function apiLogin(email: string, password: string): Promise<ApiRes<{ user: Omit<User, 'password'>; token: string; refreshToken: string }>> {
  if (!checkRateLimit('login_' + email, 10, 300000)) return err('تجاوز الحد', 429);
  email = sanitize(email).toLowerCase();
  const db = await getDB();
  const user = await db.getFromIndex('users', 'email', email);
  if (!user) return err('بريد أو كلمة مرور خاطئة', 401);
  if (user.isBanned) return err('هذا الحساب محظور', 403);
  if (!(await verifyPassword(password, user.password))) return err('بريد أو كلمة مرور خاطئة', 401);

  const now = new Date().toISOString();
  const lastStudy = user.progress.lastStudyDate;
  if (lastStudy) {
    const ld = new Date(lastStudy).toDateString();
    const yd = new Date(Date.now() - 86400000).toDateString();
    const td = new Date().toDateString();
    if (ld !== td && ld !== yd) user.progress.currentStreak = 0;
  }
  user.lastLogin = now;
  await db.put('users', user);

  const token = generateToken(); const refreshToken = generateToken();
  await db.put('authTokens', { token, refreshToken, userId: user.id, createdAt: now, expiresAt: new Date(Date.now() + 7 * 86400000).toISOString() });
  const { password: _, ...safe } = user; void _;
  if (user.role === 'admin' || user.role === 'manager') {
    const db2 = await getDB();
    const sysLog = { id: generateId(), adminId: user.id, action: 'تسجيل دخول', details: `${user.name} (${email}) — ${new Date().toLocaleString('ar')}`, createdAt: new Date().toISOString() };
    await db2.put('adminLogs', sysLog);
  }
  return ok({ user: safe, token, refreshToken });
}

export async function apiGetUser(token: string): Promise<ApiRes<Omit<User, 'password'>>> {
  const user = await getAuthUser(token);
  if (!user) return err('جلسة منتهية', 401);
  const { password: _, ...safe } = user; void _;
  return ok(safe);
}

export async function apiLogout(token: string): Promise<ApiRes> {
  const db = await getDB(); await db.delete('authTokens', token); return ok(null);
}

export async function apiResetPassword(email: string, newPassword: string): Promise<ApiRes> {
  if (newPassword.length < 6) return err('كلمة المرور قصيرة');
  const db = await getDB();
  const user = await db.getFromIndex('users', 'email', email.toLowerCase());
  if (!user) return err('بريد غير موجود', 404);
  user.password = await hashPassword(newPassword);
  await db.put('users', user);
  const resetLog = { id: generateId(), adminId: user.id, action: 'تغيير كلمة المرور', details: `${user.name} (${email}) — تم تغيير كلمة المرور بنجاح`, createdAt: new Date().toISOString() };
  await db.put('adminLogs', resetLog);
  return ok(null);
}

export async function apiUpdateProfile(token: string, data: { name?: string; avatar?: string }): Promise<ApiRes<Omit<User, 'password'>>> {
  const user = await getAuthUser(token);
  if (!user) return err('غير مصرح', 401);
  if (data.name) user.name = sanitize(data.name);
  if (data.avatar !== undefined) user.avatar = data.avatar;
  const db = await getDB(); await db.put('users', user);
  const { password: _, ...safe } = user; void _;
  return ok(safe);
}

export async function apiUpdateSettings(token: string, settings: Partial<User['settings']>): Promise<ApiRes<User['settings']>> {
  const user = await getAuthUser(token);
  if (!user) return err('غير مصرح', 401);
  user.settings = { ...user.settings, ...settings };
  const db = await getDB(); await db.put('users', user);
  return ok(user.settings);
}

export async function apiUpdateProgress(token: string, p: Partial<User['progress']>): Promise<ApiRes<User['progress']>> {
  const user = await getAuthUser(token);
  if (!user) return err('غير مصرح', 401);
  user.progress = { ...user.progress, ...p };
  const db = await getDB(); await db.put('users', user);
  return ok(user.progress);
}

export async function apiUpdateUser(token: string, userId: string, data: { role?: string; permissions?: string[]; verified?: boolean; isBanned?: boolean }): Promise<ApiRes<Omit<User, 'password'>>> {
  const admin = await getAuthUser(token);
  if (!admin || (admin.role !== 'admin' && admin.role !== 'manager')) return err('غير مصرح', 403);
  const db = await getDB();
  const user = await db.get('users', userId);
  if (!user) return err('مستخدم غير موجود', 404);
  if (data.role !== undefined) user.role = data.role as User['role'];
  if (data.permissions !== undefined) user.permissions = data.permissions;
  if (data.verified !== undefined) user.verified = data.verified;
  if (data.isBanned !== undefined) user.isBanned = data.isBanned;
  await db.put('users', user);
  await logAdmin(token, 'تعديل مستخدم', `${user.email} - role: ${user.role}, verified: ${user.verified}`);
  const { password: _, ...safe } = user; void _;
  return ok(safe);
}

// Re-export shared types for convenience
export type { ApiRes };
export { isAdmin };
