/**
 * Audio Bible architecture.
 *
 * No narration files are bundled with this project. Do not invent remote URLs.
 * When chapter audio is added, drop files (or a manifest) into assets/audio
 * and map them in AUDIO_MANIFEST below. The player UI already talks to this service.
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
