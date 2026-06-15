// Roaster map (migration M2.1): Leaflet + OpenStreetMap — no API key, no Google/Forge.
import { cn } from "@/lib/utils";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";

// Fix Leaflet's default marker icon paths under a bundler (Vite).
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

export interface RoasterMarker {
  id: number;
  name: string;
  lat: number;
  lng: number;
}

interface MapViewProps {
  markers: RoasterMarker[];
  onMarkerClick?: (id: number) => void;
  initialCenter?: { lat: number; lng: number };
  initialZoom?: number;
  className?: string;
}

/** Pans/zooms the map to fit all markers whenever they change. */
function FitBounds({ markers }: { markers: RoasterMarker[] }) {
  const map = useMap();
  useEffect(() => {
    if (markers.length === 0) return;
    const bounds = L.latLngBounds(markers.map((m) => [m.lat, m.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [map, markers]);
  return null;
}

export function MapView({
  markers,
  onMarkerClick,
  initialCenter = { lat: 37.7749, lng: -122.4194 },
  initialZoom = 12,
  className,
}: MapViewProps) {
  return (
    <MapContainer
      center={[initialCenter.lat, initialCenter.lng]}
      zoom={initialZoom}
      className={cn("w-full h-[500px]", className)}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {markers.map((m) => (
        <Marker
          key={m.id}
          position={[m.lat, m.lng]}
          eventHandlers={onMarkerClick ? { click: () => onMarkerClick(m.id) } : undefined}
        >
          <Popup>{m.name}</Popup>
        </Marker>
      ))}
      <FitBounds markers={markers} />
    </MapContainer>
  );
}
