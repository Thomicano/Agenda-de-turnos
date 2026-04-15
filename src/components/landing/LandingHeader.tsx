"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

// ─── Logo SVG Component ───────────────────────────────────────────────────────


export default function LandingHeader() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [supabase]);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-slate-950/90 backdrop-blur-xl border-b border-white/5 shadow-2xl shadow-black/20"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6 h-16 flex items-center justify-between max-w-6xl">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="transition-transform duration-300 group-hover:scale-110">
            {/* USAMOS TU IMAGEN AQUÍ */}
            <img 
              src="/logoTurnixapp-removebg.png" // <--- CAMBIÁ ESTO por el nombre exacto de tu archivo en /public
              alt="TurnixApp Logo"
              className="w-10 h-10 object-contain" 
            />
          </div>
          <span className="font-black text-lg tracking-tight text-white">
            Turnix<span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #00FF9F, #008080)" }}>App</span>
          </span>
        </Link>

        {/* Nav links (desktop) */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          {["Características", "Cómo Funciona", "Precios"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/\s/g, "-").replace("ó", "o").replace("é", "e")}`}
              className="text-slate-400 hover:text-white transition-colors duration-200 font-medium"
            >
              {item}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <div className="flex items-center gap-3">
          {loading ? (
            <div className="h-9 w-32 bg-white/5 animate-pulse rounded-xl" />
          ) : user ? (
            <Link
              href="/admin"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-slate-900 transition-all duration-200 hover:brightness-110 hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg, #00FF9F, #008080)" }}
            >
              Mi Panel <ArrowRight size={14} />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden sm:inline-flex h-9 items-center px-4 text-sm font-medium text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-all duration-150"
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/registro"
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-slate-900 transition-all duration-200 hover:brightness-110 hover:-translate-y-0.5"
                style={{ background: "linear-gradient(135deg, #00FF9F, #008080)" }}
              >
                Comenzar Gratis <ArrowRight size={14} />
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.header>
  );
}
