import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export default async function AdminPage() {
  // 1. Inicializamos Supabase en el servidor
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

  // 2. Verificamos si el usuario tiene sesión activa
  const { data: { session } } = await supabase.auth.getSession();

  // Si no está logueado, afuera (al login)
  if (!session) {
    redirect("/login");
  }

  // 3. Buscamos TODOS los negocios que le pertenecen a este owner_id
  const { data: negocios } = await supabase
    .from("negocios")
    .select("slug, nombre")
    .eq("owner_id", session.user.id);

  // 4. LÓGICA DE TRÁFICO INTELIGENTE
  if (!negocios || negocios.length === 0) {
    // Si no tiene negocios, lo mandamos a crear el primero
    redirect("/crear-negocio");
  } else if (negocios.length === 1) {
    // Si tiene exactamente 1, entra directo sin preguntar
    redirect(`/admin/${negocios[0].slug}`);
  }

  // 5. RENDERIZADO: Solo llega acá si tiene 2 o más negocios
  // Usamos exactamente tus mismas clases de Tailwind para no romper el diseño
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center p-8 bg-white rounded-lg shadow max-w-md w-full">
        <h1 className="text-2xl font-bold mb-2">Tus Negocios</h1>
        <p className="text-gray-600 mb-6">
          Tenés varios negocios registrados. Elegí cuál querés administrar:
        </p>
        
        <div className="flex flex-col gap-3 mb-6">
          {negocios.map((negocio) => (
            <Link
              key={negocio.slug}
              href={`/admin/${negocio.slug}`}
              className="font-mono text-sm bg-gray-100 p-3 rounded hover:bg-gray-200 transition text-amber-700 block"
            >
              {negocio.nombre}
            </Link>
          ))}
        </div>

        <Link
          href="/"
          className="text-blue-600 hover:underline block mt-4"
        >
          ← Volver al inicio
        </Link>
      </div>
    </div>
  );
}