import type { VerseRef } from './bible';

export interface CrossReference {
  from: VerseRef;
  to: VerseRef;
  note?: string;
}

export interface CrossReferenceDataset {
  version: string;
  references: CrossReference[];
}

export interface StrongsEntry {
  number: string;
  language: 'hebrew' | 'greek';
  word: string;
  transliteration: string;
  definition: string;
  pronunciation?: string;
  references: VerseRef[];
}

export interface StrongsDataset {
  version: string;
  entries: StrongsEntry[];
}

export interface AudioChapterSource {
  bookIndex: number;
  chapterIndex: number;
  uri: string;
}

export interface AudioBibleManifest {
  translationId: string;
  chapters: AudioChapterSource[];
}

export interface ReadingAssignment {
  bookIndex: number;
  chapterIndex: number;
}

export interface ReadingPlanDay {
  day: number;
  assignments: ReadingAssignment[];
}

export interface ReadingPlan {
  id: string;
  title: string;
  description: string;
  days: ReadingPlanDay[];
}

export interface SearchHit {
  bookIndex: number;
  chapterIndex: number;
  verseIndex: number;
  bookTitle: string;
  chapterNumber: string;
  verseNumber: number;
  text: string;
  snippet: string;
  matchRanges: Array<{ start: number; end: number }>;
}
