import AsyncStorage from "@react-native-async-storage/async-storage";

// 강서구 핫스팟 데이터 (실제 좌표)
export interface Hotspot {
  id: string;
  name: string;
  lat: number;
  lng: number;
  severity: "high" | "medium" | "low"; // 심각도
  trashCount: number;
  lastReported: number;
  icon: string;
  region?: string; // 지역명
}

// 강서구 주요 핫스팟 (실제 좌표)
export const GANGSEOKU_HOTSPOTS: Hotspot[] = [
  {
    id: "hs_001",
    name: "화곡동 학원가 골목",
    lat: 37.5495,
    lng: 126.8505,
    severity: "high",
    trashCount: 127,
    lastReported: Date.now() - 3600000,
    icon: "🔴",
    region: "강서구",
  },
  {
    id: "hs_002",
    name: "등촌동 이면도로",
    lat: 37.5420,
    lng: 126.8620,
    severity: "high",
    trashCount: 95,
    lastReported: Date.now() - 7200000,
    icon: "🔴",
    region: "강서구",
  },
  {
    id: "hs_003",
    name: "마곡동 상업지구",
    lat: 37.5680,
    lng: 126.8350,
    severity: "medium",
    trashCount: 62,
    lastReported: Date.now() - 10800000,
    icon: "🟡",
    region: "강서구",
  },
  {
    id: "hs_004",
    name: "방화동 주택가",
    lat: 37.5280,
    lng: 126.8200,
    severity: "medium",
    trashCount: 48,
    lastReported: Date.now() - 14400000,
    icon: "🟡",
    region: "강서구",
  },
  {
    id: "hs_005",
    name: "공항동 골목길",
    lat: 37.5550,
    lng: 126.8750,
    severity: "low",
    trashCount: 25,
    lastReported: Date.now() - 18000000,
    icon: "🟢",
    region: "강서구",
  },
  {
    id: "hs_006",
    name: "발산동 상가",
    lat: 37.5380,
    lng: 126.8450,
    severity: "high",
    trashCount: 110,
    lastReported: Date.now() - 5400000,
    icon: "🔴",
    region: "강서구",
  },
  {
    id: "hs_007",
    name: "내발산동 주변",
    lat: 37.5620,
    lng: 126.8580,
    severity: "low",
    trashCount: 18,
    lastReported: Date.now() - 21600000,
    icon: "🟢",
    region: "강서구",
  },
  {
    id: "hs_008",
    name: "염창동 골목",
    lat: 37.5720,
    lng: 126.8200,
    severity: "medium",
    trashCount: 55,
    lastReported: Date.now() - 12600000,
    icon: "🟡",
    region: "강서구",
  },
];

// 동작구 주요 핫스팟 (실제 좌표)
export const DONGJAK_HOTSPOTS: Hotspot[] = [
  {
    id: "hs_101",
    name: "노량진 수산시장 골목",
    lat: 37.5150,
    lng: 126.9650,
    severity: "high",
    trashCount: 156,
    lastReported: Date.now() - 2400000,
    icon: "🔴",
    region: "동작구",
  },
  {
    id: "hs_102",
    name: "흑석동 상가거리",
    lat: 37.5080,
    lng: 126.9720,
    severity: "high",
    trashCount: 132,
    lastReported: Date.now() - 6000000,
    icon: "🔴",
    region: "동작구",
  },
  {
    id: "hs_103",
    name: "신대방동 주택가",
    lat: 37.4950,
    lng: 126.9580,
    severity: "medium",
    trashCount: 71,
    lastReported: Date.now() - 9600000,
    icon: "🟡",
    region: "동작구",
  },
  {
    id: "hs_104",
    name: "사당동 지하철역 주변",
    lat: 37.4850,
    lng: 126.9820,
    severity: "medium",
    trashCount: 84,
    lastReported: Date.now() - 13200000,
    icon: "🟡",
    region: "동작구",
  },
  {
    id: "hs_105",
    name: "대방동 골목길",
    lat: 37.5020,
    lng: 126.9450,
    severity: "low",
    trashCount: 32,
    lastReported: Date.now() - 16800000,
    icon: "🟢",
    region: "동작구",
  },
  {
    id: "hs_106",
    name: "본동 상업지구",
    lat: 37.5250,
    lng: 126.9550,
    severity: "high",
    trashCount: 118,
    lastReported: Date.now() - 4200000,
    icon: "🔴",
    region: "동작구",
  },
  {
    id: "hs_107",
    name: "이촌동 한강변",
    lat: 37.5380,
    lng: 126.9680,
    severity: "low",
    trashCount: 28,
    lastReported: Date.now() - 19200000,
    icon: "🟢",
    region: "동작구",
  },
  {
    id: "hs_108",
    name: "상도동 주변",
    lat: 37.4920,
    lng: 126.9680,
    severity: "medium",
    trashCount: 67,
    lastReported: Date.now() - 11400000,
    icon: "🟡",
    region: "동작구",
  },
];

