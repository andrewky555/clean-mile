import { describe, it, expect } from "vitest";

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

describe("거리 계산", () => {
  it("0도 차이 = 0km", () => {
    const dist = calculateDistance(37.5495, 126.8505, 37.5495, 126.8505);
    expect(dist).toBeLessThan(0.001);
  });

  it("0.0008도 차이 약 90m", () => {
    const dist = calculateDistance(37.5495, 126.8505, 37.5495 + 0.0008, 126.8505 + 0.0008);
    expect(dist).toBeGreaterThan(0.08);
    expect(dist).toBeLessThan(0.12);
  });

  it("0.001도 차이 약 141m (대각선)", () => {
    const dist = calculateDistance(37.5495, 126.8505, 37.5495 + 0.001, 126.8505 + 0.001);
    expect(dist).toBeGreaterThan(0.13);
    expect(dist).toBeLessThan(0.16);
  });

  it("0.01도 차이 약 1.4km (대각선)", () => {
    const dist = calculateDistance(37.5495, 126.8505, 37.5495 + 0.01, 126.8505 + 0.01);
    expect(dist).toBeGreaterThan(1.3);
    expect(dist).toBeLessThan(1.5);
  });
});
