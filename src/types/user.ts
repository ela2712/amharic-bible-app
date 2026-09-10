import type { ReadingHistoryEntry, ReadingPosition, VerseRef } from './bible';

export type ThemeName = 'light' | 'dark' | 'sepia' | 'amoled';

export type HighlightColor =
  | 'yellow'
  | 'green'
  | 'blue'
  | 'orange'
  | 'red'
  | 'purple';

export interface Bookmark {
  id: string;
  ref: VerseRef;
  bookTitle: string;
  chapterNumber: string;
  verseNumber: number;
  text: string;
  createdAt: string;
}

export interface Highlight {
  id: string;
  ref: VerseRef;
  bookTitle: string;
  chapterNumber: string;
  verseNumber: number;
  text: string;
  color: HighlightColor;
  createdAt: string;
  updatedAt: string;
}

export interface VerseNote {
  id: string;
  ref: VerseRef;
  bookTitle: string;
  chapterNumber: string;
  verseNumber: number;
  text: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReaderSettings {
  fontSize: number;
  lineHeight: number;
  horizontalMargin: number;
  verseNumberSize: number;
  readingWidth: number;
  showVerseNumbers: boolean;
}

export interface AppSettings {
  theme: ThemeName;
  reader: ReaderSettings;
}

export interface PlanProgress {
  planId: string;
  currentDay: number;
  completedDays: number[];
  updatedAt: string;
}

export interface UserStore {
  version: 1;
  readingPosition: ReadingPosition | null;
  readingHistory: ReadingHistoryEntry[];
  bookmarks: Bookmark[];
  highlights: Highlight[];
  notes: VerseNote[];
  settings: AppSettings;
  searchHistory: string[];
  planProgress: Record<string, PlanProgress>;
}

export const DEFAULT_READER_SETTINGS: ReaderSettings = {
  fontSize: 22,
  lineHeight: 1.85,
  horizontalMargin: 20,
  verseNumberSize: 16,
  readingWidth: 100,
  showVerseNumbers: true,
};

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  reader: DEFAULT_READER_SETTINGS,
};

export const EMPTY_USER_STORE: UserStore = {
  version: 1,
  readingPosition: null,
  readingHistory: [],
  bookmarks: [],
  highlights: [],
  notes: [],
  settings: DEFAULT_SETTINGS,
  searchHistory: [],
  planProgress: {},
};

export function verseKey(ref: VerseRef): string {
  return `${ref.bookIndex}:${ref.chapterIndex}:${ref.verseIndex}`;
}
