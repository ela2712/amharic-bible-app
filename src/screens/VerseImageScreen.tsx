import { useMemo, useRef, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
  type TextStyle,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { captureRef } from 'react-native-view-shot';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library/legacy';
import { Screen } from '../components/Screen';
import { getVerse } from '../data/bible';
import {
  PHOTO_BACKGROUNDS,
  SOLID_BACKGROUNDS,
  type PhotoBackgroundId,
  type SolidBackgroundId,
} from '../data/verseBackgrounds';
import { useAppTheme } from '../theme/ThemeContext';
import { readerTextStyle } from '../theme/typography';
import type { BibleStackParamList } from '../types/navigation';
import type { VerseLocation } from '../types/bible';

type Align = 'left' | 'center' | 'right';
type BackgroundChoice =
  | { kind: 'solid'; id: SolidBackgroundId }
  | { kind: 'builtin'; id: PhotoBackgroundId }
  | { kind: 'custom' };

function imageReference(verse: VerseLocation): string {
  const end =
    typeof verse.verseEnd === 'number' && verse.verseEnd !== verse.verseNumber
      ? `–${verse.verseEnd}`
      : '';
  return `${verse.bookTitle} ${verse.chapterNumber} : ${verse.verseNumber}${end}`;
}

export default function VerseImageScreen() {
  const colors = useAppTheme();
  const route = useRoute<RouteProp<BibleStackParamList, 'VerseImage'>>();
  const verse = getVerse(route.params);
  const cardRef = useRef<View>(null);
  const [choice, setChoice] = useState<BackgroundChoice>({ kind: 'builtin', id: 'cross' });
  const [customUri, setCustomUri] = useState<string | null>(null);
  const [align, setAlign] = useState<Align>('center');
  const [fontSize, setFontSize] = useState(26);
  const [busy, setBusy] = useState(false);

  const solid = useMemo(
    () =>
      choice.kind === 'solid'
        ? (SOLID_BACKGROUNDS.find((item) => item.id === choice.id) ?? SOLID_BACKGROUNDS[0])
        : null,
    [choice],
  );
  const builtin = useMemo(
    () =>
      choice.kind === 'builtin'
        ? (PHOTO_BACKGROUNDS.find((item) => item.id === choice.id) ?? PHOTO_BACKGROUNDS[0])
        : null,
    [choice],
  );

  const imageSource: ImageSourcePropType | null = useMemo(() => {
    if (choice.kind === 'custom' && customUri) {
      return { uri: customUri };
    }
    if (builtin) {
      return builtin.source;
    }
    return null;
  }, [builtin, choice.kind, customUri]);

  const onPhoto = Boolean(imageSource);
  const textColor = onPhoto ? '#FFE34A' : (solid?.fg ?? '#F4FFF7');

  if (!verse) {
    return (
      <Screen>
        <View style={styles.center}>
          <Text style={{ color: colors.text }}>ጥቅሱ ሊከፈት አልቻለም።</Text>
        </View>
      </Screen>
    );
  }

  const pickPhoto = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('ፍቃድ', 'ዳራ ምስል ለመምረጥ የምስል መዳረሻ ያስፈልጋል።');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.9,
      });
      if (result.canceled) {
        return;
      }
      const uri = result.assets[0]?.uri;
      if (!uri) {
        return;
      }
      setCustomUri(uri);
      setChoice({ kind: 'custom' });
    } catch {
      Alert.alert('ስህተት', 'ምስሉ ከስልኩ ሊመረጥ አልቻለም።');
    }
  };

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

  const verseStyle: TextStyle = {
    ...readerTextStyle(fontSize, 1.55, textColor, 'sans'),
    fontWeight: '800',
    textAlign: align,
    ...(onPhoto
      ? {
          textShadowColor: '#000000',
          textShadowOffset: { width: 0, height: 1 },
          textShadowRadius: 4,
        }
      : null),
  };
  const refStyle: TextStyle = {
    ...readerTextStyle(16, 1.3, onPhoto ? '#F7F3EA' : textColor, 'sans'),
    fontWeight: '800',
    textAlign: 'center',
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>የጥቅስ ምስል</Text>
        <View
          ref={cardRef}
          collapsable={false}
          style={[styles.card, { backgroundColor: solid?.bg ?? '#111' }]}
        >
          {imageSource ? (
            <Image source={imageSource} style={styles.photoFill} resizeMode="cover" />
          ) : null}
          {onPhoto ? <View style={styles.photoScrim} pointerEvents="none" /> : null}
          <View style={styles.cardBody} pointerEvents="none">
            <Text style={verseStyle}>{verse.text}</Text>
          </View>
          <View style={onPhoto ? styles.refBar : styles.refPlain}>
            <Text style={refStyle}>{imageReference(verse)}</Text>
          </View>
        </View>

        <Text style={[styles.label, { color: colors.text }]}>ቀለም</Text>
        <View style={styles.row}>
          {SOLID_BACKGROUNDS.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => setChoice({ kind: 'solid', id: item.id })}
              accessibilityRole="button"
              accessibilityLabel={item.name}
              style={[
                styles.swatch,
                {
                  backgroundColor: item.bg,
                  borderColor:
                    choice.kind === 'solid' && choice.id === item.id ? colors.accent : colors.border,
                },
              ]}
            />
          ))}
        </View>

        <Text style={[styles.label, { color: colors.text }]}>ምስል</Text>
        <View style={styles.row}>
          {PHOTO_BACKGROUNDS.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => setChoice({ kind: 'builtin', id: item.id })}
              accessibilityRole="button"
              accessibilityLabel={item.name}
              style={[
                styles.photoSwatch,
                {
                  borderColor:
                    choice.kind === 'builtin' && choice.id === item.id
                      ? colors.accent
                      : colors.border,
                },
              ]}
            >
              <Image source={item.source} style={styles.swatchPhoto} />
            </Pressable>
          ))}
          {customUri ? (
            <Pressable
              onPress={() => setChoice({ kind: 'custom' })}
              accessibilityRole="button"
              accessibilityLabel="የተመረጠ ምስል"
              style={[
                styles.photoSwatch,
                { borderColor: choice.kind === 'custom' ? colors.accent : colors.border },
              ]}
            >
              <Image source={{ uri: customUri }} style={styles.swatchPhoto} />
            </Pressable>
          ) : null}
          <Pressable
            onPress={pickPhoto}
            accessibilityRole="button"
            accessibilityLabel="ከስልክ ምስል ጨምር"
            style={[
              styles.photoSwatch,
              styles.addSwatch,
              { borderColor: colors.border, backgroundColor: colors.surfaceMuted },
            ]}
          >
            <Ionicons name="add" size={26} color={colors.text} />
          </Pressable>
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
            {busy ? 'እየሰራ...' : 'ምስል አስቀመጥ'}
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
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  photoFill: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  photoScrim: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(8, 6, 4, 0.22)',
  },
  cardBody: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 56,
  },
  refBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.48)',
  },
  refPlain: {
    paddingBottom: 18,
    paddingHorizontal: 16,
  },
  label: { marginTop: 18, marginBottom: 8, fontWeight: '800' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  swatch: { width: 42, height: 42, borderRadius: 21, borderWidth: 3 },
  photoSwatch: {
    width: 52,
    height: 52,
    borderRadius: 10,
    borderWidth: 3,
    overflow: 'hidden',
  },
  addSwatch: { alignItems: 'center', justifyContent: 'center' },
  swatchPhoto: { width: '100%', height: '100%' },
  chip: { minHeight: 40, paddingHorizontal: 14, borderRadius: 12, justifyContent: 'center' },
  button: {
    minHeight: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
});
