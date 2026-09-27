import { StatusBar } from 'expo-status-bar';
import { Component, useCallback, useEffect, useState, type ErrorInfo, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { StudyProvider, useStudy } from './src/context/StudyContext';
import { ThemeProvider, useAppTheme } from './src/theme/ThemeContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { loadBible } from './src/data/bible';
import { FontLoader } from './src/theme/typography';

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

class FontErrorGate extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn('Font load failed', error, info.componentStack);
  }

  render() {
    if (this.state.failed) {
      return null;
    }
    return this.props.children;
  }
}

function ThemedApp() {
  const colors = useAppTheme();
  const { settings } = useStudy();
  const light = settings.theme === 'light' || settings.theme === 'sepia';
  return (
    <>
      <StatusBar style={light ? 'dark' : 'light'} />
      <RootNavigator />
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

  if (error) {
    return (
      <BootMessage
        title="መጽሐፍ ቅዱስ"
        message={error}
        onRetry={startLoad}
      />
    );
  }

  if (!ready) {
    return <BootMessage title="መጽሐፍ ቅዱስ" message="ጽሑፉ በመጫን ላይ ነው…" />;
  }

  return (
    <>
      <FontErrorGate>
        <FontLoader />
      </FontErrorGate>
      {children}
    </>
  );
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
