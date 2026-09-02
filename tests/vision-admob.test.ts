import { describe, it, expect } from "vitest";
import { ADMOB_CONFIG, shouldShowAd, shouldShowAdAfterPoints } from "../lib/admob-service";

describe("AdMob Configuration & Ad Display Logic", () => {
  it("AdMob 설정이 올바르게 로드되어야 함", () => {
    expect(ADMOB_CONFIG.appId).toBe("ca-app-pub-8867064714065372~7735207715");
    expect(ADMOB_CONFIG.bannerAdId).toBe("ca-app-pub-8867064714065372/2873763275");
    expect(ADMOB_CONFIG.interstitialAdId).toBe("ca-app-pub-8867064714065372/4957001135");
  });

  it("광고 표시 여부를 결정할 수 있어야 함", () => {
    const lastAdTime = Date.now() - 120000; // 2분 전
    const adsShownToday = 5;
    const result = shouldShowAd(lastAdTime, adsShownToday);
    expect(typeof result).toBe("boolean");
  });

  it("포인트 획득 후 광고 표시 확률이 30%여야 함", () => {
    // 여러 번 호출하여 확률 검증
    let showCount = 0;
    for (let i = 0; i < 100; i++) {
      if (shouldShowAdAfterPoints()) {
        showCount++;
      }
    }
    // 30% ± 20% 범위 (테스트 안정성)
    expect(showCount).toBeGreaterThan(10);
    expect(showCount).toBeLessThan(50);
  });

  it("최소 광고 간격 제한이 작동해야 함", () => {
    const lastAdTime = Date.now() - 30000; // 30초 전 (최소 60초 필요)
    const adsShownToday = 5;
    const result = shouldShowAd(lastAdTime, adsShownToday);
    expect(result).toBe(false);
  });

  it("하루 최대 광고 횟수 제한이 작동해야 함", () => {
    const lastAdTime = Date.now() - 120000; // 2분 전 (충분함)
    const adsShownToday = 20; // 최대값
    const result = shouldShowAd(lastAdTime, adsShownToday);
    expect(result).toBe(false);
  });
});
