import { useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, InteractionManager, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Screen } from '../components/Screen';
import { PageTitle, Segmented } from '../components/ui';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { searchBible, warmupSearchIndex } from '../services/searchService';
import { useStudy } from '../context/StudyContext';
import { useAppTheme } from '../theme/ThemeContext';
import type { RootTabParamList } from '../types/navigation';
import type { Testament } from '../types/bible';
import type { SearchHit } from '../types/study';

export default function SearchScreen() {
  const colors = useAppTheme();
  const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>();
  const { store, addSearchHistory, clearSearchHistory } = useStudy();
  const [query, setQuery] = useState('');
  const [testament, setTestament] = useState<Testament | 'all'>('all');
  const [bookIndex, setBookIndex] = useState<number | null>(null);
  const debounced = useDebouncedValue(query, 280);

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      warmupSearchIndex();
    });
    return () => task.cancel();
  }, []);

  const results = useMemo(
    () =>
      searchBible({
        query: debounced,
        testament,
        bookIndex,
      }),
    [debounced, testament, bookIndex],
  );

  const lastSavedQuery = useRef('');
  useEffect(() => {
    const trimmed = debounced.trim();
    if (trimmed.length >= 2 && trimmed !== lastSavedQuery.current) {
      lastSavedQuery.current = trimmed;
      addSearchHistory(trimmed);
    }
  }, [debounced, addSearchHistory]);

  const openHit = (hit: SearchHit) => {
    navigation.navigate('BibleTab', {
      screen: 'BibleReader',
      params: {
        bookIndex: hit.bookIndex,
        chapterIndex: hit.chapterIndex,
        verseIndex: hit.verseIndex,
      },
    });
  };

  return (
    <Screen>
      <View style={styles.header}>
        <PageTitle title="ፍለጋ" />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="ቃል ወይም ጥቅስ ይፈልጉ"
          placeholderTextColor={colors.textMuted}
          autoCorrect={false}
          style={[
            styles.input,
            { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
          ]}
        />
        <View style={{ marginTop: 12 }}>
          <Segmented
            value={testament}
            options={[
              { id: 'all', label: 'ሁሉም' },
              { id: 'ot', label: 'ብሉይ' },
              { id: 'nt', label: 'ሐዲስ' },
            ]}
            onChange={(id) => setTestament(id)}
          />
        </View>
      </View>

      {!query.trim() ? (
        <View style={styles.body}>
          <Text style={[styles.section, { color: colors.textMuted }]}>የቅርብ ፍለጋ</Text>
          {store.searchHistory.length === 0 ? (
            <Text style={{ color: colors.textMuted, lineHeight: 24 }}>ቃል ይጻፉ። ውጤቶች እዚህ ይታያሉ።</Text>
          ) : (
            <>
              <View style={styles.filters}>
                {store.searchHistory.map((item) => (
                  <Pressable
                    key={item}
                    onPress={() => setQuery(item)}
                    style={[styles.chip, { backgroundColor: colors.surfaceMuted }]}
                  >
                    <Text style={{ color: colors.text }}>{item}</Text>
                  </Pressable>
                ))}
              </View>
              <Pressable onPress={clearSearchHistory}>
                <Text style={{ color: colors.textMuted, marginTop: 12 }}>ታሪክ አጽዳ</Text>
              </Pressable>
            </>
          )}
        </View>
      ) : results.length === 0 ? (
        <View style={styles.empty}>
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>ውጤት አልተገኘም</Text>
          <Text style={{ color: colors.textMuted, marginTop: 8, textAlign: 'center' }}>
            ሌላ ቃል ይሞክሩ ወይም የመጽሐፍ ገደቡን ያንሱ።
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => `${item.bookIndex}-${item.chapterIndex}-${item.verseIndex}`}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          initialNumToRender={12}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <Pressable
              onPress={() => openHit(item)}
              style={[styles.result, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <Text style={{ color: colors.accent, fontWeight: '800' }}>
                {item.bookTitle} {item.chapterNumber}:{item.verseNumber}
              </Text>
              <Highlighted snippet={item.snippet} query={debounced} color={colors.text} accent={colors.accent} />
            </Pressable>
          )}
        />
      )}
    </Screen>
  );
}

function Highlighted({
  snippet,
  query,
  color,
  accent,
}: {
  snippet: string;
  query: string;
  color: string;
  accent: string;
}) {
  const terms = query.trim().split(/\s+/).filter(Boolean);
  if (terms.length === 0) {
    return <Text style={{ color, marginTop: 6, lineHeight: 26 }}>{snippet}</Text>;
  }
  const parts = snippet.split(new RegExp(`(${terms.map(escapeRegExp).join('|')})`, 'g'));
  return (
    <Text style={{ color, marginTop: 6, lineHeight: 26 }}>
      {parts.map((part, index) =>
        terms.some((term) => part.toLowerCase() === term.toLowerCase() || part === term) ? (
          <Text key={`${part}-${index}`} style={{ color: accent, fontWeight: '800' }}>
            {part}
          </Text>
        ) : (
          <Text key={`${part}-${index}`}>{part}</Text>
        ),
      )}
    </Text>
  );
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingTop: 8 },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    minHeight: 48,
    paddingHorizontal: 14,
    fontSize: 17,
  },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  chip: { minHeight: 36, paddingHorizontal: 12, borderRadius: 18, justifyContent: 'center' },
  body: { flex: 1, padding: 16 },
  section: { fontSize: 13, fontWeight: '700', marginBottom: 10 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  result: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 16, padding: 14, marginBottom: 10 },
});
