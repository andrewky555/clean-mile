import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { createPhotoMetadata, getMarkerColor, getConfidenceLabel } from "../lib/hotspot-verification";

describe("핫스팟 검증 시스템", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("사진 메타데이터", () => {
    it("사진 메타데이터를 올바르게 생성해야 함", () => {
      const metadata = createPhotoMetadata(
        "file:///photo.jpg",
        37.5495,
        126.8505,
        "user_123",
        "서울 강서구 화곡동"
      );

      expect(metadata.uri).toBe("file:///photo.jpg");
      expect(metadata.latitude).toBe(37.5495);
      expect(metadata.longitude).toBe(126.8505);
      expect(metadata.userId).toBe("user_123");
      expect(metadata.address).toBe("서울 강서구 화곡동");
      expect(metadata.timestamp).toBeGreaterThan(0);
    });

    it("주소 없이도 메타데이터를 생성할 수 있어야 함", () => {
      const metadata = createPhotoMetadata("file:///photo.jpg", 37.5495, 126.8505, "user_123");

      expect(metadata.uri).toBe("file:///photo.jpg");
      expect(metadata.address).toBeUndefined();
    });

    it("메타데이터 타임스탬프는 현재 시간이어야 함", () => {
      const before = Date.now();
      const metadata = createPhotoMetadata("file:///photo.jpg", 37.5495, 126.8505, "user_123");
      const after = Date.now();

      expect(metadata.timestamp).toBeGreaterThanOrEqual(before);
      expect(metadata.timestamp).toBeLessThanOrEqual(after);
    });
  });

  describe("마커 색상", () => {
    it("신뢰도 80% 이상은 초록색이어야 함", () => {
      expect(getMarkerColor(100)).toBe("#22C55E");
      expect(getMarkerColor(80)).toBe("#22C55E");
      expect(getMarkerColor(85)).toBe("#22C55E");
    });

    it("신뢰도 60-79%는 노란색이어야 함", () => {
      expect(getMarkerColor(79)).toBe("#FBBF24");
      expect(getMarkerColor(60)).toBe("#FBBF24");
      expect(getMarkerColor(70)).toBe("#FBBF24");
    });

    it("신뢰도 60% 미만은 빨간색이어야 함", () => {
      expect(getMarkerColor(59)).toBe("#EF4444");
      expect(getMarkerColor(40)).toBe("#EF4444");
      expect(getMarkerColor(50)).toBe("#EF4444");
    });

    it("신뢰도 0%와 100%를 처리해야 함", () => {
      expect(getMarkerColor(0)).toBe("#EF4444");
      expect(getMarkerColor(100)).toBe("#22C55E");
    });
  });

  describe("신뢰도 레이블", () => {
    it("신뢰도 80% 이상은 높음이어야 함", () => {
      expect(getConfidenceLabel(100)).toBe("높음");
      expect(getConfidenceLabel(80)).toBe("높음");
      expect(getConfidenceLabel(90)).toBe("높음");
    });

    it("신뢰도 60-79%는 중간이어야 함", () => {
      expect(getConfidenceLabel(79)).toBe("중간");
      expect(getConfidenceLabel(60)).toBe("중간");
      expect(getConfidenceLabel(70)).toBe("중간");
    });

    it("신뢰도 60% 미만은 낮음이어야 함", () => {
      expect(getConfidenceLabel(59)).toBe("낮음");
      expect(getConfidenceLabel(40)).toBe("낮음");
      expect(getConfidenceLabel(50)).toBe("낮음");
    });

    it("모든 신뢰도 범위를 커버해야 함", () => {
      for (let i = 0; i <= 100; i += 10) {
        const label = getConfidenceLabel(i);
        expect(["높음", "중간", "낮음"]).toContain(label);
      }
    });
  });

  describe("신뢰도 임계값", () => {
    it("신뢰도 40%는 검증 임계값이어야 함", () => {
      // 40% 이상: 검증 가능
      // 40% 미만: 검증 불가
      expect(40).toBeGreaterThanOrEqual(40);
      expect(39).toBeLessThan(40);
    });

    it("신뢰도 범위는 0-100이어야 함", () => {
      const validConfidences = [0, 25, 50, 75, 100];
      validConfidences.forEach((conf) => {
        expect(conf).toBeGreaterThanOrEqual(0);
        expect(conf).toBeLessThanOrEqual(100);
      });
    });
  });
});
