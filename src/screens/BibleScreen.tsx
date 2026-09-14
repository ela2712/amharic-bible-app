import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ListRenderItem,
  type ViewToken,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../components/Screen';
import { BookSelectorModal } from '../components/BookSelectorModal';
import { ChapterSelectorModal } from '../components/ChapterSelectorModal';
import { VerseActionSheet } from '../components/VerseActionSheet';
import { NoteEditorModal } from '../components/NoteEditorModal';
import { ReaderSettingsModal } from '../components/ReaderSettingsModal';
import { AudioPlayerBar } from '../components/AudioPlayerBar';
import { StudyToolsModal } from '../components/StudyToolsModal';
import {
  getAdjacentChapter,
  getBook,
  getChapter,
  getVerse,
} from '../data/bible';
import { useStudy } from '../context/StudyContext';
import { useAppTheme } from '../theme/ThemeContext';
import { HIGHLIGHT_COLORS } from '../theme/themes';
import { readerTextStyle } from '../theme/typography';
import type { BibleStackParamList, BibleReaderRoute } from '../types/navigation';
import type { VerseLocation } from '../types/bible';

interface VerseRowData {
  index: number;
  text: string;
}

function clampChapter(bookIndex: number, chapterIndex: number): {
  bookIndex: number;
  chapterIndex: number;
} {
  const book = getBook(bookIndex);
  if (!book) {
    return { bookIndex: 0, chapterIndex: 0 };
  }
  const maxChapter = Math.max(0, book.chapters.length - 1);
  return {
    bookIndex,
    chapterIndex: Math.min(Math.max(0, chapterIndex), maxChapter),
  };
}

const VerseRow = memo(function VerseRow({
  item,
  fontSize,
  lineHeight,
  verseNumberSize,
  showVerseNumbers,
  highlightColor,
  hasNote,
  isBookmarked,
  isFocused,
  textColor,
  numberColor,
  onOpen,
}: {
  item: VerseRowData;
  fontSize: number;
  lineHeight: number;
  verseNumberSize: number;
  showVerseNumbers: boolean;
  highlightColor?: string;
  hasNote: boolean;
  isBookmarked: boolean;
  isFocused: boolean;
  textColor: string;
  numberColor: string;
  onOpen: (verseIndex: number) => void;
}) {
  return (
    <Pressable
      onLongPress={() => onOpen(item.index)}
      onPress={() => onOpen(item.index)}
      accessibilityRole="button"
      accessibilityLabel={`ጥቅስ ${item.index + 1}. ${item.text}`}
      style={[
        styles.verseRow,
        highlightColor ? { backgroundColor: highlightColor } : null,
        isFocused ? styles.focusedVerse : null,
      ]}
    >
      <Text style={readerTextStyle(fontSize, lineHeight, textColor)}>
        {showVerseNumbers ? (
          <Text
            style={{
              fontSize: verseNumberSize,
              fontWeight: '800',
              color: numberColor,
            }}
          >
            {item.index + 1}{' '}
          </Text>
        ) : null}
        {item.text}
      </Text>
      {hasNote || isBookmarked ? (
        <View style={styles.markers}>
          {isBookmarked ? <Ionicons name="bookmark" size={14} color={numberColor} /> : null}
          {hasNote ? <Ionicons name="create" size={14} color={numberColor} /> : null}
        </View>
      ) : null}
    </Pressable>
  );
});

