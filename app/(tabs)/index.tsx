import { useEffect, useState, useCallback } from "react";
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import {
  getPoints,
  getActivities,
  getUsername,
  getLevel,
  Activity,
} from "@/lib/store";

function haptic() {
  if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "방금 전";
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  return `${Math.floor(h / 24)}일 전`;
}

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const [points, setPoints] = useState(0);
  const [username, setUsername] = useState("환경지킴이");
  const [activities, setActivities] = useState<Activity[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const [p, u, a] = await Promise.all([getPoints(), getUsername(), getActivities()]);
    setPoints(p);
    setUsername(u);
    setActivities(a.slice(0, 5));
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const levelInfo = getLevel(points);
  const todayActivities = activities.filter(
    (a) => Date.now() - a.timestamp < 86400000
  );
  const todayPoints = todayActivities.reduce((s, a) => s + a.points, 0);

  const styles = StyleSheet.create({
    header: {
      backgroundColor: colors.primary,
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 28,
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
    },
    headerTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    greeting: { color: "#fff", fontSize: 14, opacity: 0.9 },
    username: { color: "#fff", fontSize: 20, fontWeight: "700" },
    pointBadge: {
      backgroundColor: "rgba(255,255,255,0.25)",
      borderRadius: 20,
      paddingHorizontal: 14,
      paddingVertical: 6,
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    pointText: { color: "#fff", fontWeight: "700", fontSize: 16 },
    levelBar: {
      backgroundColor: "rgba(255,255,255,0.2)",
      borderRadius: 8,
      height: 8,
      overflow: "hidden",
    },
    levelFill: {
      backgroundColor: "#fff",
      height: 8,
      borderRadius: 8,
    },
    levelLabel: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 4,
    },
    levelText: { color: "#fff", fontSize: 12, opacity: 0.9 },
    statsRow: {
      flexDirection: "row",
      gap: 12,
      marginTop: -20,
      paddingHorizontal: 20,
      marginBottom: 20,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 14,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
    statValue: { fontSize: 22, fontWeight: "800", color: colors.primary },
    statLabel: { fontSize: 11, color: colors.muted, marginTop: 2 },
    section: { paddingHorizontal: 20, marginBottom: 20 },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.foreground,
      marginBottom: 12,
    },
    quickGrid: { flexDirection: "row", gap: 12 },
    quickBtn: {
      flex: 1,
      borderRadius: 16,
      padding: 16,
      alignItems: "center",
      gap: 8,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
    quickBtnLabel: { fontSize: 13, fontWeight: "600" },
    activityItem: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 12,
      marginBottom: 8,
      gap: 12,
    },
    activityIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
    },
    activityTitle: { fontSize: 14, fontWeight: "600", color: colors.foreground },
    activityTime: { fontSize: 12, color: colors.muted, marginTop: 2 },
    activityPoints: { fontSize: 14, fontWeight: "700", color: colors.primary },
    emptyText: { color: colors.muted, textAlign: "center", paddingVertical: 20 },
    banner: {
      marginHorizontal: 20,
      marginBottom: 20,
      backgroundColor: colors.warning,
      borderRadius: 16,
      padding: 16,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    bannerText: { flex: 1, color: "#fff", fontSize: 13, fontWeight: "600" },
  });

  return (
    <ScreenContainer containerClassName="bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>안녕하세요 👋</Text>
              <Text style={styles.username}>{username}</Text>
            </View>
            <View style={styles.pointBadge}>
              <IconSymbol name="star.fill" size={16} color="#FFD700" />
              <Text style={styles.pointText}>{points.toLocaleString()}P</Text>
            </View>
          </View>
          {/* Level Bar */}
          <View>
            <View style={styles.levelBar}>
              <View style={[styles.levelFill, { width: `${levelInfo.progress * 100}%` }]} />
            </View>
            <View style={styles.levelLabel}>
              <Text style={styles.levelText}>Lv.{levelInfo.level} {levelInfo.title}</Text>
              <Text style={styles.levelText}>{points.toLocaleString()} / {levelInfo.nextPoints.toLocaleString()}P</Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{todayPoints}</Text>
            <Text style={styles.statLabel}>오늘 획득 포인트</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{todayActivities.length}</Text>
            <Text style={styles.statLabel}>오늘 활동 수</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{activities.filter(a => a.type === "pickup").length}</Text>
            <Text style={styles.statLabel}>총 줍기 횟수</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>빠른 실행</Text>
          <View style={styles.quickGrid}>
            <TouchableOpacity
              style={[styles.quickBtn, { backgroundColor: colors.primary }]}
              onPress={() => { haptic(); router.push("/(tabs)/camera-vision"); }}
            >
              <IconSymbol name="camera.fill" size={28} color="#fff" />
              <Text style={[styles.quickBtnLabel, { color: "#fff" }]}>쓰레기 줍기</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickBtn, { backgroundColor: colors.surface }]}
              onPress={() => { haptic(); router.push("/(tabs)/map"); }}
            >
              <IconSymbol name="map.fill" size={28} color={colors.primary} />
              <Text style={[styles.quickBtnLabel, { color: colors.foreground }]}>핫스팟 지도</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickBtn, { backgroundColor: colors.surface }]}
              onPress={() => { haptic(); router.push("/(tabs)/ranking"); }}
            >
              <IconSymbol name="trophy.fill" size={28} color={colors.warning} />
              <Text style={[styles.quickBtnLabel, { color: colors.foreground }]}>랭킹 보기</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Banner */}
        <TouchableOpacity style={styles.banner} onPress={() => { haptic(); router.push("/(tabs)/map"); }}>
          <IconSymbol name="flame.fill" size={24} color="#fff" />
          <Text style={styles.bannerText}>강서구 학원가 쓰레기 핫스팟 3곳 발견! 지금 확인하세요</Text>
          <IconSymbol name="chevron.right" size={20} color="#fff" />
        </TouchableOpacity>

        {/* Recent Activities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>최근 활동</Text>
          {activities.length === 0 ? (
            <Text style={styles.emptyText}>아직 활동이 없어요. 쓰레기를 주워 포인트를 적립해보세요! 🌿</Text>
          ) : (
            activities.map((item) => (
              <View key={item.id} style={styles.activityItem}>
                <View style={[styles.activityIcon, { backgroundColor: item.type === "pickup" ? colors.primary + "20" : colors.warning + "20" }]}>
                  <IconSymbol
                    name={item.type === "pickup" ? "trash.fill" : "location.fill"}
                    size={20}
                    color={item.type === "pickup" ? colors.primary : colors.warning}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.activityTitle}>{item.trashType}</Text>
                  <Text style={styles.activityTime}>{timeAgo(item.timestamp)}</Text>
                </View>
                <Text style={styles.activityPoints}>+{item.points}P</Text>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </ScreenContainer>
  );
}
