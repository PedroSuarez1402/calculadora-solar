'use client'; // Necesario para usar usePathname

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import StepIndicator from "./StepIndicator";

export default function Navbar() {
  const pathname = usePathname();

  // Lógica para determinar el paso según la URL
  let currentStep = 0;
  let stepTitle = "";

  if (pathname === '/ubicacion') {
    currentStep = 1;
    stepTitle = "Ubicación";
  } else if (pathname === '/calculadora') {
    currentStep = 2;
    stepTitle = "Consumo";
  }

  // Solo mostramos el indicador si estamos en pasos válidos (1 o 2)
  const showIndicator = currentStep > 0;

  return (
    <nav className="bg-white shadow-sm p-4 flex justify-between items-center z-20 relative min-h-20px">
      
      {/* LADO IZQUIERDO: LOGO */}
      <Link href="/" className="font-bold text-xl flex items-center gap-3 text-slate-800 hover:text-red-600 transition-colors group">
        <div className="hidden sm:block relative transition-transform group-hover:scale-105">
          <Image 
            src="/img/logo.png" 
            alt="Logo" 
            width={100} 
            height={40} 
            className="h-10 w-auto object-contain" 
            priority
          />
        </div>
        <div className="flex flex-col leading-tight">
            <span className="text-lg">Calculadora Solar</span>
            <span className="text-xs text-slate-400 font-normal hidden sm:block">Panel de Ahorro</span>
        </div>
      </Link>
      
      {/* LADO DERECHO: INDICADOR DINÁMICO */}
      {showIndicator && (
        <StepIndicator 
            currentStep={currentStep} 
            totalSteps={2} 
            title={stepTitle} 
        />
      )}
    </nav>
  );
}