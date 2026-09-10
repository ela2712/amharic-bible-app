import { useMemo, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import { Screen } from '../components/Screen';
import { getVerse, formatReference } from '../data/bible';
import { useAppTheme } from '../theme/ThemeContext';
import type { BibleStackParamList } from '../types/navigation';

const BACKGROUNDS = [
  { id: 'emerald', bg: '#0F3D2E', fg: '#F4FFF7', name: 'አረንጓዴ' },
  { id: 'gold', bg: '#3D2E0F', fg: '#FFF6D8', name: 'ወርቅ' },
  { id: 'midnight', bg: '#12141C', fg: '#EEF2FF', name: 'ምሽት' },
  { id: 'parchment', bg: '#F4E6C3', fg: '#3B2A14', name: 'ብራና' },
  { id: 'dawn', bg: '#D7ECF5', fg: '#16324A', name: 'ንጋት' },
  { id: 'crimson', bg: '#4A1518', fg: '#FFE8E8', name: 'ቀይ' },
] as const;

type Align = 'left' | 'center' | 'right';

export default function VerseImageScreen() {
  const colors = useAppTheme();
  const route = useRoute<RouteProp<BibleStackParamList, 'VerseImage'>>();
  const verse = getVerse(route.params);
  const cardRef = useRef<View>(null);
  const [bgId, setBgId] = useState<(typeof BACKGROUNDS)[number]['id']>('emerald');
  const [align, setAlign] = useState<Align>('center');
  const [fontSize, setFontSize] = useState(26);
  const [busy, setBusy] = useState(false);

  const palette = useMemo(
    () => BACKGROUNDS.find((item) => item.id === bgId) ?? BACKGROUNDS[0],
    [bgId],
  );

  if (!verse) {
    return (
      <Screen>
        <View style={styles.center}>
          <Text style={{ color: colors.text }}>ጥቅሱ ሊከፈት አልቻለም።</Text>
        </View>
      </Screen>
    );
  }

  const capture = async () => {
    if (!cardRef.current) {
      throw new Error('Card is not ready.');
    }
    return captureRef(cardRef, { format: 'png', quality: 1, result: 'tmpfile' });
  };

  const shareImage = async () => {
    try {
      setBusy(true);
      const uri = await capture();
      const available = await Sharing.isAvailableAsync();
      if (!available) {
        throw new Error('Sharing unavailable');
      }
      await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'የጥቅስ ምስል' });
    } catch {
      Alert.alert('ስህተት', 'ምስሉ ሊጋራ አልቻለም።');
    } finally {
      setBusy(false);
    }
  };

  const saveImage = async () => {
    try {
      setBusy(true);
      const permission = await MediaLibrary.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('ፍቃድ', 'ምስል ለማስቀመጥ የምስል ፋይል ፍቃድ ያስፈልጋል።');
        return;
      }
      const uri = await capture();
      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert('ተቀምጧል', 'ምስሉ ወደ ማዕከለ-ሥዕሎች ተቀምጧል።');
    } catch {
      Alert.alert('ስህተት', 'ምስሉ ሊቀመጥ አልቻለም።');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>የጥቅስ ምስል</Text>
        <View
          ref={cardRef}
          collapsable={false}
          style={[styles.card, { backgroundColor: palette.bg }]}
        >
          <Text style={[styles.ornament, { color: palette.fg }]}>+</Text>
          <Text
            style={[
              styles.verse,
              { color: palette.fg, fontSize, lineHeight: fontSize * 1.7, textAlign: align },
            ]}
          >
            {verse.text}
          </Text>
          <Text style={[styles.ref, { color: palette.fg, textAlign: align }]}>
            {formatReference(verse)}
          </Text>
        </View>

        <Text style={[styles.label, { color: colors.text }]}>መደብ</Text>
        <View style={styles.row}>
          {BACKGROUNDS.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => setBgId(item.id)}
              style={[
                styles.swatch,
                { backgroundColor: item.bg, borderColor: bgId === item.id ? colors.accent : colors.border },
              ]}
            />
          ))}
        </View>

        <Text style={[styles.label, { color: colors.text }]}>አቀማመጥ</Text>
        <View style={styles.row}>
          {(['left', 'center', 'right'] as Align[]).map((value) => (
            <Pressable
              key={value}
              onPress={() => setAlign(value)}
              style={[
                styles.chip,
                { backgroundColor: align === value ? colors.accent : colors.surfaceMuted },
              ]}
            >
              <Text style={{ color: align === value ? colors.accentText : colors.text, fontWeight: '700' }}>
                {value === 'left' ? 'ግራ' : value === 'center' ? 'መሃል' : 'ቀኝ'}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.label, { color: colors.text }]}>የፊደል መጠን</Text>
        <View style={styles.row}>
          <Pressable
            onPress={() => setFontSize((value) => Math.max(18, value - 2))}
            style={[styles.chip, { backgroundColor: colors.surfaceMuted }]}
          >
            <Text style={{ color: colors.text, fontWeight: '800' }}>አ-</Text>
          </Pressable>
          <Pressable
            onPress={() => setFontSize((value) => Math.min(36, value + 2))}
            style={[styles.chip, { backgroundColor: colors.surfaceMuted }]}
          >
            <Text style={{ color: colors.text, fontWeight: '800' }}>አ+</Text>
          </Pressable>
        </View>

        <Pressable
          disabled={busy}
          onPress={saveImage}
          style={[styles.button, { backgroundColor: colors.accent }]}
        >
          <Text style={{ color: colors.accentText, fontWeight: '800' }}>
            {busy ? 'እየሰራ...' : 'ምስል አስቀምጥ'}
          </Text>
        </Pressable>
        <Pressable
          disabled={busy}
          onPress={shareImage}
          style={[styles.button, { backgroundColor: colors.surfaceMuted }]}
        >
          <Text style={{ color: colors.text, fontWeight: '800' }}>ምስል አጋራ</Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 12 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: {
    minHeight: 320,
    borderRadius: 24,
    padding: 28,
    justifyContent: 'center',
  },
  ornament: { textAlign: 'center', fontSize: 22, marginBottom: 16, opacity: 0.7 },
  verse: { fontWeight: '600' },
  ref: { marginTop: 20, fontWeight: '800', opacity: 0.9 },
  label: { marginTop: 18, marginBottom: 8, fontWeight: '800' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  swatch: { width: 42, height: 42, borderRadius: 21, borderWidth: 3 },
  chip: { minHeight: 40, paddingHorizontal: 14, borderRadius: 12, justifyContent: 'center' },
  button: {
    minHeight: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
});
