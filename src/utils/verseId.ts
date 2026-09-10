import type { VerseRef } from '../types/bible';
import { verseKey } from '../types/user';

export function makeVerseId(ref: VerseRef): string {
  return verseKey(ref);
}

export function parseVerseId(id: string): VerseRef | null {
  const parts = id.split(':').map((part) => Number(part));
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) {
    return null;
  }
  return { bookIndex: parts[0], chapterIndex: parts[1], verseIndex: parts[2] };
}
