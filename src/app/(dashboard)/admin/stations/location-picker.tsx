"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet icon issue in Next.js
const customIcon = typeof window !== 'undefined' ? new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
}) : null;

function MapEvents({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

interface LocationPickerProps {
  lat: string | undefined;
  lng: string | undefined;
  onChange: (lat: string, lng: string) => void;
}

export default function LocationPicker({ lat, lng, onChange }: LocationPickerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-[250px] w-full bg-muted flex items-center justify-center">Loading map...</div>;
  }

  const defaultLat = -1.2921;
  const defaultLng = 36.8219;
  const currentLat = lat ? parseFloat(lat) : defaultLat;
  const currentLng = lng ? parseFloat(lng) : defaultLng;
  const hasLocation = !!lat && !!lng;

  return (
    <div className="h-[250px] w-full rounded-md border overflow-hidden mt-2 relative group bg-muted z-0">
      <div className="absolute top-2 left-2 z-[1000] bg-background/80 backdrop-blur text-xs font-semibold px-2 py-1 rounded shadow-sm border pointer-events-none">
        Click on the map to set exact coordinates
      </div>
      <MapContainer
        center={[currentLat, currentLng]}
        zoom={hasLocation ? 15 : 6}
        style={{ height: "100%", width: "100%", zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ChangeView center={[currentLat, currentLng]} zoom={hasLocation ? 15 : 6} />
        <MapEvents onLocationSelect={(newLat, newLng) => onChange(newLat.toString(), newLng.toString())} />
        {hasLocation && customIcon && (
          <Marker position={[currentLat, currentLng]} icon={customIcon} />
        )}
      </MapContainer>
    </div>
  );
}
