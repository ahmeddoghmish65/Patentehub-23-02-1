import { useMemo } from 'react';
import { calculateExamReadiness } from '@/services/examReadinessService';
import type { UserProgress, QuizResult, UserMistake, Lesson, Question } from '@/types';

interface UseExamReadinessParams {
  quizHistory: QuizResult[];
  mistakes: UserMistake[];
  progress: UserProgress;
  lessons: Lesson[];
  questions: Question[];
}

export function useExamReadiness({
  quizHistory,
  mistakes,
  progress,
  lessons,
  questions,
}: UseExamReadinessParams) {
  return useMemo(
    () =>
      calculateExamReadiness({
        quizHistory,
        mistakes,
        progress,
        totalLessons: lessons.length,
        totalQuestions: questions.length,
      }),
    [quizHistory, mistakes, progress, lessons.length, questions.length],
  );
}
