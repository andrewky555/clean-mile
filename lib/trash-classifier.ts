export type TrashCategory = "glass" | "metal" | "plastic" | "paper" | "food" | "other";

export interface TrashDetectionResult {
  category: TrashCategory;
  confidence: number;
  description: string;
  points: number;
}

type TrashRule = {
  keyword: string;
  category: TrashCategory;
  description: string;
  points: number;
};

const RULES: TrashRule[] = [
  { keyword: "cigarette butt", category: "other", description: "담배꽁초", points: 10 },
  { keyword: "plastic bottle", category: "plastic", description: "플라스틱 병", points: 10 },
  { keyword: "plastic bag", category: "plastic", description: "비닐봉지", points: 10 },
  { keyword: "plastic cup", category: "plastic", description: "플라스틱 컵", points: 10 },
  { keyword: "plastic wrap", category: "plastic", description: "비닐 포장", points: 10 },
  { keyword: "glass bottle", category: "glass", description: "유리병", points: 20 },
  { keyword: "glass jar", category: "glass", description: "유리병", points: 20 },
  { keyword: "aluminum can", category: "metal", description: "알루미늄 캔", points: 20 },
  { keyword: "beverage can", category: "metal", description: "음료 캔", points: 20 },
  { keyword: "drink can", category: "metal", description: "음료 캔", points: 20 },
  { keyword: "pet bottle", category: "plastic", description: "페트병", points: 10 },
  { keyword: "recycling", category: "other", description: "재활용 쓰레기", points: 10 },
  { keyword: "debris", category: "other", description: "쓰레기", points: 10 },
  { keyword: "refuse", category: "other", description: "쓰레기", points: 10 },
  { keyword: "tin can", category: "metal", description: "금속 캔", points: 20 },
  { keyword: "metal can", category: "metal", description: "금속 캔", points: 20 },
  { keyword: "paper bag", category: "paper", description: "종이봉투", points: 10 },
  { keyword: "paper cup", category: "paper", description: "종이컵", points: 10 },
  { keyword: "food waste", category: "food", description: "음식물 쓰레기", points: 10 },
  { keyword: "styrofoam", category: "plastic", description: "스티로폼", points: 10 },
  { keyword: "polystyrene", category: "plastic", description: "스티로폼", points: 10 },
  { keyword: "packaging", category: "paper", description: "포장재", points: 10 },
  { keyword: "wrapper", category: "plastic", description: "과자 봉지", points: 10 },
  { keyword: "cigarette", category: "other", description: "담배꽁초", points: 10 },
  { keyword: "tobacco", category: "other", description: "담배꽁초", points: 10 },
  { keyword: "plastic", category: "plastic", description: "플라스틱", points: 10 },
  { keyword: "cardboard", category: "paper", description: "종이박스", points: 10 },
  { keyword: "newspaper", category: "paper", description: "신문지", points: 10 },
  { keyword: "aluminum", category: "metal", description: "알루미늄", points: 20 },
  { keyword: "bottle", category: "plastic", description: "페트병", points: 10 },
  { keyword: "litter", category: "other", description: "길거리 쓰레기", points: 10 },
  { keyword: "garbage", category: "other", description: "쓰레기", points: 10 },
  { keyword: "rubbish", category: "other", description: "쓰레기", points: 10 },
  { keyword: "waste", category: "other", description: "쓰레기", points: 10 },
  { keyword: "trash", category: "other", description: "쓰레기", points: 10 },
  { keyword: "glass", category: "glass", description: "유리", points: 20 },
  { keyword: "metal", category: "metal", description: "금속", points: 20 },
  { keyword: "paper", category: "paper", description: "종이", points: 10 },
  { keyword: "can", category: "metal", description: "캔", points: 20 },
  { keyword: "jar", category: "glass", description: "유리병", points: 20 },
  { keyword: "cup", category: "plastic", description: "일회용 컵", points: 10 },
  { keyword: "food", category: "food", description: "음식물 쓰레기", points: 10 },
];

const SORTED_RULES = [...RULES].sort((a, b) => b.keyword.length - a.keyword.length);
const MIN_CONFIDENCE = 0.32;

export type VisionLabel = { description?: string; score?: number; name?: string };

function labelText(item: VisionLabel): string {
  return (item.description || item.name || "").toLowerCase().trim();
}

function matchesKeyword(label: string, keyword: string): boolean {
  if (!label) return false;
  if (keyword.includes(" ")) return label.includes(keyword);
  if (keyword.length <= 3) {
    return label.split(/[^a-z0-9]+/).includes(keyword);
  }
  return label.includes(keyword);
}

export function classifyTrashFromAnnotations(
  labels: VisionLabel[] = [],
  objects: VisionLabel[] = []
): TrashDetectionResult | null {
  const items = [...labels, ...objects]
    .map((item) => ({
      text: labelText(item),
      score: typeof item.score === "number" ? item.score : 0,
    }))
    .filter((item) => item.text.length > 0);

  let best: TrashDetectionResult | null = null;

  for (const item of items) {
    for (const rule of SORTED_RULES) {
      if (!matchesKeyword(item.text, rule.keyword)) continue;
      if (!best || item.score > best.confidence) {
        best = {
          category: rule.category,
          confidence: item.score,
          description: rule.description,
          points: rule.points,
        };
      }
      break;
    }
  }

  if (!best || best.confidence < MIN_CONFIDENCE) return null;
  return best;
}

export function isAfterPhotoStillDirty(
  before: TrashDetectionResult,
  after: TrashDetectionResult | null
): boolean {
  if (!after) return false;
  return after.confidence >= 0.55 && after.confidence >= before.confidence - 0.05;
}

export function formatCooldown(ms: number): string {
  const totalSec = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSec / 60);
  const seconds = totalSec % 60;
  return `${minutes}분 ${String(seconds).padStart(2, "0")}초`;
}

const POINTS: Record<TrashCategory, number> = {
  glass: 20,
  metal: 20,
  plastic: 10,
  paper: 10,
  food: 10,
  other: 10,
};

export function resultFromCategory(
  category: string,
  description?: string,
  confidence = 0.8
): TrashDetectionResult | null {
  const allowed: TrashCategory[] = ["glass", "metal", "plastic", "paper", "food", "other"];
  const normalized = (category || "").toLowerCase() as TrashCategory;
  if (!allowed.includes(normalized)) return null;
  return {
    category: normalized,
    confidence: Math.min(1, Math.max(0, confidence)),
    description: description || {
      glass: "유리병",
      metal: "캔/금속",
      plastic: "플라스틱",
      paper: "종이",
      food: "음식물 쓰레기",
      other: "쓰레기",
    }[normalized],
    points: POINTS[normalized],
  };
}

export function parseAiTrashJson(text: string): TrashDetectionResult | null {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    const parsed = JSON.parse(match[0]) as {
      found?: boolean;
      category?: string;
      description?: string;
      confidence?: number;
    };
    if (parsed.found === false) return null;
    if (!parsed.category) return null;
    return resultFromCategory(parsed.category, parsed.description, parsed.confidence ?? 0.8);
  } catch {
    return null;
  }
}
