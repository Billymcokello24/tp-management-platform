"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Building, Loader2, CheckCircle2, List } from "lucide-react";
import { toast } from "sonner";
import { updateStudentSchool, assignExistingSchool } from "../_actions/student";
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

export function SchoolSelectorClient({ 
  currentSchool, 
  availableSchools 
}: { 
  currentSchool: any;
  availableSchools: { id: string; name: string; county: string }[];
}) {
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
  
  const [loadingMap, setLoadingMap] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(false);
  const [mapCenter, setMapCenter] = useState<{lat: number, lng: number}>({ lat: -1.2921, lng: 36.8219 });
  const [selectedExistingId, setSelectedExistingId] = useState<string>("");

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
      const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(inputValue)}&lat=-1.2921&lon=36.8219&limit=15`);
      const data = await res.json();
      
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

  const handleConfirmMap = async () => {
    if (!selectedPlace) return;

    setLoadingMap(true);
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
      setLoadingMap(false);
    }
  };

  const handleConfirmExisting = async () => {
    if (!selectedExistingId) return;

    setLoadingExisting(true);
    try {
      await assignExistingSchool(selectedExistingId);
      toast.success("School assigned successfully!");
    } catch (e: any) {
      toast.error(e.message || "Failed to assign school");
    } finally {
      setLoadingExisting(false);
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
          Choose from existing schools in the system, or search the map to add a new one.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="existing" className="w-full">
          <div className="px-4 pt-4 bg-background">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="existing" className="flex items-center gap-2"><List className="h-4 w-4" /> Existing Schools</TabsTrigger>
              <TabsTrigger value="map" className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Search Map</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="existing" className="m-0 p-6 bg-background min-h-[300px]">
            <div className="max-w-md mx-auto space-y-6 mt-8">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Select a School from Database
                </label>
                <Select value={selectedExistingId} onValueChange={(v) => setSelectedExistingId(v || "")}>
                  <SelectTrigger className="w-full h-12">
                    <SelectValue placeholder="Search or select a school..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {availableSchools.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name} ({s.county})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-2">
                  Can't find your school? Use the "Search Map" tab to add it manually.
                </p>
              </div>

              <Button 
                onClick={handleConfirmExisting} 
                disabled={!selectedExistingId || loadingExisting} 
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md rounded-xl"
              >
                {loadingExisting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                Confirm Selection
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="map" className="m-0 relative focus-visible:outline-none">
            <div className="p-4 bg-background relative z-20">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-9 bg-background shadow-sm"
                    placeholder="Search OpenStreetMap (e.g. Kisumu Boys High School)"
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
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
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
                <Button onClick={handleConfirmMap} disabled={loadingMap} className="shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md rounded-xl">
                  {loadingMap ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                  Confirm Placement
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
