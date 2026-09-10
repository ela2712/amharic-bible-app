import rawBible from '../../assets/bible/amharic_bible.json';
import type {
  BibleBook,
  BibleChapter,
  BibleDataset,
  BookGroupId,
  BookMeta,
  Testament,
  Translation,
  VerseLocation,
  VerseRef,
} from '../types/bible';

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function parseChapter(raw: unknown): BibleChapter | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }
  const chapter = raw as Record<string, unknown>;
  if (typeof chapter.chapter !== 'string' || !isStringArray(chapter.verses)) {
    return null;
  }
  return {
    chapter: chapter.chapter,
    title: typeof chapter.title === 'string' ? chapter.title : '',
    verses: chapter.verses,
  };
}

function parseBook(raw: unknown): BibleBook | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }
  const book = raw as Record<string, unknown>;
  if (typeof book.title !== 'string' || !Array.isArray(book.chapters)) {
    return null;
  }
  const chapters = book.chapters
    .map(parseChapter)
    .filter((item): item is BibleChapter => item !== null);
  if (chapters.length === 0) {
    return null;
  }
  return {
    title: book.title,
    abbv: typeof book.abbv === 'string' ? book.abbv : '',
    chapters,
  };
}

function parseDataset(raw: unknown): BibleDataset {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Bible dataset is missing.');
  }
  const data = raw as Record<string, unknown>;
  if (!Array.isArray(data.books)) {
    throw new Error('Bible dataset has no books.');
  }
  const books = data.books
    .map(parseBook)
    .filter((item): item is BibleBook => item !== null);
  if (books.length === 0) {
    throw new Error('Bible dataset could not be parsed.');
  }
  return {
    title: typeof data.title === 'string' ? data.title : 'Amharic Bible',
    books,
  };
}

export const bible: BibleDataset = parseDataset(rawBible);

export const AMHARIC_TRANSLATION: Translation = {
  id: 'amharic-1962',
  name: 'መጽሐፍ ቅዱስ',
  language: 'am',
  books: bible.books,
};

const OT_COUNT = 39;

const GROUP_RANGES: Array<{ group: BookGroupId; start: number; end: number }> = [
  { group: 'law', start: 0, end: 4 },
  { group: 'history', start: 5, end: 16 },
  { group: 'wisdom', start: 17, end: 21 },
  { group: 'prophets', start: 22, end: 38 },
  { group: 'gospels', start: 39, end: 42 },
  { group: 'acts', start: 43, end: 43 },
  { group: 'letters', start: 44, end: 64 },
  { group: 'revelation', start: 65, end: 65 },
];

export const BOOK_GROUP_LABELS: Record<BookGroupId, string> = {
  law: 'ኦሪት',
  history: 'ታሪክ',
  wisdom: 'ጥበብ',
  prophets: 'ትንቢት',
  gospels: 'ወንጌላት',
  acts: 'ሥራ ሐዋርያት',
  letters: 'መልእክታት',
  revelation: 'ራእይ',
};

export function getTestament(bookIndex: number): Testament {
  return bookIndex < OT_COUNT ? 'ot' : 'nt';
}

export function getBookGroup(bookIndex: number): BookGroupId {
  const found = GROUP_RANGES.find(
    (range) => bookIndex >= range.start && bookIndex <= range.end,
  );
  return found?.group ?? 'history';
}

export function getBooks(): BibleBook[] {
  return bible.books;
}

export function getBook(bookIndex: number): BibleBook | null {
  return bible.books[bookIndex] ?? null;
}

export function getChapter(
  bookIndex: number,
  chapterIndex: number,
): BibleChapter | null {
  return getBook(bookIndex)?.chapters[chapterIndex] ?? null;
}

export function getVerse(ref: VerseRef): VerseLocation | null {
  const book = getBook(ref.bookIndex);
  const chapter = book?.chapters[ref.chapterIndex];
  const text = chapter?.verses[ref.verseIndex];
  if (!book || !chapter || typeof text !== 'string') {
    return null;
  }
  return {
    ...ref,
    bookTitle: book.title,
    chapterNumber: chapter.chapter,
    verseNumber: ref.verseIndex + 1,
    text,
  };
}

export function formatReference(location: Pick<VerseLocation, 'bookTitle' | 'chapterNumber' | 'verseNumber'>): string {
  return `${location.bookTitle} ${location.chapterNumber}:${location.verseNumber}`;
}

export function getBookMetas(): BookMeta[] {
  return bible.books.map((book, index) => ({
    index,
    title: book.title,
    testament: getTestament(index),
    group: getBookGroup(index),
    chapterCount: book.chapters.length,
  }));
}

export function getAdjacentChapter(
  bookIndex: number,
  chapterIndex: number,
  direction: -1 | 1,
): { bookIndex: number; chapterIndex: number } | null {
  const book = getBook(bookIndex);
  if (!book) {
    return null;
  }
  const nextChapter = chapterIndex + direction;
  if (nextChapter >= 0 && nextChapter < book.chapters.length) {
    return { bookIndex, chapterIndex: nextChapter };
  }
  const nextBook = getBook(bookIndex + direction);
  if (!nextBook) {
    return null;
  }
  return {
    bookIndex: bookIndex + direction,
    chapterIndex: direction === 1 ? 0 : nextBook.chapters.length - 1,
  };
}

export function countVerses(): number {
  return bible.books.reduce(
    (sum, book) =>
      sum + book.chapters.reduce((inner, chapter) => inner + chapter.verses.length, 0),
    0,
  );
}

export function flattenVerseRefs(): VerseRef[] {
  const refs: VerseRef[] = [];
  bible.books.forEach((book, bookIndex) => {
    book.chapters.forEach((chapter, chapterIndex) => {
      chapter.verses.forEach((_verse, verseIndex) => {
        refs.push({ bookIndex, chapterIndex, verseIndex });
      });
    });
  });
  return refs;
}

export function isValidRef(ref: VerseRef): boolean {
  return getVerse(ref) !== null;
}
