"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardFooter, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Scissors, Edit, Trash, Plus } from "lucide-react";
import { AdminPageLayout } from "@/components/AdminPageLayout";

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
    console.log("NEGOCIO ID LISTAR:", negocioData?.id);
    if (negocioError || !negocioData) {
      console.error("Error negocio:", negocioError);
      setLoading(false);
      return;
    }

    setNegocio(negocioData);
    console.log("SLUG:", slug);

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
  console.log("NEGOCIO ID CREAR:", negocio.id);

  if (!nombre.trim() || !duracion.trim() || !precio.trim()) {
    alert("Por favor completá todos los campos.");
    return;
  }

  if (isNaN(Number(duracion)) || isNaN(Number(precio))) {
    alert("Duración y precio deben ser valores numéricos válidos.");
    return;
  }

  const { error } = await supabase.from("servicios").insert({
      negocio_id: negocio.id,
      nombre: nombre.trim(),
      duracion_min: Number(duracion),
      precio: Number(precio),
  });

  if (error) {
    console.error("ERROR AL CREAR SERVICIO:", error);
    alert("Hubo un error al crear el servicio. Revisa la consola o intenta nuevamente.");
    return;
  }

  setNombre("");
  setDuracion("");
  setPrecio("");
  cargarDatos();
};

  // ✅ NUEVA: Iniciar edición
  const iniciarEdicion = (servicio: Servicio) => {
    setEditando(servicio.id);
    setNombreEdit(servicio.nombre);
    setDuracionEdit(String(servicio.duracion_min));
    setPrecioEdit(String(servicio.precio));
  };

  // ✅ NUEVA: Cancelar edición
  const cancelarEdicion = () => {
    setEditando(null);
    setNombreEdit("");
    setDuracionEdit("");
    setPrecioEdit("");
  };

  // ✅ NUEVA: Guardar edición
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

    if (error) {
      alert("Error al editar servicio");
      return;
    }

    cancelarEdicion();
    cargarDatos();
  };

  // ✅ NUEVA: Eliminar servicio
  const eliminarServicio = async (id: string, nombre: string) => {
    if (!confirm(`¿Eliminar "${nombre}"?`)) return;

    const { error } = await supabase
      .from("servicios")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Error al eliminar servicio");
      return;
    }

    cargarDatos();
  };

  

  if (!slugValido) {
    return (
      <p className="p-6 text-amber-600">
        No se encontró el negocio en la URL. Entrá por /admin/[tu-slug]/servicios
      </p>
    );
  }

  if (loading) {
    return <p className="p-6">Cargando...</p>;
  }

  return (
    <AdminPageLayout
      title={`Servicios – ${negocio?.nombre || ""}`}
      subtitle="Gestioná los servicios que ofrece tu negocio"
    >
      <div className="space-y-8">
        {/* AGREGAR SERVICIO */}
        <Card className="border-gray-200/60 shadow-sm">
          <CardHeader className="pb-3 bg-gray-50/50">
            <CardTitle className="text-lg flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-500" />
              Agregar nuevo servicio
            </CardTitle>
            <CardDescription>
              Completá los datos para ofrecer un nuevo servicio a tus clientes.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="space-y-2 md:col-span-2">
                <Input
                  placeholder="Ej. Corte de pelo"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Input
                  type="number"
                  placeholder="Duración (min)"
                  value={duracion}
                  onChange={(e) => setDuracion(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Input
                  type="number"
                  placeholder="Precio ($)"
                  value={precio}
                  onChange={(e) => setPrecio(e.target.value)}
                />
              </div>
            </div>
            <Button onClick={crearServicio} className="mt-4 bg-indigo-600 hover:bg-indigo-700 w-full md:w-auto">
              Crear servicio
            </Button>
          </CardContent>
        </Card>

        {/* LISTA DE SERVICIOS */}
        <div>
          <h2 className="text-xl font-bold mb-4">Tus servicios</h2>
          
          {servicios.length === 0 ? (
            <Card className="p-12 text-center border-dashed shadow-sm">
              <p className="text-muted-foreground">No hay servicios registrados.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {servicios.map((s) => (
                <Card key={s.id} className="flex flex-col hover:shadow-md transition-all duration-200 border-gray-200/60">
                  {editando === s.id ? (
                    // 🔄 MODO EDICIÓN
                    <CardContent className="p-5 flex flex-col gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase">Nombre</label>
                        <Input
                          placeholder="Nombre"
                          value={nombreEdit}
                          onChange={(e) => setNombreEdit(e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-500 uppercase">Duración (min)</label>
                          <Input
                            type="number"
                            placeholder="Min"
                            value={duracionEdit}
                            onChange={(e) => setDuracionEdit(e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-500 uppercase">Precio ($)</label>
                          <Input
                            type="number"
                            placeholder="$"
                            value={precioEdit}
                            onChange={(e) => setPrecioEdit(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 pt-2 mt-auto">
                        <Button
                          onClick={guardarEdicion}
                          size="sm"
                          className="w-full bg-emerald-600 hover:bg-emerald-700"
                        >
                          Guardar
                        </Button>
                        <Button
                          onClick={cancelarEdicion}
                          size="sm"
                          variant="outline"
                          className="w-full"
                        >
                          Cancelar
                        </Button>
                      </div>
                    </CardContent>
                  ) : (
                    // 👁️ MODO VISTA
                    <>
                      <CardHeader className="pb-3 border-b bg-gray-50/50">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center space-x-3 text-indigo-600">
                            <div className="p-2 bg-indigo-100 rounded-lg">
                              <Scissors className="w-5 h-5" />
                            </div>
                            <span className="text-xl font-bold tracking-tight">{s.nombre}</span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-5 flex-grow space-y-4">
                        <div className="flex items-center justify-between text-muted-foreground bg-gray-50/80 p-3 rounded-md border border-gray-100">
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Duración</span>
                            <span className="font-medium text-gray-700">{s.duracion_min} min</span>
                          </div>
                          <div className="flex flex-col text-right">
                            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Precio</span>
                            <span className="font-medium text-gray-700">${s.precio}</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="pt-4 border-t bg-gray-50/30 flex gap-2 justify-end">
                        <Button
                          onClick={() => iniciarEdicion(s)}
                          size="sm"
                          variant="outline"
                          className="flex gap-2 items-center hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors"
                        >
                          <Edit className="w-4 h-4" /> Editar
                        </Button>
                        <Button
                          onClick={() => eliminarServicio(s.id, s.nombre)}
                          size="sm"
                          variant="outline"
                          className="flex gap-2 items-center text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
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