/**
 * Geofence utility — Haversine formula for distance calculations
 * Used to verify physical presence at a school during assessments.
 *
 * Also provides reverse geocode via Nominatim (OpenStreetMap).
 */

const EARTH_RADIUS_METERS = 6_371_000; // Earth's radius in meters

// In-memory cache for reverse geocode results to avoid hitting Nominatim rate limits
const geocodeCache = new Map<string, { name: string; timestamp: number }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Reverse geocode a latitude/longitude pair to a human-readable location name.
 * Uses Nominatim (OpenStreetMap) with caching and rate-limit protection.
 *
 * @returns A short location string (e.g. "CBD, Nairobi, Kenya") or null on failure
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  const key = `${lat.toFixed(6)},${lng.toFixed(6)}`;
  const cached = geocodeCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.name;
  }

  try {
    // Nominatim requires a User-Agent identifying the app
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=16`,
      { headers: { "User-Agent": "TMU-TP-Management-Platform/1.0" } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const displayName: string | undefined = data?.display_name;
    if (!displayName) return null;

    // Shorten to the first 3 parts for readability
    const parts = displayName.split(", ");
    const shortName = parts.slice(0, 3).join(", ");

    geocodeCache.set(key, { name: shortName, timestamp: Date.now() });
    return shortName;
  } catch {
    return null;
  }
}

/**
 * Synchronous cache lookup for reverse geocode — returns cached value only.
 * Use this for server-rendered contexts where async fetch is not possible.
 */
export function getCachedLocationName(lat: number, lng: number): string | null {
  const key = `${lat.toFixed(6)},${lng.toFixed(6)}`;
  const cached = geocodeCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.name;
  }
  return null;
}

/**
 * Convert degrees to radians.
 */
function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Calculate the great-circle distance between two GPS coordinates
 * using the Haversine formula.
 *
 * @returns Distance in meters
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_METERS * c;
}

export interface GeofenceResult {
  /** Whether the point is inside the geofence */
  isInside: boolean;
  /** Distance from the center in meters */
  distanceMeters: number;
  /** Human-readable distance string */
  distanceFormatted: string;
}

/**
 * Check whether a GPS coordinate is within a circular geofence.
 *
 * @param userLat   The user's current latitude
 * @param userLon   The user's current longitude
 * @param centerLat The school's latitude (center of geofence)
 * @param centerLon The school's longitude (center of geofence)
 * @param radiusMeters  The geofence radius in meters (default 100)
 */
export function checkGeofence(
  userLat: number,
  userLon: number,
  centerLat: number,
  centerLon: number,
  radiusMeters: number = 100
): GeofenceResult {
  const distance = haversineDistance(userLat, userLon, centerLat, centerLon);

  let distanceFormatted: string;
  if (distance < 1000) {
    distanceFormatted = `${Math.round(distance)}m`;
  } else {
    distanceFormatted = `${(distance / 1000).toFixed(1)}km`;
  }

  return {
    isInside: distance <= radiusMeters,
    distanceMeters: Math.round(distance),
    distanceFormatted,
  };
}
