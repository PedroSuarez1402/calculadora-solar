import Link from "next/link";

interface StepProps {
  currentStep: number;
  totalSteps: number;
  title: string;
}

// Contenido visual del indicador
function IndicatorContent({ currentStep, totalSteps, title }: StepProps) {
  return (
    <div className="flex flex-col items-end group cursor-pointer">
      <div className="flex items-center gap-2">
        {/* Si estamos en paso 2, mostramos un pequeño texto de 'Volver' o icono al hacer hover */}
        {currentStep > 1 && (
            <span className="text-xs text-red-500 opacity-0 group-hover:opacity-100 transition-opacity mr-1">
                <i className="fa-solid fa-arrow-left"></i> Editar
            </span>
        )}
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Paso {currentStep} de {totalSteps}
        </div>
      </div>
      
      <div className="text-slate-800 font-bold text-lg group-hover:text-red-600 transition-colors">
        {title}
      </div>
      
      {/* Barra de progreso */}
      <div className="w-32 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
        <div 
            className="h-full bg-red-600 transition-all duration-700 ease-out shadow-[0_0_10px_rgba(220,38,38,0.5)]"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        ></div>
        </div>
      </div>
    );
  }
  
  export default function StepIndicator({ currentStep, totalSteps, title }: StepProps) {
    // Lógica de navegación:
  // Si estamos en el paso 2, queremos que al dar clic nos lleve al paso 1 (Ubicación)
  if (currentStep === 2) {
    return (
      <Link href="/ubicacion" title="Volver al mapa">
        <IndicatorContent currentStep={currentStep} totalSteps={totalSteps} title={title} />
      </Link>
    );
  }

  // Si es el paso 1, no es clickeable
  return <IndicatorContent currentStep={currentStep} totalSteps={totalSteps} title={title} />;
}