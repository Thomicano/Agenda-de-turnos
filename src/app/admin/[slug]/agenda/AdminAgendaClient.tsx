"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Scissors, User } from "lucide-react";

type Turno = {
  id: string;
  hora: string;
  estado: string;
  cliente_nombre: string;
  servicios: {
    nombre: string;
  }[];
};

export default function AdminAgendaClient() {

  const params = useParams();

  const rawSlug = params?.slug;
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

  const [fecha, setFecha] = useState("");
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [negocioId, setNegocioId] = useState<string | null>(null);
  console.log({ slug, slugValido, negocioId, fecha });

  useEffect(() => {
  const hoy = new Date().toISOString().split("T")[0];
  setFecha(hoy);
}, []);
  useEffect(() => {
    if (!slugValido) return;

    const cargarNegocio = async () => {
      const { data } = await supabase
        .from("negocios")
        .select("id")
        .eq("slug", slug as string)
        .single();

      if (data) setNegocioId(data.id);
    };

    cargarNegocio();
  }, [slug, slugValido]);
  
  const cargarTurnos = async () => {
  if (!negocioId || !fecha) return;

  // Convertimos la fecha al formato que Supabase ama: YYYY-MM-DD
  // Si 'fecha' viene como "17/03/2026", lo transformamos
  let fechaISO = fecha;
  if (typeof fecha === 'string' && fecha.includes('/')) {
    const [dia, mes, anio] = fecha.split('/');
    fechaISO = `${anio}-${mes}-${dia}`;
  }

  console.log("Consultando turnos para:", fechaISO);

  const { data, error } = await supabase
    .from("turnos")
    .select(`
      id,
      hora,
      estado,
      cliente_nombre,
      servicios ( nombre ) 
    `)
    .eq("negocio_id", negocioId)
    .eq("fecha", fechaISO)
    .order("hora", { ascending: true });

  if (error) {
    console.error("Error detallado:", error);
  } else {
    console.log("¡Éxito! Turnos traídos:", data);
    setTurnos(data || []);
  }
};

  useEffect(() => {
  // 1. Si todavía no cargó la fecha o el negocio, no hacemos nada
    if (!negocioId || !fecha) return;

  // 2. Cargamos la lista de turnos normal
    cargarTurnos();

    console.log("⏳ [REALTIME] Intentando prender la antena...");

  // 3. Prendemos la antena de Supabase
  const channel = supabase
    .channel("agenda-realtime")
    .on(
      "postgres_changes",
      {
        event: "*", 
        schema: "public",
        table: "turnos",
      },
      (payload) => {
        console.log("🚨 [REALTIME] ¡Llegó un cambio desde Supabase!", payload);
        cargarTurnos(); // Volvemos a pedir los datos frescos
      }
    )
    .subscribe((status) => {
      console.log("🔌 [REALTIME] Estado de la conexión:", status);
    });

  // 4. Apagamos la antena al salir de la página
  return () => {
    console.log("🧹 [REALTIME] Apagando antena...");
    supabase.removeChannel(channel);
  };
}, [fecha, negocioId]);

  const cambiarEstado = async (turnoId: number, nuevoEstado: string) => {
    console.log(`Intentando cambiar el turno ${turnoId} a estado: ${nuevoEstado}`);

  // 1. Le decimos a Supabase que actualice el dato
    const { data, error } = await supabase
      .from("turnos")
      .update({ estado: nuevoEstado })
      .eq("id", turnoId)
      .select(); // El select() nos devuelve la fila actualizada para confirmar que funcionó

  // 2. Verificamos si hubo un error en la base de datos
  if (error) {
    console.error("❌ Error de Supabase al actualizar:", error);
    alert("Hubo un error al guardar en la base de datos. Mirá la consola.");
    return; // Cortamos la ejecución para que la pantalla NO se actualice con una mentira
  }
  // 2.5 Verificamos si realmente se actualizó algo
  if (!data || data.length === 0) {
    console.error("❌ Supabase no actualizó nada (¿Problema de RLS?)");
    alert("No se pudo actualizar el turno en la base de datos.");
    return; // Cortamos acá para que no se actualice la tarjeta mintiendo
  }
  console.log("✅ Turno actualizado en la base de datos:", data);

  // 3. Solo si la base de datos se actualizó bien, cambiamos el color en la pantalla
  setTurnos((prevTurnos) =>
    prevTurnos.map((turno) =>
      turno.id === turnoId ? { ...turno, estado: nuevoEstado } : turno
    )
  );
};
  if (!slugValido) {
    return (
      <p className="text-amber-600">
        No se encontró el negocio en la URL. Entrá por /admin/[tu-slug]/agenda
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agenda de Turnos</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Revisá y administrá las reservas del día
          </p>
        </div>
        <div className="flex items-center bg-white p-2 rounded-lg shadow-sm border w-full md:w-auto">
          <Input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="border-0 focus-visible:ring-0 shadow-none"
          />
        </div>
      </div>

      {turnos.length === 0 ? (
        <Card className="p-12 text-center border-dashed shadow-sm">
          <p className="text-muted-foreground">No hay turnos registrados para esta fecha.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {turnos.map((t) => (
            <Card key={t.id} className="flex flex-col hover:shadow-md transition-all duration-200 border-gray-200/60">
              <CardHeader className="pb-3 border-b bg-gray-50/50">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2 text-indigo-600">
                    <Clock className="w-5 h-5" />
                    <span className="text-2xl font-bold tracking-tighter">{t.hora}</span>
                  </div>
                  <Badge 
                    variant={
                      t.estado === "confirmado" ? "default" : 
                      t.estado === "cancelado" ? "destructive" : 
                      "secondary"
                    }
                    className={t.estado === "confirmado" ? "bg-emerald-500 hover:bg-emerald-600" : ""}
                  >
                    {t.estado.charAt(0).toUpperCase() + t.estado.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-5 flex-grow space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-indigo-50 rounded-full text-indigo-500">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-foreground text-lg">{t.cliente_nombre}</span>
                </div>
                <div className="flex items-center space-x-3 text-muted-foreground bg-gray-50/80 p-3 rounded-md border border-gray-100">
                  <Scissors className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium">
                    {/* @ts-ignore */}
                    {t.servicios?.[0]?.nombre || t.servicios?.nombre || 'Servicio sin nombre'}
                  </span>
                </div>
              </CardContent>
              {t.estado === "confirmado" && (
                <CardFooter className="pt-4 border-t bg-gray-50/30 flex gap-3 w-full justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full sm:w-auto font-medium"
                    onClick={() => cambiarEstado(t.id, "atendido")}
                  >
                    Marcar Atendido
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="w-full sm:w-auto font-medium"
                    onClick={() => cambiarEstado(t.id, "cancelado")}
                  >
                    Cancelar
                  </Button>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
