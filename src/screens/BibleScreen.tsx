import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type GestureResponderEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { Directions, FlingGestureHandler, State } from 'react-native-gesture-handler';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../components/Screen';
import { BookSelectorModal } from '../components/BookSelectorModal';
import { ChapterSelectorModal } from '../components/ChapterSelectorModal';
import { VerseActionSheet } from '../components/VerseActionSheet';
import { NoteEditorModal } from '../components/NoteEditorModal';
import { ReaderSettingsModal } from '../components/ReaderSettingsModal';
import { StudyToolsModal } from '../components/StudyToolsModal';
import {
  getAdjacentChapter,
  getBook,
  getChapter,
  getDisplayVerses,
  getVerse,
} from '../data/bible';
import { ensureEnglishBible, getEnglishForDisplay, hasEnglishBook } from '../data/english';
import { ensureGeezBible, getGeezForDisplay, hasGeezBook } from '../data/geez';
import { useStudy } from '../context/StudyContext';
import { useAppTheme } from '../theme/ThemeContext';
import { HIGHLIGHT_COLORS } from '../theme/themes';
import { readerTextStyle } from '../theme/typography';
import { promptChapterShare } from '../services/shareService';
import type { BibleStackParamList, BibleReaderRoute } from '../types/navigation';
import type { VerseLocation } from '../types/bible';
import type { ReaderFontStyle, ThemeName } from '../types/user';

const FONT_SIZE_MIN = 16;
const FONT_SIZE_MAX = 36;
const THEME_CYCLE: ThemeName[] = ['light', 'sepia', 'dark', 'amoled'];

function clampFontSize(value: number): number {
  return Math.min(FONT_SIZE_MAX, Math.max(FONT_SIZE_MIN, Math.round(value)));
}

function nextTheme(current: ThemeName): ThemeName {
  const index = THEME_CYCLE.indexOf(current);
  return THEME_CYCLE[(index + 1) % THEME_CYCLE.length];
}

function themeIcon(theme: ThemeName): 'sunny-outline' | 'sunny' | 'moon-outline' | 'moon' {
  if (theme === 'sepia') {
    return 'sunny';
  }
  if (theme === 'dark') {
    return 'moon-outline';
  }
  if (theme === 'amoled') {
    return 'moon';
  }
  return 'sunny-outline';
}

function twoFingerDistance(event: GestureResponderEvent): number | null {
  const touches = event.nativeEvent.touches;
  if (touches.length < 2) {
    return null;
  }
  return Math.hypot(
    touches[0].pageX - touches[1].pageX,
    touches[0].pageY - touches[1].pageY,
  );
}

