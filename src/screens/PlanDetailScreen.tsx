import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Screen } from '../components/Screen';
import { getReadingPlan, nextIncompleteDay, progressPercent } from '../services/readingPlanService';
import { getBook, getChapter } from '../data/bible';
import { useStudy } from '../context/StudyContext';
import { useAppTheme } from '../theme/ThemeContext';
import type { HomeStackParamList, RootTabParamList } from '../types/navigation';
import type { ReadingPlanDay } from '../types/study';

type Nav = CompositeNavigationProp<
  NativeStackNavigationProp<HomeStackParamList>,
  BottomTabNavigationProp<RootTabParamList>
>;

export default function PlanDetailScreen() {
  const colors = useAppTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<HomeStackParamList, 'PlanDetail'>>();
  const { store, setPlanProgress } = useStudy();
  const plan = getReadingPlan(route.params.planId);

  if (!plan) {
    return (
      <Screen>
        <View style={styles.center}>
          <Text style={{ color: colors.text }}>ዕቅዱ አልተገኘም።</Text>
        </View>
      </Screen>
    );
  }

  const progress = store.planProgress[plan.id];
  const completed = new Set(progress?.completedDays ?? []);
  const resumeDay = nextIncompleteDay(plan, progress);
  const percent = progressPercent(plan, progress);

  const toggleDay = (day: number) => {
    setPlanProgress(plan.id, (current) => {
      const set = new Set(current?.completedDays ?? []);
      if (set.has(day)) {
        set.delete(day);
      } else {
        set.add(day);
      }
      const completedDays = [...set].sort((a, b) => a - b);
      return {
        planId: plan.id,
        currentDay: nextIncompleteDay(plan, {
          planId: plan.id,
          currentDay: day,
          completedDays,
          updatedAt: new Date().toISOString(),
        }),
        completedDays,
        updatedAt: new Date().toISOString(),
      };
    });
  };

  const resume = plan.days.find((day) => day.day === resumeDay) ?? plan.days[0];
  const first = resume?.assignments[0];

  const openChapter = (bookIndex: number, chapterIndex: number) => {
    navigation.navigate('BibleTab', {
      screen: 'BibleReader',
      params: { bookIndex, chapterIndex },
    });
  };

  const renderDay = ({ item }: { item: ReadingPlanDay }) => (
    <View style={[styles.day, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Pressable
        onPress={() => toggleDay(item.day)}
        style={styles.dayHead}
        accessibilityRole="button"
        accessibilityLabel={`ቀን ${item.day}`}
      >
        <Text style={{ color: colors.text, fontWeight: '800' }}>ቀን {item.day}</Text>
        <Text style={{ color: completed.has(item.day) ? colors.success : colors.textMuted }}>
          {completed.has(item.day) ? 'ተጠናቋል' : 'ክፈት'}
        </Text>
      </Pressable>
      {item.assignments.map((assignment) => {
        const book = getBook(assignment.bookIndex);
        const chapter = getChapter(assignment.bookIndex, assignment.chapterIndex);
        return (
          <Pressable
            key={`${assignment.bookIndex}-${assignment.chapterIndex}`}
            onPress={() => openChapter(assignment.bookIndex, assignment.chapterIndex)}
            style={{ paddingVertical: 6, minHeight: 44, justifyContent: 'center' }}
          >
            <Text style={{ color: colors.accent }}>
              {book?.title} ምዕራፍ {chapter?.chapter}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );

  return (
    <Screen>
      <FlatList
        data={plan.days}
        keyExtractor={(item) => String(item.day)}
        renderItem={renderDay}
        initialNumToRender={10}
        windowSize={6}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View>
            <Text style={[styles.title, { color: colors.text }]}>{plan.title}</Text>
            <Text style={{ color: colors.textSecondary, lineHeight: 24 }}>{plan.description}</Text>
            <Text style={{ color: colors.accent, fontWeight: '800', marginVertical: 12 }}>
              ሂደት {percent}% · ቀን {resumeDay}/{plan.days.length}
            </Text>
            {first ? (
              <Pressable
                onPress={() => openChapter(first.bookIndex, first.chapterIndex)}
                style={[styles.resume, { backgroundColor: colors.accent }]}
              >
                <Text style={{ color: colors.accentText, fontWeight: '800' }}>ቀጥል · ቀን {resumeDay}</Text>
              </Pressable>
            ) : null}
          </View>
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 26, fontWeight: '800', marginBottom: 8 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  resume: {
    minHeight: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  day: { borderWidth: 1, borderRadius: 14, padding: 12, marginBottom: 10 },
  dayHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6, minHeight: 44 },
});
