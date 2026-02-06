'use client'; // Vital para interactividad

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation'; // Ojo: usa next/navigation en App Router
import Navbar from '../components/Navbar';

// 1. Importación dinámica del Mapa (sin SSR)
const MapBase = dynamic(() => import('../components/MapBase'), { 
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-slate-100 text-slate-400">
        <i className="fa-solid fa-circle-notch fa-spin text-3xl"></i>
    </div>
  )
});

export default function UbicacionPage() {
  const router = useRouter();
  
  // Estados
  const [selectedLocation, setSelectedLocation] = useState<{lat: number, lon: number} | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([4.6097, -74.0817]); // Centro inicial (Bogotá)
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Lógica: Cuando el usuario hace clic en el mapa
  const handleLocationSelect = (lat: number, lng: number) => {
    setSelectedLocation({ lat, lon: lng });
  };

  // Lógica: Buscar ciudad (Nominatim API)
  const handleSearch = async () => {
    if (!searchQuery) return;
    setIsSearching(true);

    try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();

        if (data && data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lon = parseFloat(data[0].lon);
            setMapCenter([lat, lon]); // Esto moverá el mapa gracias al componente FlyToLocation
        } else {
            alert("Ciudad no encontrada. Intenta ser más específico.");
        }
    } catch (error) {
        console.error(error);
        alert("Error al buscar la ubicación.");
    } finally {
        setIsSearching(false);
    }
  };

  // Lógica: Guardar y Continuar
  const handleContinue = () => {
    if (selectedLocation) {
        localStorage.setItem('solarLocation', JSON.stringify(selectedLocation));
        router.push('/calculadora'); // Navegación tipo SPA
    }
  };

  return (
    <main className="h-screen flex flex-col bg-slate-50">
      
      {/* 1. Navbar Superior */}
      <Navbar />

      
      <div className="flex-1 relative">
        
        {/* 3. Buscador Flotante */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-1000 w-11/12 max-w-md">
            <div className="bg-white p-2 rounded-xl shadow-xl flex gap-2 border border-slate-100">
                <input 
                    type="text" 
                    placeholder="Buscar ciudad (ej: Medellín, Colombia)" 
                    className="w-full px-4 py-2 outline-none text-slate-700 placeholder:text-slate-400"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button 
                    onClick={handleSearch}
                    disabled={isSearching}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center min-w-12"
                >
                    {isSearching ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-search"></i>}
                </button>
            </div>
        </div>

        {/* 4. Mapa */}
        <MapBase onLocationSelect={handleLocationSelect} center={mapCenter} />

        {/* 5. Tarjeta Inferior de Confirmación */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-1000 w-11/12 max-w-md">
             <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-2xl border border-white/50 animate-fade-in text-center">
                <h3 className="font-bold text-slate-800 text-lg mb-1">Punto de Instalación</h3>
                
                <p className={`text-sm mb-4 ${selectedLocation ? 'text-green-600 font-medium' : 'text-slate-500'}`}>
                    {selectedLocation 
                        ? `Coordenadas: ${selectedLocation.lat.toFixed(4)}, ${selectedLocation.lon.toFixed(4)}`
                        : "Haz clic en el mapa para ubicar tu techo."
                    }
                </p>

                <button 
                    onClick={handleContinue}
                    disabled={!selectedLocation}
                    className={`w-full py-4 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2
                        ${selectedLocation 
                            ? 'bg-red-600 text-white hover:bg-red-700 hover:scale-[1.02] shadow-red-500/30' 
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                >
                    <span>Confirmar Ubicación</span>
                    <i className="fa-solid fa-check"></i>
                </button>
             </div>
        </div>

      </div>
    </main>
  );
}