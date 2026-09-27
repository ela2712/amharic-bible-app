import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('App crash', error, info.componentStack);
  }

  render() {
    if (!this.state.error) {
      return this.props.children;
    }
    return (
      <View style={styles.wrap}>
        <Text style={styles.title}>መጽሐፉ ሊከፈት አልቻለም</Text>
        <Text style={styles.message}>{this.state.error.message}</Text>
        <Pressable
          onPress={() => this.setState({ error: null })}
          style={styles.retry}
          accessibilityRole="button"
        >
          <Text style={styles.retryLabel}>Try again</Text>
        </Pressable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: '#F4F6F1',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1B241C',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    color: '#4A5A4E',
    textAlign: 'center',
    marginBottom: 20,
  },
  retry: {
    minHeight: 44,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#1B6B3A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryLabel: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
});
