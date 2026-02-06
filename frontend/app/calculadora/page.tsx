'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';

// Definimos la estructura de la respuesta que viene del Backend
interface SolarResponse {
  recomendacion: {
    tamañoSistema: string; // "X kW"
    panelesSugeridos: number;
    mensaje: string;
  };
  analisis: {
    radiacionZona: string;
    produccionPorKW: string;
  };
  inputs: {
    consumoCalculadoKWh: number;
  };
}

export default function CalculadoraPage() {
  const router = useRouter();
  
  // --- ESTADOS ---
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<'dinero' | 'kwh'>('dinero'); // Modo por defecto
  const [inputValue, setInputValue] = useState('');
  const [costoUnitario, setCostoUnitario] = useState('650'); // Valor por defecto COP
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SolarResponse | null>(null);

  // --- EFECTOS ---
  useEffect(() => {
    setMounted(true);
    // Verificar si tenemos ubicación. Si no, devolver al mapa.
    const savedLoc = localStorage.getItem('solarLocation');
    if (!savedLoc) {
      router.push('/ubicacion');
    }
  }, [router]);

  // Evitar renderizado en servidor que cause errores de hidratación con localStorage
  if (!mounted) return null;

  // --- LÓGICA ---
  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      // 1. Recuperar ubicación
      const locationData = JSON.parse(localStorage.getItem('solarLocation') || '{}');

      // 2. Preparar payload para el backend
      const payload = {
        lat: locationData.lat,
        lon: locationData.lon,
        tipo: mode, // 'dinero' o 'kwh'
        valor: parseFloat(inputValue),
        costoUnitario: mode === 'dinero' ? parseFloat(costoUnitario) : null
      };

      // 3. Petición al Backend (Puerto 3001)
      const res = await fetch('http://localhost:3001/api/calcular', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Error en el cálculo');

      const data: SolarResponse = await res.json();
      setResult(data);

    } catch (error) {
      console.error(error);
      alert("Ocurrió un error al conectar con el servidor. Asegúrate que el backend (puerto 3001) esté corriendo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <div className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        <div className="grid md:grid-cols-2 gap-8 items-start">
          
          {/* COLUMNA IZQUIERDA: FORMULARIO */}
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100">
            <h2 className="text-2xl font-bold mb-6 text-slate-800">Analicemos tu consumo</h2>

            {/* Tabs de Selección */}
            <div className="flex gap-2 mb-6 bg-slate-100 p-1 rounded-xl">
              <button 
                onClick={() => setMode('dinero')}
                className={`flex-1 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2
                  ${mode === 'dinero' ? 'bg-white text-red-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <i className="fa-solid fa-sack-dollar"></i> Por Precio
              </button>
              <button 
                onClick={() => setMode('kwh')}
                className={`flex-1 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2
                  ${mode === 'kwh' ? 'bg-white text-red-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <i className="fa-solid fa-bolt"></i> Por Energía
              </button>
            </div>

            <form onSubmit={handleCalculate} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {mode === 'dinero' ? 'Valor mensual de tu factura (COP)' : 'Consumo mensual promedio (kWh)'}
                </label>
                <div className="relative">
                  <i className={`fa-solid ${mode === 'dinero' ? 'fa-dollar-sign' : 'fa-bolt'} absolute left-4 top-4 text-slate-400`}></i>
                  <input 
                    type="number" 
                    required
                    placeholder={mode === 'dinero' ? "Ej: 200000" : "Ej: 350"}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all text-slate-900"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                  />
                </div>
              </div>

              {/* Campo extra solo para Dinero */}
              {mode === 'dinero' && (
                <div className="animate-fade-in">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Costo por kWh (Opcional)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-slate-400 text-sm font-bold">COP</span>
                    <input 
                      type="number" 
                      value={costoUnitario}
                      onChange={(e) => setCostoUnitario(e.target.value)}
                      className="w-full pl-14 pr-4 py-3 border border-slate-200 bg-slate-50 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-slate-900 transition-all"
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Usamos el promedio nacional si lo dejas igual.</p>
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all hover:scale-[1.02] flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <i className="fa-solid fa-circle-notch fa-spin"></i> Calculando...
                  </>
                ) : (
                  <>
                    <span>Calcular Ahorro</span> <i className="fa-solid fa-calculator"></i>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* COLUMNA DERECHA: RESULTADOS (Se muestra solo si hay 'result') */}
          <div className="relative min-h-[200px]">
            {!result && !loading && (
               <div className="h-full flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-200 rounded-2xl p-8">
                  <i className="fa-solid fa-solar-panel text-6xl mb-4 opacity-20"></i>
                  <p>Completa el formulario para ver tu análisis solar.</p>
               </div>
            )}

            {result && (
              <div className="animate-fade-in bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl shadow-2xl p-8 border border-slate-700 relative overflow-hidden">
                {/* Efecto de brillo fondo */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20"></div>

                <div className="flex items-center gap-3 mb-8 relative z-10">
                    <div className="bg-green-500/20 p-3 rounded-full text-green-400">
                        <i className="fa-solid fa-check text-xl"></i>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold">Análisis Completado</h3>
                        <p className="text-xs text-slate-400">Consumo est: {result.inputs.consumoCalculadoKWh} kWh/mes</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
                    <div className="bg-slate-700/50 p-4 rounded-xl backdrop-blur-sm">
                        <div className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Sistema Requerido</div>
                        <div className="text-3xl font-bold text-yellow-400">{result.recomendacion.tamañoSistema}</div>
                    </div>
                    <div className="bg-slate-700/50 p-4 rounded-xl backdrop-blur-sm">
                        <div className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Paneles (550W)</div>
                        <div className="text-3xl font-bold text-blue-400">{result.recomendacion.panelesSugeridos}</div>
                    </div>
                </div>

                <div className="bg-slate-700/30 p-4 rounded-xl mb-6 relative z-10">
                    <p className="text-sm text-slate-300 leading-relaxed">
                       <i className="fa-solid fa-quote-left text-slate-500 mr-2"></i>
                       {result.recomendacion.mensaje}
                    </p>
                </div>
                
                <div className="flex justify-between items-center text-xs text-slate-500 border-t border-slate-700 pt-4 relative z-10">
                    <div className="flex items-center gap-2">
                        <i className="fa-solid fa-sun text-yellow-600"></i>
                        Radiación: <span className="text-slate-300">{result.analisis.radiacionZona}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <i className="fa-solid fa-plug text-green-600"></i>
                        Gen/kW: <span className="text-slate-300">{result.analisis.produccionPorKW}</span>
                    </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}