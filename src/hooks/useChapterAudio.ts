import { useCallback, useMemo } from 'react';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import {
  getAdjacentAudioChapter,
  getChapterAudio,
  PLAYBACK_RATES,
  UNAVAILABLE_AUDIO_STATE,
} from '../services/audioService';

export function useChapterAudio(bookIndex: number, chapterIndex: number) {
  const source = useMemo(
    () => getChapterAudio(bookIndex, chapterIndex),
    [bookIndex, chapterIndex],
  );
  const player = useAudioPlayer(source?.uri ?? null, { updateInterval: 250 });
  const status = useAudioPlayerStatus(player);

  const play = useCallback(() => {
    if (!source) {
      return;
    }
    player.play();
  }, [player, source]);

  const pause = useCallback(() => {
    if (!source) {
      return;
    }
    player.pause();
  }, [player, source]);

  const seek = useCallback(
    (positionMs: number) => {
      if (!source) {
        return;
      }
      void player.seekTo(Math.max(0, positionMs) / 1000);
    },
    [player, source],
  );

  const cycleRate = useCallback(() => {
    if (!source) {
      return;
    }
    const current = status.playbackRate ?? 1;
    const index = PLAYBACK_RATES.findIndex((rate) => Math.abs(rate - current) < 0.01);
    const next = PLAYBACK_RATES[(index + 1) % PLAYBACK_RATES.length];
    player.setPlaybackRate(next);
  }, [player, source, status.playbackRate]);

  const adjacent = useCallback(
    (direction: -1 | 1) => getAdjacentAudioChapter(bookIndex, chapterIndex, direction),
    [bookIndex, chapterIndex],
  );

  return {
    available: Boolean(source),
    source,
    state: source
      ? {
          status: status.playing ? ('playing' as const) : ('ready' as const),
          positionMs: Math.round((status.currentTime ?? 0) * 1000),
          durationMs: Math.round((status.duration ?? 0) * 1000),
          rate: status.playbackRate ?? 1,
          current: { bookIndex, chapterIndex },
          message: 'ድምጽ ዝግጁ ነው',
        }
      : UNAVAILABLE_AUDIO_STATE,
    play,
    pause,
    seek,
    cycleRate,
    adjacent,
  };
}
