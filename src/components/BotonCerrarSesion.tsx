// 🟢 NUEVO ARCHIVO: components/BotonCerrarSesion.tsx
"use client";

import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function BotonCerrarSesion() {
  const router = useRouter();
  
  // 🟡 Inicializamos el cliente de Supabase
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleLogout = async () => {
    // 🔴 Destruimos la sesión en la base de datos
    await supabase.auth.signOut();
    
    // 🔵 Forzamos la redirección al login y refrescamos el router
    router.push("/login");
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center justify-center gap-2 w-full md:w-auto px-6 py-2.5 bg-rose-50 text-rose-600 font-medium rounded-lg border border-rose-100 hover:bg-rose-100 hover:text-rose-700 transition-colors shadow-sm"
    >
      <LogOut className="w-5 h-5" />
      Cerrar Sesión
    </button>
  );
}