import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStudy } from '../context/StudyContext';
import { useAppTheme } from '../theme/ThemeContext';
import { DEFAULT_READER_SETTINGS } from '../types/user';

interface Props {
  visible: boolean;
  onClose: () => void;
}

function Stepper({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  const colors = useAppTheme();
  return (
    <View style={styles.row}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <View style={styles.stepper}>
        <Pressable
          accessibilityRole="button"
          onPress={() => onChange(Math.max(min, Number((value - step).toFixed(2))))}
          style={[styles.step, { backgroundColor: colors.surfaceMuted }]}
        >
          <Text style={{ color: colors.text, fontSize: 20 }}>−</Text>
        </Pressable>
        <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => onChange(Math.min(max, Number((value + step).toFixed(2))))}
          style={[styles.step, { backgroundColor: colors.surfaceMuted }]}
        >
          <Text style={{ color: colors.text, fontSize: 20 }}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function ReaderSettingsModal({ visible, onClose }: Props) {
  const colors = useAppTheme();
  const { settings, updateReader } = useStudy();
  const reader = settings.reader;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>የንባብ ቅንብሮች</Text>
          <Pressable onPress={onClose}>
            <Text style={[styles.close, { color: colors.accent }]}>ተከናውኗል</Text>
          </Pressable>
        </View>
        <Stepper
          label="የፊደል መጠን"
          value={reader.fontSize}
          min={16}
          max={36}
          step={1}
          onChange={(fontSize) => updateReader({ fontSize })}
        />
        <Stepper
          label="የመስመር ክፍተት"
          value={reader.lineHeight}
          min={1.4}
          max={2.4}
          step={0.05}
          onChange={(lineHeight) => updateReader({ lineHeight })}
        />
        <Stepper
          label="ጎን ህዳግ"
          value={reader.horizontalMargin}
          min={8}
          max={40}
          step={2}
          onChange={(horizontalMargin) => updateReader({ horizontalMargin })}
        />
        <Stepper
          label="የጥቅስ ቁጥር"
          value={reader.verseNumberSize}
          min={12}
          max={24}
          step={1}
          onChange={(verseNumberSize) => updateReader({ verseNumberSize })}
        />
        <Stepper
          label="የንባብ ስፋት %"
          value={reader.readingWidth}
          min={70}
          max={100}
          step={5}
          onChange={(readingWidth) => updateReader({ readingWidth })}
        />
        <Pressable
          onPress={() => updateReader({ showVerseNumbers: !reader.showVerseNumbers })}
          style={[styles.toggle, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <Text style={{ color: colors.text, fontWeight: '700' }}>የጥቅስ ቁጥሮች</Text>
          <Text style={{ color: colors.accent, fontWeight: '700' }}>
            {reader.showVerseNumbers ? 'በርቷል' : 'ጠፍቷል'}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => updateReader(DEFAULT_READER_SETTINGS)}
          style={[styles.reset, { backgroundColor: colors.surfaceMuted }]}
        >
          <Text style={{ color: colors.text, fontWeight: '700' }}>ወደ ነባሪ መልስ</Text>
        </Pressable>
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
  row: { marginBottom: 16 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  step: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: { minWidth: 56, textAlign: 'center', fontSize: 18, fontWeight: '700' },
  toggle: {
    minHeight: 52,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  reset: {
    marginTop: 18,
    minHeight: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
