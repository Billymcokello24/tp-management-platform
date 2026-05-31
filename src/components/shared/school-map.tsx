"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapPin } from "lucide-react";

// Fix Leaflet's default icon path issues in Next.js
const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface MapProps {
  schools: {
    id: string;
    name: string;
    latitude: number | null;
    longitude: number | null;
    geofenceRadius: number;
  }[];
}

export default function SchoolMap({ schools }: MapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return (
    <div className="w-full h-[400px] bg-muted/30 rounded-xl border border-border flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center">
        <MapPin className="h-8 w-8 text-muted-foreground/50 mb-2" />
        <span className="text-sm font-medium text-muted-foreground">Loading Map...</span>
      </div>
    </div>
  );

  const schoolsWithLocations = schools.filter(s => s.latitude !== null && s.longitude !== null);
  
  // Default to Nairobi if no schools have locations
  const center: [number, number] = schoolsWithLocations.length > 0
    ? [schoolsWithLocations[0].latitude as number, schoolsWithLocations[0].longitude as number]
    : [-1.286389, 36.817223];

  return (
    <div className="w-full h-[400px] rounded-xl overflow-hidden border border-border/60 shadow-sm relative z-0">
      <MapContainer 
        center={center} 
        zoom={schoolsWithLocations.length > 0 ? 12 : 6} 
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {schoolsWithLocations.map((school) => (
          <Marker 
            key={school.id} 
            position={[school.latitude as number, school.longitude as number]}
            icon={customIcon}
          >
            <Popup>
              <div className="font-semibold text-sm">{school.name}</div>
              <div className="text-xs text-muted-foreground mt-1">
                Geofence: {school.geofenceRadius}m
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
