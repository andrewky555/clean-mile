import { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Platform,
  FlatList,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import {
  getPoints,
  getActivities,
  getUsername,
  setUsername,
  getLevel,
  Activity,
} from "@/lib/store";

function haptic() {
  if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

const BADGES = [
  { id: "b1", icon: "🌱", label: "첫 줍기", desc: "처음으로 쓰레기를 주웠어요", condition: (a: Activity[]) => a.length >= 1 },
  { id: "b2", icon: "🌿", label: "10회 달성", desc: "쓰레기를 10번 주웠어요", condition: (a: Activity[]) => a.filter(x => x.type === "pickup").length >= 10 },
  { id: "b3", icon: "🌳", label: "50회 달성", desc: "쓰레기를 50번 주웠어요", condition: (a: Activity[]) => a.filter(x => x.type === "pickup").length >= 50 },
  { id: "b4", icon: "♻️", label: "분리수거왕", desc: "플라스틱을 5번 분리수거했어요", condition: (a: Activity[]) => a.filter(x => x.trashType.includes("플라스틱")).length >= 5 },
  { id: "b5", icon: "🏆", label: "1000P 달성", desc: "포인트 1000P를 모았어요", condition: (_: Activity[], p: number) => p >= 1000 },
  { id: "b6", icon: "⭐", label: "5000P 달성", desc: "포인트 5000P를 모았어요", condition: (_: Activity[], p: number) => p >= 5000 },
  { id: "b7", icon: "🔥", label: "핫스팟 신고", desc: "핫스팟을 신고했어요", condition: (a: Activity[]) => a.filter(x => x.type === "report").length >= 1 },
  { id: "b8", icon: "🌍", label: "지구지킴이", desc: "100회 이상 쓰레기를 주웠어요", condition: (a: Activity[]) => a.filter(x => x.type === "pickup").length >= 100 },
];

export default function ProfileScreen() {
  const colors = useColors();
  const [points, setPoints] = useState(0);
  const [username, setUsernameState] = useState("환경지킴이");
  const [activities, setActivities] = useState<Activity[]>([]);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");

  const load = useCallback(async () => {
    const [p, u, a] = await Promise.all([getPoints(), getUsername(), getActivities()]);
    setPoints(p);
    setUsernameState(u);
    setActivities(a);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const levelInfo = getLevel(points);
  const pickupCount = activities.filter((a) => a.type === "pickup").length;
  const reportCount = activities.filter((a) => a.type === "report").length;
  const earnedBadges = BADGES.filter((b) => b.condition(activities, points));

  const handleSaveName = async () => {
    if (!nameInput.trim()) return;
    await setUsername(nameInput.trim());
    setUsernameState(nameInput.trim());
    setEditingName(false);
    haptic();
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const styles = StyleSheet.create({
    profileHeader: {
      alignItems: "center",
      paddingTop: 24,
      paddingBottom: 20,
      paddingHorizontal: 20,
    },
    avatarCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.primary + "20",
      borderWidth: 3,
      borderColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 12,
    },
    avatarEmoji: { fontSize: 36 },
    nameRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
    nameText: { fontSize: 20, fontWeight: "800", color: colors.foreground },
    editBtn: {
      backgroundColor: colors.surface,
      borderRadius: 8,
      padding: 4,
      borderWidth: 1,
      borderColor: colors.border,
    },
    levelBadge: {
      backgroundColor: colors.primary + "20",
      borderRadius: 20,
      paddingHorizontal: 14,
      paddingVertical: 4,
    },
    levelBadgeText: { color: colors.primary, fontWeight: "700", fontSize: 13 },
    nameInputRow: { flexDirection: "row", gap: 8, alignItems: "center", marginBottom: 8 },
    nameInput: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 10,
      fontSize: 16,
      color: colors.foreground,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    saveBtn: {
      backgroundColor: colors.primary,
      borderRadius: 10,
      paddingHorizontal: 16,
      paddingVertical: 10,
    },
    saveBtnText: { color: "#fff", fontWeight: "700" },
    statsGrid: {
      flexDirection: "row",
      marginHorizontal: 20,
      marginBottom: 20,
      gap: 10,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 14,
      padding: 14,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 6,
      elevation: 2,
    },
    statValue: { fontSize: 22, fontWeight: "800", color: colors.primary },
    statLabel: { fontSize: 11, color: colors.muted, marginTop: 2, textAlign: "center" },
    section: { paddingHorizontal: 20, marginBottom: 20 },
    sectionTitle: { fontSize: 16, fontWeight: "700", color: colors.foreground, marginBottom: 12 },
    levelBarContainer: {
      marginHorizontal: 20,
      marginBottom: 20,
      backgroundColor: colors.surface,
      borderRadius: 14,
      padding: 16,
    },
    levelBarLabel: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
    levelBarLabelText: { fontSize: 13, fontWeight: "600", color: colors.foreground },
    levelBarBg: { backgroundColor: colors.border, borderRadius: 8, height: 10, overflow: "hidden" },
    levelBarFill: { backgroundColor: colors.primary, height: 10, borderRadius: 8 },
    badgeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    badgeCard: {
      width: "47%",
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      borderWidth: 1,
    },
    badgeEmoji: { fontSize: 24 },
    badgeLabel: { fontSize: 13, fontWeight: "700" },
    badgeDesc: { fontSize: 11, marginTop: 2 },
    activityItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 10,
      gap: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    activityIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
    },
    activityTitle: { fontSize: 13, fontWeight: "600", color: colors.foreground },
    activityTime: { fontSize: 11, color: colors.muted, marginTop: 2 },
    activityPoints: { fontSize: 13, fontWeight: "700", color: colors.primary },
  });

  function timeAgo(ts: number): string {
    const diff = Date.now() - ts;
    const m = Math.floor(diff / 60000);
    if (m < 1) return "방금 전";
    if (m < 60) return `${m}분 전`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}시간 전`;
    return `${Math.floor(h / 24)}일 전`;
  }

  return (
    <ScreenContainer containerClassName="bg-background">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarEmoji}>🌿</Text>
          </View>
          {editingName ? (
            <View style={styles.nameInputRow}>
              <TextInput
                style={styles.nameInput}
                value={nameInput}
                onChangeText={setNameInput}
                placeholder="닉네임 입력"
                placeholderTextColor={colors.muted}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleSaveName}
              />
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveName}>
                <Text style={styles.saveBtnText}>저장</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.nameRow}>
              <Text style={styles.nameText}>{username}</Text>
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => { haptic(); setNameInput(username); setEditingName(true); }}
              >
                <IconSymbol name="gear" size={16} color={colors.muted} />
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.levelBadge}>
            <Text style={styles.levelBadgeText}>Lv.{levelInfo.level} {levelInfo.title}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{points.toLocaleString()}</Text>
            <Text style={styles.statLabel}>총 포인트</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{pickupCount}</Text>
            <Text style={styles.statLabel}>줍기 횟수</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{reportCount}</Text>
            <Text style={styles.statLabel}>신고 횟수</Text>
          </View>
        </View>

        {/* Level Progress */}
        <View style={styles.levelBarContainer}>
          <View style={styles.levelBarLabel}>
            <Text style={styles.levelBarLabelText}>다음 레벨까지</Text>
            <Text style={styles.levelBarLabelText}>{(levelInfo.nextPoints - points).toLocaleString()}P 남음</Text>
          </View>
          <View style={styles.levelBarBg}>
            <View style={[styles.levelBarFill, { width: `${levelInfo.progress * 100}%` }]} />
          </View>
        </View>

        {/* Badges */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>획득한 뱃지 ({earnedBadges.length}/{BADGES.length})</Text>
          <View style={styles.badgeGrid}>
            {BADGES.map((badge) => {
              const earned = badge.condition(activities, points);
              return (
                <View
                  key={badge.id}
                  style={[styles.badgeCard, {
                    borderColor: earned ? colors.primary : colors.border,
                    opacity: earned ? 1 : 0.4,
                  }]}
                >
                  <Text style={[styles.badgeEmoji, { opacity: earned ? 1 : 0.3 }]}>{badge.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.badgeLabel, { color: earned ? colors.foreground : colors.muted }]}>{badge.label}</Text>
                    <Text style={[styles.badgeDesc, { color: colors.muted }]}>{badge.desc}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Activity History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>활동 내역</Text>
          {activities.length === 0 ? (
            <Text style={{ color: colors.muted, textAlign: "center", paddingVertical: 20 }}>
              아직 활동 내역이 없어요 🌱
            </Text>
          ) : (
            activities.slice(0, 20).map((item) => (
              <View key={item.id} style={styles.activityItem}>
                <View style={[styles.activityIcon, { backgroundColor: item.type === "pickup" ? colors.primary + "20" : colors.warning + "20" }]}>
                  <IconSymbol
                    name={item.type === "pickup" ? "trash.fill" : "location.fill"}
                    size={18}
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
