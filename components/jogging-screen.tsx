import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Location from "expo-location";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { addPoints, addActivity } from "@/lib/store";
import {
  startJoggingSession,
  getCurrentJoggingSession,
  addTrashPhotoToSession,
  endJoggingSession,
  updateJoggingDistance,
  JoggingSession,
} from "@/lib/jogging-camera-system";

function haptic() {
  if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

export default function JoggingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [locationPermission, requestLocationPermission] =
    Location.useForegroundPermissions();

  const [session, setSession] = useState<JoggingSession | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [distance, setDistance] = useState(0);
  const [time, setTime] = useState(0); // 초 단위
  const [trashCount, setTrashCount] = useState(0);
  const [points, setPoints] = useState(0);
  const [calories, setCalories] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const cameraRef = useRef<CameraView>(null);
  const locationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastLocationRef = useRef<{ lat: number; lng: number } | null>(null);

  // 권한 요청
  useEffect(() => {
    (async () => {
      if (!permission?.granted) {
        await requestPermission();
      }
      if (!locationPermission?.granted) {
        await requestLocationPermission();
      }
    })();
  }, []);

  // 시간 업데이트
  useEffect(() => {
    if (isRecording) {
      timeIntervalRef.current = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timeIntervalRef.current) clearInterval(timeIntervalRef.current);
    };
  }, [isRecording]);

  // 칼로리 계산 (거리 기반: 1km당 약 50칼로리)
  useEffect(() => {
    setCalories(Math.floor(distance * 50));
  }, [distance]);

  // 플로깅 시작
  const handleStartJogging = async () => {
    try {
      setLoading(true);
      const location = await Location.getCurrentPositionAsync();
      lastLocationRef.current = {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      };
      setCurrentLocation(lastLocationRef.current);

      const newSession = await startJoggingSession(
        location.coords.latitude,
        location.coords.longitude
      );
      setSession(newSession);
      setIsRecording(true);
      setDistance(0);
      setTime(0);
      setTrashCount(0);
      setPoints(0);
      setCalories(0);

      haptic();

      // 위치 업데이트 시작 (1초마다)
      locationIntervalRef.current = setInterval(async () => {
        try {
          const loc = await Location.getCurrentPositionAsync();
          setCurrentLocation({
            lat: loc.coords.latitude,
            lng: loc.coords.longitude,
          });

          // 거리 계산 (Haversine formula)
          if (lastLocationRef.current) {
            const R = 6371; // 지구 반지름 (km)
            const dLat =
              ((loc.coords.latitude - lastLocationRef.current.lat) * Math.PI) / 180;
            const dLng =
              ((loc.coords.longitude - lastLocationRef.current.lng) * Math.PI) / 180;
            const a =
              Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos((lastLocationRef.current.lat * Math.PI) / 180) *
                Math.cos((loc.coords.latitude * Math.PI) / 180) *
                Math.sin(dLng / 2) *
                Math.sin(dLng / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const segmentDistance = R * c;

            if (segmentDistance > 0.001) {
              // 1m 이상만 계산
              setDistance((prev) => prev + segmentDistance);
              lastLocationRef.current = {
                lat: loc.coords.latitude,
                lng: loc.coords.longitude,
              };
            }
          }
        } catch (error) {
          console.error("위치 업데이트 오류:", error);
        }
      }, 1000);
    } catch (error) {
      Alert.alert("오류", "플로깅을 시작할 수 없습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 플로깅 종료
  const handleEndJogging = async () => {
    try {
      setLoading(true);
      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current as any);
      }
      if (timeIntervalRef.current) {
        clearInterval(timeIntervalRef.current);
      }

      if (currentLocation) {
        const result = await endJoggingSession(
          currentLocation.lat,
          currentLocation.lng
        );
        setSession(null);
        setIsRecording(false);

        // 포인트 적립
        const totalPoints = result.totalPoints;
        if (totalPoints > 0) {
          const newTotal = await addPoints(totalPoints);
          await addActivity({
            type: "pickup",
            points: totalPoints,
            trashType: `🏃 플로깅 ${result.session.distance.toFixed(2)}km`,
            timestamp: Date.now(),
          });
        }

        haptic();

        Alert.alert(
          "플로깅 완료! 🎉",
          `거리: ${result.session.distance.toFixed(2)}km\n` +
            `시간: ${Math.floor(time / 60)}분 ${time % 60}초\n` +
            `쓰레기: ${result.session.trashPhotos.length}개\n` +
            `칼로리: ${calories}kcal\n` +
            `포인트: ${totalPoints}P`
        );

        // 초기화
        setDistance(0);
        setTime(0);
        setTrashCount(0);
        setPoints(0);
        setCalories(0);
      }
    } catch (error) {
      Alert.alert("오류", "플로깅을 종료할 수 없습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 쓰레기 사진 촬영
  const handleTakePhoto = async (category: string) => {
    try {
      if (!cameraRef.current) {
        Alert.alert("오류", "카메라를 사용할 수 없습니다.");
        return;
      }

      haptic();

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.6,
        skipProcessing: Platform.OS === "android",
      });

      let location = currentLocation;
      if (!location) {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        location = { lat: loc.coords.latitude, lng: loc.coords.longitude };
        setCurrentLocation(location);
      }

      const saved = await addTrashPhotoToSession(
        location.lat,
        location.lng,
        category as "plastic" | "paper" | "glass" | "metal" | "other",
        photo?.uri
      );

      if (saved) {
        setTrashCount((prev) => prev + 1);
        setPoints((prev) => prev + saved.points);
        Alert.alert("촬영 완료!", `${category} 쓰레기: ${saved.points}P 적립`);
      }
    } catch (error) {
      console.error("플로깅 촬영 오류:", error);
      Alert.alert("오류", "사진을 촬영할 수 없습니다. 카메라 권한을 확인해주세요.");
    }
  };

  // 시간 포맷팅
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    }
    return `${minutes}:${String(secs).padStart(2, "0")}`;
  };

  if (!permission?.granted || !locationPermission?.granted) {
    return (
      <ScreenContainer className="justify-center items-center">
        <Text className="text-foreground mb-4 text-center">
          카메라 및 위치 권한이 필요합니다.
        </Text>
        <Pressable
          onPress={() => {
            requestPermission();
            requestLocationPermission();
          }}
          className="bg-primary px-6 py-3 rounded-full"
        >
          <Text className="text-background font-semibold">권한 허용</Text>
        </Pressable>
      </ScreenContainer>
    );
  }

  if (!isRecording) {
    return (
      <ScreenContainer className="justify-center items-center p-6">
        <View className="items-center gap-6 w-full">
          <Text className="text-5xl">🏃</Text>
          <Text className="text-3xl font-bold text-foreground">플로깅</Text>
          <Text className="text-muted text-center text-base">
            플로깅하면서 쓰레기를 촬영하면 포인트를 얻을 수 있어요!
          </Text>

          {/* 이전 기록 표시 */}
          <View className="w-full bg-surface rounded-2xl p-6 gap-4 mb-4">
            <View className="flex-row justify-between">
              <View className="items-center flex-1">
                <Text className="text-2xl font-bold text-primary">📍</Text>
                <Text className="text-sm text-muted mt-2">위치</Text>
                <Text className="text-base font-semibold text-foreground">
                  {currentLocation
                    ? `${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}`
                    : "확인 중..."}
                </Text>
              </View>
              <View className="items-center flex-1">
                <Text className="text-2xl font-bold text-primary">🗑️</Text>
                <Text className="text-sm text-muted mt-2">쓰레기</Text>
                <Text className="text-base font-semibold text-foreground">0개</Text>
              </View>
              <View className="items-center flex-1">
                <Text className="text-2xl font-bold text-primary">⚡</Text>
                <Text className="text-sm text-muted mt-2">칼로리</Text>
                <Text className="text-base font-semibold text-foreground">0kcal</Text>
              </View>
            </View>
          </View>

          <Pressable
            onPress={handleStartJogging}
            disabled={loading}
            className="bg-primary px-8 py-4 rounded-full w-full items-center"
          >
            {loading ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text className="text-background font-bold text-lg">
                플로깅 시작 🚀
              </Text>
            )}
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="back"
        mode="picture"
      />

      {/* 상단 정보 패널 */}
      <View
        className="absolute left-0 right-0 bg-black/70 p-4"
        style={{ top: 0, paddingTop: insets.top + 8 }}
      >
        <View className="grid gap-3">
          {/* 첫 번째 줄 */}
          <View className="flex-row justify-between gap-2">
            <View className="flex-1 bg-white/10 rounded-lg p-3 items-center">
              <Text className="text-white text-xs opacity-70">거리</Text>
              <Text className="text-white text-2xl font-bold">
                {distance.toFixed(2)}
              </Text>
              <Text className="text-white text-xs">km</Text>
            </View>
            <View className="flex-1 bg-white/10 rounded-lg p-3 items-center">
              <Text className="text-white text-xs opacity-70">시간</Text>
              <Text className="text-white text-2xl font-bold">
                {formatTime(time)}
              </Text>
            </View>
            <View className="flex-1 bg-white/10 rounded-lg p-3 items-center">
              <Text className="text-white text-xs opacity-70">칼로리</Text>
              <Text className="text-white text-2xl font-bold">
                {calories}
              </Text>
              <Text className="text-white text-xs">kcal</Text>
            </View>
          </View>

          {/* 두 번째 줄 */}
          <View className="flex-row justify-between gap-2">
            <View className="flex-1 bg-white/10 rounded-lg p-3 items-center">
              <Text className="text-white text-xs opacity-70">쓰레기</Text>
              <Text className="text-white text-2xl font-bold">{trashCount}</Text>
              <Text className="text-white text-xs">개</Text>
            </View>
            <View className="flex-1 bg-white/10 rounded-lg p-3 items-center">
              <Text className="text-white text-xs opacity-70">포인트</Text>
              <Text className="text-white text-2xl font-bold">{points}</Text>
              <Text className="text-white text-xs">P</Text>
            </View>
            <View className="flex-1 bg-white/10 rounded-lg p-3 items-center">
              <Text className="text-white text-xs opacity-70">속도</Text>
              <Text className="text-white text-2xl font-bold">
                {time > 0 ? ((distance * 3600) / time).toFixed(1) : "0"}
              </Text>
              <Text className="text-white text-xs">km/h</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 하단 카메라 버튼 */}
      <View
        className="absolute left-0 right-0 bg-black/70 p-4"
        style={{ bottom: 0, paddingBottom: insets.bottom + 12 }}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-4"
        >
          {[
            { label: "🟣 플라스틱", category: "plastic", color: "#FF6B6B" },
            { label: "🟤 종이", category: "paper", color: "#8B4513" },
            { label: "🔵 유리", category: "glass", color: "#45B7D1" },
            { label: "🟡 금속", category: "metal", color: "#FFD700" },
            { label: "⚪ 기타", category: "other", color: "#95E1D3" },
          ].map((item) => (
            <Pressable
              key={item.category}
              onPress={() => handleTakePhoto(item.category)}
              className="mr-3 px-4 py-3 rounded-full items-center"
              style={{ backgroundColor: item.color }}
            >
              <Text className="text-white font-bold text-sm">{item.label}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* 종료 버튼 */}
        <Pressable
          onPress={handleEndJogging}
          disabled={loading}
          className="bg-red-500 px-6 py-3 rounded-full items-center"
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">🛑 플로깅 종료</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}
