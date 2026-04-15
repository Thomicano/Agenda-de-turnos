"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { ChevronDown, Store, Loader2, Plus,  } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
type Negocio = { nombre: string; slug: string; };

export default function BusinessSwitcher() {
  const [negocios, setNegocios] = useState<Negocio[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false); // Estado para abrir/cerrar el menú personalizado
  
  const router = useRouter();
  const params = useParams();
  const currentSlug = params.slug as string;
  const dropdownRef = useRef<HTMLDivElement>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Cerrar el menú si hacen clic afuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cargar negocios
  useEffect(() => {
    async function fetchNegocios() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("negocios")
        .select("nombre, slug")
        .eq("owner_id", session.user.id);

      if (data) setNegocios(data);
      setLoading(false);
    }
    fetchNegocios();
  }, [supabase]);

  const handleSeleccion = (nuevoSlug: string) => {
    setIsOpen(false); // Cerramos el menú al elegir
    
    if (nuevoSlug === "crear-nuevo") {
      router.push("/crear-negocio");
      return;
    }

    if (nuevoSlug && nuevoSlug !== currentSlug) {
      router.push(`/admin/${nuevoSlug}`);
    }
  };

  // Buscar el nombre del negocio actual para mostrarlo en el botón
  const negocioActual = negocios.find(n => n.slug === currentSlug);

  if (loading) return (
    <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-xl animate-pulse w-full h-11">
      <Loader2 className="w-3 h-3 text-[#00FF9F] animate-spin" />
      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Sincronizando...</span>
    </div>
  );
  
  if (negocios.length === 0) return (
    <div className="text-[10px] text-red-400 font-black p-3 border border-red-500/20 bg-red-500/5 rounded-xl uppercase tracking-tighter italic w-full">
      ⚠️ 0 Negocios
    </div>
  );

  return (
    <div className="relative w-full" ref={dropdownRef}>
      
      {/* ── BOTÓN PRINCIPAL (CABECERA DEL DROPDOWN) ── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full h-11 px-3 flex items-center justify-between
          bg-white/5 border rounded-xl outline-none
          transition-all duration-300 shadow-lg group
          ${isOpen ? 'border-[#00FF9F]/50 bg-white/10' : 'border-white/10 hover:border-[#00FF9F]/30 hover:bg-white/10'}
        `}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <Store size={14} className="text-slate-500 group-hover:text-[#00FF9F] transition-colors flex-shrink-0" />
          <span className="text-white text-xs font-black uppercase tracking-widest truncate">
            {negocioActual ? negocioActual.nombre : "Seleccionar..."}
          </span>
        </div>
        
        <ChevronDown 
          size={14} 
          className={`text-slate-500 group-hover:text-[#00FF9F] transition-all flex-shrink-0 ${isOpen ? 'rotate-180 text-[#00FF9F]' : ''}`} 
        />

        {/* Glow inferior sutil (visible solo en hover o abierto) */}
        <div className={`absolute -bottom-px left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-[#00FF9F]/40 to-transparent transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
      </button>

      {/* ── MENÚ DESPLEGABLE PERSONALIZADO ── */}
      {/* ── MENÚ DESPLEGABLE PERSONALIZADO ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full mt-2 left-0 w-full bg-[var(--background)] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col"
            style={{ backgroundColor: '#0B0F19' }} // Forzamos el color oscuro
          >
            {/* Lista de negocios */}
            <div className="max-h-60 overflow-y-auto custom-scrollbar p-1">
              {negocios.map((neg) => (
                <button
                  key={neg.slug}
                  onClick={() => handleSeleccion(neg.slug)}
                  className={`
                    w-full text-left px-4 py-3 text-xs rounded-lg transition-colors flex items-center gap-2
                    ${neg.slug === currentSlug 
                      ? 'bg-white/10 text-white font-black' 
                      : 'text-slate-400 font-medium hover:bg-white/5 hover:text-white'
                    }
                  `}
                >
                  <span className="lowercase first-letter:uppercase truncate">
                    {neg.nombre}
                  </span>
                </button>
              ))}
            </div>

            {/* Separador */}
            <div className="h-px bg-white/5 w-full" />

            {/* Opción para crear nuevo */}
            <div className="p-1">
              <button
                onClick={() => handleSeleccion("crear-nuevo")}
                className="w-full flex items-center gap-2 px-4 py-3 rounded-lg text-xs font-black uppercase tracking-widest text-[#00FF9F] hover:bg-[#00FF9F]/10 transition-all"
              >
                <Plus size={14} />
                Nuevo Negocio
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}