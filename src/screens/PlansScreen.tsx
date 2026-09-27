import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { PageTitle } from '../components/ui';
import { listPlans, progressPercent } from '../services/readingPlanService';
import { useStudy } from '../context/StudyContext';
import { useAppTheme } from '../theme/ThemeContext';
import type { PlansStackParamList } from '../types/navigation';

export default function PlansScreen() {
  const colors = useAppTheme();
  const navigation = useNavigation<NativeStackNavigationProp<PlansStackParamList>>();
  const { store } = useStudy();

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <PageTitle title="የንባብ ዕቅዶች" subtitle="ከመጽሐፉ ምዕራፎች የተገነቡ ዕቅዶች" />
        {listPlans().map((plan) => {
          const percent = progressPercent(plan, store.planProgress[plan.id]);
          return (
            <Pressable
              key={plan.id}
              onPress={() => navigation.navigate('PlanDetail', { planId: plan.id })}
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderWidth: 1,
                borderRadius: 16,
                padding: 16,
                marginBottom: 12,
              }}
            >
              <Text style={{ color: colors.text, fontWeight: '800', fontSize: 18 }}>{plan.title}</Text>
              <Text style={{ color: colors.textSecondary, marginTop: 6, lineHeight: 22 }}>
                {plan.description}
              </Text>
              <Text style={{ color: colors.accent, marginTop: 10, fontWeight: '700' }}>
                {plan.days.length} ቀናት · {percent}%
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 8 },
});
