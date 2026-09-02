import { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  Image,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { LiveCamera, type CapturedPhoto } from "@/components/live-camera";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { addPoints, addActivity } from "@/lib/store";
import {
  recordPickup,
  getPickupEligibility,
  getAds,
  recordAdImpression,
  DAILY_PICKUP_LIMIT,
  type PickupEligibility,
} from "@/lib/store-extended";
import { detectTrash, VisionRequestError, type TrashDetectionResult } from "@/lib/vision-api";
import { formatCooldown, isAfterPhotoStillDirty } from "@/lib/trash-classifier";
import { shouldShowAdAfterPoints } from "@/lib/admob-service";
import { getDeviceLocation, distanceMeters, type LatLng } from "@/lib/device-location";
import { verifyHotspot } from "@/lib/hotspot-verification";
import { recordUserTrashSpot } from "@/lib/map-system";

function haptic() {
  if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

type Phase = "idle" | "before" | "analyzing_before" | "after" | "analyzing_after" | "result";

const SAME_SPOT_LIMIT_M = 80;

export default function CameraVisionScreen() {
  const colors = useColors();
  const [phase, setPhase] = useState<Phase>("idle");
  const [beforePhoto, setBeforePhoto] = useState<CapturedPhoto | null>(null);
  const [afterPhoto, setAfterPhoto] = useState<CapturedPhoto | null>(null);
  const [beforeLocation, setBeforeLocation] = useState<LatLng | null>(null);
  const [afterLocation, setAfterLocation] = useState<LatLng | null>(null);
  const [detectedType, setDetectedType] = useState<TrashDetectionResult | null>(null);
  const [eligibility, setEligibility] = useState<PickupEligibility | null>(null);
  const [cooldownMs, setCooldownMs] = useState(0);
  const [showAd, setShowAd] = useState(false);
  const [selectedAd, setSelectedAd] = useState<any>(null);
  const [awardedPoints, setAwardedPoints] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);

  const refreshEligibility = useCallback(async () => {
    const next = await getPickupEligibility();
    setEligibility(next);
    setCooldownMs(next.cooldownMs);
    return next;
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshEligibility();
    }, [refreshEligibility])
  );

  useEffect(() => {
    if (!eligibility?.nextAvailableAt) {
      setCooldownMs(0);
      return;
    }
    const target = eligibility.nextAvailableAt;
    const tick = () => {
      const left = target - Date.now();
      if (left <= 0) {
        setCooldownMs(0);
        return false;
      }
      setCooldownMs(left);
      return true;
    };
    if (!tick()) {
      refreshEligibility();
      return;
    }
    const timer = setInterval(() => {
      if (!tick()) {
        clearInterval(timer);
        refreshEligibility();
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [eligibility?.nextAvailableAt, refreshEligibility]);

  const reset = useCallback(() => {
    setPhase("idle");
    setBeforePhoto(null);
    setAfterPhoto(null);
    setBeforeLocation(null);
    setAfterLocation(null);
    setDetectedType(null);
    setShowAd(false);
    setSelectedAd(null);
    setAwardedPoints(0);
    refreshEligibility();
  }, [refreshEligibility]);

  const startCapture = useCallback(async () => {
    haptic();
    const next = await refreshEligibility();
    if (!next.allowed) {
      Alert.alert("지금은 촬영할 수 없어요", next.reason || "잠시 후 다시 시도해주세요.");
      return;
    }
    setPhase("before");
  }, [refreshEligibility]);

  const handleBeforeCapture = useCallback(async (photo: CapturedPhoto) => {
    haptic();
    setBeforePhoto(photo);
    setPhase("analyzing_before");

    const location = await getDeviceLocation();
    setBeforeLocation(location);

    try {
      const result = await detectTrash(photo);
      if (!result) {
        Alert.alert(
          "쓰레기를 찾지 못했어요",
          "길거리에 있는 쓰레기(병, 캔, 비닐, 담배꽁초 등)가 잘 보이게 다시 찍어주세요."
        );
        setBeforePhoto(null);
        setPhase("before");
        return;
      }
      setDetectedType(result);
      setPhase("after");
    } catch (error) {
      const network = error instanceof VisionRequestError && error.kind === "network";
      Alert.alert(
        network ? "인터넷 연결 확인" : "AI 인식 실패",
        network
          ? "휴대폰 인터넷이 연결되어 있는지 확인한 뒤 다시 찍어주세요."
          : "AI가 사진에서 쓰레기를 찾지 못했습니다. 병·캔·비닐이 크게 보이게 다시 찍어주세요."
      );
      setBeforePhoto(null);
      setPhase("before");
    }
  }, []);

  const awardPoints = useCallback(
    async (location: LatLng, trash: TrashDetectionResult, photoUri: string) => {
      const checkResult = await recordPickup(location.lat, location.lng);
      if (!checkResult.allowed) {
        Alert.alert("쓰레기 줍기 제한", checkResult.reason || "제한에 도달했습니다.");
        setPhase("idle");
        refreshEligibility();
        return false;
      }

      const newTotal = await addPoints(trash.points);
      await addActivity({
        type: "pickup",
        points: trash.points,
        trashType: trash.description,
        timestamp: Date.now(),
      });
      await verifyHotspot(photoUri, location.lat, location.lng, "me", trash);
      await recordUserTrashSpot({
        lat: location.lat,
        lng: location.lng,
        trashType: trash.description,
      });

      setAwardedPoints(trash.points);
      setTotalPoints(newTotal);
      setEligibility(checkResult);
      setCooldownMs(checkResult.cooldownMs);

      const ads = await getAds();
      if (shouldShowAdAfterPoints() && ads.length > 0) {
        const randomAd = ads[Math.floor(Math.random() * ads.length)];
        setSelectedAd(randomAd);
        setShowAd(true);
        await recordAdImpression(randomAd.id, false);
      }

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      return true;
    },
    [refreshEligibility]
  );

  const handleAfterCapture = useCallback(
    async (photo: CapturedPhoto) => {
      if (!detectedType) {
        setPhase("before");
        return;
      }

      haptic();
      const location = await getDeviceLocation();
      setAfterPhoto(photo);
      setAfterLocation(location);
      setPhase("analyzing_after");

      if (beforeLocation && location) {
        const moved = distanceMeters(beforeLocation, location);
        if (moved > SAME_SPOT_LIMIT_M) {
          Alert.alert(
            "같은 자리에서 찍어주세요",
            `줍기 전과 ${Math.round(moved)}m 떨어져 있어요. 쓰레기를 주운 그 자리에서 다시 촬영해주세요.`
          );
          setAfterPhoto(null);
          setPhase("after");
          return;
        }
      }

      try {
        const afterResult = await detectTrash(photo);
        if (isAfterPhotoStillDirty(detectedType, afterResult)) {
          Alert.alert(
            "아직 쓰레기가 보여요",
            "줍기 후 장면에도 쓰레기가 남아 있습니다. 치운 뒤 같은 구도로 다시 찍어주세요."
          );
          setAfterPhoto(null);
          setPhase("after");
          return;
        }
      } catch {
        // 후 사진은 위치·구도 확인이 우선. AI 실패 시에도 인증은 진행합니다.
      }

      const pointLocation = location || beforeLocation;
      if (!pointLocation) {
        Alert.alert("위치 필요", "인증을 위해 위치 권한을 허용해주세요.");
        setAfterPhoto(null);
        setPhase("after");
        return;
      }

      const ok = await awardPoints(pointLocation, detectedType, photo.uri);
      if (ok) setPhase("result");
    },
    [detectedType, beforeLocation, awardPoints]
  );

  const handleAdClick = async () => {
    if (!selectedAd) return;
    haptic();
    await recordAdImpression(selectedAd.id, true);
    const bonus = selectedAd.bonus || 0;
    if (bonus > 0) {
      const newTotal = await addPoints(bonus);
      setTotalPoints(newTotal);
      Alert.alert("광고 보상! 🎁", `추가 +${bonus}P 획득!\n누적 포인트: ${newTotal.toLocaleString()}P`);
    }
  };

  const remaining = eligibility?.remaining ?? DAILY_PICKUP_LIMIT;
  const blocked = eligibility ? !eligibility.allowed : false;
  const dailyDone = remaining <= 0;

  if (phase === "before") {
    return (
      <LiveCamera
        label="BEFORE · 쓰레기 있는 장면"
        hint="병, 캔, 비닐, 담배꽁초가 잘 보이게 찍으면 AI가 바로 인식합니다."
        onCapture={handleBeforeCapture}
        onClose={reset}
      />
    );
  }

  if (phase === "after") {
    return (
      <LiveCamera
        label="AFTER · 깨끗해진 장면"
        hint={`${detectedType?.description ?? "쓰레기"}를 주운 뒤, 같은 자리에서 찍어주세요.`}
        onCapture={handleAfterCapture}
        onClose={reset}
      />
    );
  }

  const styles = StyleSheet.create({
    header: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 12,
    },
    title: { fontSize: 22, fontWeight: "800", color: colors.foreground },
    subtitle: { fontSize: 14, color: colors.muted, marginTop: 4, lineHeight: 20 },
    remainingBadge: {
      marginHorizontal: 20,
      marginBottom: 12,
      backgroundColor: blocked ? colors.error + "20" : colors.primary + "20",
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 10,
      gap: 4,
    },
    remainingBadgeText: {
      fontSize: 13,
      fontWeight: "700",
      color: blocked ? colors.error : colors.primary,
    },
    cooldownText: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.muted,
    },
    stepRow: {
      flexDirection: "row",
      marginHorizontal: 20,
      gap: 10,
      marginBottom: 16,
    },
    stepCard: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 12,
      minHeight: 150,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    stepImage: { width: "100%", height: 120, borderRadius: 10 },
    stepLabel: { fontSize: 12, fontWeight: "800", color: colors.primary, marginBottom: 8 },
    stepPlaceholder: { color: colors.muted, fontSize: 12, textAlign: "center" },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0,0,0,0.55)",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      borderRadius: 16,
    },
    overlayText: { color: "#fff", fontWeight: "700" },
    primaryBtn: {
      marginHorizontal: 20,
      backgroundColor: blocked ? colors.border : colors.primary,
      borderRadius: 16,
      paddingVertical: 16,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 8,
    },
    btnText: { fontWeight: "700", fontSize: 15, color: "#fff" },
    resultCard: {
      marginHorizontal: 20,
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 20,
      alignItems: "center",
      gap: 8,
      marginTop: 8,
    },
    resultType: { fontSize: 20, fontWeight: "800", color: colors.foreground },
    resultPoints: { fontSize: 32, fontWeight: "900", color: colors.primary },
    resultConfidence: { fontSize: 12, color: colors.muted, textAlign: "center", lineHeight: 18 },
    confirmBtn: {
      width: "100%",
      backgroundColor: colors.primary,
      borderRadius: 14,
      paddingVertical: 14,
      alignItems: "center",
      marginTop: 8,
    },
    confirmBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
    adBanner: {
      marginHorizontal: 20,
      marginTop: 16,
      backgroundColor: colors.warning,
      borderRadius: 14,
      padding: 14,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    adText: { flex: 1, color: "#fff", fontSize: 13, fontWeight: "700" },
    adBtn: {
      backgroundColor: "rgba(255,255,255,0.3)",
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    adBtnText: { color: "#fff", fontWeight: "700", fontSize: 12 },
    tipCard: {
      marginHorizontal: 20,
      marginTop: 16,
      marginBottom: 100,
      backgroundColor: colors.primary + "15",
      borderRadius: 14,
      padding: 14,
      flexDirection: "row",
      gap: 10,
      alignItems: "flex-start",
    },
    tipText: { flex: 1, fontSize: 13, color: colors.foreground, lineHeight: 20 },
  });

  return (
    <ScreenContainer containerClassName="bg-background">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>쓰레기 줍기</Text>
          <Text style={styles.subtitle}>
            실시간 카메라로 줍기 전·후를 찍으면 AI가 쓰레기를 인식하고 포인트를 적립합니다
          </Text>
        </View>

        <View style={styles.remainingBadge}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <IconSymbol
              name={dailyDone ? "xmark.circle.fill" : "checkmark.circle.fill"}
              size={18}
              color={blocked ? colors.error : colors.primary}
            />
            <Text style={styles.remainingBadgeText}>
              {dailyDone
                ? "오늘 3회를 모두 사용했습니다"
                : `오늘 ${eligibility?.used ?? 0}/${DAILY_PICKUP_LIMIT}회 사용 · 남은 ${remaining}회`}
            </Text>
          </View>
          {!dailyDone && cooldownMs > 0 ? (
            <Text style={styles.cooldownText}>다음 촬영까지 {formatCooldown(cooldownMs)}</Text>
          ) : (
            <Text style={styles.cooldownText}>촬영 간격 30분 · 하루 최대 3회</Text>
          )}
        </View>

        <View style={styles.stepRow}>
          <View style={styles.stepCard}>
            <Text style={styles.stepLabel}>1. BEFORE</Text>
            {beforePhoto ? (
              <View style={{ width: "100%" }}>
                <Image source={{ uri: beforePhoto.uri }} style={styles.stepImage} />
                {phase === "analyzing_before" ? (
                  <View style={styles.overlay}>
                    <ActivityIndicator color="#2ECC71" />
                    <Text style={styles.overlayText}>AI 분석 중</Text>
                  </View>
                ) : null}
              </View>
            ) : (
              <Text style={styles.stepPlaceholder}>쓰레기가 있는{"\n"}장면을 촬영</Text>
            )}
          </View>
          <View style={styles.stepCard}>
            <Text style={styles.stepLabel}>2. AFTER</Text>
            {afterPhoto ? (
              <View style={{ width: "100%" }}>
                <Image source={{ uri: afterPhoto.uri }} style={styles.stepImage} />
                {phase === "analyzing_after" ? (
                  <View style={styles.overlay}>
                    <ActivityIndicator color="#2ECC71" />
                    <Text style={styles.overlayText}>인증 중</Text>
                  </View>
                ) : null}
              </View>
            ) : (
              <Text style={styles.stepPlaceholder}>같은 자리에서{"\n"}깨끗해진 장면</Text>
            )}
          </View>
        </View>

        {phase === "result" && detectedType ? (
          <View style={styles.resultCard}>
            <Text style={{ fontSize: 40 }}>🎉</Text>
            <Text style={styles.resultType}>{detectedType.description} 인증 완료</Text>
            <Text style={styles.resultPoints}>+{awardedPoints}P</Text>
            <Text style={styles.resultConfidence}>
              AI 신뢰도 {(detectedType.confidence * 100).toFixed(0)}%{"\n"}
              누적 {totalPoints.toLocaleString()}P · 오늘 남은 {remaining}회
            </Text>
            <TouchableOpacity style={styles.confirmBtn} onPress={reset}>
              <Text style={styles.confirmBtnText}>확인</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {showAd && selectedAd ? (
          <View style={styles.adBanner}>
            <Text style={{ fontSize: 18 }}>{selectedAd.icon}</Text>
            <Text style={styles.adText}>{selectedAd.title}</Text>
            <TouchableOpacity style={styles.adBtn} onPress={handleAdClick}>
              <Text style={styles.adBtnText}>보기</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {phase === "idle" ? (
          <TouchableOpacity style={styles.primaryBtn} onPress={startCapture} disabled={blocked}>
            <IconSymbol name="camera.fill" size={20} color="#fff" />
            <Text style={styles.btnText}>
              {dailyDone
                ? "내일 다시 촬영"
                : cooldownMs > 0
                  ? `${formatCooldown(cooldownMs)} 후 가능`
                  : "실시간 촬영 시작"}
            </Text>
          </TouchableOpacity>
        ) : null}

        {phase === "analyzing_before" || phase === "analyzing_after" ? (
          <View style={{ paddingVertical: 20, alignItems: "center" }}>
            <ActivityIndicator color={colors.primary} />
            <Text style={{ marginTop: 8, color: colors.muted, fontWeight: "600" }}>
              {phase === "analyzing_before" ? "AI가 쓰레기를 인식하는 중..." : "줍기 완료를 확인하는 중..."}
            </Text>
          </View>
        ) : null}

        <View style={styles.tipCard}>
          <Text style={{ fontSize: 18 }}>💡</Text>
          <Text style={styles.tipText}>
            갤러리 사진은 사용할 수 없습니다. AI가 병·캔·비닐·담배꽁초 등을 인식해야 포인트가 적립됩니다. 유리병·캔은 20P, 그 외는 10P이며 하루 3회, 30분 간격입니다.
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
