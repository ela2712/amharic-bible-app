import { StatusBar } from 'expo-status-bar';
import { lazy, Suspense, useCallback, useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { StudyProvider, useStudy } from './src/context/StudyContext';
import { ThemeProvider, useAppTheme } from './src/theme/ThemeContext';
import { loadBible } from './src/data/bible';

const RootNavigator = lazy(async () => {
  const mod = await import('./src/navigation/RootNavigator');
  return { default: mod.RootNavigator };
});

function BootMessage({
  title,
  message,
  onRetry,
}: {
  title: string;
  message: string;
  onRetry?: () => void;
}) {
  const colors = useAppTheme();
  return (
    <View style={[styles.boot, { backgroundColor: colors.background }]}>
      {onRetry ? null : <ActivityIndicator size="large" color={colors.accent} />}
      <Text style={[styles.bootTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.bootMessage, { color: colors.textMuted }]}>{message}</Text>
      {onRetry ? (
        <Pressable
          onPress={onRetry}
          style={[styles.retry, { backgroundColor: colors.accent }]}
          accessibilityRole="button"
          accessibilityLabel="እንደገና ሞክር"
        >
          <Text style={[styles.retryLabel, { color: colors.accentText }]}>እንደገና ሞክር</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function ThemedApp() {
  const colors = useAppTheme();
  const { settings } = useStudy();
  const light = settings.theme === 'light' || settings.theme === 'sepia';
  return (
    <>
      <StatusBar style={light ? 'dark' : 'light'} backgroundColor={colors.background} />
      <Suspense
        fallback={
          <BootMessage title="መጽሐፍ ቅዱስ" message="መተግበሪያው በመጫን ላይ ነው…" />
        }
      >
        <RootNavigator />
      </Suspense>
    </>
  );
}

function BibleBootstrap({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startLoad = useCallback(() => {
    setError(null);
    setReady(false);
    loadBible()
      .then(() => setReady(true))
      .catch((cause) => {
        const detail = cause instanceof Error ? cause.message : String(cause);
        setError(detail);
      });
  }, []);

  useEffect(() => {
    startLoad();
  }, [startLoad]);

  if (ready) {
    return <>{children}</>;
  }

  if (error) {
    return (
      <BootMessage
        title="መጽሐፍ ቅዱስ"
        message={error}
        onRetry={startLoad}
      />
    );
  }

  return <BootMessage title="መጽሐፍ ቅዱስ" message="ጽሑፉ በመጫን ላይ ነው…" />;
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ErrorBoundary>
          <StudyProvider>
            <ThemeProvider>
              <BibleBootstrap>
                <ThemedApp />
              </BibleBootstrap>
            </ThemeProvider>
          </StudyProvider>
        </ErrorBoundary>
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
  },
  bootTitle: {
    fontSize: 28,
    fontWeight: '800',
    marginTop: 16,
    marginBottom: 8,
  },
  bootMessage: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  retry: {
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
