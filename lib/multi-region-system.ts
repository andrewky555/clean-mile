// 다중 지역 핫스팟 시스템
export interface Region {
  id: string;
  name: string;
  centerLat: number;
  centerLng: number;
  zoom: number;
}

export interface RegionalHotspot {
  id: string;
  regionId: string;
  name: string;
  lat: number;
  lng: number;
  severity: "high" | "medium" | "low";
  trashCount: number;
  lastReported: number;
  icon: string;
}

// 지역 정의
export const REGIONS: Region[] = [
  {
    id: "gangseoku",
    name: "강서구",
    centerLat: 37.5495,
    centerLng: 126.8505,
    zoom: 13,
  },
  {
    id: "mapogu",
    name: "마포구",
    centerLat: 37.5465,
    centerLng: 126.9065,
    zoom: 13,
  },
  {
    id: "seodaemungu",
    name: "서대문구",
    centerLat: 37.5795,
    centerLng: 126.9365,
    zoom: 13,
  },
  {
    id: "eunpyeonggu",
    name: "은평구",
    centerLat: 37.6195,
    centerLng: 126.9265,
    zoom: 13,
  },
];

// 강서구 핫스팟 (기존)
const GANGSEOKU_HOTSPOTS: RegionalHotspot[] = [
  {
    id: "gs_001",
    regionId: "gangseoku",
    name: "화곡동 학원가 골목",
    lat: 37.5495,
    lng: 126.8505,
    severity: "high",
    trashCount: 127,
    lastReported: Date.now() - 3600000,
    icon: "🔴",
  },
  {
    id: "gs_002",
    regionId: "gangseoku",
    name: "등촌동 이면도로",
    lat: 37.5420,
    lng: 126.8620,
    severity: "high",
    trashCount: 95,
    lastReported: Date.now() - 7200000,
    icon: "🔴",
  },
  {
    id: "gs_003",
    regionId: "gangseoku",
    name: "마곡동 상업지구",
    lat: 37.5680,
    lng: 126.8350,
    severity: "medium",
    trashCount: 62,
    lastReported: Date.now() - 10800000,
    icon: "🟡",
  },
  {
    id: "gs_004",
    regionId: "gangseoku",
    name: "방화동 주택가",
    lat: 37.5280,
    lng: 126.8200,
    severity: "medium",
    trashCount: 48,
    lastReported: Date.now() - 14400000,
    icon: "🟡",
  },
  {
    id: "gs_005",
    regionId: "gangseoku",
    name: "공항동 골목길",
    lat: 37.5550,
    lng: 126.8750,
    severity: "low",
    trashCount: 25,
    lastReported: Date.now() - 18000000,
    icon: "🟢",
  },
  {
    id: "gs_006",
    regionId: "gangseoku",
    name: "발산동 상가",
    lat: 37.5380,
    lng: 126.8450,
    severity: "high",
    trashCount: 110,
    lastReported: Date.now() - 5400000,
    icon: "🔴",
  },
  {
    id: "gs_007",
    regionId: "gangseoku",
    name: "내발산동 주변",
    lat: 37.5620,
    lng: 126.8580,
    severity: "low",
    trashCount: 18,
    lastReported: Date.now() - 21600000,
    icon: "🟢",
  },
  {
    id: "gs_008",
    regionId: "gangseoku",
    name: "염창동 골목",
    lat: 37.5720,
    lng: 126.8200,
    severity: "medium",
    trashCount: 55,
    lastReported: Date.now() - 12600000,
    icon: "🟡",
  },
];

