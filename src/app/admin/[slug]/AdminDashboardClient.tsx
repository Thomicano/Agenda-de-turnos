"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, DollarSign, TrendingUp, Clock, CheckCircle, ArrowRight } from "lucide-react";

type TurnoServicio = {
  nombre: string;
  precio?: number;
};

type Turno = {
  id: string;
  fecha: string;
  estado: string;
  servicios: TurnoServicio | TurnoServicio[];
};

export default function AdminDashboardClient({ slug: slugProp }: { slug?: string }) {
  const params = useParams();
  const rawSlug = (slugProp ?? params?.slug) as unknown;
  const slug = typeof rawSlug === "string" ? rawSlug : Array.isArray(rawSlug) ? rawSlug[0] : undefined;

  const slugValido = typeof slug === "string" && slug.trim().length > 0 && slug !== "undefined" && slug !== "null";

  const [loading, setLoading] = useState(true);
  const [negocioNombre, setNegocioNombre] = useState("");
  const [turnosHoy, setTurnosHoy] = useState(0);
  const [pendientesHoy, setPendientesHoy] = useState(0);
  const [completadosMes, setCompletadosMes] = useState(0);
  const [gananciasEstimadas, setGananciasEstimadas] = useState(0);
  const [servicioPopular, setServicioPopular] = useState<string>("Ninguno");

  const nombreMesActual = new Intl.DateTimeFormat('es-AR', { month: 'long' }).format(new Date());

  useEffect(() => {
    if (slugValido) {
      cargarDatos();

      // 📡 ANTENA REALTIME
      const channel = supabase
        .channel("dashboard-realtime")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "turnos" },
          () => {
            console.log("♻️ Cambio en turnos detectado, refrescando métricas...");
            cargarDatos();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
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

    setNegocioNombre(negocioData.nombre);

    const hoy = new Date();
    // Ajuste de zona horaria
    const offset = hoy.getTimezoneOffset() * 60000;
    const fechaHoyString = new Date(hoy.getTime() - offset).toISOString().split("T")[0];
    
    const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split("T")[0];
    const ultimoDiaMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).toISOString().split("T")[0];

    const { data: turnosData, error: turnosError } = await supabase
      .from("turnos")
      .select("id, fecha, estado, servicios (nombre, precio)")
      .eq("negocio_id", negocioData.id)
      .gte("fecha", primerDiaMes)
      .lte("fecha", ultimoDiaMes);

    if (!turnosError && turnosData) {
      calcularMetricas(turnosData as Turno[], fechaHoyString);
    }

    setLoading(false);
  };

  const calcularMetricas = (turnos: Turno[], fechaHoyString: string) => {
    let tHoy = 0, tPendientesHoy = 0, tCompletadosMes = 0, ganancias = 0;
    const countServicios: Record<string, number> = {};

    turnos.forEach((turno) => {
      // HOY
      if (turno.fecha === fechaHoyString) {
        if (turno.estado !== "cancelado") tHoy++;
        if (turno.estado === "confirmado") tPendientesHoy++; // "confirmado" es el estado pendiente real en la BD
      }
      // MES
      if (turno.estado === "atendido") {
        tCompletadosMes++;
        let servs: TurnoServicio[] = Array.isArray(turno.servicios) ? turno.servicios : turno.servicios ? [turno.servicios] : [];
        servs.forEach(serv => {
          if (serv.precio) ganancias += Number(serv.precio);
          if (serv.nombre) countServicios[serv.nombre] = (countServicios[serv.nombre] || 0) + 1;
        });
      }
    });

    setTurnosHoy(tHoy);
    setPendientesHoy(tPendientesHoy);
    setCompletadosMes(tCompletadosMes);
    setGananciasEstimadas(ganancias);

    let maxCount = 0, popular = "Ninguno";
    for (const [nombre, count] of Object.entries(countServicios)) {
      if (count > maxCount) {
        maxCount = count;
        popular = nombre;
      }
    }
    setServicioPopular(popular);
  };

  if (!slugValido) return <div className="p-6 text-amber-500 font-bold bg-amber-500/5 rounded-2xl border border-amber-500/10">No se encontró el negocio.</div>;

  if (loading) {
    return (
      <AdminPageLayout title="Resumen" subtitle="Cargando tus métricas...">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-white/5 animate-pulse rounded-3xl border border-white/10" />)}
        </div>
      </AdminPageLayout>
    );
  }

  return (
    <AdminPageLayout
      title={`Resumen – ${negocioNombre || ""}`}
      subtitle={`Métricas de ${nombreMesActual} en tiempo real.`}
    >
      {/* GRID DE KPIs PRINCIPALES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Card Turnos Hoy */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-3xl shadow-2xl transition-all duration-500 hover:shadow-[0_0_25px_rgba(0,255,159,0.1)] hover:bg-white/[0.08] group overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2 bg-transparent">
            <CardTitle className="text-xs font-black text-slate-500 uppercase tracking-widest">Turnos Hoy</CardTitle>
            <div className="p-2 bg-[#00FF9F]/5 text-[#00FF9F] rounded-xl transition-all duration-300 group-hover:bg-[#00FF9F] group-hover:text-black group-hover:shadow-[0_0_15px_rgba(0,255,159,0.5)]">
              <Calendar className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-white mb-4 transition-transform duration-300 group-hover:scale-105 origin-left">{turnosHoy}</div>
            <Link
              href={`/admin/${slug}/agenda`}
              className="text-xs text-[#00FF9F] font-bold hover:underline flex items-center gap-1 group/link"
            >
              Ver agenda <ArrowRight size={12} className="group-hover/link:translate-x-1 transition-transform" />
            </Link>
          </CardContent>
        </Card>

        {/* Card Pendientes */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-3xl shadow-2xl transition-all duration-500 hover:shadow-[0_0_25px_rgba(245,158,11,0.1)] hover:bg-white/[0.08] group overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2 bg-transparent">
            <CardTitle className="text-xs font-black text-slate-500 uppercase tracking-widest">Pendientes</CardTitle>
            <div className="p-2 bg-amber-500/5 text-amber-500 rounded-xl transition-all duration-300 group-hover:bg-amber-500 group-hover:text-black group-hover:shadow-[0_0_15px_rgba(245,158,11,0.5)]">
              <Clock className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-white transition-transform duration-300 group-hover:scale-105 origin-left">{pendientesHoy}</div>
            <p className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-tight">Restantes por atender</p>
          </CardContent>
        </Card>

        {/* Card Completados */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-3xl shadow-2xl transition-all duration-500 hover:shadow-[0_0_25px_rgba(0,255,159,0.1)] hover:bg-white/[0.08] group overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2 bg-transparent">
            <CardTitle className="text-xs font-black text-slate-500 uppercase tracking-widest">Completados</CardTitle>
            <div className="p-2 bg-[#00FF9F]/5 text-[#00FF9F] rounded-xl transition-all duration-300 group-hover:bg-[#00FF9F] group-hover:text-black group-hover:shadow-[0_0_15px_rgba(0,255,159,0.5)]">
              <CheckCircle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-white transition-transform duration-300 group-hover:scale-105 origin-left">{completadosMes}</div>
            <p className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-tight">Total este mes</p>
          </CardContent>
        </Card>
      </div>

      {/* SECCIÓN SECUNDARIA: POPULARIDAD Y GANANCIAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Popularidad */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-3xl overflow-hidden relative group transition-all duration-500 hover:shadow-[0_0_25px_rgba(0,255,159,0.08)]">
          <div className="absolute -top-6 -right-6 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-500">
            <TrendingUp size={160} className="text-[#00FF9F]" />
          </div>
          <CardHeader className="bg-transparent">
            <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#00FF9F]" /> 
              <span className="uppercase tracking-widest text-[10px] text-slate-400">Servicio Estrella</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex items-center gap-4 group-hover:bg-white/[0.08] transition-colors">
              <div className="h-12 w-12 bg-gradient-to-br from-[#00FF9F] to-[#008080] rounded-xl flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-[#00FF9F]/20">
                {servicioPopular !== "Ninguno" ? servicioPopular.charAt(0).toUpperCase() : "-"}
              </div>
              <div>
                <div className="text-xl font-black text-white leading-none tracking-tight">{servicioPopular}</div>
                <div className="text-[10px] font-bold text-[#00FF9F] uppercase tracking-widest mt-1">Más agendado este mes</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ganancias */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-3xl relative overflow-hidden group transition-all duration-500 hover:shadow-[0_0_25px_rgba(0,255,159,0.08)]">
          <CardHeader className="bg-transparent">
            <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-[#00FF9F]" /> 
              <span className="uppercase tracking-widest text-[10px] text-slate-400">Facturación Estimada</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl group-hover:bg-white/[0.08] transition-colors">
              <div className="text-3xl font-black text-white tracking-tighter">
                ${gananciasEstimadas.toLocaleString("es-AR")}
              </div>
              <div className="flex flex-col gap-2 mt-3">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  <span>Rendimiento Mensual</span>
                  <span className="text-[#00FF9F]">75%</span>
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                   <div className="h-full bg-gradient-to-r from-[#00FF9F] to-[#008080] w-[75%] shadow-[0_0_12px_#00FF9F] animate-pulse" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminPageLayout>
  );
}