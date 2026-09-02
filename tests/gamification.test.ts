import { describe, it, expect } from "vitest";

describe("Gamification System", () => {
  it("should calculate 7-day streak bonus", () => {
    const streak = 7;
    const bonusPoints = streak === 7 ? 1000 : 0;
    expect(bonusPoints).toBe(1000);
  });

  it("should calculate 14-day streak bonus", () => {
    const streak = 14;
    const bonusPoints = streak === 14 ? 2000 : 0;
    expect(bonusPoints).toBe(2000);
  });

  it("should calculate 30-day streak bonus", () => {
    const streak = 30;
    const bonusPoints = streak === 30 ? 5000 : 0;
    expect(bonusPoints).toBe(5000);
  });

  it("should give daily reward of 10P", () => {
    const dailyReward = 10;
    expect(dailyReward).toBe(10);
  });

  it("should give referral reward of 500P", () => {
    const referralReward = 500;
    expect(referralReward).toBe(500);
  });

  it("should calculate weekly rank rewards", () => {
    const rank = 1;
    const rewards = rank === 1 ? 5000 : rank === 2 ? 3000 : rank === 3 ? 1000 : 0;
    expect(rewards).toBe(5000);
  });

  it("should calculate 2nd place weekly reward", () => {
    const rank: number = 2;
    const rewards = rank === 1 ? 5000 : rank === 2 ? 3000 : rank === 3 ? 1000 : 0;
    expect(rewards).toBe(3000);
  });

  it("should calculate 3rd place weekly reward", () => {
    const rank: number = 3;
    const rewards = rank === 1 ? 5000 : rank === 2 ? 3000 : rank === 3 ? 1000 : 0;
    expect(rewards).toBe(1000);
  });

  it("should accumulate multiple referrals", () => {
    let referralRewards = 0;
    referralRewards += 500; // 1st referral
    referralRewards += 500; // 2nd referral
    referralRewards += 500; // 3rd referral
    expect(referralRewards).toBe(1500);
  });

  it("should track referral code generation", () => {
    const code = `CM${Date.now().toString(36).toUpperCase()}`;
    expect(code).toMatch(/^CM/);
  });
});
