import AsyncStorage from "@react-native-async-storage/async-storage";

// 일일 보상 시스템
export interface DailyReward {
  lastClaimedDate: string;
  claimedToday: boolean;
  totalClaimed: number;
}

// 연속 줍기 보너스
export interface StreakBonus {
  currentStreak: number;
  longestStreak: number;
  lastPickupDate: string;
}

// 친구 초대
export interface ReferralData {
  referralCode: string;
  referredBy?: string;
  referredCount: number;
  referralRewards: number;
}

// 주간 랭킹 경쟁
export interface WeeklyCompetition {
  weekStartDate: string;
  weekEndDate: string;
  pointsThisWeek: number;
  rank: number;
  rewards: number;
}

const KEYS = {
  DAILY_REWARD: "cleanmile_daily_reward",
  STREAK_BONUS: "cleanmile_streak_bonus",
  REFERRAL_DATA: "cleanmile_referral_data",
  WEEKLY_COMPETITION: "cleanmile_weekly_competition",
};

// 일일 보상 조회
export async function getDailyReward(): Promise<DailyReward> {
  const data = await AsyncStorage.getItem(KEYS.DAILY_REWARD);
  if (!data) {
    return {
      lastClaimedDate: "",
      claimedToday: false,
      totalClaimed: 0,
    };
  }
  return JSON.parse(data);
}

// 일일 보상 수령
export async function claimDailyReward(): Promise<number> {
  const reward = await getDailyReward();
  const today = new Date().toISOString().split("T")[0];

  if (reward.claimedToday && reward.lastClaimedDate === today) {
    return 0; // 이미 수령함
  }

  const newReward: DailyReward = {
    lastClaimedDate: today,
    claimedToday: true,
    totalClaimed: reward.totalClaimed + 1,
  };

  await AsyncStorage.setItem(KEYS.DAILY_REWARD, JSON.stringify(newReward));
  return 10; // 매일 10P
}

// 일일 보상 리셋 (자정)
export async function resetDailyReward(): Promise<void> {
  const reward = await getDailyReward();
  const today = new Date().toISOString().split("T")[0];

  if (reward.lastClaimedDate !== today) {
    reward.claimedToday = false;
  }

  await AsyncStorage.setItem(KEYS.DAILY_REWARD, JSON.stringify(reward));
}

// 연속 줍기 조회
export async function getStreakBonus(): Promise<StreakBonus> {
  const data = await AsyncStorage.getItem(KEYS.STREAK_BONUS);
  if (!data) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastPickupDate: "",
    };
  }
  return JSON.parse(data);
}

// 연속 줍기 업데이트
export async function updateStreakBonus(): Promise<{ bonusPoints: number; streak: number }> {
  const streak = await getStreakBonus();
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  let newStreak = streak.currentStreak;
  let bonusPoints = 0;

  if (streak.lastPickupDate === today) {
    return { bonusPoints: 0, streak: newStreak }; // 오늘 이미 줍기함
  }

  if (streak.lastPickupDate === yesterday) {
    newStreak += 1; // 연속 유지
  } else {
    newStreak = 1; // 새로 시작
  }

  // 보너스 계산
  if (newStreak === 7) bonusPoints = 1000;
  else if (newStreak === 14) bonusPoints = 2000;
  else if (newStreak === 30) bonusPoints = 5000;

  const longestStreak = Math.max(streak.longestStreak, newStreak);

  const newStreakData: StreakBonus = {
    currentStreak: newStreak,
    longestStreak,
    lastPickupDate: today,
  };

  await AsyncStorage.setItem(KEYS.STREAK_BONUS, JSON.stringify(newStreakData));
  return { bonusPoints, streak: newStreak };
}

