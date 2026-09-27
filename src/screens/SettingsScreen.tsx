import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { PageTitle } from '../components/ui';
import { useStudy } from '../context/StudyContext';
import { useAppTheme } from '../theme/ThemeContext';
import { THEME_LABELS } from '../theme/themes';
import type { ThemeName } from '../types/user';
import { exportUserStore, importUserStoreFile } from '../services/backupService';
import { getActiveTranslation } from '../services/translationService';
import { getDailyVerse } from '../services/dailyVerseService';
import { formatReference } from '../data/bible';
import type { RootTabParamList, SettingsStackParamList } from '../types/navigation';

const THEMES: ThemeName[] = ['light', 'sepia', 'dark', 'amoled'];

type Nav = CompositeNavigationProp<
  NativeStackNavigationProp<SettingsStackParamList>,
  BottomTabNavigationProp<RootTabParamList>
>;

export default function SettingsScreen() {
  const colors = useAppTheme();
  const navigation = useNavigation<Nav>();
  const { settings, setTheme, store, replaceStore, resetStore } = useStudy();
  const translation = getActiveTranslation();
  const daily = useMemo(() => getDailyVerse(), []);

  const exportData = async () => {
    try {
      await exportUserStore(store);
    } catch {
      Alert.alert('ስህተት', 'ምትኬ ማጋራት አልተቻለም።');
    }
  };

  const importData = async () => {
    try {
      const next = await importUserStoreFile();
      if (next) {
        replaceStore(next);
        Alert.alert('ተሳክቷል', 'የግል መረጃ ተመልሷል።');
      }
    } catch {
      Alert.alert('ስህተት', 'ፋይሉ ሊነበብ አልቻለም።');
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <PageTitle title="ተጨማሪ" />

        <Pressable
          onPress={() =>
            navigation.navigate('BibleTab', {
              screen: 'BibleReader',
              params: {
                bookIndex: daily.bookIndex,
                chapterIndex: daily.chapterIndex,
                verseIndex: daily.verseIndex,
              },
            })
          }
          style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
          accessibilityRole="button"
          accessibilityLabel="የዛሬ ጥቅስ"
        >
          <Text style={{ color: colors.textMuted, fontWeight: '700', fontSize: 12 }}>የዛሬ ጥቅስ</Text>
          <Text style={{ color: colors.accent, fontWeight: '700', marginTop: 6 }}>
            {formatReference(daily)}
          </Text>
          <Text style={{ color: colors.text, marginTop: 8, lineHeight: 24 }} numberOfLines={4}>
            {daily.text}
          </Text>
        </Pressable>

        <Pressable
          onPress={() =>
            navigation.navigate('PlansTab', {
              screen: 'PlansMain',
            })
          }
          style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
          accessibilityRole="button"
        >
          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 17 }}>የንባብ ዕቅዶች</Text>
          <Text style={{ color: colors.textMuted, marginTop: 6, lineHeight: 22 }}>
            365 ቀን እና አጭር ዕቅዶች
          </Text>
        </Pressable>

        <Text style={[styles.section, { color: colors.text }]}>ገጽታ</Text>
        <View style={styles.row}>
          {THEMES.map((theme) => (
            <Pressable
              key={theme}
              onPress={() => setTheme(theme)}
              style={[
                styles.theme,
                {
                  backgroundColor: settings.theme === theme ? colors.accent : colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text
                style={{
                  color: settings.theme === theme ? colors.accentText : colors.text,
                  fontWeight: '700',
                }}
              >
                {THEME_LABELS[theme]}
              </Text>
            </Pressable>
          ))}
        </View>
        <Text style={{ color: colors.textMuted, marginTop: 8, lineHeight: 22 }}>
          የንባብ ፊደል መጠን፣ ቅርጸ-ቁምፊ፣ ክፍተት እና ህዳግ ከመጽሐፍ ቅዱስ ማያ ውስጥ የፊደል አዝራሩን (Aa) በመጫን ይስተካከላሉ።
        </Text>

        <Text style={[styles.section, { color: colors.text }]}>ትርጉም</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={{ color: colors.text, fontWeight: '700' }}>{translation.name}</Text>
          <Text style={{ color: colors.textMuted, marginTop: 6, lineHeight: 22 }}>
            ቋንቋ፦ {translation.language}
          </Text>
          <Text style={{ color: colors.textMuted, marginTop: 8, lineHeight: 22 }}>
            በንባብ ማያ ላይ አማ / KJV / ግዕ ይቀይሩ። እንግሊዘኛው King James Version ነው፤ ከመሣሪያው ውስጥ ይሰራል እንጂ ኢንተርኔት አይፈልግም። የኢትዮጵያ ተጨማሪ መጻሕፍት በKJV ሙሉ አይደሉም። ግዕዝ ለአብዛኞቹ መጻሕፍት ተካትቷል።
          </Text>
        </View>

        <Text style={[styles.section, { color: colors.text }]}>ምትኬ</Text>
        <Text style={{ color: colors.textMuted, lineHeight: 22, marginBottom: 10 }}>
          ምልክቶች፣ ቀለሞች፣ ማስታወሻዎች እና የንባብ ሂደት በዚህ መሣሪያ ላይ ይቀመጣሉ።
        </Text>
        <Pressable onPress={exportData} style={[styles.button, { backgroundColor: colors.accent }]}>
          <Text style={{ color: colors.accentText, fontWeight: '700' }}>ምትኬ አጋራ</Text>
        </Pressable>
        <Pressable onPress={importData} style={[styles.button, { backgroundColor: colors.surfaceMuted }]}>
          <Text style={{ color: colors.text, fontWeight: '700' }}>ምትኬ መልስ</Text>
        </Pressable>
        <Pressable
          onPress={() =>
            Alert.alert('ማጽዳት', 'ሁሉም የግል መረጃ ይጠፋል።', [
              { text: 'ተወው', style: 'cancel' },
              { text: 'አጽዳ', style: 'destructive', onPress: resetStore },
            ])
          }
          style={[styles.button, { backgroundColor: colors.surfaceMuted }]}
        >
          <Text style={{ color: colors.danger, fontWeight: '700' }}>የግል መረጃ አጽዳ</Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 40 },
  section: { fontSize: 13, fontWeight: '700', marginTop: 18, marginBottom: 10 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  theme: {
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
  },
  card: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 16, padding: 16, marginBottom: 12 },
  button: {
    minHeight: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
});
