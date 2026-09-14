import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../theme/ThemeContext';
import { useChapterAudio } from '../hooks/useChapterAudio';

interface Props {
  bookIndex: number;
  chapterIndex: number;
  bookTitle: string;
  chapterLabel: string;
  onOpenChapter?: (bookIndex: number, chapterIndex: number) => void;
}

function formatTime(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${`${seconds}`.padStart(2, '0')}`;
}

export function AudioPlayerBar({
  bookIndex,
  chapterIndex,
  bookTitle,
  chapterLabel,
  onOpenChapter,
}: Props) {
  const colors = useAppTheme();
  const audio = useChapterAudio(bookIndex, chapterIndex);
  const playing = audio.state.status === 'playing';
  const prev = audio.adjacent(-1);
  const next = audio.adjacent(1);
  const progress =
    audio.state.durationMs > 0 ? audio.state.positionMs / audio.state.durationMs : 0;

  return (
    <View style={[styles.bar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Ionicons name="headset-outline" size={20} color={colors.accent} />
      <View style={styles.meta}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {bookTitle} {chapterLabel}
        </Text>
        <Text style={[styles.sub, { color: colors.textMuted }]} numberOfLines={2}>
          {audio.available
            ? `${formatTime(audio.state.positionMs)} / ${formatTime(audio.state.durationMs)} · ${audio.state.rate}x`
            : audio.state.message}
        </Text>
        {audio.available ? (
          <View style={[styles.track, { backgroundColor: colors.surfaceMuted }]}>
            <View
              style={[
                styles.fill,
                { width: `${Math.min(100, Math.round(progress * 100))}%`, backgroundColor: colors.accent },
              ]}
            />
          </View>
        ) : null}
      </View>
      {audio.available ? (
        <View style={styles.controls}>
          <Pressable
            disabled={!prev}
            accessibilityLabel="ቀዳሚ ድምጽ"
            onPress={() => prev && onOpenChapter?.(prev.bookIndex, prev.chapterIndex)}
          >
            <Ionicons name="play-skip-back" size={18} color={prev ? colors.text : colors.textMuted} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={playing ? 'አቁም' : 'አጫውት'}
            onPress={playing ? audio.pause : audio.play}
            style={[styles.play, { backgroundColor: colors.accent }]}
          >
            <Ionicons name={playing ? 'pause' : 'play'} size={18} color={colors.accentText} />
          </Pressable>
          <Pressable
            disabled={!next}
            accessibilityLabel="ቀጣይ ድምጽ"
            onPress={() => next && onOpenChapter?.(next.bookIndex, next.chapterIndex)}
          >
            <Ionicons name="play-skip-forward" size={18} color={next ? colors.text : colors.textMuted} />
          </Pressable>
          <Pressable accessibilityLabel="ፍጥነት" onPress={audio.cycleRate}>
            <Text style={{ color: colors.accent, fontWeight: '800', fontSize: 12 }}>{audio.state.rate}x</Text>
          </Pressable>
        </View>
      ) : (
        <View style={[styles.play, { backgroundColor: colors.surfaceMuted }]}>
          <Ionicons name="play" size={18} color={colors.textMuted} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderTopWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  meta: { flex: 1 },
  title: { fontWeight: '700', fontSize: 13 },
  sub: { fontSize: 11, marginTop: 2 },
  track: { height: 4, borderRadius: 99, marginTop: 6, overflow: 'hidden' },
  fill: { height: 4, borderRadius: 99 },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  play: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
