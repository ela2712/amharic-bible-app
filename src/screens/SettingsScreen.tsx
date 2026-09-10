import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { useStudy } from '../context/StudyContext';
import { useAppTheme } from '../theme/ThemeContext';
import { THEME_LABELS } from '../theme/themes';
import type { ThemeName } from '../types/user';
import { exportUserStore, importUserStoreFile } from '../services/backupService';
import { getActiveTranslation } from '../services/translationService';
import { isAudioAvailable } from '../services/audioService';
import { hasCrossReferences } from '../services/crossReferenceService';
import { hasStrongsData } from '../services/strongsService';

const THEMES: ThemeName[] = ['light', 'sepia', 'dark', 'amoled'];

export default function SettingsScreen() {
  const colors = useAppTheme();
  const { settings, setTheme, store, replaceStore, resetStore } = useStudy();
  const translation = getActiveTranslation();

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
        <Text style={[styles.title, { color: colors.text }]}>ቅንብሮች</Text>

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
          የንባብ ፊደል መጠን፣ ክፍተት እና ህዳግ ከመጽሐፍ ቅዱስ ማያ ውስጥ የፊደል አዝራሩን በመጫን ይስተካከላሉ።
        </Text>

        <Text style={[styles.section, { color: colors.text }]}>ትርጉም</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={{ color: colors.text, fontWeight: '700' }}>{translation.name}</Text>
          <Text style={{ color: colors.textMuted, marginTop: 6, lineHeight: 22 }}>
            ቋንቋ፦ {translation.language}. ሌላ ትርጉም በዚህ ስሪት አልተካተተም።
          </Text>
        </View>

        <Text style={[styles.section, { color: colors.text }]}>ምትኬ</Text>
        <Text style={{ color: colors.textMuted, lineHeight: 22, marginBottom: 10 }}>
          ምልክቶች፣ ቀለሞች፣ ማስታወሻዎች፣ ቅንብሮች እና የንባብ ሂደት በመሣሪያዎ ላይ ይቀመጣሉ። የደመና ስምሪት የለም።
        </Text>
        <Pressable onPress={exportData} style={[styles.button, { backgroundColor: colors.accent }]}>
          <Text style={{ color: colors.accentText, fontWeight: '800' }}>JSON ምትኬ አጋራ</Text>
        </Pressable>
        <Pressable onPress={importData} style={[styles.button, { backgroundColor: colors.surfaceMuted }]}>
          <Text style={{ color: colors.text, fontWeight: '800' }}>ምትኬ መልስ</Text>
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
          <Text style={{ color: colors.danger, fontWeight: '800' }}>የግል መረጃ አጽዳ</Text>
        </Pressable>

        <Text style={[styles.section, { color: colors.text }]}>ያልተካተቱ መረጃዎች</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={{ color: colors.textSecondary, lineHeight: 24 }}>
            ድምጽ፦ {isAudioAvailable() ? 'ዝግጁ' : 'ፋይል የለም (`src/services/audioService.ts`)'}
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 24 }}>
            ተያያዥ ጥቅሶች፦ {hasCrossReferences() ? 'ዝግጁ' : 'መረጃ የለም'}
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 24 }}>
            Strong&apos;s፦ {hasStrongsData() ? 'ዝግጁ' : 'መረጃ የለም'}
          </Text>
          <Text style={{ color: colors.textMuted, marginTop: 8, lineHeight: 22 }}>
            Ethiopic ቅርጸ-ቁምፊ ፋይል በፕሮጀክቱ ውስጥ የለም፤ የመሣሪያው ስርዓት ፊደል ጥቅም ላይ ይውላል።
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 16 },
  section: { fontSize: 18, fontWeight: '800', marginTop: 18, marginBottom: 10 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  theme: {
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
  },
  card: { borderWidth: 1, borderRadius: 16, padding: 16 },
  button: {
    minHeight: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
});
