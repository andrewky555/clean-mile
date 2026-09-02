import AsyncStorage from "@react-native-async-storage/async-storage";

// 플로깅 세션
export interface JoggingSession {
  id: string;
  startTime: number;
  endTime?: number;
  startLat: number;
  startLng: number;
  endLat?: number;
  endLng?: number;
  distance: number; // km
  trashPhotos: TrashPhoto[];
  totalPoints: number;
  status: "active" | "completed";
}

// 쓰레기 사진
export interface TrashPhoto {
  id: string;
  timestamp: number;
  lat: number;
  lng: number;
  category: "plastic" | "paper" | "glass" | "metal" | "other";
  points: number;
  imageUri?: string;
}

// 플로깅 통계
export interface JoggingStats {
  totalSessions: number;
  totalDistance: number;
  totalTrashPhotos: number;
  totalPoints: number;
  longestSession: number;
  averageTrashPerKm: number;
}

const KEYS = {
  CURRENT_SESSION: "cleanmile_current_jogging_session",
  COMPLETED_SESSIONS: "cleanmile_completed_jogging_sessions",
  JOGGING_STATS: "cleanmile_jogging_stats",
};

// 플로깅 세션 시작
export async function startJoggingSession(
  startLat: number,
  startLng: number
): Promise<JoggingSession> {
  const sessionId = `jog_${Date.now()}`;
  const session: JoggingSession = {
    id: sessionId,
    startTime: Date.now(),
    startLat,
    startLng,
    distance: 0,
    trashPhotos: [],
    totalPoints: 0,
    status: "active",
  };

  await AsyncStorage.setItem(KEYS.CURRENT_SESSION, JSON.stringify(session));
  return session;
}

// 현재 플로깅 세션 조회
export async function getCurrentJoggingSession(): Promise<JoggingSession | null> {
  const data = await AsyncStorage.getItem(KEYS.CURRENT_SESSION);
  return data ? JSON.parse(data) : null;
}

// 플로깅 중 쓰레기 사진 추가
export async function addTrashPhotoToSession(
  lat: number,
  lng: number,
  category: "plastic" | "paper" | "glass" | "metal" | "other",
  imageUri?: string
): Promise<TrashPhoto | null> {
  const session = await getCurrentJoggingSession();
  if (!session || session.status !== "active") {
    return null;
  }

  const photoId = `photo_${Date.now()}`;
  const points = getTrashPoints(category);

  const photo: TrashPhoto = {
    id: photoId,
    timestamp: Date.now(),
    lat,
    lng,
    category,
    points,
    imageUri,
  };

  session.trashPhotos.push(photo);
  session.totalPoints += points;

  await AsyncStorage.setItem(KEYS.CURRENT_SESSION, JSON.stringify(session));
  return photo;
}

// 카테고리별 포인트
function getTrashPoints(category: string): number {
  const points: Record<string, number> = {
    glass: 20,
    metal: 20,
    plastic: 10,
    paper: 10,
    other: 10,
  };
  return points[category] || 10;
}

// 플로깅 거리 업데이트
export async function updateJoggingDistance(
  currentLat: number,
  currentLng: number
): Promise<number> {
  const session = await getCurrentJoggingSession();
  if (!session || session.status !== "active") {
    return 0;
  }

  // 마지막 위치 (또는 시작 위치)
  const lastLat = session.trashPhotos.length > 0
    ? session.trashPhotos[session.trashPhotos.length - 1].lat
    : session.startLat;
  const lastLng = session.trashPhotos.length > 0
    ? session.trashPhotos[session.trashPhotos.length - 1].lng
    : session.startLng;

  // Haversine 공식으로 거리 계산
  const distance = calculateDistance(lastLat, lastLng, currentLat, currentLng);
  session.distance += distance;

  await AsyncStorage.setItem(KEYS.CURRENT_SESSION, JSON.stringify(session));
  return session.distance;
}

// Haversine 공식 (두 좌표 간 거리 계산)
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // 지구 반지름 (km)
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// 플로깅 세션 종료
export async function endJoggingSession(
  endLat: number,
  endLng: number
): Promise<{ session: JoggingSession; distancePoints: number; totalPoints: number }> {
  const session = await getCurrentJoggingSession();
  if (!session || session.status !== "active") {
    return { session: null as any, distancePoints: 0, totalPoints: 0 };
  }

  // 최종 거리 업데이트
  const finalDistance = await updateJoggingDistance(endLat, endLng);

  // 거리 기반 포인트 (1km당 10P)
  const distancePoints = Math.floor(finalDistance * 10);

  // 속력 검증 (20km/h 초과 시 포인트 미지급)
  const duration = (Date.now() - session.startTime) / 1000 / 3600; // 시간
  const speed = finalDistance / duration;
  const isValidSpeed = speed <= 20;

  session.endTime = Date.now();
  session.endLat = endLat;
  session.endLng = endLng;
  session.status = "completed";

  // 포인트 계산
  let totalPoints = session.totalPoints; // 쓰레기 사진 포인트
  if (isValidSpeed) {
    totalPoints += distancePoints; // 거리 포인트 (속력 검증 통과)
  }

  session.totalPoints = totalPoints;

  // 완료된 세션 저장
  const completedSessions = await getCompletedSessions();
  completedSessions.push(session);
  await AsyncStorage.setItem(KEYS.COMPLETED_SESSIONS, JSON.stringify(completedSessions));

  // 통계 업데이트
  await updateJoggingStats(session, distancePoints);

  // 현재 세션 삭제
  await AsyncStorage.removeItem(KEYS.CURRENT_SESSION);

  return { session, distancePoints: isValidSpeed ? distancePoints : 0, totalPoints };
}

// 완료된 플로깅 세션 조회
export async function getCompletedSessions(): Promise<JoggingSession[]> {
  const data = await AsyncStorage.getItem(KEYS.COMPLETED_SESSIONS);
  return data ? JSON.parse(data) : [];
}

// 플로깅 통계 조회
export async function getJoggingStats(): Promise<JoggingStats> {
  const data = await AsyncStorage.getItem(KEYS.JOGGING_STATS);
  if (!data) {
    return {
      totalSessions: 0,
      totalDistance: 0,
      totalTrashPhotos: 0,
      totalPoints: 0,
      longestSession: 0,
      averageTrashPerKm: 0,
    };
  }
  return JSON.parse(data);
}

// 플로깅 통계 업데이트
async function updateJoggingStats(
  session: JoggingSession,
  distancePoints: number
): Promise<void> {
  const stats = await getJoggingStats();

  stats.totalSessions += 1;
  stats.totalDistance += session.distance;
  stats.totalTrashPhotos += session.trashPhotos.length;
  stats.totalPoints += session.totalPoints;
  stats.longestSession = Math.max(stats.longestSession, session.distance);
  stats.averageTrashPerKm =
    stats.totalDistance > 0 ? stats.totalTrashPhotos / stats.totalDistance : 0;

  await AsyncStorage.setItem(KEYS.JOGGING_STATS, JSON.stringify(stats));
}

// 플로깅 세션 취소
export async function cancelJoggingSession(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.CURRENT_SESSION);
}
