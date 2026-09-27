import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';
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

function parseNumberArray(value: unknown, length: number): number[] | undefined {
  if (!Array.isArray(value) || value.length !== length) {
    return undefined;
  }
  const numbers = value.map((item) => Number(item));
  if (numbers.some((item) => !Number.isFinite(item))) {
    return undefined;
  }
  return numbers;
}

function parseChapter(raw: unknown, fallbackNumber: number): BibleChapter | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }
  const chapter = raw as Record<string, unknown>;
  if (!Array.isArray(chapter.verses)) {
    return null;
  }
  const verses = chapter.verses.map((item) => (item == null ? '' : String(item)));
  const numeric =
    typeof chapter.chapter === 'number' && Number.isFinite(chapter.chapter)
      ? String(chapter.chapter)
      : typeof chapter.chapter === 'string' && /^[0-9]+$/.test(chapter.chapter)
        ? chapter.chapter
        : String(fallbackNumber);
  return {
    chapter: numeric,
    title: typeof chapter.title === 'string' ? chapter.title : '',
    verses,
    verseNumbers: parseNumberArray(chapter.verseNumbers, verses.length),
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
    .map((item, index) => parseChapter(item, index + 1))
    .filter((item): item is BibleChapter => item !== null);
  if (chapters.length === 0) {
    return null;
  }
  return {
    title: book.title,
    abbv: typeof book.abbv === 'string' ? book.abbv : '',
    englishTitle: typeof book.englishTitle === 'string' ? book.englishTitle : undefined,
    testament: book.testament === 'nt' || book.testament === 'ot' ? book.testament : undefined,
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

let dataset: BibleDataset | null = null;
let loading: Promise<BibleDataset> | null = null;

function resolveAssetModule(mod: unknown): Parameters<typeof Asset.fromModule>[0] {
  if (typeof mod === 'number' || typeof mod === 'string') {
    return mod;
  }
  if (mod && typeof mod === 'object' && 'default' in mod) {
    return resolveAssetModule((mod as { default: unknown }).default);
  }
  if (mod && typeof mod === 'object' && 'uri' in mod && typeof (mod as { uri: unknown }).uri === 'string') {
    const packed = mod as { uri: string; width?: number; height?: number };
    return { uri: packed.uri, width: packed.width ?? 0, height: packed.height ?? 0 };
  }
  throw new Error('Bible asset module is invalid.');
}

async function readAssetJson(mod: unknown): Promise<unknown> {
  const asset = Asset.fromModule(resolveAssetModule(mod));
  await asset.downloadAsync();
  const uri = asset.localUri ?? asset.uri;
  if (!uri) {
    throw new Error('Bible asset could not be resolved.');
  }
  try {
    const response = await fetch(uri);
    if (response.ok) {
      return response.json();
    }
  } catch {
    // Native file:// URIs are not always fetchable.
  }
  const raw = await FileSystem.readAsStringAsync(uri);
  return JSON.parse(raw);
}

async function readPackedBible(): Promise<unknown> {
  const { packedBibleChunks } = await import('./bibleChunks');
  const books: unknown[] = [];
  for (const chunk of packedBibleChunks) {
    const parsed = await readAssetJson(chunk);
    if (!Array.isArray(parsed)) {
      throw new Error('Bible chunk is invalid.');
    }
    books.push(...parsed);
  }
  return {
    title: 'ሠማንያ ወአሐዱ',
    books,
  };
}

export async function loadBible(): Promise<BibleDataset> {
  if (dataset) {
    return dataset;
  }
  if (!loading) {
    loading = readPackedBible()
      .then(parseDataset)
      .then((parsed) => {
        dataset = parsed;
        return parsed;
      })
      .catch((error) => {
        loading = null;
        throw error;
      });
  }
  return loading;
}

export function isBibleReady(): boolean {
  return dataset !== null;
}

function requireBible(): BibleDataset {
  if (!dataset) {
    throw new Error('Bible dataset is not loaded yet.');
  }
  return dataset;
}

export const bible: BibleDataset = {
  get title() {
    return requireBible().title;
  },
  get books() {
    return requireBible().books;
  },
};

export const AMHARIC_TRANSLATION: Translation = {
  id: 'amharic-eotc-81',
  name: 'ሠማንያ ወአሐዱ',
  language: 'am',
  get books() {
    return requireBible().books;
  },
};

const GROUP_RANGES: Array<{ group: BookGroupId; start: number; end: number }> = [
  { group: 'law', start: 0, end: 4 },
  { group: 'history', start: 5, end: 13 },
  { group: 'narrow', start: 14, end: 25 },
  { group: 'wisdom', start: 26, end: 33 },
  { group: 'prophets', start: 34, end: 53 },
  { group: 'gospels', start: 54, end: 57 },
  { group: 'acts', start: 58, end: 58 },
  { group: 'letters', start: 59, end: 79 },
  { group: 'revelation', start: 80, end: 80 },
];

export const BOOK_GROUP_LABELS: Record<BookGroupId, string> = {
  law: 'ኦሪት',
  history: 'ታሪክ',
  narrow: 'ተጨማሪ ብሉይ',
  wisdom: 'ጥበብ',
  prophets: 'ትንቢት',
  gospels: 'ወንጌላት',
  acts: 'ሥራ ሐዋርያት',
  letters: 'መልእክታት',
  revelation: 'ራእይ',
};

export function getTestament(bookIndex: number): Testament {
  return getBook(bookIndex)?.testament ?? (bookIndex < 54 ? 'ot' : 'nt');
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

export function printedVerseNumber(chapter: BibleChapter, verseIndex: number): number {
  return chapter.verseNumbers?.[verseIndex] ?? verseIndex + 1;
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
    verseNumber: printedVerseNumber(chapter, ref.verseIndex),
    text,
  };
}

export function formatReference(
  location: Pick<VerseLocation, 'bookTitle' | 'chapterNumber' | 'verseNumber' | 'verseEnd'>,
): string {
  const end = location.verseEnd;
  const range =
    typeof end === 'number' && end !== location.verseNumber
      ? `${location.verseNumber}–${end}`
      : String(location.verseNumber);
  return `${location.bookTitle} ${location.chapterNumber}:${range}`;
}

export interface DisplayVerse {
  verseIndex: number;
  fromIndex: number;
  toIndex: number;
  start: number;
  end: number;
  text: string;
}

function compactAmharic(value: string): string {
  return value.replace(/[“”"'()\s።፤፡፣፥·?؟]/g, '');
}

function preferredVerseText(a: string, b: string): string {
  return b.trim().length >= a.trim().length ? b : a;
}

export function versesShouldCombine(first: string, second: string): boolean {
  const a = String(first ?? '').trim();
  const b = String(second ?? '').trim();
  if (!a || !b) {
    return true;
  }
  const ca = compactAmharic(a);
  const cb = compactAmharic(b);
  if (!ca || !cb) {
    return true;
  }
  const shorter = ca.length <= cb.length ? ca : cb;
  const longer = ca.length > cb.length ? ca : cb;
  const isProperPrefix =
    longer.startsWith(shorter) &&
    shorter.length >= 2 &&
    shorter.length < longer.length &&
    (shorter.length <= 32 || shorter.length / longer.length <= 0.72);
  if (isProperPrefix) {
    return true;
  }
  if (longer.length >= 40 && shorter.length / longer.length >= 0.88 && longer.includes(shorter)) {
    return true;
  }
  return false;
}

export function getDisplayVerses(chapter: BibleChapter): DisplayVerse[] {
  const rows: DisplayVerse[] = [];
  chapter.verses.forEach((text, verseIndex) => {
    const n = printedVerseNumber(chapter, verseIndex);
    const clean = String(text ?? '').trim();
    const previous = rows[rows.length - 1];
    if (previous && versesShouldCombine(previous.text, clean)) {
      const keepNext = clean.length >= previous.text.length;
      previous.end = n;
      previous.toIndex = verseIndex;
      previous.text = preferredVerseText(previous.text, clean);
      if (keepNext) {
        previous.verseIndex = verseIndex;
      }
      return;
    }
    if (!clean) {
      if (previous) {
        previous.end = n;
        previous.toIndex = verseIndex;
      }
      return;
    }
    rows.push({
      verseIndex,
      fromIndex: verseIndex,
      toIndex: verseIndex,
      start: n,
      end: n,
      text: clean,
    });
  });
  return rows;
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

export function verseAtOrdinal(ordinal: number): VerseLocation | null {
  let remaining = ordinal;
  for (let bookIndex = 0; bookIndex < bible.books.length; bookIndex += 1) {
    const book = bible.books[bookIndex];
    for (let chapterIndex = 0; chapterIndex < book.chapters.length; chapterIndex += 1) {
      const chapter = book.chapters[chapterIndex];
      if (remaining < chapter.verses.length) {
        return getVerse({ bookIndex, chapterIndex, verseIndex: remaining });
      }
      remaining -= chapter.verses.length;
    }
  }
  return getVerse({ bookIndex: 0, chapterIndex: 0, verseIndex: 0 });
}
