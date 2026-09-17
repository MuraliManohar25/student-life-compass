import React, { useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { StudentSpot } from '../types';
import { getDirectionsUrl } from '../services/directionsService';

interface ExploreMapProps {
  userLat?: number;
  userLon?: number;
  spots: StudentSpot[];
  selectedSpotId?: string | null;
  onSelectSpot: (spot: StudentSpot) => void;
  onRecenterUser?: () => void;
}

export const ExploreMap: React.FC<ExploreMapProps> = ({
  userLat,
  userLon,
  spots,
  selectedSpotId,
  onSelectSpot,
  onRecenterUser,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const userMarkerRef = useRef<maplibregl.Marker | null>(null);
  const spotMarkersRef = useRef<Map<string, maplibregl.Marker>>(new Map());
  const initialCenteredRef = useRef<boolean>(false);

  // Initialize MapLibre GL JS Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Default center to University of Washington CS Hall or provided user coords
    const initialLat = userLat ?? 47.6532;
    const initialLon = userLon ?? -122.3057;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          'carto-tiles': {
            type: 'raster',
            tiles: ['https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png'],
            tileSize: 256,
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank">CARTO</a>',
          },
        },
        layers: [
          {
            id: 'carto-layer',
            type: 'raster',
            source: 'carto-tiles',
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: [initialLon, initialLat],
      zoom: 14,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update user location marker (Pulsing blue marker)
  useEffect(() => {
    if (!mapRef.current || userLat == null || userLon == null) return;

    const map = mapRef.current;

    if (!userMarkerRef.current) {
      // Create user location DOM pin
      const el = document.createElement('div');
      el.className = 'relative flex items-center justify-center w-7 h-7';
      el.innerHTML = `
        <span class="absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75 animate-ping"></span>
        <span class="relative inline-flex rounded-full h-4 w-4 bg-indigo-600 ring-2 ring-white shadow-lg"></span>
      `;

      userMarkerRef.current = new maplibregl.Marker({ element: el })
        .setLngLat([userLon, userLat])
        .addTo(map);
    } else {
      userMarkerRef.current.setLngLat([userLon, userLat]);
    }

    // Automatically center map ONLY on initial location load
    if (!initialCenteredRef.current) {
      map.flyTo({ center: [userLon, userLat], zoom: 15 });
      initialCenteredRef.current = true;
    }
  }, [userLat, userLon]);

  // Update spot markers on map
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // Clear previous spot markers
    spotMarkersRef.current.forEach((marker) => marker.remove());
    spotMarkersRef.current.clear();

    spots.forEach((spot) => {
      if (spot.lat == null || spot.lon == null) return;

      const isSelected = spot.id === selectedSpotId;
      const isFree = spot.priceStatus === 'free';
      const isPaid = spot.priceStatus === 'paid';

      // Custom DOM Element for Spot Marker
      const el = document.createElement('div');
      el.className = `cursor-pointer transition-transform duration-150 ${
        isSelected ? 'scale-125 z-30' : 'hover:scale-110 z-10'
      }`;

      const bgColor = isFree ? 'bg-emerald-600' : isPaid ? 'bg-indigo-600' : 'bg-slate-700';
      const badgeText = isFree ? 'FREE' : isPaid ? 'PAID' : 'SPOT';

      el.innerHTML = `
        <div class="flex items-center gap-1 px-2 py-1 rounded-full ${bgColor} text-white shadow-md font-bold text-[10px] border border-white">
          <span>📍</span>
          <span>${badgeText}</span>
        </div>
      `;

      const directionsUrl = getDirectionsUrl({
        userLat,
        userLon,
        destLat: spot.lat,
        destLon: spot.lon,
        destName: spot.name,
      });

      // Map Popup HTML
      const popupHtml = `
        <div class="p-2 space-y-1.5 max-w-[200px] text-left">
          <h4 class="font-bold text-xs text-gray-900 leading-tight">📍 ${spot.name}</h4>
          <div class="text-[11px] text-indigo-600 font-semibold">📏 ${spot.distance}</div>
          <div class="text-[10px] text-gray-600">${spot.address || ''}</div>
          <div class="flex gap-1 items-center text-[10px] font-bold">
            ${
              spot.priceStatus === 'free'
                ? '<span class="text-emerald-600 bg-emerald-50 px-1 rounded">FREE</span>'
                : spot.priceStatus === 'paid'
                ? '<span class="text-indigo-600 bg-indigo-50 px-1 rounded">PAID</span>'
                : '<span class="text-gray-500">Price unavailable</span>'
            }
          </div>
          <a href="${directionsUrl}" target="_blank" rel="noopener noreferrer" class="inline-block mt-1 px-2 py-1 bg-indigo-600 text-white rounded text-[10px] font-bold">
            ➡️ Directions
          </a>
        </div>
      `;

      const popup = new maplibregl.Popup({ offset: 25, closeButton: false }).setHTML(popupHtml);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([spot.lon, spot.lat])
        .setPopup(popup)
        .addTo(map);

      el.addEventListener('click', () => {
        onSelectSpot(spot);
      });

      spotMarkersRef.current.set(spot.id, marker);
    });
  }, [spots, selectedSpotId, userLat, userLon, onSelectSpot]);

  // Focus selected spot when selectedSpotId changes
  useEffect(() => {
    if (!mapRef.current || !selectedSpotId) return;
    const spot = spots.find((s) => s.id === selectedSpotId);
    if (spot && spot.lat != null && spot.lon != null) {
      mapRef.current.easeTo({
        center: [spot.lon, spot.lat],
        zoom: 15.5,
      });
      const marker = spotMarkersRef.current.get(spot.id);
      if (marker) {
        marker.togglePopup();
      }
    }
  }, [selectedSpotId, spots]);

  const handleRecenter = () => {
    if (mapRef.current && userLat != null && userLon != null) {
      mapRef.current.flyTo({ center: [userLon, userLat], zoom: 15 });
    }
    if (onRecenterUser) onRecenterUser();
  };

  return (
    <div className="relative w-full h-[320px] sm:h-[420px] lg:h-[550px] rounded-3xl overflow-hidden border border-gray-200 shadow-sm bg-gray-100">
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Recenter / My Location Floating Action Button */}
      {userLat != null && userLon != null && (
        <button
          onClick={handleRecenter}
          type="button"
          title="Recenter on my location"
          className="absolute bottom-4 right-4 z-20 px-3 py-2 rounded-xl bg-white/95 backdrop-blur-md text-indigo-700 font-bold text-xs shadow-md border border-gray-200 hover:bg-indigo-50 flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">my_location</span>
          <span>Recenter</span>
        </button>
      )}

      {/* Map Attribution / Live Badge */}
      <div className="absolute top-3 left-3 z-20 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-gray-700 shadow-xs border border-gray-200 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span>MapLibre GL • OpenStreetMap</span>
      </div>
    </div>
  );
};
