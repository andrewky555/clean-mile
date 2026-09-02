import AsyncStorage from "@react-native-async-storage/async-storage";

export type VerificationStatus = "verified" | "pending" | "unverified" | "rejected";

export interface PhotoMetadata {
  uri: string;
  timestamp: number;
  latitude: number;
  longitude: number;
  address?: string;
  userId: string;
}

export interface VerifiedHotspot {
  id: string;
  latitude: number;
  longitude: number;
  address?: string;
  status: VerificationStatus;
  confidence: number; // 0-100
  photoUri: string;
  photoMetadata: PhotoMetadata;
  createdAt: number;
  verifiedAt?: number;
  userId: string;
  trashType?: string;
}

const STORAGE_KEYS = {
  VERIFIED_HOTSPOTS: "cleanmile_verified_hotspots",
  PENDING_HOTSPOTS: "cleanmile_pending_hotspots",
};

// 사진 메타데이터 생성
export function createPhotoMetadata(
  uri: string,
  latitude: number,
  longitude: number,
  userId: string,
  address?: string
): PhotoMetadata {
  return {
    uri,
    timestamp: Date.now(),
    latitude,
    longitude,
    address,
    userId,
  };
}

// 핫스팟 검증 (Vision API 결과 기반)
export async function verifyHotspot(
  photoUri: string,
  latitude: number,
  longitude: number,
  userId: string,
  visionResult: {
    category: string;
    confidence: number;
    description: string;
  },
  address?: string
): Promise<VerifiedHotspot | null> {
  // 신뢰도 40% 이상만 인정
  if (visionResult.confidence < 0.4) {
    return null;
  }

  const hotspot: VerifiedHotspot = {
    id: `hotspot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    latitude,
    longitude,
    address,
    status: "verified",
    confidence: Math.round(visionResult.confidence * 100),
    photoUri,
    photoMetadata: createPhotoMetadata(photoUri, latitude, longitude, userId, address),
    createdAt: Date.now(),
    verifiedAt: Date.now(),
    userId,
    trashType: visionResult.category,
  };

  // 검증된 핫스팟 저장
  await saveVerifiedHotspot(hotspot);

  return hotspot;
}

// 검증된 핫스팟 저장
export async function saveVerifiedHotspot(hotspot: VerifiedHotspot): Promise<void> {
  const hotspots: Record<string, VerifiedHotspot> = JSON.parse(
    await AsyncStorage.getItem(STORAGE_KEYS.VERIFIED_HOTSPOTS) || "{}"
  );
  hotspots[hotspot.id] = hotspot;
  await AsyncStorage.setItem(STORAGE_KEYS.VERIFIED_HOTSPOTS, JSON.stringify(hotspots));
}

// 모든 검증된 핫스팟 조회
export async function getVerifiedHotspots(): Promise<VerifiedHotspot[]> {
  const hotspots: Record<string, VerifiedHotspot> = JSON.parse(
    await AsyncStorage.getItem(STORAGE_KEYS.VERIFIED_HOTSPOTS) || "{}"
  );
  return Object.values(hotspots);
}

// 지역별 검증된 핫스팟 조회
export async function getVerifiedHotspotsByRegion(
  minLat: number,
  maxLat: number,
  minLng: number,
  maxLng: number
): Promise<VerifiedHotspot[]> {
  const hotspots = await getVerifiedHotspots();
  return hotspots.filter(
    (h) => h.latitude >= minLat && h.latitude <= maxLat && h.longitude >= minLng && h.longitude <= maxLng
  );
}

// 특정 핫스팟 조회
export async function getHotspotById(id: string): Promise<VerifiedHotspot | null> {
  const hotspots: Record<string, VerifiedHotspot> = JSON.parse(
    await AsyncStorage.getItem(STORAGE_KEYS.VERIFIED_HOTSPOTS) || "{}"
  );
  return hotspots[id] || null;
}

// 사용자별 검증된 핫스팟 조회
export async function getUserVerifiedHotspots(userId: string): Promise<VerifiedHotspot[]> {
  const hotspots = await getVerifiedHotspots();
  return hotspots.filter((h) => h.userId === userId);
}

// 핫스팟 삭제
export async function deleteHotspot(id: string): Promise<void> {
  const hotspots: Record<string, VerifiedHotspot> = JSON.parse(
    await AsyncStorage.getItem(STORAGE_KEYS.VERIFIED_HOTSPOTS) || "{}"
  );
  delete hotspots[id];
  await AsyncStorage.setItem(STORAGE_KEYS.VERIFIED_HOTSPOTS, JSON.stringify(hotspots));
}

// 신뢰도별 핫스팟 필터링
export async function getHotspotsByConfidence(minConfidence: number): Promise<VerifiedHotspot[]> {
  const hotspots = await getVerifiedHotspots();
  return hotspots.filter((h) => h.confidence >= minConfidence);
}

// 시간 범위별 핫스팟 조회
export async function getHotspotsByTimeRange(startTime: number, endTime: number): Promise<VerifiedHotspot[]> {
  const hotspots = await getVerifiedHotspots();
  return hotspots.filter((h) => h.createdAt >= startTime && h.createdAt <= endTime);
}

// 핫스팟 통계
export async function getHotspotStats(): Promise<{
  total: number;
  byType: Record<string, number>;
  avgConfidence: number;
  recentCount: number; // 최근 7일
}> {
  const hotspots = await getVerifiedHotspots();
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  const byType: Record<string, number> = {};
  let totalConfidence = 0;
  let recentCount = 0;

  hotspots.forEach((h) => {
    if (h.trashType) {
      byType[h.trashType] = (byType[h.trashType] || 0) + 1;
    }
    totalConfidence += h.confidence;
    if (h.createdAt >= sevenDaysAgo) {
      recentCount++;
    }
  });

  return {
    total: hotspots.length,
    byType,
    avgConfidence: hotspots.length > 0 ? Math.round(totalConfidence / hotspots.length) : 0,
    recentCount,
  };
}

// 지도 마커 색상 결정 (신뢰도 기반)
export function getMarkerColor(confidence: number): string {
  if (confidence >= 80) return "#22C55E"; // 초록색 (높음)
  if (confidence >= 60) return "#FBBF24"; // 노란색 (중간)
  return "#EF4444"; // 빨간색 (낮음)
}

// 신뢰도 레이블
export function getConfidenceLabel(confidence: number): string {
  if (confidence >= 80) return "높음";
  if (confidence >= 60) return "중간";
  return "낮음";
}
