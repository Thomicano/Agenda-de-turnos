"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function getSession() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    }
    getSession();
  }, [supabase]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-100/80 bg-white/70 backdrop-blur-md">
      <div className="container mx-auto px-6 h-[3.75rem] flex items-center justify-between max-w-6xl">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="bg-indigo-600 p-1.5 rounded-xl shadow-sm shadow-indigo-300/40 group-hover:shadow-indigo-300/60 transition-shadow duration-200">
            <Calendar className="w-[1.05rem] h-[1.05rem] text-white" />
          </div>
          <span className="font-extrabold text-[1.05rem] tracking-tight text-slate-900">
            Turnero<span className="text-indigo-600">Pro</span>
          </span>
        </Link>

        {/* Nav Inteligente */}
        <nav className="flex items-center gap-1.5">
          {loading ? (
            <div className="h-9 w-24 bg-slate-100 animate-pulse rounded-xl"></div>
          ) : user ? (
            // 🔵 SI HAY SESIÓN: Botón al Panel
            <Button
              className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm shadow-indigo-300/40 text-sm font-semibold transition-all duration-200"
              asChild
            >
              <Link href="/admin">Ir a mi Panel</Link>
            </Button>
          ) : (
            // ⚪ SI NO HAY SESIÓN: Login y Registro
            <>
              <Link
                href="/login"
                className="hidden sm:inline-flex h-9 items-center px-3.5 text-sm font-medium text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-100/80 transition-all duration-150"
              >
                Iniciar Sesión
              </Link>
              <Button
                className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm shadow-indigo-300/40 text-sm font-semibold transition-all duration-200"
                asChild
              >
                <Link href="/crear-negocio">Comenzar Gratis</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}