interface VerseRowData {
  verseIndex: number;
  fromIndex: number;
  toIndex: number;
  start: number;
  end: number;
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
  fontStyle,
  highlightColor,
  hasNote,
  isBookmarked,
  isFocused,
  textColor,
  numberColor,
  displayText,
  englishTypography,
  onOpen,
  onLayoutY,
}: {
  item: VerseRowData;
  fontSize: number;
  lineHeight: number;
  verseNumberSize: number;
  showVerseNumbers: boolean;
  fontStyle: ReaderFontStyle;
  highlightColor?: string;
  hasNote: boolean;
  isBookmarked: boolean;
  isFocused: boolean;
  textColor: string;
  numberColor: string;
  displayText: string;
  englishTypography: boolean;
  onOpen: (item: VerseRowData) => void;
  onLayoutY: (fromIndex: number, toIndex: number, y: number) => void;
}) {
  const body = englishTypography
    ? {
        fontSize,
        lineHeight: Math.round(fontSize * lineHeight),
        color: textColor,
      }
    : readerTextStyle(fontSize, lineHeight, textColor, fontStyle);
  return (
    <Pressable
      onLayout={(event) => onLayoutY(item.fromIndex, item.toIndex, event.nativeEvent.layout.y)}
      onLongPress={() => onOpen(item)}
      onPress={() => onOpen(item)}
      accessibilityRole="button"
      accessibilityLabel={`ጥቅስ ${item.start === item.end ? item.start : `${item.start} እስከ ${item.end}`}. ${displayText}`}
      style={[
        styles.verseRow,
        highlightColor ? { backgroundColor: highlightColor } : null,
        isFocused ? styles.focusedVerse : null,
      ]}
    >
      {showVerseNumbers ? (
        <Text
          style={[
            body,
            {
              fontSize: Math.max(11, verseNumberSize - 2),
              lineHeight: Math.round(fontSize * lineHeight),
              color: numberColor,
              width: item.start === item.end ? 28 : 52,
            },
          ]}
        >
          {item.start === item.end ? item.start : `${item.start}–${item.end}`}
        </Text>
      ) : null}
      <View style={styles.verseBody}>
        <Text style={body}>{displayText}</Text>
        {hasNote || isBookmarked ? (
          <View style={styles.markers}>
            {isBookmarked ? <Ionicons name="bookmark" size={14} color={numberColor} /> : null}
            {hasNote ? <Ionicons name="create" size={14} color={numberColor} /> : null}
          </View>
        ) : null}
      </View>
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
    setTheme,
    updateReader,
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
  const [englishEpoch, setEnglishEpoch] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const verseOffsets = useRef<number[]>([]);
  const restoredRef = useRef(false);
  const pinchStartDistRef = useRef<number | null>(null);
  const pinchBaseRef = useRef(settings.reader.fontSize);
  const lastEmittedSizeRef = useRef(settings.reader.fontSize);
  const locationRef = useRef({ bookIndex: 0, chapterIndex: 0 });
  const [liveFontSize, setLiveFontSize] = useState<number | null>(null);
  locationRef.current = { bookIndex, chapterIndex };
  const fontSize = liveFontSize ?? settings.reader.fontSize;

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
    () => (chapter ? getDisplayVerses(chapter) : []),
    [chapter],
  );
  const readerLanguage = settings.reader.readerLanguage ?? 'am';

  useEffect(() => {
    if (readerLanguage === 'am') {
      return;
    }
    let cancelled = false;
    const load = readerLanguage === 'gez' ? ensureGeezBible() : ensureEnglishBible();
    load
      .then(() => {
        if (!cancelled) {
          setEnglishEpoch((value) => value + 1);
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [readerLanguage]);

  useEffect(() => {
    verseOffsets.current = [];
  }, [bookIndex, chapterIndex]);

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
      const y = verseOffsets.current[focusVerse];
      if (typeof y === 'number') {
        scrollRef.current?.scrollTo({ y: Math.max(0, y - 8), animated: true });
      }
    }, 80);
    return () => clearTimeout(handle);
  }, [bookIndex, chapterIndex, focusVerse]);

  const openVerse = useCallback(
    (item: VerseRowData) => {
      const verse = getVerse({ bookIndex, chapterIndex, verseIndex: item.verseIndex });
      if (!verse) {
        return;
      }
      const language = settings.reader.readerLanguage ?? 'am';
      const swapped =
        language === 'en'
          ? getEnglishForDisplay(bookIndex, chapterIndex, item)
          : language === 'gez'
            ? getGeezForDisplay(bookIndex, chapterIndex, item)
            : null;
      setActiveVerse({
        ...verse,
        verseNumber: item.start,
        verseEnd: item.end,
        text: swapped ?? item.text,
      });
    },
    [bookIndex, chapterIndex, settings.reader.readerLanguage],
  );

  const onLayoutY = useCallback((fromIndex: number, toIndex: number, y: number) => {
    for (let index = fromIndex; index <= toIndex; index += 1) {
      verseOffsets.current[index] = y;
    }
  }, []);

  const onScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = event.nativeEvent.contentOffset.y;
    const offsets = verseOffsets.current;
    let index = 0;
    for (let i = 0; i < offsets.length; i += 1) {
      if (typeof offsets[i] === 'number' && offsets[i] <= y + 24) {
        index = i;
      }
    }
    const location = locationRef.current;
    setReadingPosition({
      bookIndex: location.bookIndex,
      chapterIndex: location.chapterIndex,
      verseIndex: index,
      updatedAt: new Date().toISOString(),
    });
  }, [setReadingPosition]);

  const goAdjacent = useCallback((direction: -1 | 1) => {
    const current = locationRef.current;
    const next = getAdjacentChapter(current.bookIndex, current.chapterIndex, direction);
    if (!next) {
      return;
    }
    applyLocation(next.bookIndex, next.chapterIndex, 0);
  }, [applyLocation]);

  const cycleTheme = useCallback(() => {
    setTheme(nextTheme(settings.theme));
  }, [setTheme, settings.theme]);

  const beginPinch = useCallback(
    (event: GestureResponderEvent) => {
      const dist = twoFingerDistance(event);
      if (dist == null || dist < 12) {
        return false;
      }
      pinchStartDistRef.current = dist;
      pinchBaseRef.current = settings.reader.fontSize;
      lastEmittedSizeRef.current = settings.reader.fontSize;
      return true;
    },
    [settings.reader.fontSize],
  );

  const onPinchMove = useCallback((event: GestureResponderEvent) => {
    if (pinchStartDistRef.current == null) {
      beginPinch(event);
    }
    const start = pinchStartDistRef.current;
    const dist = twoFingerDistance(event);
    if (start == null || dist == null) {
      return;
    }
    const next = clampFontSize(pinchBaseRef.current * (dist / start));
    if (next !== lastEmittedSizeRef.current) {
      lastEmittedSizeRef.current = next;
      setLiveFontSize(next);
    }
  }, [beginPinch]);

  const endPinch = useCallback(() => {
    if (pinchStartDistRef.current == null) {
      return;
    }
    pinchStartDistRef.current = null;
    updateReader({ fontSize: lastEmittedSizeRef.current });
    setLiveFontSize(null);
  }, [updateReader]);

  if (!book || !chapter) {
    return (
      <Screen backgroundColor={colors.readerBackground}>
        <View style={styles.error}>
          <Text style={{ color: colors.text, fontSize: 18 }}>መጽሐፉ ሊከፈት አልቻለም።</Text>
        </View>
      </Screen>
    );
  }

  const fontStyle = settings.reader.fontStyle ?? 'sans';

  return (
    <Screen backgroundColor={colors.readerBackground}>
      <View
        style={[
          styles.header,
          { backgroundColor: colors.readerBackground, borderBottomColor: colors.border },
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
          <Ionicons name="chevron-down" size={16} color={colors.textMuted} />
        </Pressable>
        <View style={styles.headerActions}>
          <Pressable
            onPress={() => setShowChapters(true)}
            accessibilityRole="button"
            accessibilityLabel="ምዕራፍ ይምረጡ"
            style={styles.iconBtn}
          >
            <Text style={{ color: colors.accent, fontWeight: '700', fontSize: 16 }}>{chapter.chapter}</Text>
          </Pressable>
          <Pressable
            onPress={cycleTheme}
            accessibilityLabel="የብርሃን ሁነታ"
            accessibilityRole="button"
            style={styles.iconBtn}
          >
            <Ionicons name={themeIcon(settings.theme)} size={22} color={colors.accent} />
          </Pressable>
          <View style={[styles.langSwitch, { backgroundColor: colors.surfaceMuted }]}>
            <Pressable
              onPress={() => updateReader({ readerLanguage: 'am' })}
              accessibilityLabel="አማርኛ"
              style={[
                styles.langBtn,
                (settings.reader.readerLanguage ?? 'am') === 'am'
                  ? { backgroundColor: colors.surface }
                  : null,
              ]}
            >
              <Text
                style={{
                  color: (settings.reader.readerLanguage ?? 'am') === 'am' ? colors.text : colors.textMuted,
                  fontWeight: '800',
                  fontSize: 13,
                }}
              >
                አማ
              </Text>
            </Pressable>
            <Pressable
              onPress={() => updateReader({ readerLanguage: 'en' })}
              accessibilityLabel="King James Version"
              style={[
                styles.langBtn,
                readerLanguage === 'en' ? { backgroundColor: colors.surface } : null,
              ]}
            >
              <Text
                style={{
                  color: readerLanguage === 'en' ? colors.text : colors.textMuted,
                  fontWeight: '800',
                  fontSize: 12,
                }}
              >
                KJV
              </Text>
            </Pressable>
            <Pressable
              onPress={() => updateReader({ readerLanguage: 'gez' })}
              accessibilityLabel="ግዕዝ"
              style={[
                styles.langBtn,
                readerLanguage === 'gez' ? { backgroundColor: colors.surface } : null,
              ]}
            >
              <Text
                style={{
                  color: readerLanguage === 'gez' ? colors.text : colors.textMuted,
                  fontWeight: '800',
                  fontSize: 12,
                }}
              >
                ግዕ
              </Text>
            </Pressable>
          </View>
          <Pressable
            onPress={() =>
              promptChapterShare(bookIndex, chapterIndex, readerLanguage)
            }
            accessibilityLabel="ምዕራፍ አጋራ"
            accessibilityRole="button"
            style={styles.iconBtn}
          >
            <Ionicons name="share-outline" size={22} color={colors.accent} />
          </Pressable>
          <Pressable onPress={() => setShowSettings(true)} accessibilityLabel="የንባብ ቅንብሮች" style={styles.iconBtn}>
            <Ionicons name="text" size={22} color={colors.accent} />
          </Pressable>
        </View>
      </View>

      <FlingGestureHandler
        direction={Directions.RIGHT}
        onHandlerStateChange={({ nativeEvent }) => {
          if (nativeEvent.state === State.END) {
            goAdjacent(-1);
          }
        }}
      >
        <FlingGestureHandler
          direction={Directions.LEFT}
          onHandlerStateChange={({ nativeEvent }) => {
            if (nativeEvent.state === State.END) {
              goAdjacent(1);
            }
          }}
        >
          <View style={styles.fill}>
            <ScrollView
              ref={scrollRef}
              onScroll={onScroll}
              scrollEventThrottle={200}
              onTouchStart={(event) => {
                if (event.nativeEvent.touches.length >= 2) {
                  beginPinch(event);
                }
              }}
              onTouchMove={(event) => {
                if (event.nativeEvent.touches.length >= 2) {
                  onPinchMove(event);
                }
              }}
              onTouchEnd={endPinch}
              onTouchCancel={endPinch}
              contentContainerStyle={{
                paddingHorizontal: settings.reader.horizontalMargin,
                paddingTop: 8,
                paddingBottom: 28,
              }}
            >
              <Text style={[styles.chapterHeading, { color: colors.textMuted }]}>
                ምዕራፍ {chapter.chapter}
                {chapter.title ? ` · ${chapter.title}` : ''}
                {readerLanguage === 'en' ? ' · KJV' : readerLanguage === 'gez' ? ' · ግዕዝ' : ''}
              </Text>
              {readerLanguage === 'en' && englishEpoch > 0 && !hasEnglishBook(bookIndex) ? (
                <Text style={{ color: colors.textMuted, paddingBottom: 12, lineHeight: 22 }}>
                  This book is not in the King James Bible.
                </Text>
              ) : null}
              {readerLanguage === 'gez' && englishEpoch > 0 && !hasGeezBook(bookIndex) ? (
                <Text style={{ color: colors.textMuted, paddingBottom: 12, lineHeight: 22 }}>
                  ግዕዝ ለዚህ መጽሐፍ አልተገኘም።
                </Text>
              ) : null}
              {verses.length === 0 ? (
                <Text style={{ color: colors.textMuted, padding: 24 }}>በዚህ ምዕራፍ ጥቅስ የለም።</Text>
              ) : (
                verses.map((item) => {
                  let highlight;
                  let hasNote = false;
                  let bookmarked = false;
                  for (let verseIndex = item.fromIndex; verseIndex <= item.toIndex; verseIndex += 1) {
                    const ref = { bookIndex, chapterIndex, verseIndex };
                    highlight = highlight ?? getHighlight(ref);
                    hasNote = hasNote || Boolean(getNote(ref));
                    bookmarked = bookmarked || isBookmarked(ref);
                  }
                  const focused =
                    focusVerse != null &&
                    focusVerse >= item.fromIndex &&
                    focusVerse <= item.toIndex;
                  const swapped =
                    readerLanguage === 'en' && englishEpoch > 0
                      ? getEnglishForDisplay(bookIndex, chapterIndex, item)
                      : readerLanguage === 'gez' && englishEpoch > 0
                        ? getGeezForDisplay(bookIndex, chapterIndex, item)
                        : null;
                  const displayText =
                    readerLanguage === 'am'
                      ? item.text
                      : swapped ?? (englishEpoch > 0 ? '—' : '…');
                  return (
                    <VerseRow
                      key={`${item.fromIndex}-${item.toIndex}`}
                      item={item}
                      fontSize={fontSize}
                      lineHeight={settings.reader.lineHeight}
                      verseNumberSize={settings.reader.verseNumberSize}
                      showVerseNumbers={settings.reader.showVerseNumbers}
                      fontStyle={fontStyle}
                      highlightColor={highlight ? HIGHLIGHT_COLORS[highlight.color] : undefined}
                      hasNote={hasNote}
                      isBookmarked={bookmarked}
                      isFocused={focused}
                      displayText={displayText}
                      englishTypography={readerLanguage === 'en' && Boolean(swapped)}
                      textColor={colors.text}
                      numberColor={colors.verseNumber}
                      onOpen={openVerse}
                      onLayoutY={onLayoutY}
                    />
                  );
                })
              )}
            </ScrollView>
          </View>
        </FlingGestureHandler>
      </FlingGestureHandler>

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
  fill: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 44 },
  bookTitle: { fontSize: 17, fontWeight: '600', flexShrink: 1 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  langSwitch: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 2,
  },
  langBtn: {
    minHeight: 32,
    minWidth: 36,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtn: {
    minHeight: 44,
    minWidth: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chapterHeading: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.4,
    marginBottom: 10,
    marginTop: 8,
  },
  verseRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 2,
    gap: 8,
  },
  verseBody: { flex: 1 },
  focusedVerse: {
    borderLeftWidth: 2,
    borderLeftColor: '#1B6B3A66',
    paddingLeft: 8,
  },
  markers: { flexDirection: 'row', gap: 6, marginTop: 4 },
  error: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
