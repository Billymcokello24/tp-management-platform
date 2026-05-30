"use client";

import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getCounties, getSubCountiesByCounty, getWardsByConstituency } from "osm-kenya-boundaries";

export interface LocationData {
  county: string;
  subCounty: string;
  ward: string;
  village: string;
}

interface KenyaLocationPickerProps {
  value: LocationData;
  onChange: (data: LocationData) => void;
  required?: boolean;
}

export function KenyaLocationPicker({ value, onChange, required = false }: KenyaLocationPickerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const counties = getCounties().sort((a, b) => a.name.localeCompare(b.name));
  
  const subCounties = value.county 
    ? getSubCountiesByCounty(value.county).sort((a, b) => a.name.localeCompare(b.name))
    : [];
    
  const wards = value.subCounty
    ? getWardsByConstituency(value.subCounty).sort((a, b) => a.name.localeCompare(b.name))
    : [];

  const handleCountyChange = (county: string | null) => {
    onChange({ county: county || "", subCounty: "", ward: "", village: "" });
  };

  const handleSubCountyChange = (subCounty: string | null) => {
    onChange({ ...value, subCounty: subCounty || "", ward: "", village: "" });
  };

  const handleWardChange = (ward: string | null) => {
    onChange({ ...value, ward: ward || "", village: "" });
  };

  const handleVillageChange = (village: string) => {
    onChange({ ...value, village });
  };

  if (!mounted) {
    return <div className="animate-pulse bg-muted h-32 rounded-md w-full"></div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label>County {required && "*"}</Label>
        <Select value={value.county || null} onValueChange={handleCountyChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select County" />
          </SelectTrigger>
          <SelectContent>
            {counties.map((c) => (
              <SelectItem key={c.code} value={c.name}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Sub-County {required && "*"}</Label>
        <Select 
          value={value.subCounty || null} 
          onValueChange={handleSubCountyChange} 
          disabled={!value.county}
        >
          <SelectTrigger>
            <SelectValue placeholder={value.county ? "Select Sub-County" : "Select County first"} />
          </SelectTrigger>
          <SelectContent>
            {subCounties.map((sc) => (
              <SelectItem key={sc.code} value={sc.name}>
                {sc.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Ward</Label>
        <Select 
          value={value.ward || null} 
          onValueChange={handleWardChange} 
          disabled={!value.subCounty}
        >
          <SelectTrigger>
            <SelectValue placeholder={value.subCounty ? "Select Ward" : "Select Sub-County first"} />
          </SelectTrigger>
          <SelectContent>
            {wards.map((w) => (
              <SelectItem key={w.code} value={w.name}>
                {w.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Village / Location</Label>
        <Input 
          placeholder="Enter village or exact location..." 
          value={value.village} 
          onChange={(e) => handleVillageChange(e.target.value)} 
        />
      </div>
    </div>
  );
}
