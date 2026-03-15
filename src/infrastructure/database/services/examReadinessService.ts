/**
 * Exam Readiness Algorithm
 *
 * Computes a 0-100 readiness score from five weighted factors:
 *
 *  1. Exam Simulation Performance (35%) — weighted avg of recent exam scores
 *     with exponential time-decay so recent attempts matter most.
 *  2. Quiz Accuracy (25%) — weighted accuracy across all quiz types.
 *  3. Content Coverage (20%) — lessons completed + unique questions attempted
 *     as a percentage of total available content.
 *  4. Study Consistency (10%) — streak + cumulative study-days.
 *  5. Improvement Trend (10%) — whether scores are rising or falling.
 *
 * A Weakness Penalty (0–15 pts) is subtracted for unresolved mistakes.
 */

import type { QuizResult, UserMistake, UserProgress } from '@/infrastructure/database/database';

// ─── Public types ──────────────────────────────────────────────────────────────

export type ExamReadinessLevel =
  | 'not_ready'
  | 'beginner'
  | 'developing'
  | 'ready'
  | 'excellent';

export interface ExamReadinessFactors {
  /** 0-100: weighted score from exam-simulator runs */
  examSimulation: number;
  /** 0-100: weighted accuracy across all quizzes */
  quizAccuracy: number;
  /** 0-100: lessons + questions coverage */
  coverage: number;
  /** 0-100: streak × studyDays consistency */
  consistency: number;
  /** 0-100: score trend (improving vs declining) */
  trend: number;
}

export interface ExamReadinessResult {
  /** Final composite score 0–100 */
  score: number;
  /** Human-readable level label key */
  level: ExamReadinessLevel;
  /** Individual factor scores (all 0–100) */
  factors: ExamReadinessFactors;
  /** Points subtracted due to unresolved mistakes (0–15) */
  weaknessPenalty: number;
  /** i18n tip keys — list of things to improve */
  tips: string[];
}

// ─── Internal helpers ──────────────────────────────────────────────────────────

/** Exponential-decay weight for position i (most recent = i=0). */
function decayWeight(i: number, base = 0.88): number {
  return Math.pow(base, i);
}

/** Weighted average of `values` using corresponding `weights`. */
function weightedAverage(values: number[], weights: number[]): number {
  const totalW = weights.reduce((s, w) => s + w, 0);
  if (totalW === 0) return 0;
  const sum = values.reduce((s, v, i) => s + v * weights[i], 0);
  return sum / totalW;
}

// ─── Main export ───────────────────────────────────────────────────────────────

