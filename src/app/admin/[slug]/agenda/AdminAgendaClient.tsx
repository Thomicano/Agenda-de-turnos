"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Scissors, User, Calendar as CalendarIcon, ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
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
  const slug = typeof params?.slug === "string" ? params.slug : undefined;

  const [fecha, setFecha] = useState("");
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [negocioId, setNegocioId] = useState<string | null>(null);
  const [nombreMes, setNombreMes] = useState("");

  // 1. Efecto inicial para la fecha de hoy
  useEffect(() => {
    const hoy = new Date();
    setFecha(hoy.toISOString().split("T")[0]);
    setNombreMes(hoy.toLocaleDateString('es-AR', { month: 'long', day: 'numeric' }));
  }, []);

  // 2. Cargar Negocio
  useEffect(() => {
    if (!slug) return;
    const cargarNegocio = async () => {
      const { data } = await supabase.from("negocios").select("id").eq("slug", slug).single();
      if (data) setNegocioId(data.id);
    };
    cargarNegocio();
  }, [slug]);

  // 3. Cargar Turnos (Lógica central)
  const cargarTurnos = async () => {
    if (!negocioId || !fecha) return;
    const { data, error } = await supabase
      .from("turnos")
      .select(`id, hora, estado, cliente_nombre, servicios ( nombre )`)
      .eq("negocio_id", negocioId)
      .eq("fecha", fecha)
      .order("hora", { ascending: true });

    if (!error) setTurnos(data || []);
  };

  // 4. Realtime y Suscripción
  useEffect(() => {
    if (!negocioId || !fecha) return;
    cargarTurnos();

    const channel = supabase
      .channel("agenda-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "turnos" }, () => cargarTurnos())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fecha, negocioId]);

  const cambiarEstado = async (turnoId: string, nuevoEstado: string) => {
    const { error } = await supabase.from("turnos").update({ estado: nuevoEstado }).eq("id", turnoId);
    if (error) alert("Error al actualizar estado");
  };

  if (!slug) return <div className="p-10 text-[#00FF9F]">Cargando configuración...</div>;

  return (
    <AdminPageLayout
      title="Gestión de Agenda"
      subtitle={`Turnos programados para el ${fecha.split('-').reverse().join('/')}`}
    >
      {/* HEADER DE CONTROL */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-2 pl-4 rounded-2xl backdrop-blur-xl w-full md:w-auto">
          <CalendarIcon className="w-5 h-5 text-[#00FF9F]" />
          <Input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="bg-transparent border-0 text-white focus-visible:ring-0 font-bold uppercase tracking-tighter"
          />
        </div>

        <div className="flex gap-2">
          <Badge className="bg-[#00FF9F]/10 text-[#00FF9F] border-[#00FF9F]/20 px-4 py-1 rounded-full">
            {turnos.length} Turnos hoy
          </Badge>
        </div>
      </div>

      {/* LISTA DE TURNOS */}
      {turnos.length === 0 ? (
        <Card className="bg-white/5 border-dashed border-white/10 p-20 text-center rounded-3xl">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-white/5 rounded-full text-slate-500">
              <Clock size={40} />
            </div>
            <p className="text-slate-400 font-medium">No hay actividad registrada para este día.</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {turnos.map((t) => (
            <Card key={t.id} className="group relative bg-white/5 border-white/10 hover:border-[#00FF9F]/30 transition-all duration-500 rounded-3xl overflow-hidden shadow-2xl hover:shadow-[0_0_30px_rgba(0,255,159,0.05)]">

              {/* INDICADOR DE ESTADO LATERAL */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${t.estado === "atendido" ? "bg-emerald-500" :
                  t.estado === "cancelado" ? "bg-red-500" : "bg-[#00FF9F]"
                }`} />

              <CardHeader className="pb-3 bg-transparent">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2 text-[#00FF9F]">
                    <Clock className="w-5 h-5" />
                    <span className="text-3xl font-black tracking-tighter text-white">{t.hora}</span>
                  </div>
                  <Badge className={`uppercase text-[10px] font-black tracking-widest border-0 ${t.estado === "atendido" ? "bg-emerald-500/20 text-emerald-400" :
                      t.estado === "cancelado" ? "bg-red-500/20 text-red-400" : "bg-[#00FF9F]/20 text-[#00FF9F]"
                    }`}>
                    {t.estado}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-4 space-y-4">
                <div className="flex items-center space-x-3 bg-white/5 p-3 rounded-2xl border border-white/5">
                  <div className="p-2 bg-[#00FF9F]/10 rounded-xl text-[#00FF9F]">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-white text-lg tracking-tight">{t.cliente_nombre}</span>
                </div>

                <div className="flex items-center space-x-3 text-slate-400 pl-2">
                  <Scissors className="w-4 h-4 text-[#00FF9F]/50" />
                  <span className="text-sm font-medium">
                    {/* @ts-ignore */}
                    {t.servicios?.[0]?.nombre || t.servicios?.nombre || 'Servicio General'}
                  </span>
                </div>
              </CardContent>

              <CardFooter className="pt-4 border-t border-white/5 bg-white/[0.02] flex flex-wrap gap-2">
                {/* Botón ATENDIDO - Solo si no está atendido */}
                {t.estado !== "atendido" && (
                  <Button
                    size="sm"
                    className="flex-1 bg-[#00FF9F] text-black font-black hover:bg-[#00FF9F]/80 rounded-xl transition-all"
                    onClick={() => cambiarEstado(t.id, "atendido")}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" /> Atendido
                  </Button>
                )}

                {/* Botón RE-ABRIR - Si está atendido o cancelado */}
                {(t.estado === "atendido" || t.estado === "cancelado") && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 border-[#00FF9F]/30 text-[#00FF9F] hover:bg-[#00FF9F]/10 rounded-xl transition-all"
                    onClick={() => cambiarEstado(t.id, "confirmado")} // Usamos 'confirmado' que es el estado inicial
                  >
                    <Clock className="w-4 h-4 mr-2" /> Re-abrir
                  </Button>
                )}

                {/* Botón CANCELAR - Siempre disponible si no está cancelado */}
                {t.estado !== "cancelado" && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                    onClick={() => cambiarEstado(t.id, "cancelado")}
                  >
                    <XCircle className="w-4 h-4 mr-2" /> Cancelar
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )
      }
    </AdminPageLayout >
  );
}