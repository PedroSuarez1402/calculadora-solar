'use client';

import { useState } from 'react';

interface CalculatorFormProps {
  ciudadNombre: string;
  onSubmit: (data: { mode: 'dinero' | 'kwh'; valor: number; costoUnitario: number }) => void;
  loading: boolean;
}

export default function CalculatorForm({ ciudadNombre, onSubmit, loading }: CalculatorFormProps) {
  const [mode, setMode] = useState<'dinero' | 'kwh'>('dinero');
  const [inputValue, setInputValue] = useState(''); // Valor principal (Factura o Consumo kWh)
  const [tarifaKwh, setTarifaKwh] = useState('650'); // Tarifa (Editable en ambos modos si se desea, o solo en Energía)

  // Manejo del envío
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      mode,
      valor: parseFloat(inputValue),
      costoUnitario: parseFloat(tarifaKwh) || 650, // Enviamos la tarifa siempre
    });
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Analicemos tu consumo</h2>
        {ciudadNombre && (
          <div className="flex items-center gap-2 text-red-600 mt-1 font-medium bg-red-50 w-fit px-3 py-1 rounded-full text-sm">
            <i className="fa-solid fa-location-dot"></i>
            <span>en {ciudadNombre}</span>
          </div>
        )}
      </div>

      {/* Tabs de Selección */}
      <div className="flex gap-2 mb-6 bg-slate-100 p-1 rounded-xl">
        <button
          onClick={() => setMode('dinero')}
          className={`flex-1 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2
            ${mode === 'dinero' ? 'bg-white text-red-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <i className="fa-solid fa-sack-dollar"></i> Por Dinero
        </button>
        <button
          onClick={() => setMode('kwh')}
          className={`flex-1 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2
            ${mode === 'kwh' ? 'bg-white text-red-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <i className="fa-solid fa-bolt"></i> Por Energía
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Lógica condicional de campos según el modo */}
        
        {mode === 'kwh' ? (
           // --- MODO ENERGÍA ---
           <>
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-2">Consumo Mensual (kWh)</label>
               <div className="relative">
                 <i className="fa-solid fa-bolt absolute left-4 top-4 text-slate-400"></i>
                 <input
                   type="number"
                   required
                   placeholder="Ej: 350"
                   className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all text-slate-900"
                   value={inputValue}
                   onChange={(e) => setInputValue(e.target.value)}
                 />
               </div>
             </div>
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-2">Tarifa por kWh (COP)</label>
               <div className="relative">
                 <span className="absolute left-4 top-3.5 text-slate-400 text-sm font-bold">COP</span>
                 <input
                   type="number"
                   required
                   value={tarifaKwh}
                   onChange={(e) => setTarifaKwh(e.target.value)}
                   className="w-full pl-14 pr-4 py-3 border border-slate-200 bg-slate-50 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-slate-900 transition-all"
                 />
               </div>
               <p className="text-xs text-slate-400 mt-1">Precio promedio editable.</p>
             </div>
           </>
        ) : (
           // --- MODO DINERO ---
           <div>
             <label className="block text-sm font-medium text-slate-700 mb-2">Valor Total de la Factura (Mensual)</label>
             <div className="relative">
               <i className="fa-solid fa-dollar-sign absolute left-4 top-4 text-slate-400"></i>
               <input
                 type="number"
                 required
                 placeholder="Ej: 200000"
                 className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all text-slate-900"
                 value={inputValue}
                 onChange={(e) => setInputValue(e.target.value)}
               />
             </div>
             <p className="text-xs text-slate-400 mt-2">Calcularemos el consumo basado en un promedio de tarifa.</p>
           </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all hover:scale-[1.02] flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <><i className="fa-solid fa-circle-notch fa-spin"></i> Calculando...</>
          ) : (
            <><span>Calcular Ahorro</span> <i className="fa-solid fa-calculator"></i></>
          )}
        </button>
      </form>
    </div>
  );
}