// 마포구 핫스팟
const MAPOGU_HOTSPOTS: RegionalHotspot[] = [
  {
    id: "mp_001",
    regionId: "mapogu",
    name: "합정동 상업지구",
    lat: 37.5465,
    lng: 126.9065,
    severity: "high",
    trashCount: 135,
    lastReported: Date.now() - 2400000,
    icon: "🔴",
  },
  {
    id: "mp_002",
    regionId: "mapogu",
    name: "망원동 주택가",
    lat: 37.5380,
    lng: 126.8920,
    severity: "high",
    trashCount: 98,
    lastReported: Date.now() - 5400000,
    icon: "🔴",
  },
  {
    id: "mp_003",
    regionId: "mapogu",
    name: "서교동 골목길",
    lat: 37.5520,
    lng: 126.9180,
    severity: "medium",
    trashCount: 67,
    lastReported: Date.now() - 9000000,
    icon: "🟡",
  },
  {
    id: "mp_004",
    regionId: "mapogu",
    name: "아현동 상가",
    lat: 37.5620,
    lng: 126.9320,
    severity: "medium",
    trashCount: 52,
    lastReported: Date.now() - 11400000,
    icon: "🟡",
  },
  {
    id: "mp_005",
    regionId: "mapogu",
    name: "도화동 이면도로",
    lat: 37.5280,
    lng: 126.9050,
    severity: "low",
    trashCount: 28,
    lastReported: Date.now() - 16200000,
    icon: "🟢",
  },
  {
    id: "mp_006",
    regionId: "mapogu",
    name: "신수동 주변",
    lat: 37.5450,
    lng: 126.8850,
    severity: "high",
    trashCount: 115,
    lastReported: Date.now() - 4200000,
    icon: "🔴",
  },
  {
    id: "mp_007",
    regionId: "mapogu",
    name: "토정동 골목",
    lat: 37.5680,
    lng: 126.9220,
    severity: "low",
    trashCount: 22,
    lastReported: Date.now() - 19800000,
    icon: "🟢",
  },
  {
    id: "mp_008",
    regionId: "mapogu",
    name: "연남동 카페거리",
    lat: 37.5550,
    lng: 126.9280,
    severity: "medium",
    trashCount: 58,
    lastReported: Date.now() - 13500000,
    icon: "🟡",
  },
];

// 서대문구 핫스팟
const SEODAEMUNGU_HOTSPOTS: RegionalHotspot[] = [
  {
    id: "sd_001",
    regionId: "seodaemungu",
    name: "신촌 상업지구",
    lat: 37.5795,
    lng: 126.9365,
    severity: "high",
    trashCount: 142,
    lastReported: Date.now() - 1800000,
    icon: "🔴",
  },
  {
    id: "sd_002",
    regionId: "seodaemungu",
    name: "이화동 주택가",
    lat: 37.5920,
    lng: 126.9420,
    severity: "high",
    trashCount: 105,
    lastReported: Date.now() - 4800000,
    icon: "🔴",
  },
  {
    id: "sd_003",
    regionId: "seodaemungu",
    name: "충정로 상가",
    lat: 37.5680,
    lng: 126.9580,
    severity: "medium",
    trashCount: 73,
    lastReported: Date.now() - 8400000,
    icon: "🟡",
  },
  {
    id: "sd_004",
    regionId: "seodaemungu",
    name: "홍제동 골목",
    lat: 37.6020,
    lng: 126.9280,
    severity: "medium",
    trashCount: 61,
    lastReported: Date.now() - 10200000,
    icon: "🟡",
  },
  {
    id: "sd_005",
    regionId: "seodaemungu",
    name: "북아현동 주변",
    lat: 37.5550,
    lng: 126.9450,
    severity: "low",
    trashCount: 32,
    lastReported: Date.now() - 15600000,
    icon: "🟢",
  },
  {
    id: "sd_006",
    regionId: "seodaemungu",
    name: "연희동 상업지구",
    lat: 37.5870,
    lng: 126.9150,
    severity: "high",
    trashCount: 122,
    lastReported: Date.now() - 3600000,
    icon: "🔴",
  },
  {
    id: "sd_007",
    regionId: "seodaemungu",
    name: "천연동 이면도로",
    lat: 37.6150,
    lng: 126.9520,
    severity: "low",
    trashCount: 26,
    lastReported: Date.now() - 18900000,
    icon: "🟢",
  },
  {
    id: "sd_008",
    regionId: "seodaemungu",
    name: "현저동 골목길",
    lat: 37.5720,
    lng: 126.9680,
    severity: "medium",
    trashCount: 64,
    lastReported: Date.now() - 12000000,
    icon: "🟡",
  },
];

