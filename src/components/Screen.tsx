import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../theme/ThemeContext';

interface ScreenProps {
  children: ReactNode;
  edges?: Array<'top' | 'bottom' | 'left' | 'right'>;
  style?: ViewStyle;
}

export function Screen({ children, edges = ['top'], style }: ScreenProps) {
  const colors = useAppTheme();
  return (
    <SafeAreaView
      edges={edges}
      style={[
        styles.safe,
        { backgroundColor: colors.background },
        colors.highContrast ? { borderColor: colors.border } : null,
        style,
      ]}
    >
      <View style={styles.fill}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  fill: { flex: 1 },
});
