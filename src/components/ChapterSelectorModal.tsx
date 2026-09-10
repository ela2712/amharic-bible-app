import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getBook } from '../data/bible';
import { useAppTheme } from '../theme/ThemeContext';

interface Props {
  visible: boolean;
  bookIndex: number;
  chapterIndex: number;
  onClose: () => void;
  onSelect: (chapterIndex: number) => void;
}

export function ChapterSelectorModal({
  visible,
  bookIndex,
  chapterIndex,
  onClose,
  onSelect,
}: Props) {
  const colors = useAppTheme();
  const book = getBook(bookIndex);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            {book?.title ?? 'ምዕራፍ'} — ምዕራፍ ይምረጡ
          </Text>
          <Pressable onPress={onClose} accessibilityRole="button">
            <Text style={[styles.close, { color: colors.accent }]}>ዝጋ</Text>
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.grid}>
          {(book?.chapters ?? []).map((chapter, index) => (
            <Pressable
              key={chapter.chapter}
              onPress={() => {
                onSelect(index);
                onClose();
              }}
              style={[
                styles.cell,
                {
                  backgroundColor: index === chapterIndex ? colors.accent : colors.surface,
                  borderColor: colors.border,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={`ምዕራፍ ${chapter.chapter}`}
            >
              <Text
                style={{
                  color: index === chapterIndex ? colors.accentText : colors.text,
                  fontWeight: '700',
                  fontSize: 16,
                }}
              >
                {chapter.chapter}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, paddingHorizontal: 16 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  title: { fontSize: 18, fontWeight: '800', flex: 1 },
  close: { fontSize: 16, fontWeight: '700', minHeight: 44, textAlignVertical: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingBottom: 24 },
  cell: {
    width: 56,
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
