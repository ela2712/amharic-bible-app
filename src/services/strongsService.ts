/**
 * Strong's / concordance architecture.
 *
 * No Hebrew/Greek concordance dataset is bundled. Do not fabricate definitions.
 * Connect a real Strong's JSON dataset to STRONGS_DATASET when one is supplied.
 */
import type { StrongsDataset, StrongsEntry } from '../types/study';

export const STRONGS_DATASET: StrongsDataset | null = null;

export function hasStrongsData(): boolean {
  return (STRONGS_DATASET?.entries.length ?? 0) > 0;
}

export function lookupStrongs(number: string): StrongsEntry | null {
  return STRONGS_DATASET?.entries.find((entry) => entry.number === number) ?? null;
}

export function searchStrongs(query: string): StrongsEntry[] {
  if (!STRONGS_DATASET || !query.trim()) {
    return [];
  }
  const needle = query.trim().toLowerCase();
  return STRONGS_DATASET.entries.filter(
    (entry) =>
      entry.number.toLowerCase().includes(needle) ||
      entry.word.toLowerCase().includes(needle) ||
      entry.transliteration.toLowerCase().includes(needle) ||
      entry.definition.toLowerCase().includes(needle),
  );
}
