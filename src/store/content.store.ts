/**
 * content.store.ts
 * Domain store for static learning content:
 * sections, lessons, questions, signs, dictionary.
 *
 * Replaces the content slice of the old data.store.ts.
 * Architecture: component → useContentStore → questionsService → db/api
 */
import { create } from 'zustand';
import * as questionsService from '@/services/supabase/questions.service';
import type {
  Section, Lesson, Question, Sign, SignSection,
  DictionarySection, DictionaryEntry,
} from '@/shared/types';

interface ContentState {
  // Data
  sections:     Section[];
  lessons:      Lesson[];
  questions:    Question[];
  signs:        Sign[];
  signSections: SignSection[];
  dictSections: DictionarySection[];
  dictEntries:  DictionaryEntry[];

  // Loading flags
  loadingSections:  boolean;
  loadingLessons:   boolean;
  loadingQuestions: boolean;

  // Actions
  loadSections:    () => Promise<void>;
  loadLessons:     (sectionId?: string) => Promise<void>;
  loadQuestions:   (lessonId?: string, sectionId?: string) => Promise<void>;
  loadSigns:       (category?: string) => Promise<void>;
  loadSignSections:() => Promise<void>;
  loadDictSections:() => Promise<void>;
  loadDictEntries: (sectionId?: string) => Promise<void>;
}

export const useContentStore = create<ContentState>((set) => ({
  sections:     [],
  lessons:      [],
  questions:    [],
  signs:        [],
  signSections: [],
  dictSections: [],
  dictEntries:  [],
  loadingSections:  false,
  loadingLessons:   false,
  loadingQuestions: false,

  loadSections: async () => {
    set({ loadingSections: true });
    const r = await questionsService.getSections();
    if (r.success && r.data) set({ sections: r.data });
    set({ loadingSections: false });
  },

  loadLessons: async (sectionId) => {
    set({ loadingLessons: true });
    const r = await questionsService.getLessons(sectionId);
    if (r.success && r.data) set({ lessons: r.data });
    set({ loadingLessons: false });
  },

  loadQuestions: async (lessonId, sectionId) => {
    set({ loadingQuestions: true });
    const r = await questionsService.getQuestions(lessonId, sectionId);
    if (r.success && r.data) set({ questions: r.data });
    set({ loadingQuestions: false });
  },

  loadSigns: async (category) => {
    const r = await questionsService.getSigns(category);
    if (r.success && r.data) set({ signs: r.data });
  },

  loadSignSections: async () => {
    const r = await questionsService.getSignSections();
    if (r.success && r.data) set({ signSections: r.data });
  },

  loadDictSections: async () => {
    const r = await questionsService.getDictionarySections();
    if (r.success && r.data) set({ dictSections: r.data });
  },

  loadDictEntries: async (sectionId) => {
    const r = await questionsService.getDictionaryEntries(sectionId);
    if (r.success && r.data) set({ dictEntries: r.data });
  },
}));