// 연속 기록 초기화 (1일 미실행 시)
export async function checkAndResetStreak(): Promise<void> {
  const streak = await getStreakBonus();
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  // 어제나 오늘이 아닌 다른 날이면 초기화
  if (streak.lastPickupDate !== today && streak.lastPickupDate !== yesterday) {
    const resetData: StreakBonus = {
      currentStreak: 0,
      longestStreak: streak.longestStreak,
      lastPickupDate: "",
    };
    await AsyncStorage.setItem(KEYS.STREAK_BONUS, JSON.stringify(resetData));
  }
}

// 친구 초대 코드 생성
export async function generateReferralCode(): Promise<string> {
  const code = `CM${Date.now().toString(36).toUpperCase()}`;
  const referralData: ReferralData = {
    referralCode: code,
    referredCount: 0,
    referralRewards: 0,
  };
  await AsyncStorage.setItem(KEYS.REFERRAL_DATA, JSON.stringify(referralData));
  return code;
}

// 친구 초대 조회
export async function getReferralData(): Promise<ReferralData> {
  const data = await AsyncStorage.getItem(KEYS.REFERRAL_DATA);
  if (!data) {
    return {
      referralCode: await generateReferralCode(),
      referredCount: 0,
      referralRewards: 0,
    };
  }
  return JSON.parse(data);
}

// 친구 초대 수락
export async function acceptReferral(referralCode: string): Promise<number> {
  // 초대 수락자: 500P
  // 초대자: 500P (별도 처리)
  return 500;
}

// 친구 초대 기록
export async function recordReferral(): Promise<void> {
  const referralData = await getReferralData();
  referralData.referredCount += 1;
  referralData.referralRewards += 500;
  await AsyncStorage.setItem(KEYS.REFERRAL_DATA, JSON.stringify(referralData));
}

// 주간 랭킹 조회
export async function getWeeklyCompetition(): Promise<WeeklyCompetition> {
  const data = await AsyncStorage.getItem(KEYS.WEEKLY_COMPETITION);
  if (!data) {
    return {
      weekStartDate: getWeekStart(),
      weekEndDate: getWeekEnd(),
      pointsThisWeek: 0,
      rank: 0,
      rewards: 0,
    };
  }
  return JSON.parse(data);
}

// 주간 포인트 업데이트
export async function updateWeeklyPoints(points: number): Promise<void> {
  const competition = await getWeeklyCompetition();
  const today = new Date().toISOString().split("T")[0];
  const weekStart = getWeekStart();

  // 주가 바뀌었으면 초기화
  if (today < weekStart) {
    competition.pointsThisWeek = 0;
    competition.rank = 0;
    competition.rewards = 0;
    competition.weekStartDate = getWeekStart();
    competition.weekEndDate = getWeekEnd();
  }

  competition.pointsThisWeek += points;
  await AsyncStorage.setItem(KEYS.WEEKLY_COMPETITION, JSON.stringify(competition));
}

// 주간 랭킹 계산 (시뮬레이션)
export async function calculateWeeklyRank(): Promise<{ rank: number; rewards: number }> {
  const competition = await getWeeklyCompetition();

  // 시뮬레이션: 임의의 사용자들과 비교
  const mockUsers = [
    { points: 8500 },
    { points: 7200 },
    { points: 6800 },
    { points: 5400 },
    { points: 4200 },
    { points: competition.pointsThisWeek },
  ];

  mockUsers.sort((a, b) => b.points - a.points);
  const rank = mockUsers.findIndex((u) => u.points === competition.pointsThisWeek) + 1;

  let rewards = 0;
  if (rank === 1) rewards = 5000;
  else if (rank === 2) rewards = 3000;
  else if (rank === 3) rewards = 1000;

  competition.rank = rank;
  competition.rewards = rewards;
  await AsyncStorage.setItem(KEYS.WEEKLY_COMPETITION, JSON.stringify(competition));

  return { rank, rewards };
}

// 주 시작일 (월요일)
function getWeekStart(): string {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  return new Date(now.setDate(diff)).toISOString().split("T")[0];
}

// 주 종료일 (일요일)
function getWeekEnd(): string {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? 0 : 7);
  return new Date(now.setDate(diff)).toISOString().split("T")[0];
}
