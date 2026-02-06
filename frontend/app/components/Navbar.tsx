import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-white shadow-sm p-4 flex justify-between items-center z-20">
      <Link href="/" className="font-bold text-xl flex items-center gap-2 text-blue-600">
        {/* Puedes usar una librería de iconos como 'react-icons' o FontAwesome como componente */}
        <i className="fa-solid fa-solar-panel"></i> SolarCalc
      </Link>
      <div className="text-sm text-slate-500">...</div>
    </nav>
  );
}