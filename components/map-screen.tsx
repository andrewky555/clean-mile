import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { HotspotMap } from "@/components/hotspot-map";
import { useColors } from "@/hooks/use-colors";
import { getAllHotspots, getHotspotsBySeverity, reportHotspot, type Hotspot } from "@/lib/map-system";
import { getDeviceLocation, watchDeviceLocation, type LatLng } from "@/lib/device-location";

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

const SEVERITY_COLOR: Record<string, string> = {
  high: "#E74C3C",
  medium: "#F39C12",
  low: "#2ECC71",
};

const SEVERITY_LABEL: Record<string, string> = {
  high: "심각",
  medium: "보통",
  low: "양호",
};

export default function MapScreen() {
  const colors = useColors();
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [filter, setFilter] = useState<"all" | "high" | "medium" | "low">("all");
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  const [currentLocation, setCurrentLocation] = useState<LatLng | null>(null);

  const refreshLocation = useCallback(async () => {
    const loc = await getDeviceLocation();
    if (loc) {
      setCurrentLocation(loc);
      return;
    }
    Alert.alert(
      "위치를 가져올 수 없어요",
      "설정에서 위치 권한을 허용하면 내 위치가 지도에 표시됩니다."
    );
  }, []);

  useEffect(() => {
    let cancelled = false;
    let stopWatch: (() => void) | undefined;

    (async () => {
      const loc = await getDeviceLocation();
      if (!cancelled && loc) setCurrentLocation(loc);
      stopWatch = await watchDeviceLocation((next) => {
        if (!cancelled) setCurrentLocation(next);
      });
      if (cancelled) stopWatch();
    })();

    return () => {
      cancelled = true;
      stopWatch?.();
    };
  }, []);

  const load = useCallback(async () => {
    const spots =
      filter === "all" ? await getAllHotspots() : await getHotspotsBySeverity(filter);
    setHotspots(spots);
  }, [filter]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleReport = (hotspot: Hotspot) => {
    haptic();
    Alert.alert("쓰레기 신고", `${hotspot.name}에서 쓰레기를 발견했나요?`, [
      { text: "취소", style: "cancel" },
      {
        text: "신고하기",
        onPress: async () => {
          await reportHotspot(hotspot.id, "unknown");
          setHotspots(await getAllHotspots());
          if (Platform.OS !== "web") {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
          Alert.alert("신고 완료", "쓰레기 신고가 접수되었습니다. 감사합니다! 🙏");
        },
      },
    ]);
  };

  const handleMarkerPress = (hotspot: Hotspot) => {
    haptic();
    setSelectedHotspot(hotspot);
  };

  const filtered = filter === "all" ? hotspots : hotspots.filter((h) => h.severity === filter);

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    mapContainer: {
      flex: 1,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    bottomPanel: {
      maxHeight: "42%",
      backgroundColor: colors.background,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    panelHeader: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 12,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    panelTitle: { fontSize: 18, fontWeight: "800", color: colors.foreground },
    locationBar: {
      paddingHorizontal: 20,
      paddingVertical: 8,
      backgroundColor: "#E3F2FD",
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    locationText: { fontSize: 12, color: "#1976D2", fontWeight: "600" },
    filterRow: {
      flexDirection: "row",
      paddingHorizontal: 20,
      paddingVertical: 12,
      gap: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    filterBtn: {
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 20,
      borderWidth: 1,
    },
    filterBtnText: { fontSize: 12, fontWeight: "600" },
    spotsList: {
      flex: 1,
      paddingHorizontal: 20,
    },
    spotCard: {
      marginBottom: 10,
      backgroundColor: colors.surface,
      borderRadius: 14,
      padding: 14,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 6,
      elevation: 2,
    },
    severityDot: { width: 14, height: 14, borderRadius: 7 },
    spotTitle: { fontSize: 14, fontWeight: "600", color: colors.foreground },
    spotMeta: { fontSize: 12, color: colors.muted, marginTop: 2 },
    severityBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 10,
    },
    severityText: { fontSize: 11, fontWeight: "700", color: "#fff" },
  });

  const filters: { key: "all" | "high" | "medium" | "low"; label: string }[] = [
    { key: "all", label: "전체" },
    { key: "high", label: "심각" },
    { key: "medium", label: "보통" },
    { key: "low", label: "양호" },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <HotspotMap
          hotspots={filtered}
          onMarkerClick={handleMarkerPress}
          selectedHotspot={selectedHotspot}
          currentLocation={currentLocation}
          onRequestLocation={refreshLocation}
        />
      </View>

      <View style={styles.bottomPanel}>
        <View style={styles.panelHeader}>
          <Text style={styles.panelTitle}>쓰레기 핫스팟</Text>
          <Text style={{ fontSize: 14, fontWeight: "600", color: colors.muted }}>
            {filtered.length}곳
          </Text>
        </View>

        <View style={styles.locationBar}>
          <Text style={styles.locationText}>
            {currentLocation
              ? `내 위치: ${currentLocation.lat.toFixed(5)}, ${currentLocation.lng.toFixed(5)}`
              : "내 위치를 확인하는 중... 버튼을 눌러 권한을 허용하세요"}
          </Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          {filters.map((f) => {
            const isActive = filter === f.key;
            return (
              <TouchableOpacity
                key={f.key}
                style={[
                  styles.filterBtn,
                  {
                    backgroundColor: isActive ? colors.primary : colors.surface,
                    borderColor: isActive ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => {
                  haptic();
                  setFilter(f.key);
                }}
              >
                <Text
                  style={[styles.filterBtnText, { color: isActive ? "#fff" : colors.foreground }]}
                >
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <ScrollView style={styles.spotsList} showsVerticalScrollIndicator={false}>
          {filtered.length === 0 ? (
            <View style={{ paddingVertical: 28, paddingHorizontal: 8 }}>
              <Text style={{ textAlign: "center", color: colors.muted, lineHeight: 22 }}>
                아직 사람이 찍은 쓰레기 정보가 없습니다.{"\n"}
                줍기 탭에서 쓰레기를 촬영하면 여기에 표시됩니다.
              </Text>
            </View>
          ) : null}
          {filtered.map((spot) => (
            <TouchableOpacity
              key={spot.id}
              style={[
                styles.spotCard,
                selectedHotspot?.id === spot.id && {
                  backgroundColor: colors.primary,
                  opacity: 0.9,
                },
              ]}
              onPress={() => handleMarkerPress(spot)}
            >
              <View style={[styles.severityDot, { backgroundColor: SEVERITY_COLOR[spot.severity] }]} />
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.spotTitle,
                    selectedHotspot?.id === spot.id && { color: "#fff" },
                  ]}
                >
                  {spot.name}
                </Text>
                <Text
                  style={[
                    styles.spotMeta,
                    selectedHotspot?.id === spot.id && { color: "rgba(255,255,255,0.7)" },
                  ]}
                >
                  쓰레기 {spot.trashCount}건 · {timeAgo(spot.lastReported)}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.severityBadge, { backgroundColor: SEVERITY_COLOR[spot.severity] }]}
                onPress={() => handleReport(spot)}
              >
                <Text style={styles.severityText}>{SEVERITY_LABEL[spot.severity]}</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
          <View style={{ height: 20 }} />
        </ScrollView>
      </View>
    </View>
  );
}
