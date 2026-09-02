import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getDongByLocation,
  DONG_LIST,
  calculateDongRanking,
  awardRankingPoints,
  getDongInfo,
  getDongsByGu,
  getCurrentMonth,
  RANKING_POINTS,
  UserRankingData,
  DongInfo,
} from "../lib/dong-ranking-system";

describe("동 단위 랭킹 시스템", () => {
  describe("위치 기반 동 분류", () => {
    it("강서구 화곡동 좌표로 정확한 동을 반환해야 함", () => {
      const dong = getDongByLocation(37.5495, 126.8505);
      expect(dong).not.toBeNull();
      expect(dong?.name).toBe("화곡동");
      expect(dong?.gu).toBe("강서구");
    });

    it("강남구 강남역 좌표로 정확한 동을 반환해야 함", () => {
      const dong = getDongByLocation(37.4979, 127.0276);
      expect(dong).not.toBeNull();
      expect(dong?.name).toBe("강남동");
      expect(dong?.gu).toBe("강남구");
    });

    it("2km 이상 떨어진 위치는 null을 반환해야 함", () => {
      // 서울 외곽 좌표
      const dong = getDongByLocation(37.2, 127.2);
      expect(dong).toBeNull();
    });
  });

  describe("동 정보 조회", () => {
    it("동 ID로 정확한 동 정보를 반환해야 함", () => {
      const dong = getDongInfo("dong_001");
      expect(dong).not.toBeUndefined();
      expect(dong?.name).toBe("화곡동");
    });

    it("존재하지 않는 동 ID는 undefined를 반환해야 함", () => {
      const dong = getDongInfo("invalid_id");
      expect(dong).toBeUndefined();
    });

    it("강서구 동 목록은 8개여야 함", () => {
      const dongs = getDongsByGu("강서구");
      expect(dongs).toHaveLength(8);
      expect(dongs.every((d) => d.gu === "강서구")).toBe(true);
    });

    it("강남구 동 목록은 8개여야 함", () => {
      const dongs = getDongsByGu("강남구");
      expect(dongs).toHaveLength(8);
    });
  });

  describe("동 단위 랭킹 계산", () => {
    let mockUsers: UserRankingData[];
    let testDong: DongInfo;

    beforeEach(() => {
      testDong = DONG_LIST[0]; // 화곡동

      mockUsers = [
        {
          userId: "user_1",
          username: "사용자1",
          points: 1000,
          monthlyPoints: 500,
          rank: 0,
          dong: "dong_001",
          joinedAt: Date.now(),
        },
        {
          userId: "user_2",
          username: "사용자2",
          points: 2000,
          monthlyPoints: 800,
          rank: 0,
          dong: "dong_001",
          joinedAt: Date.now(),
        },
        {
          userId: "user_3",
          username: "사용자3",
          points: 1500,
          monthlyPoints: 600,
          rank: 0,
          dong: "dong_001",
          joinedAt: Date.now(),
        },
        {
          userId: "user_4",
          username: "사용자4",
          points: 3000,
          monthlyPoints: 1000,
          rank: 0,
          dong: "dong_002", // 다른 동
          joinedAt: Date.now(),
        },
      ];
    });

    it("동별 랭킹을 포인트 기준으로 정렬해야 함", () => {
      const ranking = calculateDongRanking(mockUsers, testDong, "2026-06");

      expect(ranking).toHaveLength(3); // 화곡동 사용자만
      expect(ranking[0].username).toBe("사용자2"); // 800P (1등)
      expect(ranking[1].username).toBe("사용자3"); // 600P (2등)
      expect(ranking[2].username).toBe("사용자1"); // 500P (3등)
    });

    it("순위를 정확하게 할당해야 함", () => {
      const ranking = calculateDongRanking(mockUsers, testDong, "2026-06");

      expect(ranking[0].rank).toBe(1);
      expect(ranking[1].rank).toBe(2);
      expect(ranking[2].rank).toBe(3);
    });
  });

  describe("랭킹 포인트 지급", () => {
    let mockRanking: UserRankingData[];

    beforeEach(() => {
      mockRanking = [
        { userId: "user_1", username: "1등", points: 0, monthlyPoints: 100, rank: 1, dong: "dong_001", joinedAt: 0 },
        { userId: "user_2", username: "2등", points: 0, monthlyPoints: 90, rank: 2, dong: "dong_001", joinedAt: 0 },
        { userId: "user_3", username: "3등", points: 0, monthlyPoints: 80, rank: 3, dong: "dong_001", joinedAt: 0 },
        { userId: "user_4", username: "4등", points: 0, monthlyPoints: 70, rank: 4, dong: "dong_001", joinedAt: 0 },
        {
          userId: "user_5",
          username: "5등",
          points: 0,
          monthlyPoints: 60,
          rank: 5,
          dong: "dong_001",
          joinedAt: 0,
        },
      ];
    });

    it("1등은 50P를 받아야 함", () => {
      const awards = awardRankingPoints(mockRanking);
      expect(awards[0].points).toBe(50);
    });

    it("2등은 30P를 받아야 함", () => {
      const awards = awardRankingPoints(mockRanking);
      expect(awards[1].points).toBe(30);
    });

    it("3등은 20P를 받아야 함", () => {
      const awards = awardRankingPoints(mockRanking);
      expect(awards[2].points).toBe(20);
    });

    it("4-10등은 10P를 받아야 함", () => {
      const awards = awardRankingPoints(mockRanking);
      expect(awards[3].points).toBe(10);
      expect(awards[4].points).toBe(10);
    });
  });

  describe("월 문자열", () => {
    it("현재 월을 YYYY-MM 형식으로 반환해야 함", () => {
      const month = getCurrentMonth();
      expect(month).toMatch(/^\d{4}-\d{2}$/);

      const now = new Date();
      const expectedMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      expect(month).toBe(expectedMonth);
    });
  });

  describe("동 데이터 검증", () => {
    it("총 40개의 동이 있어야 함", () => {
      expect(DONG_LIST).toHaveLength(40);
    });

    it("각 구별로 8개의 동이 있어야 함", () => {
      const gus = ["강서구", "동작구", "강남구", "강동구", "서초구"];
      gus.forEach((gu) => {
        const dongs = getDongsByGu(gu);
        expect(dongs).toHaveLength(8);
      });
    });

    it("모든 동이 고유한 ID를 가져야 함", () => {
      const ids = DONG_LIST.map((d) => d.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(DONG_LIST.length);
    });

    it("모든 동이 유효한 좌표를 가져야 함", () => {
      DONG_LIST.forEach((dong) => {
        expect(dong.lat).toBeGreaterThan(37);
        expect(dong.lat).toBeLessThan(38);
        expect(dong.lng).toBeGreaterThan(126);
        expect(dong.lng).toBeLessThan(128);
      });
    });
  });
});
