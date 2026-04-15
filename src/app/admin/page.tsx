import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { LayoutGrid, ArrowRight, PlusCircle } from "lucide-react"; // Iconos para darle nivel

export default async function AdminPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  const { data: negocios } = await supabase
    .from("negocios")
    .select("slug, nombre")
    .eq("owner_id", session.user.id);

  if (!negocios || negocios.length === 0) {
    redirect("/crear-negocio");
  } 
  
  // 💡 NOTA: Si querés que SIEMPRE se vea la lista aunque sea 1 solo, 
  // borrá o comentá las siguientes 3 líneas:
  else if (negocios.length === 1) {
    redirect(`/admin/${negocios[0].slug}`);
  }

  return (
    /* Quitamos bg-gray-100 y usamos el fondo de globals.css */
    <div className="min-h-screen flex items-center justify-center p-6">
      
      <div className="w-full max-w-md">
        {/* Card Estilo Glassmorphism */}
        <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-8 shadow-2xl text-center">
          
          <div className="inline-flex p-3 rounded-2xl bg-[#00FF9F]/10 mb-6">
            <LayoutGrid className="text-[#00FF9F]" size={28} />
          </div>

          <h1 className="text-3xl font-black text-white mb-2 tracking-tight">
            Tus <span className="text-[#00FF9F]">Negocios</span>
          </h1>
          <p className="text-slate-400 text-sm mb-8">
            Seleccioná el panel que querés gestionar hoy
          </p>
          
          <div className="flex flex-col gap-4 mb-8">
            {negocios.map((negocio) => (
              <Link
                key={negocio.slug}
                href={`/admin/${negocio.slug}`}
                className="group flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-[#00FF9F]/30 hover:bg-[#00FF9F]/5 transition-all duration-200"
              >
                <span className="font-bold text-slate-200 group-hover:text-white transition-colors">
                  {negocio.nombre}
                </span>
                <ArrowRight size={18} className="text-slate-500 group-hover:text-[#00FF9F] group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>

          {/* Botón para crear otro negocio (opcional) */}
          <Link
            href="/crear-negocio"
            className="flex items-center justify-center gap-2 text-sm font-bold text-[#00FF9F] hover:text-[#00FF9F]/80 transition-colors"
          >
            <PlusCircle size={16} />
            Registrar otro negocio
          </Link>
        </div>

        <Link
          href="/"
          className="text-center block mt-8 text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-white transition-colors"
        >
          ← Volver al inicio
        </Link>
      </div>
    </div>
  );
}