// Single Source of Truth Store for Live GPS Geolocation & Nearby Places Engine
import {
  fetchRealNearbyPlaces,
  reverseGeocodeAddress,
  RealPlace,
  Coordinates,
  calculateDistanceMeters,
} from "./overpassApi";
import {
  LocalDiscoveryEngine,
  EvaluatedPlace,
} from "./localDiscoveryEngine";
import { getCurrentMonthKey } from "./budgetEngine";

const DEFAULT_LOCATION: Coordinates = [18.0560, 83.4024]; // Campus coordinates
const CACHE_TTL_MS = 5 * 60 * 1000; // 5-minute cache
const DISTANCE_THRESHOLD_METERS = 100; // Auto-refresh if user moves > 100m

export interface NearbyPlacesStoreState {
  userLocation: Coordinates | null;
  mapCenter: Coordinates;
  locationAddress: string;
  locationAccuracy: number | null;
  lastUpdatedTime: string;
  locationError: boolean;
  loadingLocation: boolean;
  rawPlaces: RealPlace[];
  evaluatedPlaces: EvaluatedPlace[];
  loadingPlaces: boolean;
  selectedPlaceId: string | null;
  lastFetchedTimestamp: number;
}

type Listener = () => void;

class NearbyPlacesStore {
  private state: NearbyPlacesStoreState = {
    userLocation: null,
    mapCenter: DEFAULT_LOCATION,
    locationAddress: "Requesting GPS Location...",
    locationAccuracy: null,
    lastUpdatedTime: "",
    locationError: false,
    loadingLocation: true,
    rawPlaces: [],
    evaluatedPlaces: [],
    loadingPlaces: false,
    selectedPlaceId: null,
    lastFetchedTimestamp: 0,
  };

  private listeners: Set<Listener> = new Set();
  private isInitializing: boolean = false;

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    // Auto-init on first subscriber if not already initialized
    if (!this.isInitializing && this.state.rawPlaces.length === 0) {
      this.initLocation();
    }
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => {
      try {
        fn();
      } catch (err) {
        console.warn("Error in nearbyPlacesStore listener:", err);
      }
    });
  }

  public getState(): NearbyPlacesStoreState {
    return { ...this.state };
  }

  public initLocation() {
    if (this.isInitializing) return;
    this.isInitializing = true;
    this.requestLocation();
  }

  public requestLocation = (forceRefresh: boolean = false) => {
    const now = Date.now();
    
    // Use cached data if within 5 min TTL and not forced
    if (
      !forceRefresh &&
      this.state.rawPlaces.length > 0 &&
      now - this.state.lastFetchedTimestamp < CACHE_TTL_MS
    ) {
      this.state.loadingLocation = false;
      this.notify();
      return;
    }

    this.state.loadingLocation = true;
    this.state.locationError = false;
    this.notify();

    if (!navigator.geolocation) {
      this.handleLocationFallback("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const loc: Coordinates = [coords.latitude, coords.longitude];
        const oldLoc = this.state.userLocation;
        
        // Calculate distance moved if previous location exists
        const distanceMoved = oldLoc ? calculateDistanceMeters(oldLoc, loc) : 999;
        
        this.state.userLocation = loc;
        this.state.mapCenter = loc;
        this.state.locationAccuracy = Math.round(coords.accuracy || 15);
        this.state.lastUpdatedTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        this.state.loadingLocation = false;
        this.notify();

        // Reverse Geocode Address
        const addr = await reverseGeocodeAddress(coords.latitude, coords.longitude);
        this.state.locationAddress = addr;
        this.notify();

        // Fetch places if forced, expired, or moved > 100m
        if (forceRefresh || distanceMoved > DISTANCE_THRESHOLD_METERS || this.state.rawPlaces.length === 0) {
          await this.loadPlacesForLocation(loc, addr);
        }
      },
      (err) => {
        console.warn("GPS Permission or network issue:", err);
        this.handleLocationFallback("College Campus, Vizianagaram (Fallback)");
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
    );
  };

  private async handleLocationFallback(addressLabel: string) {
    this.state.locationError = true;
    this.state.loadingLocation = false;
    this.state.userLocation = DEFAULT_LOCATION;
    this.state.mapCenter = DEFAULT_LOCATION;
    this.state.locationAddress = addressLabel;
    this.state.lastUpdatedTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    this.notify();

    await this.loadPlacesForLocation(DEFAULT_LOCATION, addressLabel);
  }

  public async loadPlacesForLocation(loc: Coordinates, addressLabel?: string) {
    this.state.loadingPlaces = true;
    this.notify();

    try {
      const fetched = await fetchRealNearbyPlaces(loc);
      const monthKey = getCurrentMonthKey();
      const evaluated = LocalDiscoveryEngine.evaluatePlaces(fetched, monthKey);

      this.state.rawPlaces = fetched;
      this.state.evaluatedPlaces = evaluated;
      this.state.lastFetchedTimestamp = Date.now();

      // If user had searched, record in localStorage
      try {
        const summary = {
          lastSearchedLocation: addressLabel || this.state.locationAddress,
          recentlyDiscoveredCount: fetched.length,
          visitedCount: LocalDiscoveryEngine.getVisitedHistory().length,
        };
        localStorage.setItem("compass_nearby_summary", JSON.stringify(summary));
      } catch {}
    } catch (err) {
      console.warn("Failed to load places in store:", err);
    } finally {
      this.state.loadingPlaces = false;
      this.notify();
    }
  }

  public refreshBudgetEvaluation() {
    if (this.state.rawPlaces.length > 0) {
      const monthKey = getCurrentMonthKey();
      this.state.evaluatedPlaces = LocalDiscoveryEngine.evaluatePlaces(this.state.rawPlaces, monthKey);
      this.notify();
    }
  }

  public setSelectedPlace(placeId: string | null) {
    this.state.selectedPlaceId = placeId;
    this.notify();
  }

  public getTopPlaces(limit: number = 4): EvaluatedPlace[] {
    return [...this.state.evaluatedPlaces]
      .sort((a, b) => b.aiScorePercent - a.aiScorePercent)
      .slice(0, limit);
  }
}

export const nearbyPlacesStore = new NearbyPlacesStore();
