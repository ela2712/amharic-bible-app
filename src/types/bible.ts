export interface BibleChapter {
  chapter: string;
  title: string;
  verses: string[];
}

export interface BibleBook {
  title: string;
  abbv: string;
  chapters: BibleChapter[];
}

export interface BibleDataset {
  title: string;
  books: BibleBook[];
}

export type Testament = 'ot' | 'nt';

export interface VerseRef {
  bookIndex: number;
  chapterIndex: number;
  verseIndex: number;
}

export interface VerseLocation extends VerseRef {
  bookTitle: string;
  chapterNumber: string;
  verseNumber: number;
  text: string;
}

export interface ReadingPosition {
  bookIndex: number;
  chapterIndex: number;
  verseIndex: number;
  updatedAt: string;
}

export interface ReadingHistoryEntry {
  bookIndex: number;
  chapterIndex: number;
  openedAt: string;
}

export interface Translation {
  id: string;
  name: string;
  language: string;
  books: BibleBook[];
}

export type BookGroupId =
  | 'law'
  | 'history'
  | 'wisdom'
  | 'prophets'
  | 'gospels'
  | 'acts'
  | 'letters'
  | 'revelation';

export interface BookMeta {
  index: number;
  title: string;
  testament: Testament;
  group: BookGroupId;
  chapterCount: number;
}
