import { describe, it, expect } from "vitest";
import {
  classifyTrashFromAnnotations,
  isAfterPhotoStillDirty,
  formatCooldown,
  parseAiTrashJson,
} from "../lib/trash-classifier";

describe("쓰레기 AI 분류", () => {
  it("플라스틱 병을 플라스틱으로 분류하고 10P를 준다", () => {
    const result = classifyTrashFromAnnotations(
      [{ description: "Plastic bottle", score: 0.92 }],
      []
    );
    expect(result?.category).toBe("plastic");
    expect(result?.description).toBe("플라스틱 병");
    expect(result?.points).toBe(10);
  });

  it("bottle만 있어도 유리병이 아니라 페트병으로 본다", () => {
    const result = classifyTrashFromAnnotations([{ description: "Bottle", score: 0.8 }], []);
    expect(result?.category).toBe("plastic");
    expect(result?.points).toBe(10);
  });

  it("유리병은 20P", () => {
    const result = classifyTrashFromAnnotations(
      [{ description: "Glass bottle", score: 0.88 }],
      []
    );
    expect(result?.category).toBe("glass");
    expect(result?.points).toBe(20);
  });

  it("캔은 금속 20P", () => {
    const result = classifyTrashFromAnnotations([{ description: "Soda can", score: 0.77 }], []);
    expect(result?.category).toBe("metal");
    expect(result?.points).toBe(20);
  });

  it("담배꽁초를 인식한다", () => {
    const result = classifyTrashFromAnnotations(
      [{ description: "Cigarette butt", score: 0.7 }],
      []
    );
    expect(result?.description).toBe("담배꽁초");
    expect(result?.points).toBe(10);
  });

  it("쓰레기와 무관한 사진은 null", () => {
    const result = classifyTrashFromAnnotations(
      [
        { description: "Sky", score: 0.9 },
        { description: "Tree", score: 0.8 },
        { description: "Person", score: 0.7 },
      ],
      []
    );
    expect(result).toBeNull();
  });

  it("신뢰도가 너무 낮으면 null", () => {
    const result = classifyTrashFromAnnotations([{ description: "Trash", score: 0.1 }], []);
    expect(result).toBeNull();
  });

  it("객체 감지 결과도 사용한다", () => {
    const result = classifyTrashFromAnnotations([], [{ name: "Bottle", score: 0.86 }]);
    expect(result?.category).toBe("plastic");
  });
});

describe("AI JSON 파싱", () => {
  it("Gemini JSON에서 플라스틱을 읽는다", () => {
    const result = parseAiTrashJson(
      '```json\n{"found":true,"category":"plastic","description":"페트병","confidence":0.91}\n```'
    );
    expect(result?.category).toBe("plastic");
    expect(result?.points).toBe(10);
    expect(result?.description).toBe("페트병");
  });

  it("쓰레기가 없으면 null", () => {
    expect(parseAiTrashJson('{"found":false}')).toBeNull();
  });
});

describe("줍기 후 사진 판정", () => {
  const before = {
    category: "plastic" as const,
    confidence: 0.8,
    description: "플라스틱 병",
    points: 10,
  };

  it("후 사진에 쓰레기가 없으면 통과", () => {
    expect(isAfterPhotoStillDirty(before, null)).toBe(false);
  });

  it("후 사진에도 쓰레기가 뚜렷하면 거부", () => {
    expect(
      isAfterPhotoStillDirty(before, {
        category: "plastic",
        confidence: 0.82,
        description: "플라스틱 병",
        points: 10,
      })
    ).toBe(true);
  });
});

describe("쿨다운 표시", () => {
  it("30분을 분:초로 보여준다", () => {
    expect(formatCooldown(30 * 60 * 1000)).toBe("30분 00초");
    expect(formatCooldown(90 * 1000)).toBe("1분 30초");
  });
});