// 강남구 주요 핫스팟 (실제 좌표)
export const GANGNAM_HOTSPOTS: Hotspot[] = [
  {
    id: "hs_201",
    name: "강남역 지하상가",
    lat: 37.4979,
    lng: 127.0276,
    severity: "high",
    trashCount: 189,
    lastReported: Date.now() - 1800000,
    icon: "🔴",
    region: "강남구",
  },
  {
    id: "hs_202",
    name: "테헤란로 오피스거리",
    lat: 37.5050,
    lng: 127.0350,
    severity: "high",
    trashCount: 165,
    lastReported: Date.now() - 5400000,
    icon: "🔴",
    region: "강남구",
  },
  {
    id: "hs_203",
    name: "삼성동 상가",
    lat: 37.5150,
    lng: 127.0550,
    severity: "medium",
    trashCount: 92,
    lastReported: Date.now() - 8400000,
    icon: "🟡",
    region: "강남구",
  },
  {
    id: "hs_204",
    name: "압구정로데오거리",
    lat: 37.5270,
    lng: 127.0180,
    severity: "medium",
    trashCount: 105,
    lastReported: Date.now() - 12000000,
    icon: "🟡",
    region: "강남구",
  },
  {
    id: "hs_205",
    name: "신사동 가로수길",
    lat: 37.5320,
    lng: 127.0250,
    severity: "low",
    trashCount: 38,
    lastReported: Date.now() - 15600000,
    icon: "🟢",
    region: "강남구",
  },
  {
    id: "hs_206",
    name: "논현동 주택가",
    lat: 37.5080,
    lng: 127.0180,
    severity: "high",
    trashCount: 142,
    lastReported: Date.now() - 3600000,
    icon: "🔴",
    region: "강남구",
  },
  {
    id: "hs_207",
    name: "청담동 골목",
    lat: 37.5420,
    lng: 127.0420,
    severity: "low",
    trashCount: 35,
    lastReported: Date.now() - 18000000,
    icon: "🟢",
    region: "강남구",
  },
  {
    id: "hs_208",
    name: "대치동 상업지구",
    lat: 37.4850,
    lng: 127.0650,
    severity: "medium",
    trashCount: 78,
    lastReported: Date.now() - 10200000,
    icon: "🟡",
    region: "강남구",
  },
];

// 강동구 주요 핫스팟 (실제 좌표)
export const GANGDONG_HOTSPOTS: Hotspot[] = [
  {
    id: "hs_301",
    name: "성내동 상가거리",
    lat: 37.5280,
    lng: 127.1450,
    severity: "high",
    trashCount: 143,
    lastReported: Date.now() - 2700000,
    icon: "🔴",
    region: "강동구",
  },
  {
    id: "hs_302",
    name: "천호동 지하철역 주변",
    lat: 37.5380,
    lng: 127.1280,
    severity: "high",
    trashCount: 128,
    lastReported: Date.now() - 6300000,
    icon: "🔴",
    region: "강동구",
  },
  {
    id: "hs_303",
    name: "길동 주택가",
    lat: 37.5150,
    lng: 127.1350,
    severity: "medium",
    trashCount: 69,
    lastReported: Date.now() - 9900000,
    icon: "🟡",
    region: "강동구",
  },
  {
    id: "hs_304",
    name: "암사동 골목길",
    lat: 37.5420,
    lng: 127.1580,
    severity: "medium",
    trashCount: 81,
    lastReported: Date.now() - 13500000,
    icon: "🟡",
    region: "강동구",
  },
  {
    id: "hs_305",
    name: "고덕동 상업지구",
    lat: 37.5050,
    lng: 127.1620,
    severity: "low",
    trashCount: 30,
    lastReported: Date.now() - 17100000,
    icon: "🟢",
    region: "강동구",
  },
  {
    id: "hs_306",
    name: "명일동 주변",
    lat: 37.5280,
    lng: 127.1180,
    severity: "high",
    trashCount: 135,
    lastReported: Date.now() - 4500000,
    icon: "🔴",
    region: "강동구",
  },
  {
    id: "hs_307",
    name: "강일동 한강변",
    lat: 37.5520,
    lng: 127.1450,
    severity: "low",
    trashCount: 26,
    lastReported: Date.now() - 19800000,
    icon: "🟢",
    region: "강동구",
  },
  {
    id: "hs_308",
    name: "둔촌동 상가",
    lat: 37.4950,
    lng: 127.1280,
    severity: "medium",
    trashCount: 73,
    lastReported: Date.now() - 12300000,
    icon: "🟡",
    region: "강동구",
  },
];

