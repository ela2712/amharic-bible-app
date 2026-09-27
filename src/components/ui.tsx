import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../theme/ThemeContext';
import { radius, space } from '../theme/layout';

export function PageTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  const colors = useAppTheme();
  return (
    <View style={styles.titleBlock}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

export function Card({ children, onPress }: { children: ReactNode; onPress?: () => void }) {
  const colors = useAppTheme();
  const body = (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {children}
    </View>
  );
  if (!onPress) {
    return body;
  }
  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      {body}
    </Pressable>
  );
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: Array<{ id: T; label: string }>;
  onChange: (id: T) => void;
}) {
  const colors = useAppTheme();
  return (
    <View style={[styles.segment, { backgroundColor: colors.surfaceMuted }]}>
      {options.map((option) => {
        const active = option.id === value;
        return (
          <Pressable
            key={option.id}
            onPress={() => onChange(option.id)}
            style={[
              styles.segmentItem,
              active ? { backgroundColor: colors.surface } : null,
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
          >
            <Text
              style={{
                color: active ? colors.text : colors.textMuted,
                fontWeight: active ? '700' : '500',
                fontSize: 14,
              }}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  titleBlock: { marginBottom: space.md },
  title: { fontSize: 28, fontWeight: '700', letterSpacing: -0.3 },
  subtitle: { fontSize: 15, marginTop: 6, lineHeight: 22 },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.lg,
    padding: space.md,
    marginBottom: space.sm,
  },
  segment: {
    flexDirection: 'row',
    borderRadius: radius.md,
    padding: 4,
    gap: 4,
  },
  segmentItem: {
    flex: 1,
    minHeight: 40,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
