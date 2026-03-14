import { useState, useCallback, useEffect } from 'react';
import { useDataStore } from '@/store';
import type { Question, Sign, DictionaryEntry } from '@/db/database';
import type { TrainMode, Phase, TrainItem } from '../types';
import { TIMED_LIMIT, getModeCount } from '../constants';

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function buildItems(
  mode: TrainMode,
  questions: Question[],
  signs: Sign[],
  dictEntries: DictionaryEntry[],
  mistakes: { questionId: string }[],
): TrainItem[] {
  const count = getModeCount(mode);

  switch (mode) {
    case 'questions':
    case 'timed':
    case 'marathon':
      return shuffle(questions).slice(0, count);

    case 'signs':
      return shuffle(signs).slice(0, count);

    case 'dictionary':
      return shuffle(dictEntries).slice(0, count);

    case 'weak-points': {
      const weakIds = new Set(mistakes.map(m => m.questionId));
      const weakQs = questions.filter(q => weakIds.has(q.id));
      return shuffle(weakQs.length > 0 ? weakQs : questions).slice(0, count);
    }

    case 'daily': {
      const qs = shuffle(questions).slice(0, 5);
      const ss = shuffle(signs).slice(0, 5);
      const ds = shuffle(dictEntries).slice(0, 5);
      return shuffle([...qs, ...ss, ...ds]);
    }

    case 'mixed': {
      const qs = shuffle(questions).slice(0, 4);
      const ss = shuffle(signs).slice(0, 3);
      const ds = shuffle(dictEntries).slice(0, 3);
      return shuffle([...qs, ...ss, ...ds]);
    }

    default:
      return [];
  }
}

export interface TrainingSessionState {
  mode: TrainMode;
  phase: Phase;
  index: number;
  score: number;
  total: number;
  showAnswer: boolean;
  userAnswer: boolean | null;
  items: TrainItem[];
  timedElapsed: number;
  timedStart: number;
  startTraining: (m: TrainMode) => void;
  handleNext: (correct: boolean) => void;
  handleQuestionAnswer: (ans: boolean) => void;
  setPhase: (p: Phase) => void;
  setShowAnswer: (v: boolean) => void;
}

export function useTrainingSession(): TrainingSessionState {
  const { questions, signs, dictEntries, mistakes } = useDataStore();

  const [mode, setMode] = useState<TrainMode>('questions');
  const [phase, setPhase] = useState<Phase>('select');
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [userAnswer, setUserAnswer] = useState<boolean | null>(null);
  const [items, setItems] = useState<TrainItem[]>([]);
  const [timedStart, setTimedStart] = useState(0);
  const [timedElapsed, setTimedElapsed] = useState(0);

  // Timer for timed mode
  useEffect(() => {
    if (phase !== 'training' || mode !== 'timed') return;
    const iv = setInterval(() => {
      const elapsed = Math.floor((Date.now() - timedStart) / 1000);
      setTimedElapsed(elapsed);
      if (elapsed >= TIMED_LIMIT) setPhase('result');
    }, 1000);
    return () => clearInterval(iv);
  }, [phase, mode, timedStart]);

  const startTraining = useCallback((m: TrainMode) => {
    const arr = buildItems(m, questions, signs, dictEntries, mistakes);
    setMode(m);
    setPhase('training');
    setIndex(0);
    setScore(0);
    setShowAnswer(false);
    setUserAnswer(null);
    setItems(arr);
    setTotal(arr.length);
    if (m === 'timed') {
      setTimedStart(Date.now());
      setTimedElapsed(0);
    }
  }, [questions, signs, dictEntries, mistakes]);

  const handleNext = useCallback((correct: boolean) => {
    if (correct) setScore(s => s + 1);
    if (index < items.length - 1) {
      setIndex(i => i + 1);
      setShowAnswer(false);
      setUserAnswer(null);
    } else {
      setPhase('result');
    }
  }, [index, items.length]);

  const handleQuestionAnswer = useCallback((ans: boolean) => {
    if (userAnswer !== null) return;
    setUserAnswer(ans);
    setShowAnswer(true);
  }, [userAnswer]);

  return {
    mode, phase, index, score, total, showAnswer, userAnswer,
    items, timedElapsed, timedStart,
    startTraining, handleNext, handleQuestionAnswer,
    setPhase, setShowAnswer,
  };
}