export default function BibleScreen() {
  const colors = useAppTheme();
  const navigation = useNavigation<NativeStackNavigationProp<BibleStackParamList>>();
  const route = useRoute<BibleReaderRoute>();
  const {
    ready,
    store,
    settings,
    setReadingPosition,
    addHistory,
    getHighlight,
    getNote,
    isBookmarked,
  } = useStudy();

  const [bookIndex, setBookIndex] = useState(0);
  const [chapterIndex, setChapterIndex] = useState(0);
  const [focusVerse, setFocusVerse] = useState<number | null>(null);
  const [showBooks, setShowBooks] = useState(false);
  const [showChapters, setShowChapters] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeVerse, setActiveVerse] = useState<VerseLocation | null>(null);
  const [noteVerse, setNoteVerse] = useState<VerseLocation | null>(null);
  const [studyVerse, setStudyVerse] = useState<VerseLocation | null>(null);
  const listRef = useRef<FlatList<VerseRowData>>(null);
  const restoredRef = useRef(false);
  const locationRef = useRef({ bookIndex: 0, chapterIndex: 0 });
  locationRef.current = { bookIndex, chapterIndex };

  const applyLocation = useCallback(
    (nextBook: number, nextChapter: number, nextVerse = 0) => {
      const clamped = clampChapter(nextBook, nextChapter);
      setBookIndex(clamped.bookIndex);
      setChapterIndex(clamped.chapterIndex);
      setFocusVerse(nextVerse);
    },
    [],
  );

  useEffect(() => {
    if (!ready || restoredRef.current) {
      return;
    }
    restoredRef.current = true;
    const params = route.params;
    if (typeof params?.bookIndex === 'number') {
      applyLocation(params.bookIndex, params.chapterIndex ?? 0, params.verseIndex ?? 0);
      return;
    }
    const saved = store.readingPosition;
    if (saved) {
      applyLocation(saved.bookIndex, saved.chapterIndex, saved.verseIndex);
    }
  }, [ready, applyLocation, route.params, store.readingPosition]);

  useEffect(() => {
    const params = route.params;
    if (!restoredRef.current || typeof params?.bookIndex !== 'number') {
      return;
    }
    applyLocation(params.bookIndex, params.chapterIndex ?? 0, params.verseIndex ?? 0);
  }, [route.params, applyLocation]);

  const book = getBook(bookIndex);
  const chapter = getChapter(bookIndex, chapterIndex);
  const verses: VerseRowData[] = useMemo(
    () => (chapter?.verses ?? []).map((text, index) => ({ index, text })),
    [chapter],
  );

  useEffect(() => {
    if (!book || !chapter) {
      return;
    }
    addHistory(bookIndex, chapterIndex);
  }, [bookIndex, chapterIndex, book, chapter, addHistory]);

  useEffect(() => {
    if (!book || !chapter) {
      return;
    }
    setReadingPosition({
      bookIndex,
      chapterIndex,
      verseIndex: focusVerse ?? 0,
      updatedAt: new Date().toISOString(),
    });
  }, [bookIndex, chapterIndex, book, chapter, focusVerse, setReadingPosition]);

  useEffect(() => {
    if (focusVerse == null) {
      return;
    }
    const handle = setTimeout(() => {
      try {
        listRef.current?.scrollToIndex({ index: focusVerse, viewPosition: 0.18, animated: true });
      } catch {
        listRef.current?.scrollToOffset({ offset: 0, animated: false });
      }
    }, 80);
    return () => clearTimeout(handle);
  }, [bookIndex, chapterIndex, focusVerse]);

  const openVerse = useCallback(
    (verseIndex: number) => {
      const verse = getVerse({ bookIndex, chapterIndex, verseIndex });
      if (verse) {
        setActiveVerse(verse);
      }
    },
    [bookIndex, chapterIndex],
  );

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    const first = viewableItems[0];
    if (typeof first?.index !== 'number') {
      return;
    }
    const location = locationRef.current;
    setReadingPosition({
      bookIndex: location.bookIndex,
      chapterIndex: location.chapterIndex,
      verseIndex: first.index,
      updatedAt: new Date().toISOString(),
    });
  }).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 40 }).current;

  const goAdjacent = (direction: -1 | 1) => {
    const next = getAdjacentChapter(bookIndex, chapterIndex, direction);
    if (!next) {
      return;
    }
    applyLocation(next.bookIndex, next.chapterIndex, 0);
  };

  const renderItem: ListRenderItem<VerseRowData> = useCallback(
    ({ item }) => {
      const ref = { bookIndex, chapterIndex, verseIndex: item.index };
      const highlight = getHighlight(ref);
      return (
        <VerseRow
          item={item}
          fontSize={settings.reader.fontSize}
          lineHeight={settings.reader.lineHeight}
          verseNumberSize={settings.reader.verseNumberSize}
          showVerseNumbers={settings.reader.showVerseNumbers}
          highlightColor={highlight ? HIGHLIGHT_COLORS[highlight.color] : undefined}
          hasNote={Boolean(getNote(ref))}
          isBookmarked={isBookmarked(ref)}
          isFocused={focusVerse === item.index}
          textColor={colors.text}
          numberColor={colors.verseNumber}
          onOpen={openVerse}
        />
      );
    },
    [
      bookIndex,
      chapterIndex,
      colors.text,
      colors.verseNumber,
      focusVerse,
      getHighlight,
      getNote,
      isBookmarked,
      openVerse,
      settings.reader,
    ],
  );

  if (!book || !chapter) {
    return (
      <Screen>
        <View style={styles.error}>
          <Text style={{ color: colors.text, fontSize: 18 }}>መጽሐፉ ሊከፈት አልቻለም።</Text>
        </View>
      </Screen>
    );
  }

  const prev = getAdjacentChapter(bookIndex, chapterIndex, -1);
  const next = getAdjacentChapter(bookIndex, chapterIndex, 1);
  const widthPercent = Math.min(100, Math.max(70, settings.reader.readingWidth));

  return (
    <Screen>
      <View
        style={[
          styles.header,
          { backgroundColor: colors.header, borderBottomColor: colors.border },
        ]}
      >
        <Pressable
          onPress={() => setShowBooks(true)}
          style={styles.headerMain}
          accessibilityRole="button"
          accessibilityLabel="መጽሐፍ ይምረጡ"
        >
          <Text style={[styles.bookTitle, { color: colors.text }]} numberOfLines={1}>
            {book.title}
          </Text>
          <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
        </Pressable>
        <View style={styles.headerActions}>
          <Pressable
            onPress={() => setShowChapters(true)}
            style={[styles.chapterChip, { backgroundColor: colors.accentSoft }]}
            accessibilityRole="button"
            accessibilityLabel="ምዕራፍ ይምረጡ"
          >
            <Text style={{ color: colors.accent, fontWeight: '800' }}>ም {chapter.chapter}</Text>
          </Pressable>
          <Pressable onPress={() => setShowSettings(true)} accessibilityLabel="የንባብ ቅንብሮች">
            <Ionicons name="text" size={22} color={colors.accent} />
          </Pressable>
        </View>
      </View>

      <FlatList
        ref={listRef}
        data={verses}
        keyExtractor={(item) => String(item.index)}
        renderItem={renderItem}
        initialNumToRender={12}
        maxToRenderPerBatch={10}
        windowSize={7}
        removeClippedSubviews
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        onScrollToIndexFailed={(info) => {
          listRef.current?.scrollToOffset({
            offset: Math.max(0, info.averageItemLength * info.index),
            animated: false,
          });
        }}
        contentContainerStyle={{
          paddingHorizontal: settings.reader.horizontalMargin,
          paddingTop: 12,
          paddingBottom: 24,
          width: `${widthPercent}%`,
          alignSelf: 'center',
        }}
        extraData={`${store.highlights.length}-${store.notes.length}-${store.bookmarks.length}-${settings.reader.fontSize}-${focusVerse}`}
        ListEmptyComponent={
          <Text style={{ color: colors.textMuted, padding: 24 }}>በዚህ ምዕራፍ ጥቅስ የለም።</Text>
        }
      />

      <View style={[styles.nav, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <Pressable
          disabled={!prev}
          onPress={() => goAdjacent(-1)}
          style={[styles.navBtn, { backgroundColor: prev ? colors.accent : colors.surfaceMuted }]}
          accessibilityLabel="ቀዳሚ ምዕራፍ"
        >
          <Text style={{ color: prev ? colors.accentText : colors.textMuted, fontWeight: '700' }}>
            ‹ ቀዳሚ
          </Text>
        </Pressable>
        <Text style={{ color: colors.textSecondary, fontWeight: '700' }}>
          {chapterIndex + 1} / {book.chapters.length}
        </Text>
        <Pressable
          disabled={!next}
          onPress={() => goAdjacent(1)}
          style={[styles.navBtn, { backgroundColor: next ? colors.accent : colors.surfaceMuted }]}
          accessibilityLabel="ቀጣይ ምዕራፍ"
        >
          <Text style={{ color: next ? colors.accentText : colors.textMuted, fontWeight: '700' }}>
            ቀጣይ ›
          </Text>
        </Pressable>
      </View>

      <AudioPlayerBar
        bookIndex={bookIndex}
        chapterIndex={chapterIndex}
        bookTitle={book.title}
        chapterLabel={`ምዕራፍ ${chapter.chapter}`}
        onOpenChapter={(nextBook, nextChapter) => applyLocation(nextBook, nextChapter, 0)}
      />

      <BookSelectorModal
        visible={showBooks}
        selectedIndex={bookIndex}
        onClose={() => setShowBooks(false)}
        onSelect={(index) => applyLocation(index, 0, 0)}
      />
      <ChapterSelectorModal
        visible={showChapters}
        bookIndex={bookIndex}
        chapterIndex={chapterIndex}
        onClose={() => setShowChapters(false)}
        onSelect={(index) => applyLocation(bookIndex, index, 0)}
      />
      <ReaderSettingsModal visible={showSettings} onClose={() => setShowSettings(false)} />
      <VerseActionSheet
        verse={activeVerse}
        visible={Boolean(activeVerse)}
        onClose={() => setActiveVerse(null)}
        onAddNote={setNoteVerse}
        onCreateImage={(verse) =>
          navigation.navigate('VerseImage', {
            bookIndex: verse.bookIndex,
            chapterIndex: verse.chapterIndex,
            verseIndex: verse.verseIndex,
          })
        }
        onOpenStudy={setStudyVerse}
      />
      <NoteEditorModal
        verse={noteVerse}
        visible={Boolean(noteVerse)}
        onClose={() => setNoteVerse(null)}
      />
      <StudyToolsModal
        verse={studyVerse}
        visible={Boolean(studyVerse)}
        onClose={() => setStudyVerse(null)}
        onOpenRef={(b, c, v) => applyLocation(b, c, v)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44 },
  bookTitle: { fontSize: 20, fontWeight: '800', flex: 1 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  chapterChip: { minHeight: 40, paddingHorizontal: 12, borderRadius: 12, justifyContent: 'center' },
  verseRow: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginBottom: 4,
  },
  focusedVerse: { borderWidth: 1, borderColor: '#1B6B3A33' },
  markers: { flexDirection: 'row', gap: 6, marginTop: 4 },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  navBtn: {
    minHeight: 44,
    minWidth: 96,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  error: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
