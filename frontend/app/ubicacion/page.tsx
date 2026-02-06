'use client'; 

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';

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
  const [selectedLocation, setSelectedLocation] = useState<{lat: number, lon: number, nombre?: string} | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([4.6097, -74.0817]); 
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // --- LÓGICA DE GEOCODIFICACIÓN INVERSA (Clic en mapa) ---
  const obtenerNombreCiudad = async (lat: number, lon: number) => {
     try {
         // Usamos Nominatim para saber qué ciudad es
         const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
         const data = await res.json();
         // Intentamos obtener ciudad, municipio o pueblo
         const ciudad = data.address?.city || data.address?.town || data.address?.village || data.address?.county || "Ubicación seleccionada";
         return ciudad;
     } catch (_error) {
         return "Ubicación personalizada " + _error;
     }
  };

  // --- EVENTO: CLIC EN EL MAPA ---
  const handleLocationSelect = async (lat: number, lng: number) => {
    // 1. Guardamos coord temporalmente sin nombre mientras cargamos
    setSelectedLocation({ lat, lon: lng, nombre: "Cargando nombre..." });
    
    // 2. Buscamos el nombre real
    const nombreCiudad = await obtenerNombreCiudad(lat, lng);
    setSelectedLocation({ lat, lon: lng, nombre: nombreCiudad });
  };

  // --- EVENTO: BUSCADOR ---
  const handleSearch = async () => {
    if (!searchQuery) return;
    setIsSearching(true);

    try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();

        if (data && data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lon = parseFloat(data[0].lon);
            // El display_name suele ser largo, tomamos solo la primera parte (la ciudad)
            const nombreCompleto = data[0].display_name.split(',')[0]; 
            
            setMapCenter([lat, lon]); 
            setSelectedLocation({ lat, lon, nombre: nombreCompleto }); // Guardamos el nombre encontrado
        } else {
            alert("Ciudad no encontrada.");
        }
    } catch (error) {
        console.error(error);
        alert("Error al buscar.");
    } finally {
        setIsSearching(false);
    }
  };

  const handleContinue = () => {
    if (selectedLocation) {
        localStorage.setItem('solarLocation', JSON.stringify(selectedLocation));
        router.push('/calculadora');
    }
  };

  return (
    <main className="h-screen flex flex-col bg-slate-50">
      <Navbar />
      <div className="flex-1 relative">
        
        {/* Buscador */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-1000 w-11/12 max-w-md">
            <div className="bg-white p-2 rounded-xl shadow-xl flex gap-2 border border-slate-100">
                <input 
                    type="text" 
                    placeholder="Buscar ciudad (ej: Bucaramanga)" 
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

        <MapBase onLocationSelect={handleLocationSelect} center={mapCenter} />

        {/* Tarjeta Inferior */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-1000 w-11/12 max-w-md">
             <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-2xl border border-white/50 animate-fade-in text-center">
                <h3 className="font-bold text-slate-800 text-lg mb-1">
                    {selectedLocation?.nombre || "Punto de Instalación"}
                </h3>
                
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