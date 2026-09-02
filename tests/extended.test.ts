import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Mock AsyncStorage with fresh state for each test
const mockStorage: Record<string, string> = {};

vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: vi.fn((key: string) => Promise.resolve(mockStorage[key] || null)),
    setItem: vi.fn((key: string, value: string) => {
      mockStorage[key] = value;
      return Promise.resolve();
    }),
  },
}));

import { recordPickup, getPickupEligibility, getShopItems, getAds } from "../lib/store-extended";

describe("포인트 상점", () => {
  it("상점 아이템 로드", async () => {
    const items = await getShopItems();
    expect(items.length).toBeGreaterThan(0);
    expect(items[0]).toHaveProperty("name");
    expect(items[0]).toHaveProperty("price");
    expect(items[0]).toHaveProperty("category");
  });

  it("상점 아이템 카테고리 확인", async () => {
    const items = await getShopItems();
    const categories = new Set(items.map((i) => i.category));
    expect(categories.has("food")).toBe(true);
    expect(categories.has("coupon")).toBe(true);
  });

  it("커피 가격 확인 (10,000P)", async () => {
    const items = await getShopItems();
    const coffee = items.find((i) => i.name.includes("아메리카노"));
    expect(coffee?.price).toBe(10000);
  });

  it("GS 쿠폰 가격 확인 (6,000P)", async () => {
    const items = await getShopItems();
    const coupon = items.find((i) => i.name.includes("3,000원"));
    expect(coupon?.price).toBe(6000);
  });
});

describe("광고 시스템", () => {
  it("광고 로드", async () => {
    const ads = await getAds();
    expect(ads.length).toBeGreaterThan(0);
    expect(ads[0]).toHaveProperty("id");
    expect(ads[0]).toHaveProperty("title");
  });

  it("광고 활성 상태 확인", async () => {
    const ads = await getAds();
    const activeAds = ads.filter((a) => a.active);
    expect(activeAds.length).toBeGreaterThan(0);
  });
});

describe("일일 제한", () => {
  beforeEach(() => {
    Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 14, 10, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("첫 번째 줍기 허용", async () => {
    const result = await recordPickup(37.5495, 126.8505);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
    expect(result.used).toBe(1);
  });

  it("30분 전에는 다시 찍을 수 없다", async () => {
    await recordPickup(37.5495, 126.8505);
    vi.setSystemTime(new Date(2026, 7, 14, 10, 29, 0));
    const tooSoon = await recordPickup(37.56, 126.86);
    expect(tooSoon.allowed).toBe(false);
    expect(tooSoon.remaining).toBe(2);
    expect(tooSoon.cooldownMs).toBeGreaterThan(0);
  });

  it("30분이 지나면 두 번째 줍기를 허용한다", async () => {
    await recordPickup(37.5495, 126.8505);
    vi.setSystemTime(new Date(2026, 7, 14, 10, 30, 0));
    const result = await recordPickup(37.56, 126.86);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(1);
  });

  it("3회 제한 도달 후 거부", async () => {
    await recordPickup(37.5495, 126.8505);
    vi.setSystemTime(new Date(2026, 7, 14, 10, 30, 0));
    await recordPickup(37.56, 126.86);
    vi.setSystemTime(new Date(2026, 7, 14, 11, 0, 0));
    await recordPickup(37.57, 126.87);
    const result = await recordPickup(37.58, 126.88);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("촬영 전 자격 조회는 횟수를 소모하지 않는다", async () => {
    const before = await getPickupEligibility();
    expect(before.allowed).toBe(true);
    expect(before.used).toBe(0);
    const again = await getPickupEligibility();
    expect(again.used).toBe(0);
  });
});
