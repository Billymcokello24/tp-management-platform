"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Building, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { updateStudentSchool } from "../_actions/student";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

// Dynamically import react-leaflet components since they rely on window
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });

// Leaflet icon fix for Next.js
import L from "leaflet";
const customIcon = typeof window !== 'undefined' ? new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
}) : null;

export function SchoolSelectorClient({ currentSchool }: { currentSchool: any }) {
  const [inputValue, setInputValue] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const [selectedPlace, setSelectedPlace] = useState<{
    name: string;
    address: string;
    lat: number;
    lng: number;
    county: string;
  } | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState<{lat: number, lng: number}>({ lat: -1.2921, lng: 36.8219 }); // Default Nairobi

  useEffect(() => {
    if (currentSchool && currentSchool.latitude && currentSchool.longitude) {
      setMapCenter({ lat: currentSchool.latitude, lng: currentSchool.longitude });
    }
  }, [currentSchool]);

  const handleSearch = async () => {
    if (!inputValue.trim()) return;
    setSearching(true);
    setSearchResults([]);
    try {
      // Photon API for better fuzzy searching (built on OSM)
      const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(inputValue)}&lat=-1.2921&lon=36.8219&limit=15`);
      const data = await res.json();
      
      // Filter for Kenya
      const filtered = data.features ? data.features.filter((f: any) => f.properties.countrycode === "KE") : [];
      
      if (filtered.length === 0) {
        toast.info("No schools found. Try a different name.");
      } else {
        setSearchResults(filtered);
      }
    } catch (e) {
      toast.error("Failed to search OpenStreetMap.");
    } finally {
      setSearching(false);
    }
  };

  const handlePlaceSelect = (feature: any) => {
    const lat = feature.geometry.coordinates[1];
    const lng = feature.geometry.coordinates[0];
    
    // Extract county if possible
    const props = feature.properties;
    let county = props.county || props.state || "Unknown";
    county = county.replace(" County", "");

    const addressStr = [props.street, props.city, props.state].filter(Boolean).join(", ");

    setSelectedPlace({
      name: props.name || inputValue,
      address: addressStr || "Unknown Address",
      lat,
      lng,
      county
    });
    
    setMapCenter({ lat, lng });
    setSearchResults([]);
    setInputValue(props.name || inputValue);
  };

  const handleConfirm = async () => {
    if (!selectedPlace) return;

    setLoading(true);
    try {
      await updateStudentSchool({
        name: selectedPlace.name,
        address: selectedPlace.address,
        latitude: selectedPlace.lat,
        longitude: selectedPlace.lng,
        county: selectedPlace.county,
      });
      toast.success("School updated successfully!");
      setSelectedPlace(null);
    } catch (e: any) {
      toast.error(e.message || "Failed to update school");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="overflow-hidden border-2 border-primary/10 shadow-sm">
      <CardHeader className="bg-muted/30 pb-4 border-b">
        <CardTitle className="text-lg flex items-center gap-2">
          <Building className="h-5 w-5 text-primary" /> 
          {currentSchool ? "Update School Placement" : "Select Your School"}
        </CardTitle>
        <CardDescription>
          Search for your school using OpenStreetMap to automatically link your profile and capture GPS coordinates for supervision.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="p-4 bg-background relative z-20">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-9 bg-background shadow-sm"
                placeholder="Search for your school (e.g. Kisumu Boys High School)"
              />
            </div>
            <Button onClick={handleSearch} disabled={searching} variant="secondary">
              {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
            </Button>
          </div>

          {searchResults.length > 0 && (
            <div className="absolute top-full left-4 right-4 mt-1 bg-background border rounded-md shadow-xl overflow-hidden z-50">
              {searchResults.map((result, idx) => (
                <div 
                  key={idx} 
                  className="p-3 hover:bg-muted cursor-pointer border-b last:border-0"
                  onClick={() => handlePlaceSelect(result)}
                >
                  <p className="font-medium text-sm text-foreground">{result.properties.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{[result.properties.street, result.properties.city, result.properties.state].filter(Boolean).join(", ")}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="h-[400px] w-full bg-muted relative z-0">
          <MapContainer 
            center={[mapCenter.lat, mapCenter.lng]} 
            zoom={15} 
            style={{ height: '100%', width: '100%', zIndex: 0 }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {selectedPlace && customIcon && (
              <Marker position={[selectedPlace.lat, selectedPlace.lng]} icon={customIcon}>
                <Popup>{selectedPlace.name}</Popup>
              </Marker>
            )}
            {!selectedPlace && currentSchool?.latitude && currentSchool?.longitude && customIcon && (
              <Marker position={[currentSchool.latitude, currentSchool.longitude]} icon={customIcon}>
                <Popup>{currentSchool.name}</Popup>
              </Marker>
            )}
          </MapContainer>
        </div>

        {selectedPlace && (
          <div className="p-4 bg-primary/5 border-t border-primary/10 flex items-center justify-between">
            <div>
              <p className="font-semibold text-primary">{selectedPlace.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5 max-w-[200px] md:max-w-md truncate">{selectedPlace.address}</p>
            </div>
            <Button onClick={handleConfirm} disabled={loading} className="shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md rounded-xl">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
              Confirm Placement
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
