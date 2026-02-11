'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import CalculadoraForm from '../components/CalculadoraForm';

// Actualizamos la interfaz para coincidir con el nuevo Backend
interface SolarResponse {
  inputs: {
    consumoKWh: number;
    tarifaAplicada: number;
  };
  situacionActual: {
    gastoMensual: number;
    gastoAnual: number;
  };
  situacionSolar: {
    ahorroMensual: number;
    ahorroAnual: number;
    ahorro25Anios: number;
    co2Toneladas: string;
  };
  sistema: {
    tamanoKW: number;
    numeroPaneles: number;
    generacionAnualEstimada: number;
  };
  mensaje: string;
}

export default function CalculadoraPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [ciudadNombre, setCiudadNombre] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SolarResponse | null>(null);

  // Formateador de moneda (Pesos Colombianos)
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', { 
        style: 'currency', 
        currency: 'COP', 
        maximumFractionDigits: 0 
    }).format(value);
  };

  useEffect(() => {
    setMounted(true);
    const savedLoc = localStorage.getItem('solarLocation');
    if (!savedLoc) {
      router.push('/ubicacion');
    } else {
        const locData = JSON.parse(savedLoc);
        if (locData.nombre) setCiudadNombre(locData.nombre);
    }
  }, [router]);

  if (!mounted) return null;

  const onFormSubmit = async (formData: { mode: 'dinero' | 'kwh'; valor: number; costoUnitario: number }) => {
    setLoading(true);
    setResult(null);

    try {
      const locationData = JSON.parse(localStorage.getItem('solarLocation') || '{}');
      const payload = {
        lat: locationData.lat,
        lon: locationData.lon,
        tipo: formData.mode,
        valor: formData.valor,
        costoUnitario: formData.costoUnitario 
      };

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

      const res = await fetch(`${backendUrl}/api/calcular`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Error en el cálculo');
      const data: SolarResponse = await res.json();
      setResult(data);

    } catch (error) {
      console.error(error);
      alert("Error de conexión con el backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <div className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* COLUMNA IZQUIERDA: FORMULARIO (Ocupa 4 columnas) */}
          <div className="lg:col-span-4">
            <CalculadoraForm 
              ciudadNombre={ciudadNombre} 
              onSubmit={onFormSubmit} 
              loading={loading} 
            />
          </div>

          {/* COLUMNA DERECHA: RESULTADOS (Ocupa 8 columnas) */}
          <div className="lg:col-span-8 min-h-100">
            {!result && !loading && (
               <div className="h-full flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-200 rounded-2xl p-12 bg-white/50">
                  <i className="fa-solid fa-solar-panel text-7xl mb-6 opacity-20"></i>
                  <p className="text-xl font-medium">Completa el formulario para ver tu proyección financiera.</p>
               </div>
            )}

            {result && (
              <div className="animate-fade-in space-y-6">
                
                {/* 1. TARJETA PRINCIPAL: SITUACIÓN ACTUAL VS SOLAR */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
                    <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
                        <h3 className="font-bold text-lg"><i className="fa-solid fa-chart-line mr-2"></i> Análisis Financiero</h3>
                        <span className="text-xs bg-slate-700 px-3 py-1 rounded-full text-slate-300">
                             Tarifa: {formatCurrency(result.inputs.tarifaAplicada)}/kWh
                        </span>
                    </div>
                    
                    <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                        {/* Situación Actual */}
                        <div className="p-6 bg-slate-50">
                            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Situación Actual (Sin Solar)</h4>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-slate-500">Consumo Mensual</p>
                                    <p className="text-xl font-bold text-slate-700">{result.inputs.consumoKWh} kWh</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Gasto Mensual Promedio</p>
                                    <p className="text-xl font-bold text-slate-800">{formatCurrency(result.situacionActual.gastoMensual)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Gasto Anual Proyectado</p>
                                    <p className="text-xl font-bold text-red-500">{formatCurrency(result.situacionActual.gastoAnual)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Situación Solar */}
                        <div className="p-6 bg-green-50/50">
                            <h4 className="text-sm font-bold text-green-600 uppercase tracking-wider mb-4">
                                <i className="fa-solid fa-leaf mr-1"></i> Con Energía Solar
                            </h4>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-slate-500">Ahorro Mensual Estimado</p>
                                    <p className="text-2xl font-bold text-green-600">{formatCurrency(result.situacionSolar.ahorroMensual)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Ahorro Anual</p>
                                    <p className="text-2xl font-bold text-green-700">{formatCurrency(result.situacionSolar.ahorroAnual)}</p>
                                </div>
                                <div className="pt-2 border-t border-green-100">
                                    <p className="text-xs text-green-800 font-semibold mb-1">PROYECCIÓN A 25 AÑOS</p>
                                    <p className="text-3xl font-black text-green-600">{formatCurrency(result.situacionSolar.ahorro25Anios)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. DATOS TÉCNICOS Y AMBIENTALES */}
                <div className="grid md:grid-cols-3 gap-6">
                    {/* Sistema */}
                    <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100 col-span-2">
                        <h4 className="font-bold text-slate-800 mb-4">Tu Sistema Ideal</h4>
                        <div className="grid grid-cols-2 gap-4">
                             <div className="bg-slate-100 p-4 rounded-xl">
                                <p className="text-xs text-slate-500">Potencia</p>
                                <p className="text-2xl font-bold text-blue-600">{result.sistema.tamanoKW} kWp</p>
                             </div>
                             <div className="bg-slate-100 p-4 rounded-xl">
                                <p className="text-xs text-slate-500">Paneles (550W)</p>
                                <p className="text-2xl font-bold text-blue-600">{result.sistema.numeroPaneles} Unid.</p>
                             </div>
                        </div>
                        <p className="text-sm text-slate-500 mt-4 bg-blue-50 p-3 rounded-lg border border-blue-100">
                            <i className="fa-solid fa-circle-info mr-2 text-blue-500"></i>
                            {result.mensaje}
                        </p>
                    </div>

                    {/* Impacto Ambiental */}
                    <div className="bg-teal-700 text-white p-6 rounded-2xl shadow-md flex flex-col justify-center items-center text-center relative overflow-hidden">
                        <i className="fa-solid fa-earth-americas text-8xl absolute -right-4 -bottom-4 opacity-20"></i>
                        <h4 className="font-bold mb-2 z-10">Impacto Ambiental</h4>
                        <p className="text-4xl font-bold text-teal-200 z-10">{result.situacionSolar.co2Toneladas}</p>
                        <p className="text-sm text-teal-100 z-10">Toneladas de CO2 evitadas (año)</p>
                        <div className="mt-4 bg-white/20 px-3 py-1 rounded-full text-xs z-10">
                            Equivale a plantar {Math.round(parseFloat(result.situacionSolar.co2Toneladas) * 45)} árboles
                        </div>
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