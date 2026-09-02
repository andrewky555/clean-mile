import { View, Text, StyleSheet, TouchableOpacity, FlatList, Platform, ScrollView } from "react-native";
import { useState, useCallback, useEffect } from "react";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { getRanking, getMyRank, getPodium, RankingUser } from "@/lib/ranking-system";
import { getDongRankings } from "@/lib/dong-ranking-system";

// 동 단위 랭킹 데이터 변환 함수들
const getDongRanking = async (period: "weekly" | "monthly") => {
  const rankings = await getDongRankings();
  if (rankings.length === 0) return [];
  return rankings[0].rankings.map((r, i) => ({
    id: r.userId,
    nickname: r.username,
    points: r.monthlyPoints,
    rank: i + 1,
    badge: i < 3 ? ["🏆", "🥈", "🥉"][i] : "",
    lastActivityTime: 0,
  }));
};

const getMyDongRank = async (period: "weekly" | "monthly") => {
  const rankings = await getDongRankings();
  if (rankings.length === 0) return null;
  const userRankings = rankings[0].rankings;
  const myRank = userRankings.find(r => r.userId === "current_user");
  if (!myRank) return null;
  const rank = userRankings.findIndex(r => r.userId === "current_user") + 1;
  return {
    id: myRank.userId,
    nickname: myRank.username,
    points: myRank.monthlyPoints,
    rank: rank,
    badge: rank < 3 ? ["🏆", "🥈", "🥉"][rank - 1] : "",
    lastActivityTime: 0,
  };
};

const getDongPodium = async (period: "weekly" | "monthly") => {
  const rankings = await getDongRankings();
  if (rankings.length === 0) return [];
  return rankings[0].rankings.slice(0, 3).map((r, i) => ({
    id: r.userId,
    nickname: r.username,
    points: r.monthlyPoints,
    rank: i + 1,
    badge: ["🏆", "🥈", "🥉"][i],
    lastActivityTime: 0,
  }));
};