// 서초구 주요 핫스팟 (실제 좌표)
export const SEOCHO_HOTSPOTS: Hotspot[] = [
  {
    id: "hs_401",
    name: "서초역 지하상가",
    lat: 37.4950,
    lng: 127.0070,
    severity: "high",
    trashCount: 171,
    lastReported: Date.now() - 2100000,
    icon: "🔴",
    region: "서초구",
  },
  {
    id: "hs_402",
    name: "강남대로 상가",
    lat: 37.4880,
    lng: 127.0150,
    severity: "high",
    trashCount: 148,
    lastReported: Date.now() - 5700000,
    icon: "🔴",
    region: "서초구",
  },
  {
    id: "hs_403",
    name: "반포동 주택가",
    lat: 37.5080,
    lng: 126.9950,
    severity: "medium",
    trashCount: 87,
    lastReported: Date.now() - 9300000,
    icon: "🟡",
    region: "서초구",
  },
  {
    id: "hs_404",
    name: "방배동 골목길",
    lat: 37.4750,
    lng: 127.0050,
    severity: "medium",
    trashCount: 96,
    lastReported: Date.now() - 12900000,
    icon: "🟡",
    region: "서초구",
  },
  {
    id: "hs_405",
    name: "양재동 상업지구",
    lat: 37.4650,
    lng: 127.0280,
    severity: "low",
    trashCount: 41,
    lastReported: Date.now() - 16500000,
    icon: "🟢",
    region: "서초구",
  },
  {
    id: "hs_406",
    name: "서초동 상가",
    lat: 37.4820,
    lng: 127.0280,
    severity: "high",
    trashCount: 159,
    lastReported: Date.now() - 3900000,
    icon: "🔴",
    region: "서초구",
  },
  {
    id: "hs_407",
    name: "잠원동 한강변",
    lat: 37.5150,
    lng: 126.9850,
    severity: "low",
    trashCount: 33,
    lastReported: Date.now() - 18600000,
    icon: "🟢",
    region: "서초구",
  },
  {
    id: "hs_408",
    name: "신반포 주변",
    lat: 37.5020,
    lng: 126.9750,
    severity: "medium",
    trashCount: 79,
    lastReported: Date.now() - 11100000,
    icon: "🟡",
    region: "서초구",
  },
];

const USER_HOTSPOTS_KEY = "cleanmile_user_hotspots_v1";

function severityFromCount(count: number): Hotspot["severity"] {
  if (count >= 3) return "high";
  if (count >= 2) return "medium";
  return "low";
}

export async function getAllHotspots(): Promise<Hotspot[]> {
  const val = await AsyncStorage.getItem(USER_HOTSPOTS_KEY);
  return val ? JSON.parse(val) : [];
}

export async function getHotspotsBySeverity(
  severity: "high" | "medium" | "low"
): Promise<Hotspot[]> {
  const spots = await getAllHotspots();
  return spots.filter((h) => h.severity === severity);
}

export async function getNearbyHotspots(
  lat: number,
  lng: number,
  radiusKm: number = 5
): Promise<Hotspot[]> {
  const spots = await getAllHotspots();
  return spots.filter((h) => calculateDistance(lat, lng, h.lat, h.lng) <= radiusKm);
}

export async function recordUserTrashSpot(input: {
  lat: number;
  lng: number;
  trashType: string;
}): Promise<Hotspot> {
  const spots = await getAllHotspots();
  const nearby = spots.find(
    (h) => calculateDistance(h.lat, h.lng, input.lat, input.lng) <= 0.05
  );

  if (nearby) {
    nearby.trashCount += 1;
    nearby.lastReported = Date.now();
    nearby.severity = severityFromCount(nearby.trashCount);
    nearby.name = input.trashType;
    await AsyncStorage.setItem(USER_HOTSPOTS_KEY, JSON.stringify(spots));
    return nearby;
  }

  const created: Hotspot = {
    id: `user_${Date.now()}`,
    name: input.trashType,
    lat: input.lat,
    lng: input.lng,
    severity: "low",
    trashCount: 1,
    lastReported: Date.now(),
    icon: "📍",
    region: "촬영",
  };
  spots.push(created);
  await AsyncStorage.setItem(USER_HOTSPOTS_KEY, JSON.stringify(spots));
  return created;
}

export async function reportHotspot(hotspotId: string, _trashType?: string): Promise<void> {
  const spots = await getAllHotspots();
  const hotspot = spots.find((h) => h.id === hotspotId);
  if (!hotspot) return;
  hotspot.trashCount += 1;
  hotspot.lastReported = Date.now();
  hotspot.severity = severityFromCount(hotspot.trashCount);
  await AsyncStorage.setItem(USER_HOTSPOTS_KEY, JSON.stringify(spots));
}

export async function getHotspotInfo(hotspotId: string): Promise<Hotspot | undefined> {
  const spots = await getAllHotspots();
  return spots.find((h) => h.id === hotspotId);
}

// 거리 계산 (Haversine)
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

export const GANGSEOKU_CENTER = {
  lat: 37.5495,
  lng: 126.8505,
};

export const MAP_INITIAL_ZOOM = 13;
