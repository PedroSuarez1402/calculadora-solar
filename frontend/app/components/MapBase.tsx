'use client';

import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useState, useEffect } from 'react';

// Configuración de Iconos
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Componente para manejar clics
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

// Componente para mover la cámara (ESTO ES LO QUE REALMENTE MUEVE EL MAPA)
function FlyToLocation({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            // Usamos flyTo o setView para mover el mapa sin desmontar el componente
            map.flyTo(center, map.getZoom()); 
        }
    }, [center, map]);
    return null;
}

interface MapBaseProps {
  onLocationSelect: (lat: number, lng: number) => void;
  center?: [number, number];
}

export default function MapBase({ onLocationSelect, center = [4.6097, -74.0817] }: MapBaseProps) {
  return (
    <MapContainer 
      // IMPORTANTE: No pasamos 'center' aquí dinámicamente. 
      // Pasamos una coordenada fija o el valor inicial solo para la primera carga.
      // Si pasas 'center' que cambia, React-Leaflet intenta reinicializar cosas que no debe.
      center={center} 
      zoom={13} 
      scrollWheelZoom={true}
      style={{ height: "100%", width: "100%", zIndex: 10 }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <LocationMarker onLocationSelect={onLocationSelect} />
      
      {/* Este componente se encarga de reaccionar a los cambios de 'center' */}
      <FlyToLocation center={center} />
    </MapContainer>
  );
}