import type { SearchHit } from '../types/study';
import type { Testament } from '../types/bible';
import { bible, getTestament } from '../data/bible';
import { normalizeAmharic } from '../utils/amharic';

interface IndexedVerse {
  bookIndex: number;
  chapterIndex: number;
  verseIndex: number;
  bookTitle: string;
  chapterNumber: string;
  verseNumber: number;
  text: string;
  normalized: string;
  testament: Testament;
}

let index: IndexedVerse[] | null = null;

function buildIndex(): IndexedVerse[] {
  if (index) {
    return index;
  }
  const built: IndexedVerse[] = [];
  bible.books.forEach((book, bookIndex) => {
    const testament = getTestament(bookIndex);
    book.chapters.forEach((chapter, chapterIndex) => {
      chapter.verses.forEach((text, verseIndex) => {
        built.push({
          bookIndex,
          chapterIndex,
          verseIndex,
          bookTitle: book.title,
          chapterNumber: chapter.chapter,
          verseNumber: verseIndex + 1,
          text,
          normalized: normalizeAmharic(text),
          testament,
        });
      });
    });
  });
  index = built;
  return built;
}

export function warmupSearchIndex(): void {
  buildIndex();
}

function matchRanges(text: string, terms: string[]): Array<{ start: number; end: number }> {
  const ranges: Array<{ start: number; end: number }> = [];
  const lower = text;
  const normalizedText = normalizeAmharic(text);
  for (const term of terms) {
    if (!term) {
      continue;
    }
    let from = 0;
    const needle = normalizeAmharic(term);
    while (from < normalizedText.length) {
      const found = normalizedText.indexOf(needle, from);
      if (found === -1) {
        break;
      }
      ranges.push({ start: found, end: found + needle.length });
      from = found + needle.length;
    }
    if (ranges.length === 0) {
      const direct = lower.indexOf(term);
      if (direct >= 0) {
        ranges.push({ start: direct, end: direct + term.length });
      }
    }
  }
  return ranges;
}

function snippetFor(text: string, ranges: Array<{ start: number; end: number }>): string {
  if (ranges.length === 0) {
    return text.length > 120 ? `${text.slice(0, 117)}…` : text;
  }
  const start = Math.max(0, ranges[0].start - 24);
  const end = Math.min(text.length, ranges[0].end + 80);
  const prefix = start > 0 ? '…' : '';
  const suffix = end < text.length ? '…' : '';
  return `${prefix}${text.slice(start, end)}${suffix}`;
}

export interface SearchOptions {
  query: string;
  testament?: Testament | 'all';
  bookIndex?: number | null;
  limit?: number;
}

export function searchBible(options: SearchOptions): SearchHit[] {
  const query = options.query.trim();
  if (!query) {
    return [];
  }
  const terms = normalizeAmharic(query)
    .split(/\s+/)
    .filter(Boolean);
  if (terms.length === 0) {
    return [];
  }
  const verses = buildIndex();
  const hits: SearchHit[] = [];
  const limit = options.limit ?? 80;
  for (const verse of verses) {
    if (options.testament && options.testament !== 'all' && verse.testament !== options.testament) {
      continue;
    }
    if (typeof options.bookIndex === 'number' && verse.bookIndex !== options.bookIndex) {
      continue;
    }
    const matchesAll = terms.every((term) => verse.normalized.includes(term));
    if (!matchesAll) {
      continue;
    }
    const ranges = matchRanges(verse.text, query.trim().split(/\s+/));
    hits.push({
      bookIndex: verse.bookIndex,
      chapterIndex: verse.chapterIndex,
      verseIndex: verse.verseIndex,
      bookTitle: verse.bookTitle,
      chapterNumber: verse.chapterNumber,
      verseNumber: verse.verseNumber,
      text: verse.text,
      snippet: snippetFor(verse.text, ranges),
      matchRanges: ranges,
    });
    if (hits.length >= limit) {
      break;
    }
  }
  return hits;
}
