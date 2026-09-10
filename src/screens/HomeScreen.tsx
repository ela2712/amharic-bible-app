import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../components/Screen';
import { VerseActionSheet } from '../components/VerseActionSheet';
import { NoteEditorModal } from '../components/NoteEditorModal';
import { StudyToolsModal } from '../components/StudyToolsModal';
import { useStudy } from '../context/StudyContext';
import { useAppTheme } from '../theme/ThemeContext';
import { getBook, getChapter, formatReference } from '../data/bible';
import { getDailyVerse } from '../services/dailyVerseService';
import { shareVerse } from '../services/shareService';
import { listPlans, progressPercent } from '../services/readingPlanService';
import type { HomeStackParamList, RootTabParamList } from '../types/navigation';
import type { VerseLocation } from '../types/bible';

type Nav = CompositeNavigationProp<
  NativeStackNavigationProp<HomeStackParamList>,
  BottomTabNavigationProp<RootTabParamList>
>;

export default function HomeScreen() {
  const colors = useAppTheme();
  const navigation = useNavigation<Nav>();
  const { store, toggleBookmark, isBookmarked } = useStudy();
  const daily = useMemo(() => getDailyVerse(), []);
  const [activeVerse, setActiveVerse] = useState<VerseLocation | null>(null);
  const [noteVerse, setNoteVerse] = useState<VerseLocation | null>(null);
  const [studyVerse, setStudyVerse] = useState<VerseLocation | null>(null);

  const position = store.readingPosition;
  const continueBook = position ? getBook(position.bookIndex) : getBook(0);
  const continueChapter = position
    ? getChapter(position.bookIndex, position.chapterIndex)
    : getChapter(0, 0);
  const hasRead = Boolean(position);

  const openReader = (bookIndex: number, chapterIndex: number, verseIndex = 0) => {
    navigation.navigate('BibleTab', {
      screen: 'BibleReader',
      params: { bookIndex, chapterIndex, verseIndex },
    });
  };

  const chapterProgress = (() => {
    if (!position) {
      return 0;
    }
    const book = getBook(position.bookIndex);
    if (!book) {
      return 0;
    }
    const totalBooks = 66;
    return Math.min(100, Math.round(((position.bookIndex + (position.chapterIndex + 1) / book.chapters.length) / totalBooks) * 100));
  })();

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.appTitle, { color: colors.text }]}>መጽሐፍ ቅዱስ</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          ቃሉን ያንብቡ፣ ያስተውሉ፣ ይኑሩበት
        </Text>

        <Text style={[styles.section, { color: colors.text }]}>ማንበብ ይቀጥሉ</Text>
        <Pressable
          style={[styles.continue, { backgroundColor: colors.accent }]}
          onPress={() =>
            openReader(position?.bookIndex ?? 0, position?.chapterIndex ?? 0, position?.verseIndex ?? 0)
          }
          accessibilityRole="button"
          accessibilityLabel="ማንበብ ይቀጥሉ"
        >
          <View style={{ flex: 1 }}>
            <Text style={[styles.continueLabel, { color: colors.accentText }]}>
              {hasRead ? 'የመጨረሻ ንባብ' : 'መጀመሪያ ያንብቡ'}
            </Text>
            <Text style={[styles.continueBook, { color: colors.accentText }]}>
              {continueBook?.title ?? 'ኦሪት ዘፍጥረት'}
            </Text>
            <Text style={{ color: colors.accentText, marginTop: 4 }}>
              ምዕራፍ {continueChapter?.chapter ?? '1'}
            </Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${chapterProgress}%` }]} />
            </View>
            <Text style={{ color: colors.accentText, marginTop: 6, fontSize: 12 }}>
              {hasRead ? `ሂደት ${chapterProgress}%` : 'ከኦሪት ዘፍጥረት ምዕራፍ 1 ይጀምሩ'}
            </Text>
          </View>
          <View style={styles.readPill}>
            <Text style={{ color: colors.accent, fontWeight: '800' }}>አንብብ</Text>
          </View>
        </Pressable>

        <Text style={[styles.section, { color: colors.text }]}>የዕለቱ ጥቅስ</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.verse, { color: colors.text }]}>{daily.text}</Text>
          <Text style={[styles.ref, { color: colors.textMuted }]}>— {formatReference(daily)}</Text>
          <View style={styles.row}>
            <Chip
              label="አንብብ"
              onPress={() => openReader(daily.bookIndex, daily.chapterIndex, daily.verseIndex)}
            />
            <Chip label="አጋራ" onPress={() => shareVerse(daily, true).catch(() => Alert.alert('ማጋራት አልተሳካም'))} />
            <Chip
              label={isBookmarked(daily) ? 'ተቀምጧል' : 'አስቀምጥ'}
              onPress={() => toggleBookmark(daily)}
            />
            <Chip label="ተጨማሪ" onPress={() => setActiveVerse(daily)} />
          </View>
        </View>

        <Text style={[styles.section, { color: colors.text }]}>በቅርብ የተነበቡ</Text>
        {store.readingHistory.length === 0 ? (
          <Text style={{ color: colors.textMuted, marginBottom: 16 }}>
            ምዕራፍ ሲያነቡ እዚህ ይታያሉ።
          </Text>
        ) : (
          store.readingHistory.slice(0, 6).map((item) => {
            const book = getBook(item.bookIndex);
            const chapter = getChapter(item.bookIndex, item.chapterIndex);
            return (
              <Pressable
                key={`${item.bookIndex}-${item.chapterIndex}-${item.openedAt}`}
                onPress={() => openReader(item.bookIndex, item.chapterIndex)}
                style={[styles.history, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <Text style={{ color: colors.text, fontWeight: '700' }}>{book?.title}</Text>
                <Text style={{ color: colors.textMuted }}>ምዕራፍ {chapter?.chapter}</Text>
              </Pressable>
            );
          })
        )}

        <Text style={[styles.section, { color: colors.text }]}>ፈጣን መዳረሻ</Text>
        <View style={styles.grid}>
          <Quick
            icon="book-outline"
            title="መጽሐፍ ቅዱስ"
            subtitle="ሁሉንም መጻሕፍት"
            onPress={() => navigation.navigate('BibleTab', { screen: 'BibleReader' })}
          />
          <Quick
            icon="search-outline"
            title="ፍለጋ"
            subtitle="ቃል ወይም ጥቅስ"
            onPress={() => navigation.navigate('SearchTab', { screen: 'SearchMain' })}
          />
          <Quick
            icon="bookmark-outline"
            title="የተቀመጡ"
            subtitle={`${store.bookmarks.length} ምልክቶች`}
            onPress={() => navigation.navigate('SavedTab', { screen: 'SavedMain' })}
          />
          <Quick
            icon="calendar-outline"
            title="የንባብ ዕቅድ"
            subtitle={`${listPlans().length} ዕቅዶች`}
            onPress={() => navigation.navigate('Plans')}
          />
        </View>

        <Text style={[styles.section, { color: colors.text }]}>የንባብ ዕቅዶች</Text>
        {listPlans().slice(0, 3).map((plan) => {
          const percent = progressPercent(plan, store.planProgress[plan.id]);
          return (
            <Pressable
              key={plan.id}
              onPress={() => navigation.navigate('PlanDetail', { planId: plan.id })}
              style={[styles.plan, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <Text style={{ color: colors.text, fontWeight: '800' }}>{plan.title}</Text>
              <Text style={{ color: colors.textMuted, marginTop: 4 }}>{plan.days.length} ቀናት · {percent}%</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <VerseActionSheet
        verse={activeVerse}
        visible={Boolean(activeVerse)}
        onClose={() => setActiveVerse(null)}
        onAddNote={setNoteVerse}
        onCreateImage={(verse) =>
          navigation.navigate('BibleTab', {
            screen: 'VerseImage',
            params: verse,
          })
        }
        onOpenStudy={setStudyVerse}
      />
      <NoteEditorModal verse={noteVerse} visible={Boolean(noteVerse)} onClose={() => setNoteVerse(null)} />
      <StudyToolsModal
        verse={studyVerse}
        visible={Boolean(studyVerse)}
        onClose={() => setStudyVerse(null)}
        onOpenRef={(b, c, v) => openReader(b, c, v)}
      />
    </Screen>
  );
}

function Chip({ label, onPress }: { label: string; onPress: () => void }) {
  const colors = useAppTheme();
  return (
    <Pressable onPress={onPress} style={[styles.chip, { backgroundColor: colors.accentSoft }]}>
      <Text style={{ color: colors.accent, fontWeight: '700' }}>{label}</Text>
    </Pressable>
  );
}

function Quick({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  const colors = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[styles.quick, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <Ionicons name={icon} size={22} color={colors.accent} />
      <Text style={{ color: colors.text, fontWeight: '800', marginTop: 8 }}>{title}</Text>
      <Text style={{ color: colors.textMuted, marginTop: 4 }}>{subtitle}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 40 },
  appTitle: { fontSize: 32, fontWeight: '800' },
  subtitle: { fontSize: 16, marginTop: 6, marginBottom: 20 },
  section: { fontSize: 20, fontWeight: '800', marginBottom: 12, marginTop: 8 },
  continue: {
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  continueLabel: { fontSize: 14, marginBottom: 4 },
  continueBook: { fontSize: 22, fontWeight: '800' },
  progressTrack: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.28)',
    borderRadius: 99,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressFill: { height: 6, backgroundColor: '#fff' },
  readPill: { backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
  card: { borderRadius: 18, padding: 18, borderWidth: 1, marginBottom: 18 },
  verse: { fontSize: 19, lineHeight: 34 },
  ref: { marginTop: 10, fontWeight: '700' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  chip: { paddingHorizontal: 12, minHeight: 40, borderRadius: 10, justifyContent: 'center' },
  history: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  quick: { width: '48%', borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 12 },
  plan: { borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 10 },
});
