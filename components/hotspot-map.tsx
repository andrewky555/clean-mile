import { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Platform, TouchableOpacity } from "react-native";
import MapView, { Marker, UrlTile, type Region } from "react-native-maps";
import type { Hotspot } from "@/lib/map-system";

export const GANGSEO_REGION: Region = {
  latitude: 37.5505,
  longitude: 126.8495,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

const SEVERITY_COLOR: Record<string, string> = {
  high: "#E74C3C",
  medium: "#F39C12",
  low: "#2ECC71",
};

export type HotspotMapProps = {
  hotspots: Hotspot[];
  onMarkerClick: (hotspot: Hotspot) => void;
  selectedHotspot: Hotspot | null;
  currentLocation?: { lat: number; lng: number } | null;
  onRequestLocation?: () => void;
};

export function HotspotMap({
  hotspots,
  onMarkerClick,
  selectedHotspot,
  currentLocation,
  onRequestLocation,
}: HotspotMapProps) {
  const mapRef = useRef<MapView>(null);
  const didCenter = useRef(false);

  useEffect(() => {
    if (!currentLocation || !mapRef.current || didCenter.current) return;
    didCenter.current = true;
    mapRef.current.animateToRegion(
      {
        latitude: currentLocation.lat,
        longitude: currentLocation.lng,
        latitudeDelta: 0.03,
        longitudeDelta: 0.03,
      },
      600
    );
  }, [currentLocation]);

  useEffect(() => {
    if (!selectedHotspot || !mapRef.current) return;
    mapRef.current.animateToRegion(
      {
        latitude: selectedHotspot.lat,
        longitude: selectedHotspot.lng,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      },
      400
    );
  }, [selectedHotspot]);

  const recenter = () => {
    if (currentLocation && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: currentLocation.lat,
          longitude: currentLocation.lng,
          latitudeDelta: 0.03,
          longitudeDelta: 0.03,
        },
        400
      );
      return;
    }
    onRequestLocation?.();
  };

  return (
    <View style={styles.wrap}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={GANGSEO_REGION}
        mapType="standard"
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass
        loadingEnabled
        toolbarEnabled={false}
      >
        {Platform.OS === "android" ? (
          <UrlTile
            urlTemplate="https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png"
            maximumZ={19}
          />
        ) : null}
        {hotspots.map((hotspot) => (
          <Marker
            key={hotspot.id}
            coordinate={{ latitude: hotspot.lat, longitude: hotspot.lng }}
            title={hotspot.name}
            description={`쓰레기 ${hotspot.trashCount}건`}
            onPress={() => onMarkerClick(hotspot)}
          >
            <View style={styles.markerWrap}>
              <View
                style={[
                  styles.marker,
                  { backgroundColor: SEVERITY_COLOR[hotspot.severity] },
                  selectedHotspot?.id === hotspot.id && styles.markerSelected,
                ]}
              >
                <Text style={styles.markerText}>{hotspot.trashCount}</Text>
              </View>
            </View>
          </Marker>
        ))}
        {currentLocation ? (
          <Marker
            coordinate={{ latitude: currentLocation.lat, longitude: currentLocation.lng }}
            title="내 위치"
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={styles.meWrap}>
              <View style={styles.mePulse} />
              <View style={styles.meDot} />
            </View>
          </Marker>
        ) : null}
      </MapView>

      <TouchableOpacity style={styles.locateBtn} onPress={recenter} activeOpacity={0.85}>
        <Text style={styles.locateText}>내 위치</Text>
      </TouchableOpacity>
      {Platform.OS === "android" ? (
        <Text style={styles.osmAttr}>© OpenStreetMap</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: "#E8F5E9",
  },
  markerWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  marker: {
    minWidth: 28,
    height: 28,
    paddingHorizontal: 6,
    borderRadius: 14,
    borderWidth: 3,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  markerSelected: {
    transform: [{ scale: 1.15 }],
  },
  markerText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "800",
  },
  locateBtn: {
    position: "absolute",
    right: 12,
    bottom: 12,
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  locateText: {
    fontWeight: "800",
    fontSize: 13,
    color: "#1976D2",
  },
  meWrap: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  mePulse: {
    position: "absolute",
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(33,150,243,0.25)",
  },
  meDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#2196F3",
    borderWidth: 3,
    borderColor: "#fff",
  },
  osmAttr: {
    position: "absolute",
    left: 8,
    bottom: 8,
    fontSize: 10,
    color: "#333",
    backgroundColor: "rgba(255,255,255,0.7)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
});
