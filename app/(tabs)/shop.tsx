import { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  FlatList,
  Image,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { getPoints, addPoints } from "@/lib/store";
import { getShopItems, purchaseItem, getPurchaseHistory, ShopItem, Purchase } from "@/lib/store-extended";

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

export default function ShopScreen() {
  const colors = useColors();
  const [points, setPoints] = useState(0);
  const [items, setItems] = useState<ShopItem[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [tab, setTab] = useState<"shop" | "history">("shop");
  const [filter, setFilter] = useState<"all" | "food" | "coupon" | "experience">("all");

  const load = useCallback(async () => {
    const [p, i, h] = await Promise.all([getPoints(), getShopItems(), getPurchaseHistory()]);
    setPoints(p);
    setItems(i);
    setPurchases(h.reverse());
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handlePurchase = (item: ShopItem) => {
    haptic();
    Alert.alert(
      `${item.name} 구매`,
      `${item.price.toLocaleString()}P를 사용하여 ${item.name}을(를) 구매하시겠습니까?`,
      [
        { text: "취소", style: "cancel" },
        {
          text: "구매하기",
          onPress: async () => {
            if (points < item.price) {
              Alert.alert("포인트 부족", `포인트가 ${item.price - points}P 부족합니다.`);
              return;
            }
            const newPoints = await addPoints(-item.price);
            await purchaseItem(item.id, item.price);
            setPoints(newPoints);
            await load();
            if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert("구매 완료! 🎉", `${item.name}을(를) 구매했습니다.\n남은 포인트: ${newPoints.toLocaleString()}P`);
          },
        },
      ]
    );
  };

  const filteredItems = filter === "all" ? items : items.filter((i) => i.category === filter);

  const styles = StyleSheet.create({
    header: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 12,
    },
    title: { fontSize: 22, fontWeight: "800", color: colors.foreground },
    pointsRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 8,
      gap: 8,
    },
    pointsValue: { fontSize: 18, fontWeight: "800", color: colors.primary },
    pointsLabel: { fontSize: 13, color: colors.muted },
    tabRow: {
      flexDirection: "row",
      marginHorizontal: 20,
      marginBottom: 12,
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 4,
    },
    tabBtn: {
      flex: 1,
      paddingVertical: 8,
      alignItems: "center",
      borderRadius: 10,
    },
    tabBtnText: { fontSize: 14, fontWeight: "700" },
    filterRow: {
      flexDirection: "row",
      paddingHorizontal: 20,
      gap: 8,
      marginBottom: 12,
    },
    filterBtn: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      borderWidth: 1,
    },
    filterBtnText: { fontSize: 12, fontWeight: "600" },
    itemCard: {
      marginHorizontal: 20,
      marginBottom: 12,
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
    itemEmoji: { fontSize: 32 },
    itemInfo: { flex: 1 },
    itemName: { fontSize: 14, fontWeight: "700", color: colors.foreground },
    itemDesc: { fontSize: 12, color: colors.muted, marginTop: 2 },
    itemPrice: { fontSize: 15, fontWeight: "800", color: colors.primary },
    buyBtn: {
      backgroundColor: colors.primary,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    buyBtnText: { color: "#fff", fontWeight: "700", fontSize: 12 },
    buyBtnDisabled: {
      backgroundColor: colors.muted,
    },
    purchaseItem: {
      marginHorizontal: 20,
      marginBottom: 10,
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    purchaseIcon: { fontSize: 24 },
    purchaseInfo: { flex: 1 },
    purchaseName: { fontSize: 13, fontWeight: "700", color: colors.foreground },
    purchaseTime: { fontSize: 11, color: colors.muted, marginTop: 2 },
    purchasePrice: { fontSize: 13, fontWeight: "700", color: colors.error },
    emptyText: { color: colors.muted, textAlign: "center", paddingVertical: 40 },
  });

  return (
    <ScreenContainer containerClassName="bg-background">
      <View style={styles.header}>
        <Text style={styles.title}>🛍️ 포인트 상점</Text>
        <View style={styles.pointsRow}>
          <IconSymbol name="star.fill" size={16} color={colors.primary} />
          <Text style={styles.pointsValue}>{points.toLocaleString()}P</Text>
          <Text style={styles.pointsLabel}>사용 가능</Text>
        </View>
      </View>

      {/* Tab */}
      <View style={styles.tabRow}>
        {(["shop", "history"] as const).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tabBtn, tab === t && { backgroundColor: colors.primary }]}
            onPress={() => { haptic(); setTab(t); }}
          >
            <Text style={[styles.tabBtnText, { color: tab === t ? "#fff" : colors.muted }]}>
              {t === "shop" ? "상품 목록" : "구매 내역"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {tab === "shop" ? (
          <>
            {/* Filter */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
              {(["all", "food", "coupon", "experience"] as const).map((f) => {
                const labels = { all: "전체", food: "음식", coupon: "쿠폰", experience: "경험" };
                const isActive = filter === f;
                return (
                  <TouchableOpacity
                    key={f}
                    style={[
                      styles.filterBtn,
                      {
                        backgroundColor: isActive ? colors.primary : colors.surface,
                        borderColor: isActive ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => { haptic(); setFilter(f); }}
                  >
                    <Text style={[styles.filterBtnText, { color: isActive ? "#fff" : colors.foreground }]}>
                      {labels[f]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Shop Items */}
            {filteredItems.length === 0 ? (
              <Text style={styles.emptyText}>상품이 없습니다.</Text>
            ) : (
              filteredItems.map((item) => (
                <View key={item.id} style={styles.itemCard}>
                  {item.imageUrl ? (
                    <Image
                      source={{ uri: item.imageUrl }}
                      style={{ width: 60, height: 60, borderRadius: 8 }}
                    />
                  ) : (
                    <Text style={styles.itemEmoji}>{item.icon}</Text>
                  )}
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemDesc}>{item.description}</Text>
                  </View>
                  <View style={{ alignItems: "flex-end", gap: 8 }}>
                    <Text style={styles.itemPrice}>{item.price.toLocaleString()}P</Text>
                    <TouchableOpacity
                      style={[styles.buyBtn, points < item.price && styles.buyBtnDisabled]}
                      onPress={() => handlePurchase(item)}
                      disabled={points < item.price}
                    >
                      <Text style={styles.buyBtnText}>구매</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </>
        ) : (
          <>
            {/* Purchase History */}
            {purchases.length === 0 ? (
              <Text style={styles.emptyText}>구매 내역이 없습니다.</Text>
            ) : (
              purchases.map((purchase) => {
                const item = items.find((i) => i.id === purchase.itemId);
                if (!item) return null;
                return (
                  <View key={purchase.id} style={styles.purchaseItem}>
                    <Text style={styles.purchaseIcon}>{item.icon}</Text>
                    <View style={styles.purchaseInfo}>
                      <Text style={styles.purchaseName}>{item.name}</Text>
                      <Text style={styles.purchaseTime}>{timeAgo(purchase.timestamp)}</Text>
                    </View>
                    <Text style={styles.purchasePrice}>-{purchase.pointsSpent.toLocaleString()}P</Text>
                  </View>
                );
              })
            )}
          </>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </ScreenContainer>
  );
}
