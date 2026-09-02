// 동 단위 랭킹 시스템
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface DongInfo {
  id: string;
  name: string;
  gu: string; // 구명
  lat: number;
  lng: number;
}

export interface UserRankingData {
  userId: string;
  username: string;
  points: number;
  monthlyPoints: number; // 이번 달 포인트
  rank: number;
  dong: string; // 동 ID
  joinedAt: number;
}

export interface DongRankingResult {
  month: string; // "2026-06"
  dong: DongInfo;
  rankings: UserRankingData[];
  updated: number;
}

// 40개 동 데이터
export const DONG_LIST: DongInfo[] = [
  // 강서구 (8개)
  { id: "dong_001", name: "화곡동", gu: "강서구", lat: 37.5495, lng: 126.8505 },
  { id: "dong_002", name: "등촌동", gu: "강서구", lat: 37.5420, lng: 126.8620 },
  { id: "dong_003", name: "마곡동", gu: "강서구", lat: 37.5680, lng: 126.8350 },
  { id: "dong_004", name: "방화동", gu: "강서구", lat: 37.5280, lng: 126.8200 },
  { id: "dong_005", name: "공항동", gu: "강서구", lat: 37.5550, lng: 126.8750 },
  { id: "dong_006", name: "발산동", gu: "강서구", lat: 37.5380, lng: 126.8450 },
  { id: "dong_007", name: "내발산동", gu: "강서구", lat: 37.5620, lng: 126.8580 },
  { id: "dong_008", name: "염창동", gu: "강서구", lat: 37.5720, lng: 126.8200 },

  // 동작구 (8개)
  { id: "dong_101", name: "노량진동", gu: "동작구", lat: 37.5150, lng: 126.9650 },
  { id: "dong_102", name: "흑석동", gu: "동작구", lat: 37.5080, lng: 126.9720 },
  { id: "dong_103", name: "신대방동", gu: "동작구", lat: 37.4950, lng: 126.9580 },
  { id: "dong_104", name: "사당동", gu: "동작구", lat: 37.4850, lng: 126.9820 },
  { id: "dong_105", name: "대방동", gu: "동작구", lat: 37.5020, lng: 126.9450 },
  { id: "dong_106", name: "본동", gu: "동작구", lat: 37.5250, lng: 126.9550 },
  { id: "dong_107", name: "이촌동", gu: "동작구", lat: 37.5380, lng: 126.9680 },
  { id: "dong_108", name: "상도동", gu: "동작구", lat: 37.4920, lng: 126.9680 },

  // 강남구 (8개)
  { id: "dong_201", name: "강남동", gu: "강남구", lat: 37.4979, lng: 127.0276 },
  { id: "dong_202", name: "역삼동", gu: "강남구", lat: 37.5050, lng: 127.0350 },
  { id: "dong_203", name: "삼성동", gu: "강남구", lat: 37.5150, lng: 127.0550 },
  { id: "dong_204", name: "압구정동", gu: "강남구", lat: 37.5270, lng: 127.0180 },
  { id: "dong_205", name: "신사동", gu: "강남구", lat: 37.5320, lng: 127.0250 },
  { id: "dong_206", name: "논현동", gu: "강남구", lat: 37.5080, lng: 127.0180 },
  { id: "dong_207", name: "청담동", gu: "강남구", lat: 37.5420, lng: 127.0420 },
  { id: "dong_208", name: "대치동", gu: "강남구", lat: 37.4850, lng: 127.0650 },

  // 강동구 (8개)
  { id: "dong_301", name: "성내동", gu: "강동구", lat: 37.5280, lng: 127.1450 },
  { id: "dong_302", name: "천호동", gu: "강동구", lat: 37.5380, lng: 127.1280 },
  { id: "dong_303", name: "길동", gu: "강동구", lat: 37.5150, lng: 127.1350 },
  { id: "dong_304", name: "암사동", gu: "강동구", lat: 37.5420, lng: 127.1580 },
  { id: "dong_305", name: "고덕동", gu: "강동구", lat: 37.5050, lng: 127.1620 },
  { id: "dong_306", name: "명일동", gu: "강동구", lat: 37.5280, lng: 127.1180 },
  { id: "dong_307", name: "강일동", gu: "강동구", lat: 37.5520, lng: 127.1450 },
  { id: "dong_308", name: "둔촌동", gu: "강동구", lat: 37.4950, lng: 127.1280 },

  // 서초구 (8개)
  { id: "dong_401", name: "서초동", gu: "서초구", lat: 37.4950, lng: 127.0070 },
  { id: "dong_402", name: "반포동", gu: "서초구", lat: 37.4880, lng: 127.0150 },
  { id: "dong_403", name: "방배동", gu: "서초구", lat: 37.5080, lng: 126.9950 },
  { id: "dong_404", name: "양재동", gu: "서초구", lat: 37.4750, lng: 127.0050 },
  { id: "dong_405", name: "잠원동", gu: "서초구", lat: 37.4650, lng: 127.0280 },
  { id: "dong_406", name: "신반포", gu: "서초구", lat: 37.5150, lng: 126.9850 },
  { id: "dong_407", name: "우면동", gu: "서초구", lat: 37.4820, lng: 127.0280 },
  { id: "dong_408", name: "원지동", gu: "서초구", lat: 37.5020, lng: 126.9750 },
];

