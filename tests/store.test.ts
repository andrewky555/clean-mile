import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock AsyncStorage
vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: vi.fn().mockResolvedValue(null),
    setItem: vi.fn().mockResolvedValue(undefined),
    removeItem: vi.fn().mockResolvedValue(undefined),
  },
}));

import { getLevel } from "../lib/store";

describe("getLevel", () => {
  it("레벨 1 새싹 (0P)", () => {
    const result = getLevel(0);
    expect(result.level).toBe(1);
    expect(result.title).toBe("새싹");
    expect(result.nextPoints).toBe(500);
  });

  it("레벨 2 새싹지킴이 (500P)", () => {
    const result = getLevel(500);
    expect(result.level).toBe(2);
    expect(result.title).toBe("새싹지킴이");
  });

  it("레벨 3 환경지킴이 (1500P)", () => {
    const result = getLevel(1500);
    expect(result.level).toBe(3);
    expect(result.title).toBe("환경지킴이");
  });

  it("레벨 4 에코히어로 (3000P)", () => {
    const result = getLevel(3000);
    expect(result.level).toBe(4);
    expect(result.title).toBe("에코히어로");
  });

  it("레벨 5 지구수호자 (6000P)", () => {
    const result = getLevel(6000);
    expect(result.level).toBe(5);
    expect(result.title).toBe("지구수호자");
  });

  it("진행률 계산 정확성", () => {
    const result = getLevel(250); // 레벨1: 0~500, 250은 50%
    expect(result.progress).toBe(0.5);
  });

  it("진행률 최대 1.0 초과 안함", () => {
    const result = getLevel(9999);
    expect(result.progress).toBeLessThanOrEqual(1);
  });
});
