import type { Question, Sign, DictionaryEntry } from '@/infrastructure/database/database';

export type TrainMode =
  | 'questions'
  | 'signs'
  | 'dictionary'
  | 'weak-points'
  | 'timed'
  | 'marathon'
  | 'daily'
  | 'mixed';

export type Phase = 'select' | 'training' | 'result';

export type TrainItem = Question | Sign | DictionaryEntry;

export interface TrainModeConfig {
  id: TrainMode;
  icon: string;
  label: string;
  desc: string;
  count: number;
  color: string;
  gradient: string;
}
