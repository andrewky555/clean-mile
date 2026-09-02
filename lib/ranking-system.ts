import AsyncStorage from "@react-native-async-storage/async-storage";
import { addPoints } from "./store";

export interface RankingUser {
  id: string;
  nickname: string;
  points: number;
  rank: number;
  badge: string;
  lastActivityTime: number;
}

export interface RankingPeriod {
  period: "weekly" | "monthly";
  users: RankingUser[];
  generatedAt: number;
}

const KEYS = {
  USERS: "cleanmile_users",
  WEEKLY_RANKING: "cleanmile_weekly_ranking",
  MONTHLY_RANKING: "cleanmile_monthly_ranking",
  USER_POINTS_HISTORY: "cleanmile_user_points_history",
};

// 사용자 ID (로컬 테스트용)
export async function getOrCreateUserId(): Promise<string> {
  let userId = await AsyncStorage.getItem("cleanmile_user_id");
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await AsyncStorage.setItem("cleanmile_user_id", userId);
  }
  return userId;
}

// 사용자 정보 저장
export async function saveUserProfile(nickname: string): Promise<void> {
  const userId = await getOrCreateUserId();
  const users: Record<string, any> = JSON.parse(await AsyncStorage.getItem(KEYS.USERS) || "{}");
  users[userId] = { id: userId, nickname, createdAt: Date.now() };
  await AsyncStorage.setItem(KEYS.USERS, JSON.stringify(users));
}

// 사용자 닉네임 조회
export async function getUserNickname(): Promise<string> {
  const userId = await getOrCreateUserId();
  const users: Record<string, any> = JSON.parse(await AsyncStorage.getItem(KEYS.USERS) || "{}");
  return users[userId]?.nickname || `사용자_${userId.substr(0, 6)}`;
}

// 사용자 포인트 조회
export async function getUserPoints(): Promise<number> {
  const userId = await getOrCreateUserId();
  const pointsData: Record<string, number> = JSON.parse(await AsyncStorage.getItem("cleanmile_user_points") || "{}");
  return pointsData[userId] || 0;
}

// 모든 사용자 포인트 조회 (랭킹 계산용)
export async function getAllUsersPoints(): Promise<Record<string, number>> {
  return JSON.parse(await AsyncStorage.getItem("cleanmile_user_points") || "{}");
}

// 랭킹 계산 (주간/월간) - 실제 사용자만 표시
export async function calculateRanking(period: "weekly" | "monthly"): Promise<RankingUser[]> {
  const userId = await getOrCreateUserId();
  const nickname = await getUserNickname();
  const allPoints = await getAllUsersPoints();

  // 실제 사용자 데이터만 사용
  const users: Record<string, any> = JSON.parse(await AsyncStorage.getItem(KEYS.USERS) || "{}");
  
  // 모든 사용자를 RankingUser로 변환
  const rankingUsers: RankingUser[] = Object.values(users).map((user: any) => ({
    id: user.id,
    nickname: user.nickname,
    points: allPoints[user.id] || 0,
    rank: 0,
    badge: "🌱",
    lastActivityTime: user.createdAt,
  }));

  // 포인트 기준 정렬
  rankingUsers.sort((a, b) => b.points - a.points);
  rankingUsers.forEach((user, idx) => {
    user.rank = idx + 1;
    // 상위 3명에게 뱃지 할당
    if (idx === 0) user.badge = "🏆";
    else if (idx === 1) user.badge = "🥈";
    else if (idx === 2) user.badge = "🥉";
  });

  // 랭킹 저장
  const key = period === "weekly" ? KEYS.WEEKLY_RANKING : KEYS.MONTHLY_RANKING;
  await AsyncStorage.setItem(key, JSON.stringify({ period, users: rankingUsers, generatedAt: Date.now() }));

  return rankingUsers;
}

// 랭킹 조회
export async function getRanking(period: "weekly" | "monthly"): Promise<RankingUser[]> {
  const key = period === "weekly" ? KEYS.WEEKLY_RANKING : KEYS.MONTHLY_RANKING;
  const cached = await AsyncStorage.getItem(key);

  if (cached) {
    const data: RankingPeriod = JSON.parse(cached);
    // 1시간 이상 지났으면 재계산
    if (Date.now() - data.generatedAt > 3600000) {
      return calculateRanking(period);
    }
    return data.users;
  }

  return calculateRanking(period);
}

// 내 순위 조회
export async function getMyRank(period: "weekly" | "monthly"): Promise<RankingUser | null> {
  const userId = await getOrCreateUserId();
  const ranking = await getRanking(period);
  return ranking.find((u) => u.id === userId) || null;
}

// 상위 3명 포디움
export async function getPodium(period: "weekly" | "monthly"): Promise<RankingUser[]> {
  const ranking = await getRanking(period);
  return ranking.slice(0, 3);
}