// 은평구 핫스팟
const EUNPYEONGGU_HOTSPOTS: RegionalHotspot[] = [
  {
    id: "ep_001",
    regionId: "eunpyeonggu",
    name: "불광동 상업지구",
    lat: 37.6195,
    lng: 126.9265,
    severity: "high",
    trashCount: 138,
    lastReported: Date.now() - 2100000,
    icon: "🔴",
  },
  {
    id: "ep_002",
    regionId: "eunpyeonggu",
    name: "응암동 주택가",
    lat: 37.6050,
    lng: 126.9080,
    severity: "high",
    trashCount: 102,
    lastReported: Date.now() - 5100000,
    icon: "🔴",
  },
  {
    id: "ep_003",
    regionId: "eunpyeonggu",
    name: "진관동 골목",
    lat: 37.6350,
    lng: 126.9180,
    severity: "medium",
    trashCount: 69,
    lastReported: Date.now() - 8700000,
    icon: "🟡",
  },
  {
    id: "ep_004",
    regionId: "eunpyeonggu",
    name: "역촌동 상가",
    lat: 37.6280,
    lng: 126.9450,
    severity: "medium",
    trashCount: 55,
    lastReported: Date.now() - 11100000,
    icon: "🟡",
  },
  {
    id: "ep_005",
    regionId: "eunpyeonggu",
    name: "갈현동 주변",
    lat: 37.5950,
    lng: 126.9320,
    severity: "low",
    trashCount: 30,
    lastReported: Date.now() - 16500000,
    icon: "🟢",
  },
  {
    id: "ep_006",
    regionId: "eunpyeonggu",
    name: "신사동 상업지구",
    lat: 37.6120,
    lng: 126.8950,
    severity: "high",
    trashCount: 128,
    lastReported: Date.now() - 3300000,
    icon: "🔴",
  },
  {
    id: "ep_007",
    regionId: "eunpyeonggu",
    name: "수색동 이면도로",
    lat: 37.6450,
    lng: 126.9080,
    severity: "low",
    trashCount: 24,
    lastReported: Date.now() - 19200000,
    icon: "🟢",
  },
  {
    id: "ep_008",
    regionId: "eunpyeonggu",
    name: "녹번동 골목길",
    lat: 37.6020,
    lng: 126.9580,
    severity: "medium",
    trashCount: 66,
    lastReported: Date.now() - 12300000,
    icon: "🟡",
  },
];

// 모든 핫스팟 통합
const ALL_HOTSPOTS = [
  ...GANGSEOKU_HOTSPOTS,
  ...MAPOGU_HOTSPOTS,
  ...SEODAEMUNGU_HOTSPOTS,
  ...EUNPYEONGGU_HOTSPOTS,
];

// 지역별 핫스팟 조회
export function getHotspotsByRegion(regionId: string): RegionalHotspot[] {
  return ALL_HOTSPOTS.filter((h) => h.regionId === regionId);
}

// 지역별 심각도별 핫스팟 조회
export function getHotspotsByRegionAndSeverity(
  regionId: string,
  severity: "high" | "medium" | "low"
): RegionalHotspot[] {
  return ALL_HOTSPOTS.filter((h) => h.regionId === regionId && h.severity === severity);
}

// 모든 지역 조회
export function getAllRegions(): Region[] {
  return REGIONS;
}

// 지역 정보 조회
export function getRegionInfo(regionId: string): Region | undefined {
  return REGIONS.find((r) => r.id === regionId);
}

// 지역별 통계
export function getRegionStats(regionId: string) {
  const hotspots = getHotspotsByRegion(regionId);
  const highCount = hotspots.filter((h) => h.severity === "high").length;
  const mediumCount = hotspots.filter((h) => h.severity === "medium").length;
  const lowCount = hotspots.filter((h) => h.severity === "low").length;
  const totalTrash = hotspots.reduce((sum, h) => sum + h.trashCount, 0);

  return {
    regionId,
    totalHotspots: hotspots.length,
    highCount,
    mediumCount,
    lowCount,
    totalTrash,
  };
}
