import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import type { VerseLocation } from '../types/bible';
import type { HighlightColor } from '../types/user';
import { formatReference } from '../data/bible';
import { HIGHLIGHT_COLORS, HIGHLIGHT_LABELS } from '../theme/themes';
import { useAppTheme } from '../theme/ThemeContext';
import { useStudy } from '../context/StudyContext';
import { copyVerse, shareVerse } from '../services/shareService';
import { hasCrossReferences } from '../services/crossReferenceService';
import { hasStrongsData } from '../services/strongsService';

const COLORS: HighlightColor[] = ['yellow', 'green', 'blue', 'orange', 'red', 'purple'];

interface Props {
  verse: VerseLocation | null;
  visible: boolean;
  onClose: () => void;
  onAddNote: (verse: VerseLocation) => void;
  onCreateImage: (verse: VerseLocation) => void;
  onOpenStudy: (verse: VerseLocation) => void;
}

export function VerseActionSheet({
  verse,
  visible,
  onClose,
  onAddNote,
  onCreateImage,
  onOpenStudy,
}: Props) {
  const colors = useAppTheme();
  const { toggleBookmark, isBookmarked, setHighlight, getHighlight, getNote } = useStudy();

  if (!verse) {
    return null;
  }

  const bookmarked = isBookmarked(verse);
  const highlight = getHighlight(verse);
  const note = getNote(verse);

  const run = async (action: () => void | Promise<void>) => {
    try {
      await Haptics.selectionAsync();
    } catch {
      // haptics optional
    }
    await action();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={[styles.backdrop, { backgroundColor: colors.overlay }]} onPress={onClose} />
      <View style={[styles.sheet, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.ref, { color: colors.accent }]}>{formatReference(verse)}</Text>
        <Text style={[styles.text, { color: colors.text }]} numberOfLines={4}>
          {verse.text}
        </Text>

        <Text style={[styles.section, { color: colors.textMuted }]}>ምልክት ቀለም</Text>
        <View style={styles.colors}>
          {COLORS.map((color) => (
            <Pressable
              key={color}
              accessibilityRole="button"
              accessibilityLabel={HIGHLIGHT_LABELS[color]}
              onPress={() =>
                run(() => {
                  setHighlight(verse, highlight?.color === color ? null : color);
                })
              }
              style={[
                styles.swatch,
                { backgroundColor: HIGHLIGHT_COLORS[color] },
                highlight?.color === color && styles.swatchActive,
              ]}
            />
          ))}
        </View>

        <View style={styles.actions}>
          <Action
            icon="copy-outline"
            label="ቅዳ"
            onPress={() => run(() => copyVerse(verse, true).then(onClose))}
          />
          <Action
            icon="share-social-outline"
            label="አጋራ"
            onPress={() => run(() => shareVerse(verse, true).then(onClose))}
          />
          <Action
            icon={bookmarked ? 'bookmark' : 'bookmark-outline'}
            label={bookmarked ? 'አስወግድ' : 'ምልክት'}
            onPress={() => run(() => toggleBookmark(verse))}
          />
          <Action
            icon="create-outline"
            label={note ? 'ማስታወሻ' : 'ጻፍ'}
            onPress={() => {
              onClose();
              onAddNote(verse);
            }}
          />
          <Action
            icon="image-outline"
            label="ምስል"
            onPress={() => {
              onClose();
              onCreateImage(verse);
            }}
          />
          <Action
            icon="library-outline"
            label="ጥናት"
            onPress={() => {
              onClose();
              onOpenStudy(verse);
            }}
          />
        </View>
        {highlight ? (
          <Pressable onPress={() => run(() => setHighlight(verse, null))}>
            <Text style={[styles.remove, { color: colors.danger }]}>ምልክቱን አስወግድ</Text>
          </Pressable>
        ) : null}
        {!hasCrossReferences() && !hasStrongsData() ? null : (
          <Text style={[styles.hint, { color: colors.textMuted }]}>
            የጥናት መሣሪያዎች ለዚህ ጥቅስ ይገኛሉ
          </Text>
        )}
      </View>
    </Modal>
  );
}

function Action({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  const colors = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[styles.action, { backgroundColor: colors.surfaceMuted }]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Ionicons name={icon} size={20} color={colors.accent} />
      <Text style={[styles.actionLabel, { color: colors.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1 },
  sheet: {
    padding: 20,
    paddingBottom: 28,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
  },
  ref: { fontSize: 15, fontWeight: '700', marginBottom: 8 },
  text: { fontSize: 17, lineHeight: 30, marginBottom: 16 },
  section: { fontSize: 13, marginBottom: 8, fontWeight: '600' },
  colors: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  swatch: { width: 36, height: 36, borderRadius: 18 },
  swatchActive: { borderWidth: 3, borderColor: '#111' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  action: {
    minWidth: 96,
    minHeight: 48,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  actionLabel: { fontSize: 13, fontWeight: '600' },
  remove: { marginTop: 14, fontWeight: '700' },
  hint: { marginTop: 10, fontSize: 12 },
});
