import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import { useColors } from "@/hooks/use-colors";

interface SplashScreenProps {
  onFinish: () => void;
  duration?: number;
}

export function SplashScreen({ onFinish, duration = 900 }: SplashScreenProps) {
  const colors = useColors();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.5));
  const [progressAnim] = useState(new Animated.Value(0));
  const [seedStage, setSeedStage] = useState(0); // 0: 🌱, 1: 🌿, 2: 🌱 (다시)

  useEffect(() => {
    // 페이드인 + 스케일 애니메이션
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // 진행률 애니메이션
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: duration - 200,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();

    // 새싹 자라나는 애니메이션 (0.5초마다 변경)
    const seedInterval = setInterval(() => {
      setSeedStage((prev) => (prev + 1) % 2);
    }, 600);

    // 지정된 시간 후 종료
    const timer = setTimeout(() => {
      clearInterval(seedInterval);
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(() => {
        onFinish();
      });
    }, duration);

    return () => {
      clearTimeout(timer);
      clearInterval(seedInterval);
    };
  }, [fadeAnim, scaleAnim, progressAnim, duration, onFinish]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const seedEmoji = seedStage === 0 ? "🌱" : "🌿";

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      justifyContent: "center",
      alignItems: "center",
    },
    content: {
      alignItems: "center",
      gap: 24,
    },
    seedContainer: {
      width: 140,
      height: 140,
      borderRadius: 35,
      backgroundColor: colors.primary + "15",
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 2,
      borderColor: colors.primary,
    },
    seedEmoji: {
      fontSize: 64,
    },
    title: {
      fontSize: 28,
      fontWeight: "800",
      color: colors.foreground,
    },
    subtitle: {
      fontSize: 14,
      color: colors.muted,
      marginTop: 8,
    },
    progressContainer: {
      width: 200,
      height: 4,
      backgroundColor: colors.border,
      borderRadius: 2,
      overflow: "hidden",
      marginTop: 16,
    },
    progressBar: {
      height: "100%",
      backgroundColor: colors.primary,
      borderRadius: 2,
    },
  });

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Animated.View
        style={[
          styles.content,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.seedContainer}>
          <Text style={styles.seedEmoji}>{seedEmoji}</Text>
        </View>

        <View style={{ alignItems: "center" }}>
          <Text style={styles.title}>CleanMile</Text>
          <Text style={styles.subtitle}>환경 지킴이가 되세요</Text>
        </View>

        <View style={styles.progressContainer}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: progressWidth,
              },
            ]}
          />
        </View>
      </Animated.View>
    </Animated.View>
  );
}
