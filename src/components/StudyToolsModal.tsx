import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { VerseLocation } from '../types/bible';
import { formatReference } from '../data/bible';
import { hasCrossReferences, getCrossReferences } from '../services/crossReferenceService';
import { hasStrongsData } from '../services/strongsService';
import { getActiveTranslation, listTranslations } from '../services/translationService';
import { useAppTheme } from '../theme/ThemeContext';

interface Props {
  verse: VerseLocation | null;
  visible: boolean;
  onClose: () => void;
  onOpenRef: (bookIndex: number, chapterIndex: number, verseIndex: number) => void;
}

export function StudyToolsModal({ verse, visible, onClose, onOpenRef }: Props) {
  const colors = useAppTheme();
  if (!verse) {
    return null;
  }
  const refs = getCrossReferences(verse);
  const translation = getActiveTranslation();

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>የጥናት መሣሪያዎች</Text>
          <Pressable onPress={onClose}>
            <Text style={[styles.close, { color: colors.accent }]}>ዝጋ</Text>
          </Pressable>
        </View>
        <Text style={[styles.ref, { color: colors.accent }]}>{formatReference(verse)}</Text>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.heading, { color: colors.text }]}>ትርጉም</Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 24 }}>
            አሁን የሚነበበው፦ {translation.name} ({translation.language})
          </Text>
          <Text style={{ color: colors.textMuted, marginTop: 8, lineHeight: 22 }}>
            {listTranslations().length === 1
              ? 'በዚህ ስሪት አንድ ትርጉም ብቻ ተካትቷል። ሌላ ትርጉም ሲታከል እዚህ ይታያል።'
              : listTranslations().map((item) => item.name).join('፣ ')}
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.heading, { color: colors.text }]}>ተያያዥ ጥቅሶች</Text>
          {hasCrossReferences() && refs.length > 0 ? (
            refs.map((item) => (
              <Pressable
                key={`${item.to.bookIndex}-${item.to.chapterIndex}-${item.to.verseIndex}`}
                onPress={() => {
                  onClose();
                  onOpenRef(item.to.bookIndex, item.to.chapterIndex, item.to.verseIndex);
                }}
              >
                <Text style={{ color: colors.accent }}>
                  {item.to.bookIndex + 1}:{item.to.chapterIndex + 1}:{item.to.verseIndex + 1}
                </Text>
              </Pressable>
            ))
          ) : (
            <Text style={{ color: colors.textMuted, lineHeight: 24 }}>
              የተያያዥ ጥቅስ መረጃ ገና አልተካተተም። ሐሰተኛ ማጣቀሻዎች አልተፈጠሩም። መረጃ ሲቀርብ
              `src/services/crossReferenceService.ts` ላይ ይገናኛል።
            </Text>
          )}
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.heading, { color: colors.text }]}>ስትሮንግ / ኮንኮርዳንስ</Text>
          <Text style={{ color: colors.textMuted, lineHeight: 24 }}>
            {hasStrongsData()
              ? 'የስትሮንግ መረጃ ዝግጁ ነው።'
              : 'የዕብራይስጥ/ግሪክ Strong\'s መረጃ በዚህ ፕሮጀክት የለም። ትርጉሞች አልተፈጠሩም። መረጃ ሲቀርብ `src/services/strongsService.ts` ላይ ይገናኛል።'}
          </Text>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, paddingHorizontal: 16 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  title: { fontSize: 22, fontWeight: '800' },
  close: { fontSize: 16, fontWeight: '700', minHeight: 44 },
  ref: { fontWeight: '700', marginBottom: 16 },
  card: { borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 12 },
  heading: { fontSize: 16, fontWeight: '800', marginBottom: 8 },
});
