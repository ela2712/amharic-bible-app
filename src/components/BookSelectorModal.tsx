import { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BOOK_GROUP_LABELS, getBookMetas } from '../data/bible';
import type { BookGroupId, Testament } from '../types/bible';
import { normalizeAmharic } from '../utils/amharic';
import { useAppTheme } from '../theme/ThemeContext';

interface Props {
  visible: boolean;
  selectedIndex: number;
  onClose: () => void;
  onSelect: (bookIndex: number) => void;
}

export function BookSelectorModal({ visible, selectedIndex, onClose, onSelect }: Props) {
  const colors = useAppTheme();
  const [testament, setTestament] = useState<Testament | 'all'>('all');
  const [query, setQuery] = useState('');
  const books = useMemo(() => getBookMetas(), []);

  const filtered = useMemo(() => {
    const needle = normalizeAmharic(query);
    return books.filter((book) => {
      if (testament !== 'all' && book.testament !== testament) {
        return false;
      }
      if (!needle) {
        return true;
      }
      return normalizeAmharic(book.title).includes(needle);
    });
  }, [books, testament, query]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>መጽሐፍ ይምረጡ</Text>
          <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="ዝጋ">
            <Text style={[styles.close, { color: colors.accent }]}>ዝጋ</Text>
          </Pressable>
        </View>

        <View style={styles.tabs}>
          {([
            ['all', 'ሁሉም'],
            ['ot', 'ብሉይ ኪዳን'],
            ['nt', 'ሐዲስ ኪዳን'],
          ] as const).map(([id, label]) => (
            <Pressable
              key={id}
              onPress={() => setTestament(id)}
              style={[
                styles.tab,
                {
                  backgroundColor: testament === id ? colors.accent : colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={{ color: testament === id ? colors.accentText : colors.text, fontWeight: '700' }}>
                {label}
              </Text>
            </Pressable>
          ))}
        </View>

        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="መጽሐፍ ፈልግ"
          placeholderTextColor={colors.textMuted}
          style={[
            styles.search,
            { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
          ]}
        />

        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.index)}
          initialNumToRender={20}
          windowSize={8}
          renderItem={({ item, index }) => {
            const prev = filtered[index - 1];
            const showGroup = !prev || prev.group !== item.group;
            return (
              <View>
                {showGroup ? (
                  <Text style={[styles.group, { color: colors.textMuted }]}>
                    {BOOK_GROUP_LABELS[item.group as BookGroupId]}
                  </Text>
                ) : null}
                <Pressable
                  onPress={() => {
                    onSelect(item.index);
                    onClose();
                  }}
                  style={[
                    styles.row,
                    {
                      backgroundColor:
                        item.index === selectedIndex ? colors.accentSoft : colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={item.title}
                >
                  <Text style={[styles.bookTitle, { color: colors.text }]}>{item.title}</Text>
                  <Text style={{ color: colors.textMuted }}>{item.chapterCount}</Text>
                </Pressable>
              </View>
            );
          }}
        />
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
  },
  title: { fontSize: 22, fontWeight: '800' },
  close: { fontSize: 16, fontWeight: '700', minHeight: 44, textAlignVertical: 'center' },
  tabs: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  tab: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  search: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    minHeight: 48,
    marginBottom: 12,
    fontSize: 16,
  },
  group: { marginTop: 12, marginBottom: 6, fontWeight: '700' },
  row: {
    minHeight: 52,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bookTitle: { fontSize: 17, fontWeight: '600', flex: 1, paddingRight: 8 },
});
