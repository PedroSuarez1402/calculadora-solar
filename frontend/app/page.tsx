import Link from "next/link"; // Importamos Link para navegación optimizada
import Image from "next/image";

export default function Home() {
  return (
    <main className="bg-slate-900 text-white h-screen flex flex-col items-center justify-center overflow-hidden relative">
      
      {/* Fondo decorativo */}
      <div 
        className="absolute top-0 left-0 w-full h-full opacity-20 bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=2072&auto=format&fit=crop')" }}
      >
      </div>

      {/* Contenido Principal */}
      <div className="z-10 text-center px-4 max-w-2xl animate-fade-in">
        <div className="mb-6 flex justify-center">
          <Image 
              src="/img/logo_energia.png"  // Ruta: public/img/logo-empresa.png
              alt="Logo Empresa"
              width={200} // Ancho en px
              height={80} // Alto en px
              className="object-contain" // Para mantener proporción con Tailwind
              priority // Prioridad alta para que cargue instantáneo
          />
        </div>
        
        <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-linear-to-r from-green-500 to-gray-400">
          Calculadora Solar
        </h1>
        
        <p className="text-slate-300 text-lg mb-8">
          Descubre cuánto puedes ahorrar instalando paneles solares en tu hogar.
          Cálculo preciso basado en radiación satelital (NREL).
        </p>

        {/* Botón usando Link de Next.js */}
        <Link
          href="/ubicacion" // Esta será la ruta que crearemos después
          className="group relative inline-flex items-center justify-center px-8 py-3 text-lg font-medium text-white bg-green-600 rounded-full overflow-hidden transition-all hover:bg-green-700 hover:scale-105 shadow-lg shadow-green-500/30"
        >
          <span>Comenzar Ahora</span>
          <i className="fa-solid fa-arrow-right ml-2 group-hover:translate-x-1 transition-transform"></i>
        </Link>
      </div>
    </main>
  );
}