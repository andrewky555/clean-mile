import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Activity {
  id: string;
  type: "pickup" | "report";
  points: number;
  trashType: string;
  timestamp: number;
  location?: string;
}

export interface HotSpot {
  id: string;
  lat: number;
  lng: number;
  title: string;
  severity: "low" | "medium" | "high";
  reportedAt: number;
  reportCount: number;
}

export interface RankingUser {
  id: string;
  name: string;
  points: number;
  pickupCount: number;
  badge: string;
  isMe?: boolean;
}

const KEYS = {
  POINTS: "cleanmile_points",
  ACTIVITIES: "cleanmile_activities",
  HOTSPOTS: "cleanmile_hotspots",
  USERNAME: "cleanmile_username",
  LEVEL: "cleanmile_level",
};

// --- Points ---
export async function getPoints(): Promise<number> {
  const val = await AsyncStorage.getItem(KEYS.POINTS);
  return val ? parseInt(val, 10) : 0;
}

export async function addPoints(amount: number): Promise<number> {
  const current = await getPoints();
  const next = current + amount;
  await AsyncStorage.setItem(KEYS.POINTS, String(next));
  return next;
}

// --- Activities ---
export async function getActivities(): Promise<Activity[]> {
  const val = await AsyncStorage.getItem(KEYS.ACTIVITIES);
  return val ? JSON.parse(val) : [];
}

export async function addActivity(activity: Omit<Activity, "id">): Promise<void> {
  const activities = await getActivities();
  const newActivity: Activity = { ...activity, id: Date.now().toString() };
  activities.unshift(newActivity);
  const trimmed = activities.slice(0, 100);
  await AsyncStorage.setItem(KEYS.ACTIVITIES, JSON.stringify(trimmed));
}

// --- Hotspots ---
export async function getHotSpots(): Promise<HotSpot[]> {
  const val = await AsyncStorage.getItem(KEYS.HOTSPOTS);
  return val ? JSON.parse(val) : [];
}

export async function addHotSpot(spot: Omit<HotSpot, "id">): Promise<void> {
  const spots = await getHotSpots();
  const newSpot: HotSpot = { ...spot, id: Date.now().toString() };
  spots.push(newSpot);
  await AsyncStorage.setItem(KEYS.HOTSPOTS, JSON.stringify(spots));
}

// --- Username ---
export async function getUsername(): Promise<string> {
  const val = await AsyncStorage.getItem(KEYS.USERNAME);
  return val ?? "환경지킴이";
}

export async function setUsername(name: string): Promise<void> {
  await AsyncStorage.setItem(KEYS.USERNAME, name);
}

// --- Ranking (mock data + real user) ---
export async function getRanking(): Promise<RankingUser[]> {
  const myPoints = await getPoints();
  const username = await getUsername();
  const activities = await getActivities();
  const myPickups = activities.filter((a) => a.type === "pickup").length;

  const mockUsers: RankingUser[] = [
    { id: "u1", name: "김환경", points: 4850, pickupCount: 97, badge: "🏆" },
    { id: "u2", name: "이청결", points: 3920, pickupCount: 78, badge: "🥈" },
    { id: "u3", name: "박지구", points: 3100, pickupCount: 62, badge: "🥉" },
    { id: "u4", name: "최그린", points: 2750, pickupCount: 55, badge: "🌿" },
    { id: "u5", name: "정에코", points: 2300, pickupCount: 46, badge: "🌿" },
    { id: "u6", name: "강클린", points: 1980, pickupCount: 40, badge: "🌱" },
    { id: "u7", name: "윤자연", points: 1650, pickupCount: 33, badge: "🌱" },
    { id: "u8", name: "조환경", points: 1200, pickupCount: 24, badge: "🌱" },
  ];

  const me: RankingUser = {
    id: "me",
    name: username,
    points: myPoints,
    pickupCount: myPickups,
    badge: myPoints >= 3000 ? "🥉" : myPoints >= 1000 ? "🌿" : "🌱",
    isMe: true,
  };

  const allUsers = [...mockUsers, me].sort((a, b) => b.points - a.points);
  return allUsers;
}

// --- Level ---
export function getLevel(points: number): { level: number; title: string; nextPoints: number; progress: number } {
  const levels = [
    { level: 1, title: "새싹", min: 0, max: 500 },
    { level: 2, title: "새싹지킴이", min: 500, max: 1500 },
    { level: 3, title: "환경지킴이", min: 1500, max: 3000 },
    { level: 4, title: "에코히어로", min: 3000, max: 6000 },
    { level: 5, title: "지구수호자", min: 6000, max: 10000 },
  ];
  const current = levels.find((l) => points >= l.min && points < l.max) ?? levels[levels.length - 1];
  const progress = Math.min((points - current.min) / (current.max - current.min), 1);
  return { level: current.level, title: current.title, nextPoints: current.max, progress };
}
