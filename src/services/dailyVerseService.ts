import type { VerseLocation } from '../types/bible';
import { flattenVerseRefs, getVerse } from '../data/bible';

function dateKey(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

let cachedRefs: ReturnType<typeof flattenVerseRefs> | null = null;

export function getDailyVerse(date = new Date()): VerseLocation {
  cachedRefs = cachedRefs ?? flattenVerseRefs();
  const refs = cachedRefs;
  const index = hashString(dateKey(date)) % refs.length;
  const verse = getVerse(refs[index]);
  if (!verse) {
    const fallback = getVerse({ bookIndex: 0, chapterIndex: 0, verseIndex: 0 });
    if (!fallback) {
      throw new Error('Bible data is unavailable.');
    }
    return fallback;
  }
  return verse;
}
