import * as Location from "expo-location";

export type LatLng = { lat: number; lng: number };

export async function getDeviceLocation(): Promise<LatLng | null> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return null;

    try {
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      return { lat: loc.coords.latitude, lng: loc.coords.longitude };
    } catch {
      const last = await Location.getLastKnownPositionAsync();
      if (!last) return null;
      return { lat: last.coords.latitude, lng: last.coords.longitude };
    }
  } catch (error) {
    console.error("위치 가져오기 오류:", error);
    return null;
  }
}

export async function watchDeviceLocation(
  onChange: (loc: LatLng) => void
): Promise<() => void> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") return () => {};

  const sub = await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.Balanced,
      distanceInterval: 8,
      timeInterval: 4000,
    },
    (pos) => {
      onChange({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    }
  );
  return () => sub.remove();
}

export function distanceMeters(a: LatLng, b: LatLng): number {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h =
    sinLat * sinLat +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * sinLng * sinLng;
  return 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function toImageBase64(data: string): string {
  if (data.startsWith("data:")) {
    return data.split(",")[1] || data;
  }
  return data;
}
