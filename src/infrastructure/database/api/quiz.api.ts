import {
  getDB, generateId,
  type QuizResult, type UserMistake, type TrainingSession,
} from '../database';
import { getAuthUser, ok, err } from './_shared';
import type { ApiRes } from './_shared';

export async function apiSaveQuizResult(token: string, result: Omit<QuizResult, 'id' | 'userId' | 'createdAt'>): Promise<ApiRes<QuizResult>> {
  const user = await getAuthUser(token);
  if (!user) return err('غير مصرح', 401);
  const qr: QuizResult = { ...result, id: generateId(), userId: user.id, createdAt: new Date().toISOString() };
  const db = await getDB(); await db.put('quizResults', qr);

  user.progress.totalQuizzes++;
  user.progress.correctAnswers += result.correctAnswers;
  user.progress.wrongAnswers += result.wrongAnswers;
  const xpGained = result.correctAnswers * 10 + (result.score >= 80 ? 50 : 0);
  user.progress.xp += xpGained;
  user.progress.level = Math.floor(user.progress.xp / 500) + 1;

  const today = new Date().toDateString();
  const last = user.progress.lastStudyDate;
  if (!last || new Date(last).toDateString() !== today) {
    const yd = new Date(Date.now() - 86400000).toDateString();
    if (last && new Date(last).toDateString() === yd) user.progress.currentStreak++;
    else user.progress.currentStreak = 1;
    user.progress.bestStreak = Math.max(user.progress.bestStreak, user.progress.currentStreak);
    if (!user.progress.totalStudyDays) user.progress.totalStudyDays = 0;
    user.progress.totalStudyDays++;
  }
  user.progress.lastStudyDate = new Date().toISOString();

  if (result.score >= 70 && result.lessonId && !user.progress.completedLessons.includes(result.lessonId)) {
    user.progress.completedLessons.push(result.lessonId);
  }

  if (user.progress.totalQuizzes >= 20 && !user.progress.badges.includes('quiz_master')) user.progress.badges.push('quiz_master');
  if (result.score === 100 && !user.progress.badges.includes('perfect_score')) user.progress.badges.push('perfect_score');
  if (user.progress.currentStreak >= 7 && !user.progress.badges.includes('week_streak')) user.progress.badges.push('week_streak');
  if (user.progress.level >= 15 && !user.progress.badges.includes('level_5')) user.progress.badges.push('level_5');

  await db.put('users', user);

  for (const a of result.answers) {
    if (!a.correct) {
      const mistakes = await db.getAllFromIndex('userMistakes', 'userId', user.id);
      const existing = mistakes.find(m => m.questionId === a.questionId);
      if (existing) {
        existing.count++;
        existing.lastMistakeAt = new Date().toISOString();
        await db.put('userMistakes', existing);
      } else {
        const q = await db.get('questions', a.questionId);
        const mistake: UserMistake = {
          id: generateId(), userId: user.id, questionId: a.questionId,
          questionAr: q?.questionAr || '', questionIt: q?.questionIt || '',
          correctAnswer: q?.isTrue ?? true, userAnswer: a.userAnswer,
          count: 1, lastMistakeAt: new Date().toISOString(),
        };
        await db.put('userMistakes', mistake);
      }
    }
  }

  return ok(qr, 201);
}

export async function apiGetQuizHistory(token: string): Promise<ApiRes<QuizResult[]>> {
  const user = await getAuthUser(token);
  if (!user) return err('غير مصرح', 401);
  const db = await getDB();
  const all = await db.getAllFromIndex('quizResults', 'userId', user.id);
  all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return ok(all);
}

export async function apiGetUserMistakes(token: string): Promise<ApiRes<UserMistake[]>> {
  const user = await getAuthUser(token);
  if (!user) return err('غير مصرح', 401);
  const db = await getDB();
  const all = await db.getAllFromIndex('userMistakes', 'userId', user.id);
  all.sort((a, b) => b.count - a.count);
  return ok(all);
}

export async function apiPracticeMistake(token: string, questionId: string, correct: boolean): Promise<ApiRes<UserMistake | null>> {
  const user = await getAuthUser(token);
  if (!user) return err('غير مصرح', 401);
  const db = await getDB();
  const all = await db.getAllFromIndex('userMistakes', 'userId', user.id);
  const existing = all.find(m => m.questionId === questionId);
  if (!existing) return ok(null);
  if (correct) {
    existing.count = Math.max(0, existing.count - 1);
    if (existing.count === 0) { await db.delete('userMistakes', existing.id); return ok(null); }
  } else {
    existing.count += 1;
  }
  await db.put('userMistakes', existing);
  return ok(existing);
}

export async function apiSaveTrainingSession(token: string, data: Omit<TrainingSession, 'id' | 'userId' | 'createdAt'>): Promise<ApiRes<TrainingSession>> {
  const user = await getAuthUser(token);
  if (!user) return err('غير مصرح', 401);
  const ts: TrainingSession = { ...data, id: generateId(), userId: user.id, createdAt: new Date().toISOString() };
  const db = await getDB(); await db.put('trainingSessions', ts);
  return ok(ts, 201);
}

export type { ApiRes };
