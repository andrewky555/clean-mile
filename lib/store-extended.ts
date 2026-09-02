import AsyncStorage from "@react-native-async-storage/async-storage";

// --- 광고 시스템 ---
export interface Ad {
  id: string;
  title: string;
  description: string;
  bonus: number; // 추가 포인트
  icon: string;
  active: boolean;
}

export interface AdImpression {
  adId: string;
  timestamp: number;
  clicked: boolean;
}

const KEYS = {
  ADS: "cleanmile_ads",
  AD_IMPRESSIONS: "cleanmile_ad_impressions",
  SHOP_ITEMS: "cleanmile_shop_items",
  PURCHASES: "cleanmile_purchases",
  DAILY_ACTIVITY: "cleanmile_daily_activity",
  JOGGING_SESSIONS: "cleanmile_jogging_sessions",
};

// --- 광고 ---
export async function getAds(): Promise<Ad[]> {
  const val = await AsyncStorage.getItem(KEYS.ADS);
  if (val) return JSON.parse(val);
  const defaults: Ad[] = [
    { id: "ad1", title: "포인트 2배 받기", description: "지금 쓰레기를 주우면 포인트 2배!", bonus: 0, icon: "🎁", active: true },
    { id: "ad2", title: "커피 쿠폰 받기", description: "GS25 아메리카노 쿠폰", bonus: 0, icon: "☕", active: true },
    { id: "ad3", title: "플로깅 보너스", description: "1km 플로깅 시 +50P", bonus: 50, icon: "🏃", active: true },
  ];
  await AsyncStorage.setItem(KEYS.ADS, JSON.stringify(defaults));
  return defaults;
}

export async function recordAdImpression(adId: string, clicked: boolean): Promise<void> {
  const impressions: AdImpression[] = JSON.parse(await AsyncStorage.getItem(KEYS.AD_IMPRESSIONS) || "[]");
  impressions.push({ adId, timestamp: Date.now(), clicked });
  const trimmed = impressions.slice(-1000);
  await AsyncStorage.setItem(KEYS.AD_IMPRESSIONS, JSON.stringify(trimmed));
}

export async function getAdStats(): Promise<{ impressions: number; clicks: number; ctr: number }> {
  const impressions: AdImpression[] = JSON.parse(await AsyncStorage.getItem(KEYS.AD_IMPRESSIONS) || "[]");
  const clicks = impressions.filter((i) => i.clicked).length;
  const total = impressions.length;
  return { impressions: total, clicks, ctr: total > 0 ? (clicks / total) * 100 : 0 };
}

// --- 포인트 상점 ---
export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number; // 포인트
  icon: string;
  imageUrl?: string; // 상품 이미지 URL
  category: "food" | "coupon" | "experience";
}

export interface Purchase {
  id: string;
  itemId: string;
  timestamp: number;
  pointsSpent: number;
}

