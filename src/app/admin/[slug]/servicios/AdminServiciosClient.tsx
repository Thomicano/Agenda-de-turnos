"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardFooter, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Scissors, Edit, Trash, Plus, Sparkles } from "lucide-react"; // Agregué Sparkles para el detalle visual
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";

// Tipos
type Negocio = {
  id: string;
  nombre: string;
};

type Servicio = {
  id: string;
  nombre: string;
  duracion_min: number;
  precio: number;
};

type Props = {
  slug?: string;
};

export default function AdminServiciosClient({ slug: slugProp }: Props) {
  const params = useParams();

  const rawSlug = (slugProp ?? params?.slug) as unknown;
  const slug =
    typeof rawSlug === "string"
      ? rawSlug
      : Array.isArray(rawSlug)
        ? rawSlug[0]
        : undefined;

  const slugValido =
    typeof slug === "string" &&
    slug.trim().length > 0 &&
    slug !== "undefined" &&
    slug !== "null";

  const [negocio, setNegocio] = useState<Negocio | null>(null);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);

  // Formulario crear
  const [nombre, setNombre] = useState("");
  const [duracion, setDuracion] = useState("");
  const [precio, setPrecio] = useState("");

  // Formulario editar
  const [editando, setEditando] = useState<string | null>(null);
  const [nombreEdit, setNombreEdit] = useState("");
  const [duracionEdit, setDuracionEdit] = useState("");
  const [precioEdit, setPrecioEdit] = useState("");

  useEffect(() => {
    if (slugValido) cargarDatos();
  }, [slug, slugValido]);

  const cargarDatos = async () => {
    if (!slugValido) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const { data: negocioData, error: negocioError } = await supabase
      .from("negocios")
      .select("id, nombre")
      .eq("slug", slug as string)
      .single();

    if (negocioError || !negocioData) {
      setLoading(false);
      return;
    }

    setNegocio(negocioData);

    const { data: serviciosData } = await supabase
      .from("servicios")
      .select("*")
      .eq("negocio_id", negocioData.id)
      .order("nombre");

    setServicios(serviciosData || []);
    setLoading(false);
  };

  const crearServicio = async () => {
    if (!negocio) return;
    if (!nombre.trim() || !duracion.trim() || !precio.trim()) {
      alert("Por favor completá todos los campos.");
      return;
    }

    const { error } = await supabase.from("servicios").insert({
      negocio_id: negocio.id,
      nombre: nombre.trim(),
      duracion_min: Number(duracion),
      precio: Number(precio),
    });

    if (error) return;

    setNombre("");
    setDuracion("");
    setPrecio("");
    cargarDatos();
  };

  const iniciarEdicion = (servicio: Servicio) => {
    setEditando(servicio.id);
    setNombreEdit(servicio.nombre);
    setDuracionEdit(String(servicio.duracion_min));
    setPrecioEdit(String(servicio.precio));
  };

  const cancelarEdicion = () => {
    setEditando(null);
    setNombreEdit("");
    setDuracionEdit("");
    setPrecioEdit("");
  };

  const guardarEdicion = async () => {
    if (!editando || !nombreEdit || !duracionEdit || !precioEdit) return;

    const { error } = await supabase
      .from("servicios")
      .update({
        nombre: nombreEdit,
        duracion_min: Number(duracionEdit),
        precio: Number(precioEdit),
      })
      .eq("id", editando);

    if (error) return;

    cancelarEdicion();
    cargarDatos();
  };

  const eliminarServicio = async (id: string, nombre: string) => {
    if (!confirm(`¿Eliminar "${nombre}"?`)) return;
    await supabase.from("servicios").delete().eq("id", id);
    cargarDatos();
  };

  if (loading) return <div className="p-10 text-[#00FF9F] animate-pulse">Cargando servicios...</div>;

  return (
    <AdminPageLayout
      title={`Servicios – ${negocio?.nombre || ""}`}
      subtitle="Gestioná los servicios que ofrece tu negocio"
    >
      <div className="space-y-8 max-w-6xl">

        {/* AGREGAR SERVICIO - Card con estilo Dark Glass */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm overflow-hidden">
          <CardHeader className="pb-4 border-b border-white/10">
            <CardTitle className="text-xl flex items-center gap-2 text-white">
              <Plus className="w-5 h-5 text-[#00FF9F]" />
              Nuevo Servicio
            </CardTitle>
            <CardDescription className="text-slate-400">
              Añadí un nuevo ítem a tu catálogo de atención.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold uppercase text-slate-500 ml-1">Nombre del Servicio</label>
                <Input
                  className="bg-black/20 border-white/10 text-white focus:border-[#00FF9F]/50 focus:ring-0 transition-all"
                  placeholder="Ej. Corte de pelo + Barba"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-500 ml-1">Duración (min)</label>
                <Input
                  type="number"
                  className="bg-black/20 border-white/10 text-white focus:border-[#00FF9F]/50 focus:ring-0 transition-all"
                  placeholder="30"
                  value={duracion}
                  onChange={(e) => setDuracion(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-500 ml-1">Precio ($)</label>
                <Input
                  type="number"
                  className="bg-black/20 border-white/10 text-white focus:border-[#00FF9F]/50 focus:ring-0 transition-all"
                  placeholder="5000"
                  value={precio}
                  onChange={(e) => setPrecio(e.target.value)}
                />
              </div>
            </div>
            <Button
              onClick={crearServicio}
              className="mt-6 bg-gradient-to-r from-[#00FF9F] to-[#008080] text-black font-bold hover:opacity-90 w-full md:w-auto px-8"
            >
              Crear servicio
            </Button>
          </CardContent>
        </Card>

        {/* LISTA DE SERVICIOS */}
        <div>
          <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#00FF9F]" />
            Catálogo Actual
          </h2>

          {servicios.length === 0 ? (
            <Card className="p-12 text-center border-dashed border-white/10 bg-transparent">
              <p className="text-slate-500">No hay servicios registrados todavía.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {servicios.map((s) => (
                <Card key={s.id} className="group relative flex flex-col bg-white/5 border-white/10 hover:border-[#00FF9F]/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,255,159,0.05)] overflow-hidden">

                  {editando === s.id ? (
                    /* 🔄 MODO EDICIÓN */
                    <CardContent className="p-5 flex flex-col gap-4 bg-black/40">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#00FF9F] uppercase">Nombre</label>
                        <Input
                          className="bg-white/5 border-white/10 text-white"
                          value={nombreEdit}
                          onChange={(e) => setNombreEdit(e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-[#00FF9F] uppercase">Mins</label>
                          <Input
                            type="number"
                            className="bg-white/5 border-white/10 text-white"
                            value={duracionEdit}
                            onChange={(e) => setDuracionEdit(e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-[#00FF9F] uppercase">Precio</label>
                          <Input
                            type="number"
                            className="bg-white/5 border-white/10 text-white"
                            value={precioEdit}
                            onChange={(e) => setPrecioEdit(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button onClick={guardarEdicion} size="sm" className="w-full bg-[#00FF9F] text-black font-bold hover:bg-[#00cc7e]">
                          Guardar
                        </Button>
                        <Button onClick={cancelarEdicion} size="sm" variant="outline" className="w-full border-white/10 text-white hover:bg-white/5">
                          X
                        </Button>
                      </div>
                    </CardContent>
                  ) : (
                    /* 👁️ MODO VISTA */
                    <>
                      <CardHeader className="pb-3 border-b border-white/10">
                        <div className="flex items-center space-x-3 text-[#00FF9F]">
                          <div className="p-2 bg-[#00FF9F]/10 rounded-lg group-hover:bg-[#00FF9F] group-hover:text-black transition-colors duration-300">
                            <Scissors className="w-5 h-5" />
                          </div>
                          <span className="text-lg font-bold tracking-tight text-white">{s.nombre}</span>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-5 flex-grow">
                        <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/5">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 italic">Tiempo</span>
                            <span className="font-mono text-xl text-white">{s.duracion_min}<span className="text-xs ml-1 text-slate-400">min</span></span>
                          </div>
                          <div className="h-8 w-[1px] bg-white/10"></div>
                          <div className="flex flex-col text-right">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 italic">Precio</span>
                            <span className="font-mono text-xl text-[#00FF9F]">${s.precio}</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="pt-4 border-t border-white/5 bg-transparent flex flex-wrap gap-2 justify-end opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
                        <Button
                          onClick={() => iniciarEdicion(s)}
                          size="sm"
                          variant="ghost"
                          className="text-slate-400 hover:text-[#00FF9F] hover:bg-[#00FF9F]/10 flex-1 md:flex-none"
                        >
                          <Edit className="w-4 h-4 mr-2" /> Editar
                        </Button>
                        <Button
                          onClick={() => eliminarServicio(s.id, s.nombre)}
                          size="sm"
                          variant="ghost"
                          className="text-slate-500 hover:text-red-400 hover:bg-red-400/10 flex-1 md:flex-none"
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </CardFooter>
                    </>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminPageLayout>
  );
}