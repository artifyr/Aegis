import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface SurveillanceNode {
  type?: string;
  id: number;
  lat: number;
  lon: number;
  tags?: Record<string, string>;
  country?: string; // We'll compute this approximately
}

export interface FlightNode {
  icao24: string;
  callsign: string;
  airline_code?: string;
  category: 'commercial' | 'private' | 'jet' | 'military';
  lng: number;
  lat: number;
  alt: number;
  speed_knots: number;
  heading: number;
  grounded: boolean;
  history?: { lat: number; lng: number }[];
}

export interface MaritimeNode {
  id?: string;
  name: string;
  lat: number;
  lng: number;
  type: string;
  country?: string;
  volume?: string;
  risk?: string;
  congestion?: string;
  traffic?: string;
  fleet?: string;
}

interface TacticalStore {
  // Currently fetched cameras in the viewport
  cameras: SurveillanceNode[];
  setCameras: (cameras: SurveillanceNode[]) => void;
  
  // Coordinate to dive to (triggered by watchlist search or sidebar click)
  diveTarget: { lat: number; lng: number; zoom?: number } | null;
  setDiveTarget: (target: { lat: number; lng: number; zoom?: number } | null) => void;

  // The currently focused camera feed popup
  activeCamera: SurveillanceNode | null;
  setActiveCamera: (cam: SurveillanceNode | null) => void;

  // Aviation
  flights: FlightNode[];
  setFlights: (flights: FlightNode[]) => void;

  // Maritime
  ports: MaritimeNode[];
  setPorts: (ports: MaritimeNode[]) => void;
  chokepoints: MaritimeNode[];
  setChokepoints: (chokepoints: MaritimeNode[]) => void;

  // UI Layers Visibility
  layers: {
    aviation_commercial: boolean;
    aviation_private: boolean;
    aviation_jets: boolean;
    aviation_military: boolean;
    maritime: boolean;
    cctv: boolean;
  };
  toggleLayer: (layerName: keyof TacticalStore['layers']) => void;
}

export const useTacticalStore = create<TacticalStore>()(
  persist(
    (set) => ({
      cameras: [],
      setCameras: (cameras) => set({ cameras }),
      
      diveTarget: null,
      setDiveTarget: (diveTarget) => set({ diveTarget }),

      activeCamera: null,
      setActiveCamera: (activeCamera) => set({ activeCamera }),

      flights: [],
      setFlights: (flights) => set({ flights }), // Removed history merge logic as trails are removed

      ports: [],
      setPorts: (ports) => set({ ports }),

      chokepoints: [],
      setChokepoints: (chokepoints) => set({ chokepoints }),

      layers: {
        aviation_commercial: false,
        aviation_private: false,
        aviation_jets: false,
        aviation_military: false,
        maritime: false,
        cctv: false,
      },
      toggleLayer: (layerName) => set((state) => ({
        layers: { ...state.layers, [layerName]: !state.layers[layerName] }
      })),
    }),
    {
      name: 'aegis-tactical-storage', // key in local storage
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ layers: state.layers }), // Only persist the layers object
    }
  )
);
