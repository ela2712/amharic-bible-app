/**
 * Cross-reference architecture.
 *
 * No cross-reference dataset is bundled. Load a real JSON dataset here when available.
 * The UI checks hasCrossReferences() and never invents links between verses.
 */
import type { CrossReference, CrossReferenceDataset } from '../types/study';
import type { VerseRef } from '../types/bible';
import { verseKey } from '../types/user';

export const CROSS_REFERENCE_DATASET: CrossReferenceDataset | null = null;

export function hasCrossReferences(): boolean {
  return (CROSS_REFERENCE_DATASET?.references.length ?? 0) > 0;
}

export function getCrossReferences(ref: VerseRef): CrossReference[] {
  if (!CROSS_REFERENCE_DATASET) {
    return [];
  }
  const key = verseKey(ref);
  return CROSS_REFERENCE_DATASET.references.filter(
    (item) => verseKey(item.from) === key,
  );
}
