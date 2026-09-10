import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../theme/ThemeContext';
import { isAudioAvailable, UNAVAILABLE_AUDIO_STATE } from '../services/audioService';

interface Props {
  bookTitle: string;
  chapterLabel: string;
}

export function AudioPlayerBar({ bookTitle, chapterLabel }: Props) {
  const colors = useAppTheme();
  const available = isAudioAvailable();
  const state = UNAVAILABLE_AUDIO_STATE;

  return (
    <View style={[styles.bar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Ionicons name="headset-outline" size={20} color={colors.accent} />
      <View style={styles.meta}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {bookTitle} {chapterLabel}
        </Text>
        <Text style={[styles.sub, { color: colors.textMuted }]} numberOfLines={2}>
          {available ? 'ድምጽ ዝግጁ ነው' : state.message}
        </Text>
      </View>
      <Pressable
        disabled={!available}
        accessibilityRole="button"
        accessibilityLabel="አጫውት"
        style={[
          styles.play,
          { backgroundColor: available ? colors.accent : colors.surfaceMuted },
        ]}
      >
        <Ionicons
          name="play"
          size={18}
          color={available ? colors.accentText : colors.textMuted}
        />
      </Pressable>
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
  play: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
