'use client';

import { useState } from 'react';

interface CalculatorFormProps {
  ciudadNombre: string;
  // Ahora pasamos areaDisponible también
  onSubmit: (data: { valor: number; costoUnitario: number; areaDisponible: number }) => void;
  loading: boolean;
}

export default function CalculatorForm({ ciudadNombre, onSubmit, loading }: CalculatorFormProps) {
  const [consumo, setConsumo] = useState('');
  const [costoUnitario, setCostoUnitario] = useState('850'); // Valor defecto sugerido
  const [area, setArea] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      valor: parseFloat(consumo),
      costoUnitario: parseFloat(costoUnitario),
      areaDisponible: parseFloat(area)
    });
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Ingresa tus datos del consumo</h2>
        {ciudadNombre && (
          <div className="flex items-center gap-2 text-green-600 mt-1 font-medium bg-green-50 w-fit px-3 py-1 rounded-full text-sm">
            <i className="fa-solid fa-location-dot"></i>
            <span>en {ciudadNombre}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* 1. Consumo */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Consumo Mensual (kWh)</label>
          <div className="relative">
            <i className="fa-solid fa-bolt absolute left-4 top-4 text-slate-400"></i>
            <input
              type="number"
              required
              placeholder="Ej: 350"
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all text-slate-900"
              value={consumo}
              onChange={(e) => setConsumo(e.target.value)}
            />
          </div>
          <p className="text-xs text-slate-400 mt-1">Lo encuentras en tu recibo de luz.</p>
        </div>

        {/* 2. Precio kWh */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Costo por kWh</label>
          <div className="relative">
            <span className="absolute left-4 top-3.5 text-slate-400 text-sm font-bold">COP</span>
            <input
              type="number"
              required
              value={costoUnitario}
              onChange={(e) => setCostoUnitario(e.target.value)}
              className="w-full pl-14 pr-4 py-3 border border-slate-200 bg-slate-50 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-slate-900 transition-all"
            />
          </div>
        </div>

        {/* 3. Área Disponible (Nuevo Requerimiento RF-01) */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Área Disponible en Techo</label>
          <div className="relative">
            <span className="absolute left-4 top-3.5 text-slate-400 text-sm font-bold">m²</span>
            <input
              type="number"
              required
              placeholder="Ej: 20"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all text-slate-900"
            />
          </div>
          <p className="text-xs text-slate-400 mt-1">Un parqueadero de auto son aprox. 10m².</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all hover:scale-[1.02] flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <><i className="fa-solid fa-circle-notch fa-spin"></i> Simulando...</>
          ) : (
            <><span>Ver Ahorro Estimado</span> <i className="fa-solid fa-calculator"></i></>
          )}
        </button>
      </form>
    </div>
  );
}