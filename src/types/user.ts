import type { ReadingHistoryEntry, ReadingPosition, VerseRef } from './bible';

export type ThemeName = 'light' | 'dark' | 'sepia' | 'amoled';

export type ReaderFontStyle = 'sans' | 'serif' | 'medium' | 'condensed';

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

export type ReaderLanguage = 'am' | 'en' | 'gez';

export interface ReaderSettings {
  fontSize: number;
  lineHeight: number;
  horizontalMargin: number;
  verseNumberSize: number;
  readingWidth: number;
  showVerseNumbers: boolean;
  fontStyle: ReaderFontStyle;
  readerLanguage: ReaderLanguage;
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
  fontStyle: 'sans',
  readerLanguage: 'am',
};

export const READER_LANGUAGE_OPTIONS: Array<{ id: ReaderLanguage; label: string }> = [
  { id: 'am', label: 'አማርኛ' },
  { id: 'en', label: 'KJV' },
  { id: 'gez', label: 'ግዕዝ' },
];

export const READER_FONT_STYLE_OPTIONS: Array<{ id: ReaderFontStyle; label: string }> = [
  { id: 'sans', label: 'ሳንስ' },
  { id: 'serif', label: 'ሴሪፍ' },
  { id: 'medium', label: 'ወፍራም' },
  { id: 'condensed', label: 'ቀጭን' },
];

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
