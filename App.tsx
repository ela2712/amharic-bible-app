import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StudyProvider } from './src/context/StudyContext';
import { ThemeProvider, useAppTheme } from './src/theme/ThemeContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useStudy } from './src/context/StudyContext';

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

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StudyProvider>
          <ThemeProvider>
            <ThemedApp />
          </ThemeProvider>
        </StudyProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
