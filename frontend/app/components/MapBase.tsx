'use client';

import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useState, useEffect } from 'react';

// Configuración de Iconos (igual que antes)
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// 1. Componente interno para detectar clics
function LocationMarker({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  const [position, setPosition] = useState<L.LatLng | null>(null);
  
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={icon}></Marker>
  );
}

// 2. Componente interno para mover la cámara cuando buscas una ciudad
function FlyToLocation({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        if (center) map.flyTo(center, 13); // Zoom 13 al encontrar ciudad
    }, [center, map]);
    return null;
}

interface MapBaseProps {
  onLocationSelect: (lat: number, lng: number) => void;
  center?: [number, number]; // Nueva prop opcional
}

export default function MapBase({ onLocationSelect, center = [4.6097, -74.0817] }: MapBaseProps) {
  return (
    <MapContainer 
      center={center} 
      zoom={6} 
      style={{ height: "100%", width: "100%", zIndex: 10 }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker onLocationSelect={onLocationSelect} />
      {/* Activamos el movimiento de cámara */}
      <FlyToLocation center={center} />
    </MapContainer>
  );
}