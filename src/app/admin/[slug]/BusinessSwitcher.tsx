"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { ChevronDown, Store, Loader2 } from "lucide-react";
type Negocio = { nombre: string; slug: string; };

export default function BusinessSwitcher() {
  const [negocios, setNegocios] = useState<Negocio[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const currentSlug = params.slug as string;

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function fetchNegocios() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("negocios")
        .select("nombre, slug")
        .eq("owner_id", session.user.id);

      if (data) setNegocios(data);
      setLoading(false);
    }
    fetchNegocios();
  }, [supabase]);

  const handleCambio = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nuevoSlug = e.target.value;
    if (nuevoSlug && nuevoSlug !== currentSlug) router.push(`/admin/${nuevoSlug}`);
  };

 if (loading) return (
    <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-xl animate-pulse">
      <Loader2 className="w-3 h-3 text-[#00FF9F] animate-spin" />
      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Sincronizando...</span>
    </div>
  );
  
  if (negocios.length === 0) return (
    <div className="text-[10px] text-red-400 font-black p-3 border border-red-500/20 bg-red-500/5 rounded-xl uppercase tracking-tighter italic">
      ⚠️ 0 Negocios encontrados
    </div>
  );
  return (
    <div className="relative group w-full">
      {/* Icono decorativo lateral */}
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-hover:text-[#00FF9F] transition-colors z-10 pointer-events-none">
        <Store size={14} />
      </div>

      <select
        value={currentSlug || ""}
        onChange={handleCambio}
        className="
          appearance-none w-full h-11 pl-10 pr-10
          bg-white/5 border border-white/10 
          text-white text-xs font-black uppercase tracking-widest
          rounded-xl cursor-pointer outline-none
          transition-all duration-300
          hover:bg-white/10 hover:border-[#00FF9F]/30
          focus:border-[#00FF9F]/50 focus:ring-1 focus:ring-[#00FF9F]/10
          shadow-lg
        "
      >
        {negocios.map((neg) => (
          <option key={neg.slug} value={neg.slug} className="bg-[#0a0a0a] text-white py-4 font-sans lowercase first-letter:uppercase">
            {neg.nombre}
          </option>
        ))}
      </select>

      {/* Flecha personalizada (Chevron) */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 group-hover:text-[#00FF9F] transition-colors pointer-events-none">
        <ChevronDown size={14} />
      </div>

      {/* Glow inferior sutil */}
      <div className="absolute -bottom-px left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-[#00FF9F]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}