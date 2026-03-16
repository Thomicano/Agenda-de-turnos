"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { AdminPageLayout } from "@/components/AdminPageLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar, DollarSign, TrendingUp, Clock, CheckCircle } from "lucide-react";

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

  const [loading, setLoading] = useState(true);
  const [negocioNombre, setNegocioNombre] = useState("");
  
  // Dashboard Metrics
  const [turnosHoy, setTurnosHoy] = useState(0);
  const [pendientesHoy, setPendientesHoy] = useState(0);
  const [completadosMes, setCompletadosMes] = useState(0);
  const [gananciasEstimadas, setGananciasEstimadas] = useState(0);
  const [servicioPopular, setServicioPopular] = useState<string>("Ninguno");

  const nombreMesActual = new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(new Date());

  useEffect(() => {
    if (slugValido) cargarDatos();
  }, [slug, slugValido]);

  const cargarDatos = async () => {
    if (!slugValido) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // 1. Obtener ID del negocio
    const { data: negocioData, error: negocioError } = await supabase
      .from("negocios")
      .select("id, nombre")
      .eq("slug", slug as string)
      .single();

    if (negocioError || !negocioData) {
      console.error("Error negocio:", negocioError);
      setLoading(false);
      return;
    }
    
    setNegocioNombre(negocioData.nombre);

    // 2. Obtener turnos del mes actual y de hoy
    const hoy = new Date();
    // Ajustar a timezone local si es necesario, pero simple ISO string (YYYY-MM-DD):
    const fechaHoyString = hoy.toISOString().split("T")[0]; 

    // Primer día del mes actual
    const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const primerDiaString = primerDiaMes.toISOString().split("T")[0];
    
    // Último día del mes actual
    const ultimoDiaMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
    const ultimoDiaString = ultimoDiaMes.toISOString().split("T")[0];

    const { data: turnosData, error: turnosError } = await supabase
      .from("turnos")
      .select("id, fecha, estado, servicios (nombre, precio)")
      .eq("negocio_id", negocioData.id)
      .gte("fecha", primerDiaString)
      .lte("fecha", ultimoDiaString);

    if (turnosError || !turnosData) {
      console.error("Error turnos:", turnosError);
      setLoading(false);
      return;
    }

    calcularMetricas(turnosData as Turno[], fechaHoyString);
    setLoading(false);
  };

  const calcularMetricas = (turnos: Turno[], fechaHoyString: string) => {
    let tHoy = 0;
    let tPendientesHoy = 0;
    let tCompletadosMes = 0;
    let ganancias = 0;
    const countServicios: Record<string, number> = {};

    turnos.forEach((turno) => {
      // Hoy
      if (turno.fecha === fechaHoyString) {
        tHoy++;
        // Asumiendo que "esperando" o "confirmado" es pendiente
        if (turno.estado === "confirmado" || turno.estado === "pendiente") {
          tPendientesHoy++;
        }
      }

      // Completados este mes
      if (turno.estado === "atendido" || turno.estado === "completado") {
        tCompletadosMes++;

        // Ganancias y popularidad solo de los completados (o de todos?)
        // Por lo general ganancias es de atendidos
        
        // Manejar estructura de retorno de supabase para relacionales (puede ser objeto o array)
        let servs: TurnoServicio[] = [];
        if (Array.isArray(turno.servicios)) {
          servs = turno.servicios;
        } else if (turno.servicios) {
          servs = [turno.servicios];
        }

        servs.forEach(serv => {
          if (serv.precio) {
            ganancias += Number(serv.precio);
          }
          if (serv.nombre) {
            countServicios[serv.nombre] = (countServicios[serv.nombre] || 0) + 1;
          }
        });
      } else {
         // Para servicio más popular podemos contar todos los agendados, no solo atendidos
         let servs: TurnoServicio[] = [];
         if (Array.isArray(turno.servicios)) {
           servs = turno.servicios;
         } else if (turno.servicios) {
           servs = [turno.servicios];
         }
 
         servs.forEach(serv => {
           if (serv.nombre) {
             countServicios[serv.nombre] = (countServicios[serv.nombre] || 0) + 1;
           }
         });
      }
    });

    setTurnosHoy(tHoy);
    setPendientesHoy(tPendientesHoy);
    setCompletadosMes(tCompletadosMes);
    setGananciasEstimadas(ganancias);

    // Encontrar más popular
    let maxCount = 0;
    let popular = "Ninguno";
    for (const [nombre, count] of Object.entries(countServicios)) {
      if (count > maxCount) {
        maxCount = count;
        popular = nombre;
      }
    }
    setServicioPopular(popular);
  };

  if (!slugValido) {
    return (
      <div className="p-6 text-amber-600">
        No se encontró el negocio en la URL. Entrá por /admin/[tu-slug]
      </div>
    );
  }

  if (loading) {
    return (
      <AdminPageLayout title="Resumen" subtitle="Cargando tus métricas...">
        <div className="p-12 text-center text-muted-foreground animate-pulse">Cargando métricas...</div>
      </AdminPageLayout>
    );
  }

  return (
    <AdminPageLayout
      title={`Resumen – ${negocioNombre || ""}`}
      subtitle="Métricas y estado general de tu negocio en tiempo real."
    >
      {/* GRID DE KPIs PRINCIPALES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-gray-200/60 shadow-sm hover:shadow-md transition-shadow flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Turnos de hoy</CardTitle>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-full">
              <Calendar className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="flex-grow">
            <div className="text-3xl font-bold">{turnosHoy}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total agendados para hoy
            </p>
          </CardContent>
          <div className="px-6 pb-4 mt-auto">
            <Link 
              href={`/admin/${slug}/agenda`}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium hover:underline inline-flex items-center gap-1"
            >
              Ir a la agenda <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </Card>

        <Card className="border-gray-200/60 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pendientes hoy</CardTitle>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-full">
              <Clock className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendientesHoy}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Restantes por atender
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-200/60 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completados en {nombreMesActual}</CardTitle>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-full">
              <CheckCircle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{completadosMes}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Servicios finalizados con éxito
            </p>
          </CardContent>
        </Card>
      </div>

      {/* SECCIÓN SECUNDARIA: POPULARIDAD Y GANANCIAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-gray-200/60 shadow-sm bg-gradient-to-br from-white to-gray-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-500" />
              Servicio más popular
            </CardTitle>
            <CardDescription>El servicio más agendado en {nombreMesActual}.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mt-2 bg-blue-50 border border-blue-100 p-4 rounded-xl shadow-sm">
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-700 font-bold text-lg">
                  {servicioPopular !== "Ninguno" ? servicioPopular.charAt(0).toUpperCase() : "-"}
                </span>
              </div>
              <div>
                <div className="font-semibold text-xl text-blue-900 tracking-tight">
                  {servicioPopular}
                </div>
                <div className="text-sm text-blue-600/80">
                  Favorito de los clientes 🏆
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200/60 shadow-sm bg-gradient-to-br from-white to-gray-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-emerald-500" />
              Ganancias estimadas
            </CardTitle>
            <CardDescription>Ingresos en {nombreMesActual} basados en turnos atendidos.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="flex items-center gap-4 mt-2 bg-white border border-gray-100 p-4 rounded-xl shadow-sm">
              <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                <DollarSign className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <div className="font-bold text-3xl text-gray-800 tracking-tight">
                  ${gananciasEstimadas.toLocaleString("es-AR")}
                </div>
                <div className="text-sm text-gray-500">
                  Generados en {nombreMesActual}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminPageLayout>
  );
}
