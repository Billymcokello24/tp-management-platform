"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export interface GeoPosition {
  latitude: number;
  longitude: number;
  accuracy: number; // meters
  timestamp: number;
  locationName?: string; // reverse-geocoded human-readable name
}

export interface UseGeolocationReturn {
  /** Current position, null if not yet acquired */
  position: GeoPosition | null;
  /** Whether we're actively trying to get a position */
  loading: boolean;
  /** Error message if geolocation failed */
  error: string | null;
  /** Whether the browser supports geolocation */
  isSupported: boolean;
  /** Manually re-request the position */
  refresh: () => void;
}

/**
 * React hook for accessing the browser's Geolocation API.
 * Requests high-accuracy GPS on mount and provides a refresh function.
 */
export function useGeolocation(): UseGeolocationReturn {
  const [position, setPosition] = useState<GeoPosition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const reverseGeocodedRef = useRef(false);

  // Reverse-geocode once we have a position
  useEffect(() => {
    if (!position || reverseGeocodedRef.current || position.locationName) return;
    reverseGeocodedRef.current = true;
    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${position.latitude}&lon=${position.longitude}&format=json&zoom=16`)
      .then(r => r.json())
      .then(data => {
        if (data?.display_name) {
          const parts = data.display_name.split(", ");
          const short = parts.slice(0, 3).join(", ");
          setPosition(prev => prev ? { ...prev, locationName: short } : prev);
        }
      })
      .catch(() => { /* silently ignore */ });
  }, [position]);

  const isSupported = typeof window !== "undefined" && "geolocation" in navigator;

  const getPosition = useCallback(() => {
    if (!isSupported) {
      setError("Geolocation is not supported by this browser.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const handleSuccess = (pos: GeolocationPosition) => {
      setPosition({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        timestamp: pos.timestamp,
      });
      setLoading(false);
    };

    const handleError = async (err: GeolocationPositionError, isFallback = false) => {
      // If high accuracy fails, try falling back to low accuracy (browser Wi-Fi based)
      if (!isFallback && (err.code === err.TIMEOUT || err.code === err.POSITION_UNAVAILABLE)) {
        console.warn("High accuracy GPS failed. Falling back to low accuracy HTML5 location...");
        navigator.geolocation.getCurrentPosition(
          handleSuccess,
          (fallbackErr) => handleError(fallbackErr, true),
          { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
        );
        return;
      }

      let message = "Failed to get location.";
      switch (err.code) {
        case err.PERMISSION_DENIED:
          message = "Location permission denied. Please allow location access in your browser.";
          break;
        case err.POSITION_UNAVAILABLE:
          message = "Location information is unavailable on this device.";
          break;
        case err.TIMEOUT:
          message = "Location request timed out completely.";
          break;
      }
      setError(message);
      setLoading(false);
    };

    // First try: High accuracy GPS
    navigator.geolocation.getCurrentPosition(handleSuccess, (err) => handleError(err, false), {
      enableHighAccuracy: true,
      timeout: 10000, // Shorter timeout for high accuracy so it falls back quicker
      maximumAge: 0,
    });
  }, [isSupported]);

  useEffect(() => {
    getPosition();

    // Also start watching for continuous updates
    if (isSupported) {
      const startWatch = (highAccuracy: boolean) => {
        return navigator.geolocation.watchPosition(
          (pos) => {
            setPosition({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              accuracy: pos.coords.accuracy,
              timestamp: pos.timestamp,
            });
          },
          (err) => {
            // If high accuracy watch fails, restart watch with low accuracy
            if (highAccuracy && (err.code === err.TIMEOUT || err.code === err.POSITION_UNAVAILABLE)) {
              if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
              watchIdRef.current = startWatch(false);
            }
          },
          {
            enableHighAccuracy: highAccuracy,
            timeout: 15000,
            maximumAge: highAccuracy ? 0 : 60000,
          }
        );
      };

      watchIdRef.current = startWatch(true);
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [getPosition, isSupported]);

  return {
    position,
    loading,
    error,
    isSupported,
    refresh: getPosition,
  };
}
