import { Component, type ErrorInfo, type ReactNode } from "react";
import { View, Text, StyleSheet } from "react-native";

type Props = { children: ReactNode };
type State = { error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("CleanMile crash:", error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <View style={styles.wrap}>
        <Text style={styles.title}>앱을 여는 중 문제가 생겼어요</Text>
        <Text style={styles.body}>{this.state.error.message}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: "#F0FFF4",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1A2E22",
    marginBottom: 12,
    textAlign: "center",
  },
  body: {
    fontSize: 13,
    color: "#5D8A6E",
    textAlign: "center",
  },
});
