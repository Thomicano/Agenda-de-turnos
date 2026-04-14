"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

type Negocio = {
    nombre: string;
    slug: string;
};

export default function BusinessSwitcher() {
    const [negocios, setNegocios] = useState<Negocio[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const params = useParams(); // Para saber en qué negocio estamos parados
    const currentSlug = params.slug as string;

    // Usamos el cliente de navegador seguro
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        async function fetchNegocios() {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            // Buscamos los negocios del dueño usando tu columna owner_id
            const { data } = await supabase
                .from("negocios")
                .select("nombre, slug")
                .eq("owner_id", session.user.id);

            if (data) {
                setNegocios(data);
            }
            setLoading(false);
        }

        fetchNegocios();
    }, [supabase]);

    // Función que teletransporta al usuario al elegir otro negocio
    const handleCambio = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const nuevoSlug = e.target.value;
        if (nuevoSlug && nuevoSlug !== currentSlug) {
            router.push(`/admin/${nuevoSlug}`);
        }
    };

    // Mientras carga, mostramos un "esqueleto" gris para que no salte la interfaz
    if (loading) return <div className="h-10 w-48 bg-slate-200 animate-pulse rounded-lg"></div>;

    // Si tiene un solo negocio, no hace falta mostrar el menú
    if (negocios.length <= 1) return null;

    return (
        <div className="flex items-center gap-2">
            <select
                value={currentSlug || ""}
                onChange={handleCambio}
                className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 cursor-pointer font-medium shadow-sm transition hover:bg-slate-50 outline-none"
            >
                {negocios.map((neg) => (
                    <option key={neg.slug} value={neg.slug}>
                        {neg.nombre}
                    </option>
                ))}
            </select>
        </div>
    );
}