export function calculateExamReadiness(params: {
  quizHistory: QuizResult[];
  mistakes: UserMistake[];
  progress: UserProgress;
  totalLessons: number;
  totalQuestions: number;
}): ExamReadinessResult {
  const { quizHistory, mistakes, progress, totalLessons, totalQuestions } = params;

  // Sort all history once (newest first)
  const sortedHistory = [...quizHistory].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // ─── Factor 1: Exam Simulation (35%) ────────────────────────────────────────
  const examRuns = sortedHistory
    .filter(r => r.topicId === 'exam-simulator')
    .slice(0, 10);

  let examSimulation = 0;
  if (examRuns.length > 0) {
    const scores  = examRuns.map(r => r.score);
    const weights = examRuns.map((_, i) => decayWeight(i, 0.88));
    const avgScore = weightedAverage(scores, weights);

    // Bonus up to +10 pts for a high pass rate (score ≥ 90 → simulated pass)
    const passRate = examRuns.filter(r => r.score >= 90).length / examRuns.length;
    examSimulation = Math.min(100, avgScore + passRate * 10);
  }

  // ─── Factor 2: Quiz Accuracy (25%) ──────────────────────────────────────────
  let quizAccuracy = 0;
  const recentQuizzes = sortedHistory.slice(0, 20);

  if (recentQuizzes.length > 0) {
    const accValues = recentQuizzes.map(r =>
      r.totalQuestions > 0 ? (r.correctAnswers / r.totalQuestions) * 100 : 0
    );
    const weights = recentQuizzes.map((_, i) => decayWeight(i, 0.92));
    quizAccuracy = weightedAverage(accValues, weights);
  } else {
    // Fall back to cumulative progress stats
    const total = progress.correctAnswers + progress.wrongAnswers;
    quizAccuracy = total > 0 ? (progress.correctAnswers / total) * 100 : 0;
  }

  // ─── Factor 3: Content Coverage (20%) ───────────────────────────────────────
  const lessonCoverage =
    totalLessons > 0
      ? Math.min(100, (progress.completedLessons.length / totalLessons) * 100)
      : 0;

  // Count unique question IDs seen across all quiz answers
  const seenQuestions = new Set<string>();
  quizHistory.forEach(r => r.answers?.forEach(a => seenQuestions.add(a.questionId)));
  const questionCoverage =
    totalQuestions > 0
      ? Math.min(100, (seenQuestions.size / totalQuestions) * 100)
      : 0;

  // Lessons carry more weight than raw question coverage
  const coverage = lessonCoverage * 0.65 + questionCoverage * 0.35;

  // ─── Factor 4: Study Consistency (10%) ──────────────────────────────────────
  const streakScore    = Math.min(100, progress.currentStreak * 10);
  const studyDaysScore = Math.min(100, progress.totalStudyDays * 2);
  const consistency    = streakScore * 0.6 + studyDaysScore * 0.4;

  // ─── Factor 5: Improvement Trend (10%) ──────────────────────────────────────
  let trend = 0; // no data means no trend score for new users
  if (sortedHistory.length >= 6) {
    const recentScores   = sortedHistory.slice(0, 5).map(r => r.score);
    const previousScores = sortedHistory.slice(5, 10).map(r => r.score);
    const recentAvg   = recentScores.reduce((s, v) => s + v, 0) / recentScores.length;
    const previousAvg = previousScores.reduce((s, v) => s + v, 0) / previousScores.length;
    const delta = recentAvg - previousAvg;
    // Each 1% improvement/decline shifts trend by 2 pts from the 50 baseline
    trend = Math.max(0, Math.min(100, 50 + delta * 2));
  }

  // ─── Weakness Penalty (0–15) ────────────────────────────────────────────────
  const heavyMistakes = mistakes.filter(m => m.count >= 3).length;
  const weaknessPenalty = Math.min(
    15,
    mistakes.length * 0.4 + heavyMistakes * 0.8
  );

  // ─── Composite Score ────────────────────────────────────────────────────────
  const rawScore =
    examSimulation * 0.35 +
    quizAccuracy   * 0.25 +
    coverage       * 0.20 +
    consistency    * 0.10 +
    trend          * 0.10;

  const score = Math.max(0, Math.min(100, Math.round(rawScore - weaknessPenalty)));

  // ─── Readiness Level ────────────────────────────────────────────────────────
  const level: ExamReadinessLevel =
    score >= 80 ? 'excellent' :
    score >= 66 ? 'ready' :
    score >= 46 ? 'developing' :
    score >= 25 ? 'beginner' :
    'not_ready';

  // ─── Personalised Tips ──────────────────────────────────────────────────────
  const tips: string[] = [];
  if (examRuns.length < 3)         tips.push('take_more_exams');
  if (examSimulation < 70 && examRuns.length >= 3) tips.push('improve_exam_score');
  if (quizAccuracy < 70)           tips.push('improve_accuracy');
  if (lessonCoverage < 60)         tips.push('complete_lessons');
  if (weaknessPenalty > 5)         tips.push('fix_mistakes');
  if (consistency < 40)            tips.push('study_daily');
  if (trend < 40)                  tips.push('maintain_progress');
  if (tips.length === 0)           tips.push('keep_going');

  return {
    score,
    level,
    factors: {
      examSimulation: Math.round(examSimulation),
      quizAccuracy:   Math.round(quizAccuracy),
      coverage:       Math.round(coverage),
      consistency:    Math.round(consistency),
      trend:          Math.round(trend),
    },
    weaknessPenalty: Math.round(weaknessPenalty),
    tips,
  };
}

/** Returns a stable color class based on a 0-100 score value. */
export function readinessColor(score: number): 'red' | 'orange' | 'yellow' | 'green' | 'emerald' {
  if (score >= 80) return 'emerald';
  if (score >= 66) return 'green';
  if (score >= 46) return 'yellow';
  if (score >= 25) return 'orange';
  return 'red';
}
