'use client';
import { useState } from 'react';

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitLead: (cliente: { nombre: string; telefono: string; email: string; direccion: string }) => void;
  loading: boolean;
}

export default function LeadModal({ isOpen, onClose, onSubmitLead, loading }: LeadModalProps) {
  const [formData, setFormData] = useState({ nombre: '', telefono: '', email: '', direccion: '' });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative">
        
        {/* Header con botón cerrar */}
        <div className="bg-slate-900 p-6 text-white relative">
            <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                <i className="fa-solid fa-xmark text-xl"></i>
            </button>
            <h3 className="text-xl font-bold mb-1">¡Estás a un paso!</h3>
            <p className="text-sm text-slate-300">Déjanos tus datos para enviarte la cotización formal con precios de instalación.</p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSubmitLead(formData); }} className="p-6 space-y-4">
            <div>
                <label className="text-sm font-bold text-slate-700">Nombre Completo</label>
                <input required type="text" className="w-full border p-3 rounded-lg mt-1 outline-none focus:border-green-500 text-slate-800" 
                    onChange={e => setFormData({...formData, nombre: e.target.value})} />
            </div>
            <div>
                <label className="text-sm font-bold text-slate-700">Teléfono / WhatsApp</label>
                <input required type="tel" className="w-full border p-3 rounded-lg mt-1 outline-none focus:border-green-500 text-slate-800" 
                    onChange={e => setFormData({...formData, telefono: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-sm font-bold text-slate-700">Email</label>
                    <input type="email" className="w-full border p-3 rounded-lg mt-1 outline-none focus:border-green-500 text-slate-800" 
                        onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div>
                    <label className="text-sm font-bold text-slate-700">Dirección (Opcional)</label>
                    <input type="text" className="w-full border p-3 rounded-lg mt-1 outline-none focus:border-green-500 text-slate-800" 
                        onChange={e => setFormData({...formData, direccion: e.target.value})} />
                </div>
            </div>

            <button type="submit" disabled={loading} 
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg mt-4 transition-all flex justify-center gap-2">
                {loading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : 
                <><span>Ver Inversión Total</span> <i className="fa-solid fa-lock-open"></i></>}
            </button>
            
            <p className="text-xs text-center text-slate-400 mt-2">
                <i className="fa-solid fa-shield-halved mr-1"></i> Tus datos están seguros.
            </p>
        </form>
      </div>
    </div>
  );
}