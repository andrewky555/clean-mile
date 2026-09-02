/**
 * Google AdMob 광고 서비스
 * 배너 광고와 전면 광고를 관리합니다.
 */

export const ADMOB_CONFIG = {
  appId: "ca-app-pub-8867064714065372~7735207715",
  bannerAdId: "ca-app-pub-8867064714065372/2873763275",
  interstitialAdId: "ca-app-pub-8867064714065372/4957001135",
};

/**
 * AdMob 배너 광고 설정
 */
export const BannerAdConfig = {
  adUnitId: ADMOB_CONFIG.bannerAdId,
  size: "BANNER", // 320x50
  requestOptions: {
    keywords: ["environment", "cleanup", "trash", "recycling"],
    contentUrl: "https://cleanmile.app",
    npa: "0", // 개인화 광고 허용
  },
};

/**
 * AdMob 전면 광고 설정
 */
export const InterstitialAdConfig = {
  adUnitId: ADMOB_CONFIG.interstitialAdId,
  requestOptions: {
    keywords: ["environment", "cleanup", "trash", "recycling"],
    contentUrl: "https://cleanmile.app",
    npa: "0",
  },
};

/**
 * 광고 표시 시점 관리
 */
export const AdDisplayTiming = {
  // 포인트 획득 후 광고 표시 확률 (0-1)
  showAdAfterPointsChance: 0.3, // 30% 확률

  // 앱 열기 후 광고 표시 확률
  showAdOnAppOpenChance: 0.2, // 20% 확률

  // 광고 최소 표시 간격 (밀리초)
  minAdIntervalMs: 60000, // 1분

  // 하루 최대 광고 표시 횟수
  maxAdsPerDay: 20,
};

/**
 * 광고 수익 추적
 */
export interface AdRevenueData {
  adUnitId: string;
  adFormat: "banner" | "interstitial";
  impressions: number;
  clicks: number;
  revenue: number; // USD
  timestamp: number;
}

/**
 * 광고 표시 여부 결정
 */
export function shouldShowAd(
  lastAdTime: number,
  adsShownToday: number
): boolean {
  const now = Date.now();
  const timeSinceLastAd = now - lastAdTime;

  // 최소 간격 확인
  if (timeSinceLastAd < AdDisplayTiming.minAdIntervalMs) {
    return false;
  }

  // 하루 최대 횟수 확인
  if (adsShownToday >= AdDisplayTiming.maxAdsPerDay) {
    return false;
  }

  return true;
}

/**
 * 포인트 획득 후 광고 표시 여부
 */
export function shouldShowAdAfterPoints(): boolean {
  return Math.random() < AdDisplayTiming.showAdAfterPointsChance;
}

/**
 * 앱 열기 후 광고 표시 여부
 */
export function shouldShowAdOnAppOpen(): boolean {
  return Math.random() < AdDisplayTiming.showAdOnAppOpenChance;
}
