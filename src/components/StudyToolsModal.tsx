import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { VerseLocation } from '../types/bible';
import { formatReference, getVerse } from '../data/bible';
import {
  crossReferenceSource,
  ensureCrossReferences,
  getCrossReferences,
} from '../services/crossReferenceService';
import { hasStrongsData } from '../services/strongsService';
import { getActiveTranslation } from '../services/translationService';
import { useAppTheme } from '../theme/ThemeContext';

interface Props {
  verse: VerseLocation | null;
  visible: boolean;
  onClose: () => void;
  onOpenRef: (bookIndex: number, chapterIndex: number, verseIndex: number) => void;
}

export function StudyToolsModal({ verse, visible, onClose, onOpenRef }: Props) {
  const colors = useAppTheme();
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!visible) {
      return;
    }
    let cancelled = false;
    setFailed(false);
    ensureCrossReferences()
      .then(() => {
        if (!cancelled) {
          setReady(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFailed(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [visible]);

  if (!verse) {
    return null;
  }

  const refs = ready ? getCrossReferences(verse) : [];
  const translation = getActiveTranslation();

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>ተያያዥ ጥቅሶች</Text>
          <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="ዝጋ">
            <Text style={[styles.close, { color: colors.accent }]}>ዝጋ</Text>
          </Pressable>
        </View>
        <Text style={[styles.ref, { color: colors.accent }]}>{formatReference(verse)}</Text>
        <Text style={[styles.current, { color: colors.textSecondary }]} numberOfLines={4}>
          {verse.text}
        </Text>

        <ScrollView contentContainerStyle={styles.body}>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.heading, { color: colors.text }]}>ተያያዥ ጥቅሶች</Text>
            {!ready && !failed ? (
              <ActivityIndicator color={colors.accent} style={{ marginVertical: 12 }} />
            ) : null}
            {failed ? (
              <Text style={{ color: colors.textMuted, lineHeight: 24 }}>
                የተያያዥ ጥቅስ መረጃ ሊከፈት አልቻለም።
              </Text>
            ) : null}
            {ready && refs.length === 0 ? (
              <Text style={{ color: colors.textMuted, lineHeight: 24 }}>
                ለዚህ ጥቅስ የተመዘገበ ተያያዥ የለም። የኢትዮጵያ ተጨማሪ መጻሕፍት በዚህ ዝርዝር ውስጥ አይገኙም።
              </Text>
            ) : null}
            {refs.map((item) => {
              const related = getVerse(item.to);
              if (!related) {
                return null;
              }
              return (
                <Pressable
                  key={`${item.to.bookIndex}-${item.to.chapterIndex}-${item.to.verseIndex}`}
                  onPress={() => {
                    onClose();
                    onOpenRef(item.to.bookIndex, item.to.chapterIndex, item.to.verseIndex);
                  }}
                  style={[styles.link, { borderBottomColor: colors.border }]}
                  accessibilityRole="button"
                  accessibilityLabel={formatReference(related)}
                >
                  <Text style={[styles.linkRef, { color: colors.accent }]}>
                    {formatReference(related)}
                  </Text>
                  <Text style={{ color: colors.text, lineHeight: 24 }} numberOfLines={3}>
                    {related.text}
                  </Text>
                </Pressable>
              );
            })}
            {ready ? (
              <Text style={[styles.credit, { color: colors.textMuted }]}>{crossReferenceSource()}</Text>
            ) : null}
          </View>

          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.heading, { color: colors.text }]}>ትርጉም</Text>
            <Text style={{ color: colors.textSecondary, lineHeight: 24 }}>
              አሁን የሚነበበው፦ {translation.name}
            </Text>
          </View>

          {hasStrongsData() ? (
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.heading, { color: colors.text }]}>ስትሮንግ</Text>
              <Text style={{ color: colors.textMuted, lineHeight: 24 }}>የስትሮንግ መረጃ ዝግጁ ነው።</Text>
            </View>
          ) : null}
        </ScrollView>
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
  ref: { fontWeight: '700', marginBottom: 8 },
  current: { lineHeight: 24, marginBottom: 12 },
  body: { paddingBottom: 32 },
  card: { borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 12 },
  heading: { fontSize: 16, fontWeight: '800', marginBottom: 8 },
  link: { paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  linkRef: { fontWeight: '800', marginBottom: 4 },
  credit: { marginTop: 12, fontSize: 11, lineHeight: 16 },
});
