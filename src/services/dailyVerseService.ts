import type { VerseLocation } from '../types/bible';
import { countVerses, getVerse, verseAtOrdinal } from '../data/bible';

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

let cachedCount: number | null = null;

export function getDailyVerse(date = new Date()): VerseLocation {
  cachedCount = cachedCount ?? countVerses();
  const total = cachedCount;
  const index = total > 0 ? hashString(dateKey(date)) % total : 0;
  const verse = verseAtOrdinal(index);
  if (!verse) {
    const fallback = getVerse({ bookIndex: 0, chapterIndex: 0, verseIndex: 0 });
    if (!fallback) {
      throw new Error('Bible data is unavailable.');
    }
    return fallback;
  }
  return verse;
}
