/**
 * Audio Bible architecture.
 *
 * No narration files are bundled. Do not invent remote URLs.
 * When chapter audio is added, map local/require URIs (or file:// paths) in
 * AUDIO_MANIFEST. The player UI talks only to this service.
 *
 * Connect files here:
 *   AUDIO_MANIFEST.chapters.push({ bookIndex, chapterIndex, uri })
 */
import type { AudioBibleManifest, AudioChapterSource } from '../types/study';
import type { VerseRef } from '../types/bible';

export const AUDIO_MANIFEST: AudioBibleManifest = {
  translationId: 'amharic-1962',
  chapters: [],
};

export function getChapterAudio(
  bookIndex: number,
  chapterIndex: number,
): AudioChapterSource | null {
  return (
    AUDIO_MANIFEST.chapters.find(
      (item) => item.bookIndex === bookIndex && item.chapterIndex === chapterIndex,
    ) ?? null
  );
}

export function getAdjacentAudioChapter(
  bookIndex: number,
  chapterIndex: number,
  direction: -1 | 1,
): AudioChapterSource | null {
  const current = AUDIO_MANIFEST.chapters.findIndex(
    (item) => item.bookIndex === bookIndex && item.chapterIndex === chapterIndex,
  );
  if (current < 0) {
    return null;
  }
  return AUDIO_MANIFEST.chapters[current + direction] ?? null;
}

export function isAudioAvailable(): boolean {
  return AUDIO_MANIFEST.chapters.length > 0;
}

export interface AudioPlaybackState {
  status: 'idle' | 'unavailable' | 'ready' | 'playing' | 'paused' | 'error';
  positionMs: number;
  durationMs: number;
  rate: number;
  current?: Pick<VerseRef, 'bookIndex' | 'chapterIndex'>;
  message: string;
}

export const UNAVAILABLE_AUDIO_STATE: AudioPlaybackState = {
  status: 'unavailable',
  positionMs: 0,
  durationMs: 0,
  rate: 1,
  message: 'የድምጽ መጽሐፍ ቅዱስ ፋይሎች በዚህ ስሪት አልተካተቱም።',
};

export const PLAYBACK_RATES = [0.75, 1, 1.25, 1.5] as const;
