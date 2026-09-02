import { describe, it, expect } from "vitest";

describe("Jogging Camera System", () => {
  it("should calculate trash points correctly", () => {
    const getTrashPoints = (category: string): number => {
      const points: Record<string, number> = {
        glass: 20,
        metal: 20,
        plastic: 10,
        paper: 10,
        other: 10,
      };
      return points[category] || 10;
    };

    expect(getTrashPoints("glass")).toBe(20);
    expect(getTrashPoints("metal")).toBe(20);
    expect(getTrashPoints("plastic")).toBe(10);
    expect(getTrashPoints("paper")).toBe(10);
    expect(getTrashPoints("other")).toBe(10);
  });

  it("should calculate distance correctly using Haversine formula", () => {
    const calculateDistance = (
      lat1: number,
      lng1: number,
      lat2: number,
      lng2: number
    ): number => {
      const R = 6371; // 지구 반지름 (km)
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLng = ((lng2 - lng1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    // 같은 위치
    const dist1 = calculateDistance(37.5665, 126.978, 37.5665, 126.978);
    expect(dist1).toBe(0);

    // 약 1km 떨어진 위치
    const dist2 = calculateDistance(37.5665, 126.978, 37.5765, 126.978);
    expect(dist2).toBeGreaterThan(0.5);
    expect(dist2).toBeLessThan(2);
  });

  it("should calculate distance-based points correctly", () => {
    const distance = 2.5; // 2.5km
    const distancePoints = Math.floor(distance * 10);
    expect(distancePoints).toBe(25); // 2.5 * 10 = 25P
  });

  it("should validate speed correctly", () => {
    const duration = 0.5; // 0.5시간 (30분)
    const distance = 8; // 8km
    const speed = distance / duration; // 16km/h
    const isValidSpeed = speed <= 20;
    expect(isValidSpeed).toBe(true);

    const distance2 = 12; // 12km
    const speed2 = distance2 / duration; // 24km/h
    const isValidSpeed2 = speed2 <= 20;
    expect(isValidSpeed2).toBe(false);
  });

  it("should calculate total points correctly", () => {
    // 쓰레기 포인트: 유리(20) + 금속(20) + 플라스틱(10) = 50P
    const trashPoints = 20 + 20 + 10;
    
    // 거리 포인트: 2km * 10 = 20P
    const distancePoints = 20;
    
    // 총 포인트
    const totalPoints = trashPoints + distancePoints;
    expect(totalPoints).toBe(70);
  });

  it("should handle speed validation for distance points", () => {
    const distance = 5; // 5km
    const duration = 0.25; // 0.25시간 (15분)
    const speed = distance / duration; // 20km/h (정상)
    
    const distancePoints = Math.floor(distance * 10);
    const isValidSpeed = speed <= 20;
    
    const finalPoints = isValidSpeed ? distancePoints : 0;
    expect(finalPoints).toBe(50); // 속력 정상이므로 50P 지급
  });

  it("should not award distance points if speed exceeds limit", () => {
    const distance = 10; // 10km
    const duration = 0.4; // 0.4시간 (24분)
    const speed = distance / duration; // 25km/h (초과)
    
    const distancePoints = Math.floor(distance * 10);
    const isValidSpeed = speed <= 20;
    
    const finalPoints = isValidSpeed ? distancePoints : 0;
    expect(finalPoints).toBe(0); // 속력 초과이므로 0P
  });
});
