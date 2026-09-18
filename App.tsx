import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StudyProvider, useStudy } from './src/context/StudyContext';
import { ThemeProvider, useAppTheme } from './src/theme/ThemeContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { loadBible } from './src/data/bible';

function ThemedApp() {
  const colors = useAppTheme();
  const { settings } = useStudy();
  const light = settings.theme === 'light' || settings.theme === 'sepia';
  return (
    <>
      <StatusBar style={light ? 'dark' : 'light'} backgroundColor={colors.background} />
      <RootNavigator />
    </>
  );
}

function BibleBootstrap({ children }: { children: ReactNode }) {
  const colors = useAppTheme();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startLoad = useCallback(() => {
    setError(null);
    setReady(false);
    loadBible()
      .then(() => setReady(true))
      .catch((cause) => {
        setError(cause instanceof Error ? cause.message : 'መጽሐፍ ቅዱስ መጫን አልተቻለም።');
      });
  }, []);

  useEffect(() => {
    startLoad();
  }, [startLoad]);

  if (ready) {
    return <>{children}</>;
  }

  return (
    <View style={[styles.boot, { backgroundColor: colors.background }]}>
      {error ? (
        <>
          <Text style={[styles.bootTitle, { color: colors.text }]}>መጽሐፍ ቅዱስ</Text>
          <Text style={[styles.bootMessage, { color: colors.textMuted }]}>{error}</Text>
          <Pressable
            onPress={startLoad}
            style={[styles.retry, { backgroundColor: colors.accent }]}
            accessibilityRole="button"
            accessibilityLabel="እንደገና ሞክር"
          >
            <Text style={[styles.retryLabel, { color: colors.accentText }]}>እንደገና ሞክር</Text>
          </Pressable>
        </>
      ) : (
        <>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[styles.bootTitle, { color: colors.text }]}>መጽሐፍ ቅዱስ</Text>
          <Text style={[styles.bootMessage, { color: colors.textMuted }]}>
            ጽሑፉ በመጫን ላይ ነው…
          </Text>
        </>
      )}
    </View>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StudyProvider>
          <ThemeProvider>
            <BibleBootstrap>
              <ThemedApp />
            </BibleBootstrap>
          </ThemeProvider>
        </StudyProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  bootTitle: {
    fontSize: 28,
    fontWeight: '800',
    marginTop: 8,
  },
  bootMessage: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  retry: {
    marginTop: 8,
    minHeight: 44,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryLabel: {
    fontWeight: '800',
    fontSize: 16,
  },
});
