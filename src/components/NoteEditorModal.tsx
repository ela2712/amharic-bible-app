import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { VerseLocation } from '../types/bible';
import { formatReference } from '../data/bible';
import { useAppTheme } from '../theme/ThemeContext';
import { useStudy } from '../context/StudyContext';

interface Props {
  verse: VerseLocation | null;
  visible: boolean;
  onClose: () => void;
}

export function NoteEditorModal({ verse, visible, onClose }: Props) {
  const colors = useAppTheme();
  const { getNote, upsertNote, deleteNote } = useStudy();
  const [content, setContent] = useState('');

  useEffect(() => {
    if (verse && visible) {
      setContent(getNote(verse)?.content ?? '');
    }
  }, [verse, visible, getNote]);

  if (!verse) {
    return null;
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <KeyboardAvoidingView
          style={styles.fill}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>ማስታወሻ</Text>
            <Pressable onPress={onClose} accessibilityRole="button">
              <Text style={[styles.close, { color: colors.accent }]}>ዝጋ</Text>
            </Pressable>
          </View>
          <Text style={[styles.ref, { color: colors.accent }]}>{formatReference(verse)}</Text>
          <Text style={[styles.verse, { color: colors.textSecondary }]} numberOfLines={3}>
            {verse.text}
          </Text>
          <TextInput
            value={content}
            onChangeText={setContent}
            placeholder="ማስታወሻዎን እዚህ ይጻፉ"
            placeholderTextColor={colors.textMuted}
            multiline
            textAlignVertical="top"
            style={[
              styles.input,
              { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
            ]}
          />
          <View style={styles.row}>
            <Pressable
              onPress={() => {
                deleteNote(verse);
                onClose();
              }}
              style={[styles.button, { backgroundColor: colors.surfaceMuted }]}
            >
              <Text style={{ color: colors.danger, fontWeight: '700' }}>ሰርዝ</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                upsertNote(verse, content);
                onClose();
              }}
              style={[styles.button, { backgroundColor: colors.accent }]}
            >
              <Text style={{ color: colors.accentText, fontWeight: '700' }}>አስቀምጥ</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, paddingHorizontal: 16 },
  fill: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  title: { fontSize: 22, fontWeight: '800' },
  close: { fontSize: 16, fontWeight: '700', minHeight: 44 },
  ref: { fontWeight: '700', marginBottom: 8 },
  verse: { fontSize: 16, lineHeight: 28, marginBottom: 12 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    fontSize: 18,
    lineHeight: 30,
  },
  row: { flexDirection: 'row', gap: 12, paddingVertical: 16 },
  button: {
    flex: 1,
    minHeight: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
