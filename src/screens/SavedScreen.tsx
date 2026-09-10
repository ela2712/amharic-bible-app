import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Screen } from '../components/Screen';
import { NoteEditorModal } from '../components/NoteEditorModal';
import { useStudy } from '../context/StudyContext';
import { useAppTheme } from '../theme/ThemeContext';
import { HIGHLIGHT_COLORS, HIGHLIGHT_LABELS } from '../theme/themes';
import { getVerse } from '../data/bible';
import { normalizeAmharic } from '../utils/amharic';
import type { RootTabParamList } from '../types/navigation';
import type { HighlightColor } from '../types/user';
import type { VerseLocation } from '../types/bible';

type TabKey = 'bookmarks' | 'highlights' | 'notes';

export default function SavedScreen() {
  const colors = useAppTheme();
  const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>();
  const { store, toggleBookmark, setHighlight } = useStudy();
  const [tab, setTab] = useState<TabKey>('bookmarks');
  const [query, setQuery] = useState('');
  const [noteVerse, setNoteVerse] = useState<VerseLocation | null>(null);

  const openVerse = (bookIndex: number, chapterIndex: number, verseIndex: number) => {
    navigation.navigate('BibleTab', {
      screen: 'BibleReader',
      params: { bookIndex, chapterIndex, verseIndex },
    });
  };

  const needle = normalizeAmharic(query);

  const bookmarks = useMemo(
    () =>
      store.bookmarks.filter(
        (item) =>
          !needle ||
          normalizeAmharic(`${item.bookTitle} ${item.text}`).includes(needle),
      ),
    [store.bookmarks, needle],
  );
  const highlights = useMemo(
    () =>
      store.highlights.filter(
        (item) =>
          !needle ||
          normalizeAmharic(`${item.bookTitle} ${item.text}`).includes(needle),
      ),
    [store.highlights, needle],
  );
  const notes = useMemo(
    () =>
      store.notes.filter(
        (item) =>
          !needle ||
          normalizeAmharic(`${item.bookTitle} ${item.text} ${item.content}`).includes(needle),
      ),
    [store.notes, needle],
  );

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>የተቀመጡ</Text>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="ፈልግ"
          placeholderTextColor={colors.textMuted}
          style={[
            styles.input,
            { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
          ]}
        />
        <View style={styles.tabs}>
          {(
            [
              ['bookmarks', `ምልክት (${store.bookmarks.length})`],
              ['highlights', `ቀለም (${store.highlights.length})`],
              ['notes', `ማስታወሻ (${store.notes.length})`],
            ] as const
          ).map(([id, label]) => (
            <Pressable
              key={id}
              onPress={() => setTab(id)}
              style={[
                styles.tab,
                { backgroundColor: tab === id ? colors.accent : colors.surfaceMuted },
              ]}
            >
              <Text style={{ color: tab === id ? colors.accentText : colors.text, fontWeight: '700', fontSize: 13 }}>
                {label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {tab === 'bookmarks' ? (
        <FlatList
          data={bookmarks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Empty text="ምንም ምልክት የለም። ጥቅስ ላይ በመጫን ያስቀምጡ።" />}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => openVerse(item.ref.bookIndex, item.ref.chapterIndex, item.ref.verseIndex)}
              style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <Text style={{ color: colors.accent, fontWeight: '800' }}>
                {item.bookTitle} {item.chapterNumber}:{item.verseNumber}
              </Text>
              <Text style={{ color: colors.text, marginTop: 6, lineHeight: 26 }}>{item.text}</Text>
              <Pressable
                onPress={() => {
                  const verse = getVerse(item.ref);
                  if (verse) {
                    toggleBookmark(verse);
                  }
                }}
                style={{ marginTop: 10 }}
              >
                <Text style={{ color: colors.danger, fontWeight: '700' }}>አስወግድ</Text>
              </Pressable>
            </Pressable>
          )}
        />
      ) : null}

      {tab === 'highlights' ? (
        <FlatList
          data={highlights}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Empty text="ምንም ቀለም የለም።" />}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => openVerse(item.ref.bookIndex, item.ref.chapterIndex, item.ref.verseIndex)}
              style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <View style={styles.colorRow}>
                <View style={[styles.dot, { backgroundColor: HIGHLIGHT_COLORS[item.color as HighlightColor] }]} />
                <Text style={{ color: colors.accent, fontWeight: '800' }}>
                  {item.bookTitle} {item.chapterNumber}:{item.verseNumber} · {HIGHLIGHT_LABELS[item.color]}
                </Text>
              </View>
              <Text style={{ color: colors.text, marginTop: 6, lineHeight: 26 }}>{item.text}</Text>
              <Pressable
                onPress={() => {
                  const verse = getVerse(item.ref);
                  if (verse) {
                    setHighlight(verse, null);
                  }
                }}
                style={{ marginTop: 10 }}
              >
                <Text style={{ color: colors.danger, fontWeight: '700' }}>ቀለሙን አስወግድ</Text>
              </Pressable>
            </Pressable>
          )}
        />
      ) : null}

      {tab === 'notes' ? (
        <FlatList
          data={notes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Empty text="ማስታወሻ የለም።" />}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => {
                const verse = getVerse(item.ref);
                if (verse) {
                  setNoteVerse(verse);
                }
              }}
              style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <Text style={{ color: colors.accent, fontWeight: '800' }}>
                {item.bookTitle} {item.chapterNumber}:{item.verseNumber}
              </Text>
              <Text style={{ color: colors.textMuted, marginTop: 4 }} numberOfLines={2}>
                {item.text}
              </Text>
              <Text style={{ color: colors.text, marginTop: 8, lineHeight: 26 }}>{item.content}</Text>
              <Pressable
                onPress={() => openVerse(item.ref.bookIndex, item.ref.chapterIndex, item.ref.verseIndex)}
                style={{ marginTop: 10 }}
              >
                <Text style={{ color: colors.accent, fontWeight: '700' }}>ጥቅሱን ክፈት</Text>
              </Pressable>
            </Pressable>
          )}
        />
      ) : null}

      <NoteEditorModal verse={noteVerse} visible={Boolean(noteVerse)} onClose={() => setNoteVerse(null)} />
    </Screen>
  );
}

function Empty({ text }: { text: string }) {
  const colors = useAppTheme();
  return (
    <View style={{ paddingTop: 48, alignItems: 'center' }}>
      <Text style={{ color: colors.textMuted, textAlign: 'center', lineHeight: 24 }}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingTop: 8 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 12 },
  input: { borderWidth: 1, borderRadius: 14, minHeight: 48, paddingHorizontal: 14, fontSize: 16 },
  tabs: { flexDirection: 'row', gap: 8, marginTop: 12 },
  tab: { flex: 1, minHeight: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 16, paddingBottom: 40 },
  card: { borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 10 },
  colorRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 14, height: 14, borderRadius: 7 },
});
