/**
 * Configurable Directions URL Provider Service
 * Prevents hardcoding a single proprietary directions provider.
 */

export type DirectionsProvider = 'google' | 'openstreetmap' | 'apple';

export interface DirectionsOptions {
  userLat?: number;
  userLon?: number;
  destLat: number;
  destLon: number;
  destName?: string;
  provider?: DirectionsProvider;
}

const DEFAULT_PROVIDER: DirectionsProvider =
  ((import.meta as any).env?.VITE_DIRECTIONS_PROVIDER as DirectionsProvider) || 'google';

/**
 * Returns a navigation/directions URL based on the configured provider.
 */
export function getDirectionsUrl({
  userLat,
  userLon,
  destLat,
  destLon,
  destName,
  provider = DEFAULT_PROVIDER,
}: DirectionsOptions): string {
  const destinationQuery = destName ? encodeURIComponent(destName) : `${destLat},${destLon}`;

  switch (provider) {
    case 'openstreetmap': {
      if (userLat != null && userLon != null) {
        return `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${userLat}%2C${userLon}%3B${destLat}%2C${destLon}`;
      }
      return `https://www.openstreetmap.org/search?query=${destinationQuery}#map=16/${destLat}/${destLon}`;
    }
    case 'apple': {
      if (userLat != null && userLon != null) {
        return `https://maps.apple.com/?saddr=${userLat},${userLon}&daddr=${destLat},${destLon}`;
      }
      return `https://maps.apple.com/?q=${destinationQuery}&ll=${destLat},${destLon}`;
    }
    case 'google':
    default: {
      if (userLat != null && userLon != null) {
        return `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLon}&destination=${destLat},${destLon}`;
      }
      return `https://www.google.com/maps/search/?api=1&query=${destinationQuery}`;
    }
  }
}
