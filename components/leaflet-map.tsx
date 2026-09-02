"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Hotspot } from "@/lib/map-system";

export interface LeafletMapProps {
  hotspots: Hotspot[];
  onMarkerClick: (hotspot: Hotspot) => void;
  selectedHotspot: Hotspot | null;
  currentLocation?: { lat: number; lng: number } | null;
  onRequestLocation?: () => void;
}

const SEVERITY_COLOR: Record<string, string> = {
  high: "#E74C3C",
  medium: "#F39C12",
  low: "#2ECC71",
};

const SEVERITY_LABEL: Record<string, string> = {
  high: "심각",
  medium: "보통",
  low: "양호",
};

export function LeafletMap({
  hotspots,
  onMarkerClick,
  selectedHotspot,
  currentLocation,
}: LeafletMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());

  useEffect(() => {
    if (!mapContainer.current) return;

    // 지도 초기화
    if (!map.current) {
      map.current = L.map(mapContainer.current, {
        center: [37.5505, 126.8495],
        zoom: 11,
        zoomControl: true,
      });

      // OpenStreetMap 타일 추가
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
        minZoom: 10,
      }).addTo(map.current);
    }

    // 기존 마커 제거
    markersRef.current.forEach((marker) => {
      if (map.current) map.current.removeLayer(marker);
    });
    markersRef.current.clear();

    // 새 마커 추가
    hotspots.forEach((hotspot) => {
      if (!map.current) return;

      const color = SEVERITY_COLOR[hotspot.severity];

      // 마커 HTML
      const markerHtml = `
        <div style="
          width: 32px;
          height: 32px;
          background-color: ${color};
          border: 3px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          cursor: pointer;
          font-weight: bold;
          color: white;
          font-size: 13px;
        ">
          ${hotspot.trashCount}
        </div>
      `;

      const icon = L.divIcon({
        html: markerHtml,
        iconSize: [32, 32],
        className: "custom-marker",
      });

      const marker = L.marker([hotspot.lat, hotspot.lng], { icon })
        .bindPopup(
          `<div style="font-family: system-ui; min-width: 220px;">
            <h3 style="margin: 0 0 10px 0; font-size: 14px; font-weight: 700;">${hotspot.name}</h3>
            <div style="background: #f5f5f5; padding: 10px; border-radius: 6px; margin-bottom: 10px; font-size: 12px;">
              <p style="margin: 4px 0;"><strong>쓰레기:</strong> ${hotspot.trashCount}건</p>
              <p style="margin: 4px 0;"><strong>지역:</strong> ${hotspot.region}</p>
              <p style="margin: 4px 0;"><strong>심각도:</strong> <span style="background: ${color}; color: white; padding: 2px 6px; border-radius: 4px; font-weight: 600;">${SEVERITY_LABEL[hotspot.severity]}</span></p>
            </div>
          </div>`
        )
        .on("click", () => {
          onMarkerClick(hotspot);
        })
        .addTo(map.current);

      markersRef.current.set(hotspot.id, marker);
    });

    if (currentLocation && map.current) {
      const userIcon = L.divIcon({
        html: `<div style="width:18px;height:18px;background:#2196F3;border:3px solid white;border-radius:50%;box-shadow:0 0 0 6px rgba(33,150,243,0.25);"></div>`,
        iconSize: [18, 18],
        className: "user-marker",
      });
      const userMarker = L.marker([currentLocation.lat, currentLocation.lng], {
        icon: userIcon,
      }).bindPopup("현재 위치");
      userMarker.addTo(map.current);
      markersRef.current.set("__user__", userMarker);
    }

    if (selectedHotspot && map.current) {
      const selectedMarker = markersRef.current.get(selectedHotspot.id);
      if (selectedMarker) {
        selectedMarker.openPopup();
        map.current.setView([selectedHotspot.lat, selectedHotspot.lng], 14, {
          animate: true,
          duration: 0.5,
        });
      }
    } else if (currentLocation && map.current) {
      map.current.setView([currentLocation.lat, currentLocation.lng], 14);
    }
  }, [hotspots, selectedHotspot, onMarkerClick, currentLocation]);

  return (
    <div
      ref={mapContainer}
      style={{
        width: "100%",
        height: "100%",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    />
  );
}