// 사용자 위치 기반 동 자동 분류
export function getDongByLocation(lat: number, lng: number): DongInfo | null {
  let closestDong: DongInfo | null = null;
  let minDistance = Infinity;

  DONG_LIST.forEach((dong) => {
    const distance = calculateDistance(lat, lng, dong.lat, dong.lng);
    if (distance < minDistance) {
      minDistance = distance;
      closestDong = dong;
    }
  });

  // 2km 이내만 인정
  return minDistance <= 2 ? closestDong : null;
}

// 거리 계산 (Haversine)
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// 월간 랭킹 포인트 지급
export const RANKING_POINTS: Record<number, number> = {
  1: 50,
  2: 30,
  3: 20,
  4: 10,
  5: 10,
  6: 10,
  7: 10,
  8: 10,
  9: 10,
  10: 10,
};

// 현재 월 문자열 (YYYY-MM)
export function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

// 동 별 월간 랭킹 계산
export function calculateDongRanking(
  users: UserRankingData[],
  dong: DongInfo,
  month: string
): UserRankingData[] {
  // 해당 동의 사용자만 필터링
  const dongUsers = users.filter((u) => u.dong === dong.id);

  // 월간 포인트 기준 정렬
  const sorted = dongUsers.sort((a, b) => b.monthlyPoints - a.monthlyPoints);

  // 순위 할당
  return sorted.map((user, index) => ({
    ...user,
    rank: index + 1,
  }));
}

// 모든 동의 월간 랭킹 계산
export function calculateAllDongRankings(
  users: UserRankingData[],
  month: string
): DongRankingResult[] {
  return DONG_LIST.map((dong) => ({
    month,
    dong,
    rankings: calculateDongRanking(users, dong, month),
    updated: Date.now(),
  }));
}

// 랭킹 포인트 자동 지급
export function awardRankingPoints(ranking: UserRankingData[]): { userId: string; points: number }[] {
  return ranking.map((user) => ({
    userId: user.userId,
    points: RANKING_POINTS[user.rank] || 0,
  }));
}

// 동 정보 조회
export function getDongInfo(dongId: string): DongInfo | undefined {
  return DONG_LIST.find((d) => d.id === dongId);
}

// 구별 동 목록
export function getDongsByGu(gu: string): DongInfo[] {
  return DONG_LIST.filter((d) => d.gu === gu);
}

// AsyncStorage 키
const STORAGE_KEYS = {
  USER_DONG: "cleanmile_user_dong",
  MONTHLY_RANKINGS: "cleanmile_monthly_rankings",
  RANKING_AWARDS: "cleanmile_ranking_awards",
};

// 사용자 동 저장
export async function saveUserDong(userId: string, dongId: string): Promise<void> {
  const data: Record<string, string> = JSON.parse(await AsyncStorage.getItem(STORAGE_KEYS.USER_DONG) || "{}");
  data[userId] = dongId;
  await AsyncStorage.setItem(STORAGE_KEYS.USER_DONG, JSON.stringify(data));
}

// 사용자 동 조회
export async function getUserDong(userId: string): Promise<string | null> {
  const data: Record<string, string> = JSON.parse(await AsyncStorage.getItem(STORAGE_KEYS.USER_DONG) || "{}");
  return data[userId] || null;
}

// 월간 랭킹 저장
export async function saveDongRankings(rankings: DongRankingResult[]): Promise<void> {
  const month = getCurrentMonth();
  const data: Record<string, DongRankingResult[]> = JSON.parse(
    await AsyncStorage.getItem(STORAGE_KEYS.MONTHLY_RANKINGS) || "{}"
  );
  data[month] = rankings;
  await AsyncStorage.setItem(STORAGE_KEYS.MONTHLY_RANKINGS, JSON.stringify(data));
}

// 월간 랭킹 조회
export async function getDongRankings(month?: string): Promise<DongRankingResult[]> {
  const targetMonth = month || getCurrentMonth();
  const data: Record<string, DongRankingResult[]> = JSON.parse(
    await AsyncStorage.getItem(STORAGE_KEYS.MONTHLY_RANKINGS) || "{}"
  );
  return data[targetMonth] || [];
}

// 특정 동의 월간 랭킹 조회
export async function getDongMonthlyRanking(dongId: string, month?: string): Promise<UserRankingData[]> {
  const rankings = await getDongRankings(month);
  const dongRanking = rankings.find((r) => r.dong.id === dongId);
  return dongRanking?.rankings || [];
}