export async function getShopItems(): Promise<ShopItem[]> {
  const val = await AsyncStorage.getItem(KEYS.SHOP_ITEMS);
  if (val) return JSON.parse(val);
  const defaults: ShopItem[] = [
    { id: "item1", name: "GS25 아메리카노", description: "따뜻한 아메리카노 한잔", price: 10000, icon: "☕", imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663727610435/YAQUq9hf5kCEP56QHLSJa4/coffee-americano-3GNFpk4pJm3dkzcSYcNKUQ.webp", category: "food" },
    { id: "item2", name: "GS25 3,000원 쿠폰", description: "GS25에서 사용 가능", price: 6000, icon: "🎫", imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663727610435/YAQUq9hf5kCEP56QHLSJa4/gs25-coupon-XMizxrAwnodwrc7wnwhFAP.webp", category: "coupon" },
    { id: "item3", name: "편의점 도시락", description: "편의점 도시락 1개", price: 8000, icon: "🍱", imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663727610435/YAQUq9hf5kCEP56QHLSJa4/convenience-store-meal-CDdfMy5cxBynWwbq9joWAG.webp", category: "food" },
    { id: "item4", name: "영화 티켓", description: "영화관 입장권 1장", price: 15000, icon: "🎬", imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663727610435/YAQUq9hf5kCEP56QHLSJa4/movie-ticket-KHdPeooA6gYvoh2ko87pBb.webp", category: "experience" },
    { id: "item5", name: "카페 음료권", description: "카페 음료 1잔", price: 5000, icon: "🧋", imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663727610435/YAQUq9hf5kCEP56QHLSJa4/cafe-beverage-KymkaP7UobCwYMQByTHxcq.webp", category: "food" },
    { id: "item6", name: "편의점 기프트카드", description: "5,000원 상당", price: 5000, icon: "💳", imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663727610435/YAQUq9hf5kCEP56QHLSJa4/gift-card-gkETYQU6aMED25u6YwAZKz.webp", category: "coupon" },
  ];
  await AsyncStorage.setItem(KEYS.SHOP_ITEMS, JSON.stringify(defaults));
  return defaults;
}

export async function purchaseItem(itemId: string, pointsSpent: number): Promise<void> {
  const purchases: Purchase[] = JSON.parse(await AsyncStorage.getItem(KEYS.PURCHASES) || "[]");
  purchases.push({ id: Date.now().toString(), itemId, timestamp: Date.now(), pointsSpent });
  await AsyncStorage.setItem(KEYS.PURCHASES, JSON.stringify(purchases));
}

export async function getPurchaseHistory(): Promise<Purchase[]> {
  const val = await AsyncStorage.getItem(KEYS.PURCHASES);
  return val ? JSON.parse(val) : [];
}

// --- 일일 활동 제한 ---
export const DAILY_PICKUP_LIMIT = 3;
export const PICKUP_COOLDOWN_MS = 30 * 60 * 1000;

export interface DailyActivity {
  date: string;
  pickupCount: number;
  pickupLocations: Array<{ lat: number; lng: number; timestamp: number }>;
}

export interface PickupEligibility {
  allowed: boolean;
  remaining: number;
  used: number;
  cooldownMs: number;
  nextAvailableAt: number | null;
  reason?: string;
}

export function localDateKey(now = Date.now()): string {
  const d = new Date(now);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export async function getTodayActivity(): Promise<DailyActivity> {
  const today = localDateKey();
  const val = await AsyncStorage.getItem(KEYS.DAILY_ACTIVITY);
  if (val) {
    const activity = JSON.parse(val) as DailyActivity;
    if (activity.date === today) return activity;
  }
  return { date: today, pickupCount: 0, pickupLocations: [] };
}

export async function getPickupEligibility(now = Date.now()): Promise<PickupEligibility> {
  const activity = await getTodayActivity();
  const remaining = Math.max(0, DAILY_PICKUP_LIMIT - activity.pickupCount);

  if (activity.pickupCount >= DAILY_PICKUP_LIMIT) {
    return {
      allowed: false,
      remaining: 0,
      used: activity.pickupCount,
      cooldownMs: 0,
      nextAvailableAt: null,
      reason: "오늘 쓰레기 줍기 3회를 모두 사용했습니다. 내일 다시 시도해주세요.",
    };
  }

  const last = activity.pickupLocations[activity.pickupLocations.length - 1];
  if (last) {
    const elapsed = now - last.timestamp;
    if (elapsed < PICKUP_COOLDOWN_MS) {
      const cooldownMs = PICKUP_COOLDOWN_MS - elapsed;
      return {
        allowed: false,
        remaining,
        used: activity.pickupCount,
        cooldownMs,
        nextAvailableAt: last.timestamp + PICKUP_COOLDOWN_MS,
        reason: `다음 촬영까지 ${Math.ceil(cooldownMs / 60000)}분 남았습니다. 30분 간격으로 하루 3회까지 가능합니다.`,
      };
    }
  }

  return {
    allowed: true,
    remaining,
    used: activity.pickupCount,
    cooldownMs: 0,
    nextAvailableAt: null,
  };
}

export async function recordPickup(
  lat: number,
  lng: number
): Promise<PickupEligibility> {
  const check = await getPickupEligibility();
  if (!check.allowed) return check;

  const activity = await getTodayActivity();
  activity.pickupCount += 1;
  activity.pickupLocations.push({ lat, lng, timestamp: Date.now() });
  await AsyncStorage.setItem(KEYS.DAILY_ACTIVITY, JSON.stringify(activity));

  return {
    allowed: true,
    remaining: Math.max(0, DAILY_PICKUP_LIMIT - activity.pickupCount),
    used: activity.pickupCount,
    cooldownMs: PICKUP_COOLDOWN_MS,
    nextAvailableAt: Date.now() + PICKUP_COOLDOWN_MS,
  };
}

// --- 플로깅 ---
export interface JoggingSession {
  id: string;
  startTime: number;
  endTime: number;
  distance: number; // km
  maxSpeed: number; // km/h
  points: number;
  valid: boolean; // 속력 초과 여부
}

export async function startJoggingSession(): Promise<string> {
  const sessionId = Date.now().toString();
  return sessionId;
}

export async function endJoggingSession(
  sessionId: string,
  distance: number,
  maxSpeed: number
): Promise<{ points: number; valid: boolean; reason?: string }> {
  const speedLimit = 20; // km/h (조깅 속력 제한)
  const valid = maxSpeed <= speedLimit;
  const points = valid ? Math.floor(distance * 10) : 0;

  const session: JoggingSession = {
    id: sessionId,
    startTime: parseInt(sessionId),
    endTime: Date.now(),
    distance,
    maxSpeed,
    points,
    valid,
  };

  const sessions: JoggingSession[] = JSON.parse(await AsyncStorage.getItem(KEYS.JOGGING_SESSIONS) || "[]");
  sessions.push(session);
  await AsyncStorage.setItem(KEYS.JOGGING_SESSIONS, JSON.stringify(sessions));

  return {
    points,
    valid,
    reason: !valid ? `속력 ${maxSpeed.toFixed(1)}km/h로 제한 속력 ${speedLimit}km/h를 초과했습니다. 포인트가 지급되지 않습니다.` : undefined,
  };
}

export async function getJoggingSessions(): Promise<JoggingSession[]> {
  const val = await AsyncStorage.getItem(KEYS.JOGGING_SESSIONS);
  return val ? JSON.parse(val) : [];
}