function haptic() {
  if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

export default function RankingScreen() {
  const colors = useColors();
  const [tab, setTab] = useState<"global" | "dong">("global");
  const [period, setPeriod] = useState<"weekly" | "monthly">("weekly");
  const [ranking, setRanking] = useState<RankingUser[]>([]);
  const [podium, setPodium] = useState<RankingUser[]>([]);
  const [myRank, setMyRank] = useState<RankingUser | null>(null);
  const [dongRanking, setDongRanking] = useState<RankingUser[]>([]);
  const [dongPodium, setDongPodium] = useState<RankingUser[]>([]);
  const [myDongRank, setMyDongRank] = useState<RankingUser | null>(null);
  const [loading, setLoading] = useState(true);

  const loadRanking = useCallback(async () => {
    setLoading(true);
    const [rankingData, podiumData, myRankData] = await Promise.all([
      getRanking(period),
      getPodium(period),
      getMyRank(period),
    ]);
    setRanking(rankingData);
    setPodium(podiumData);
    setMyRank(myRankData);
    setLoading(false);
  }, [period]);

  const loadDongRanking = useCallback(async () => {
    setLoading(true);
    const [dongRankingData, dongPodiumData, myDongRankData] = await Promise.all([
      getDongRanking(period),
      getDongPodium(period),
      getMyDongRank(period),
    ]);
    setDongRanking(dongRankingData);
    setDongPodium(dongPodiumData);
    setMyDongRank(myDongRankData);
    setLoading(false);
  }, [period]);

  useEffect(() => {
    if (tab === "global") {
      loadRanking();
    } else {
      loadDongRanking();
    }
  }, [tab, period, loadRanking, loadDongRanking]);

  const styles = StyleSheet.create({
    header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
    title: { fontSize: 22, fontWeight: "800", color: colors.foreground },
    tabRow: { flexDirection: "row", marginHorizontal: 20, marginBottom: 16, gap: 12 },
    tabBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: "center", borderWidth: 2 },
    tabBtnText: { fontWeight: "700", fontSize: 14 },
    periodRow: { flexDirection: "row", marginHorizontal: 20, marginBottom: 16, gap: 12 },
    periodBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center", borderWidth: 2 },
    periodBtnText: { fontWeight: "700", fontSize: 12 },
    podiumContainer: { paddingHorizontal: 20, marginBottom: 24, alignItems: "center" },
    podiumRow: { flexDirection: "row", alignItems: "flex-end", gap: 12, justifyContent: "center", height: 180 },
    podiumCard: { alignItems: "center", borderRadius: 16, padding: 12, flex: 1 },
    podiumRank: { fontSize: 28, fontWeight: "900", marginBottom: 4 },
    podiumEmoji: { fontSize: 40, marginBottom: 8 },
    podiumName: { fontSize: 13, fontWeight: "700", color: colors.foreground, textAlign: "center" },
    podiumPoints: { fontSize: 16, fontWeight: "800", color: colors.primary, marginTop: 4 },
    myRankCard: { marginHorizontal: 20, marginBottom: 20, backgroundColor: colors.primary + "15", borderRadius: 16, padding: 16, borderWidth: 2, borderColor: colors.primary },
    myRankTitle: { fontSize: 13, fontWeight: "700", color: colors.muted, marginBottom: 8 },
    myRankContent: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    myRankName: { fontSize: 16, fontWeight: "800", color: colors.foreground },
    myRankRank: { fontSize: 14, color: colors.muted, marginTop: 4 },
    myRankPoints: { fontSize: 20, fontWeight: "900", color: colors.primary },
    rankingList: { paddingHorizontal: 20, marginBottom: 20 },
    rankingTitle: { fontSize: 16, fontWeight: "700", color: colors.foreground, marginBottom: 12 },
    rankingItem: { flexDirection: "row", alignItems: "center", backgroundColor: colors.surface, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 8, borderWidth: 1, borderColor: colors.border },
    rankingRank: { fontSize: 16, fontWeight: "800", color: colors.primary, width: 40, textAlign: "center" },
    rankingBadge: { fontSize: 18, marginHorizontal: 8 },
    rankingName: { flex: 1, fontSize: 14, fontWeight: "700", color: colors.foreground },
    rankingPoints: { fontSize: 14, fontWeight: "800", color: colors.primary },
    loadingText: { textAlign: "center", color: colors.muted, fontSize: 14, marginVertical: 40 },
    dongBadge: { fontSize: 12, fontWeight: "700", color: colors.muted, marginLeft: 8 },
  });

  const renderGlobalRanking = () => (
    <>
      {/* Period Tabs */}
      <View style={styles.periodRow}>
        <TouchableOpacity
          style={[styles.periodBtn, { backgroundColor: period === "weekly" ? colors.primary : colors.surface, borderColor: period === "weekly" ? colors.primary : colors.border }]}
          onPress={() => { haptic(); setPeriod("weekly"); }}
        >
          <Text style={[styles.periodBtnText, { color: period === "weekly" ? colors.background : colors.foreground }]}>주간</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.periodBtn, { backgroundColor: period === "monthly" ? colors.primary : colors.surface, borderColor: period === "monthly" ? colors.primary : colors.border }]}
          onPress={() => { haptic(); setPeriod("monthly"); }}
        >
          <Text style={[styles.periodBtnText, { color: period === "monthly" ? colors.background : colors.foreground }]}>월간</Text>
        </TouchableOpacity>
      </View>

      {/* Podium */}
      {podium.length > 0 && (
        <View style={styles.podiumContainer}>
          <View style={styles.podiumRow}>
            {podium[1] && (
              <View style={[styles.podiumCard, { backgroundColor: colors.surface, height: 140 }]}>
                <Text style={styles.podiumEmoji}>🥈</Text>
                <Text style={styles.podiumRank}>2</Text>
                <Text style={styles.podiumName}>{podium[1].nickname}</Text>
                <Text style={styles.podiumPoints}>{podium[1].points.toLocaleString()}P</Text>
              </View>
            )}
            {podium[0] && (
              <View style={[styles.podiumCard, { backgroundColor: colors.primary + "30", height: 160 }]}>
                <Text style={styles.podiumEmoji}>🏆</Text>
                <Text style={styles.podiumRank}>1</Text>
                <Text style={styles.podiumName}>{podium[0].nickname}</Text>
                <Text style={styles.podiumPoints}>{podium[0].points.toLocaleString()}P</Text>
              </View>
            )}
            {podium[2] && (
              <View style={[styles.podiumCard, { backgroundColor: colors.surface, height: 120 }]}>
                <Text style={styles.podiumEmoji}>🥉</Text>
                <Text style={styles.podiumRank}>3</Text>
                <Text style={styles.podiumName}>{podium[2].nickname}</Text>
                <Text style={styles.podiumPoints}>{podium[2].points.toLocaleString()}P</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* My Rank */}
      {myRank && (
        <View style={styles.myRankCard}>
          <Text style={styles.myRankTitle}>내 순위</Text>
          <View style={styles.myRankContent}>
            <View>
              <Text style={styles.myRankName}>{myRank.nickname}</Text>
              <Text style={styles.myRankRank}>#{myRank.rank}위</Text>
            </View>
            <Text style={styles.myRankPoints}>{myRank.points.toLocaleString()}P</Text>
          </View>
        </View>
      )}

      {/* Ranking List */}
      {ranking.length > 0 && (
        <View style={styles.rankingList}>
          <Text style={styles.rankingTitle}>전체 순위</Text>
          <FlatList
            data={ranking}
            scrollEnabled={false}
            renderItem={({ item, index }) => (
              <View style={styles.rankingItem}>
                <Text style={styles.rankingRank}>#{index + 1}</Text>
                <Text style={styles.rankingBadge}>{index < 3 ? ["🏆", "🥈", "🥉"][index] : "•"}</Text>
                <Text style={styles.rankingName}>{item.nickname}</Text>
                <Text style={styles.rankingPoints}>{item.points.toLocaleString()}P</Text>
              </View>
            )}
            keyExtractor={(item) => item.id}
          />
        </View>
      )}

      {loading && <Text style={styles.loadingText}>로딩 중...</Text>}
    </>
  );

  const renderDongRanking = () => (
    <>
      {/* Period Tabs */}
      <View style={styles.periodRow}>
        <TouchableOpacity
          style={[styles.periodBtn, { backgroundColor: period === "weekly" ? colors.primary : colors.surface, borderColor: period === "weekly" ? colors.primary : colors.border }]}
          onPress={() => { haptic(); setPeriod("weekly"); }}
        >
          <Text style={[styles.periodBtnText, { color: period === "weekly" ? colors.background : colors.foreground }]}>주간</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.periodBtn, { backgroundColor: period === "monthly" ? colors.primary : colors.surface, borderColor: period === "monthly" ? colors.primary : colors.border }]}
          onPress={() => { haptic(); setPeriod("monthly"); }}
        >
          <Text style={[styles.periodBtnText, { color: period === "monthly" ? colors.background : colors.foreground }]}>월간</Text>
        </TouchableOpacity>
      </View>

      {/* Dong Podium */}
      {dongPodium.length > 0 && (
        <View style={styles.podiumContainer}>
          <Text style={[styles.rankingTitle, { marginBottom: 12 }]}>내 동 상위 3명</Text>
          <View style={styles.podiumRow}>
            {dongPodium[1] && (
              <View style={[styles.podiumCard, { backgroundColor: colors.surface, height: 140 }]}>
                <Text style={styles.podiumEmoji}>🥈</Text>
                <Text style={styles.podiumRank}>2</Text>
                <Text style={styles.podiumName}>{dongPodium[1].nickname}</Text>
                <Text style={styles.podiumPoints}>{dongPodium[1].points.toLocaleString()}P</Text>
              </View>
            )}
            {dongPodium[0] && (
              <View style={[styles.podiumCard, { backgroundColor: colors.primary + "30", height: 160 }]}>
                <Text style={styles.podiumEmoji}>🏆</Text>
                <Text style={styles.podiumRank}>1</Text>
                <Text style={styles.podiumName}>{dongPodium[0].nickname}</Text>
                <Text style={styles.podiumPoints}>{dongPodium[0].points.toLocaleString()}P</Text>
              </View>
            )}
            {dongPodium[2] && (
              <View style={[styles.podiumCard, { backgroundColor: colors.surface, height: 120 }]}>
                <Text style={styles.podiumEmoji}>🥉</Text>
                <Text style={styles.podiumRank}>3</Text>
                <Text style={styles.podiumName}>{dongPodium[2].nickname}</Text>
                <Text style={styles.podiumPoints}>{dongPodium[2].points.toLocaleString()}P</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* My Dong Rank */}
      {myDongRank && (
        <View style={styles.myRankCard}>
          <Text style={styles.myRankTitle}>내 동 순위</Text>
          <View style={styles.myRankContent}>
            <View>
              <Text style={styles.myRankName}>{myDongRank.nickname}</Text>
              <Text style={styles.myRankRank}>#{myDongRank.rank}위</Text>
            </View>
            <Text style={styles.myRankPoints}>{myDongRank.points.toLocaleString()}P</Text>
          </View>
        </View>
      )}

      {/* Dong Ranking List */}
      {dongRanking.length > 0 && (
        <View style={styles.rankingList}>
          <Text style={styles.rankingTitle}>내 동 순위</Text>
          <FlatList
            data={dongRanking}
            scrollEnabled={false}
            renderItem={({ item, index }) => (
              <View style={styles.rankingItem}>
                <Text style={styles.rankingRank}>#{index + 1}</Text>
                <Text style={styles.rankingBadge}>{index < 3 ? ["🏆", "🥈", "🥉"][index] : "•"}</Text>
                <Text style={styles.rankingName}>{item.nickname}</Text>
                <Text style={styles.rankingPoints}>{item.points.toLocaleString()}P</Text>
              </View>
            )}
            keyExtractor={(item) => item.id}
          />
        </View>
      )}

      {loading && <Text style={styles.loadingText}>로딩 중...</Text>}
    </>
  );

  return (
    <ScreenContainer containerClassName="bg-background">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>🏆 랭킹</Text>
        </View>

        {/* Tab Buttons */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tabBtn, { backgroundColor: tab === "global" ? colors.primary : colors.surface, borderColor: tab === "global" ? colors.primary : colors.border }]}
            onPress={() => { haptic(); setTab("global"); }}
          >
            <Text style={[styles.tabBtnText, { color: tab === "global" ? colors.background : colors.foreground }]}>전체 랭킹</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, { backgroundColor: tab === "dong" ? colors.primary : colors.surface, borderColor: tab === "dong" ? colors.primary : colors.border }]}
            onPress={() => { haptic(); setTab("dong"); }}
          >
            <Text style={[styles.tabBtnText, { color: tab === "dong" ? colors.background : colors.foreground }]}>내 동 순위</Text>
          </TouchableOpacity>
        </View>

        {tab === "global" ? renderGlobalRanking() : renderDongRanking()}
      </ScrollView>
    </ScreenContainer>
  );
}
