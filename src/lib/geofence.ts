/**
 * Geofence utility — Haversine formula for distance calculations
 * Used to verify physical presence at a school during assessments.
 */

const EARTH_RADIUS_METERS = 6_371_000; // Earth's radius in meters

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
