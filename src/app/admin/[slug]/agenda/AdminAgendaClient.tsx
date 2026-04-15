"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { 
  Clock, Scissors, User, Plus, Filter, 
  Download, CalendarDays, CheckCircle2, XCircle, Loader2,
  UserCheck
} from "lucide-react";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { toast } from "react-hot-toast";

// --- TIPOS ---
type Turno = {
  id: string;
  hora: string;
  estado: string;
  cliente_nombre: string;
  cliente_telefono?: string;
  servicio_nombre?: string;
  profesional_id?: string;
  profesional_nombre?: string;
};

type Servicio = { id: string; nombre: string; };
type Profesional = { id: string; nombre: string; };

export default function AdminAgendaClient() {
  const params = useParams();
  const slug = params?.slug as string;

  // ESTADOS PRINCIPALES
  const [date, setDate] = useState<Date>(new Date());
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [profesionales, setProfesionales] = useState<Profesional[]>([]);
  const [negocioId, setNegocioId] = useState<string | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");

  // ESTADOS DEL MODAL
  const [isModalNuevoOpen, setIsModalNuevoOpen] = useState(false);
  const [creandoTurno, setCreandoTurno] = useState(false);
  const [nuevoTurnoData, setNuevoTurnoData] = useState({
    cliente_nombre: "",
    cliente_telefono: "",
    servicio_id: "",
    profesional_id: "",
    hora: "09:00"
  });

  const getFechaString = (d: Date) => {
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().split('T')[0];
  };
  const fechaString = getFechaString(date);

  // CARGA DE DATOS INICIALES
  useEffect(() => {
    if (!slug) return;
    const init = async () => {
      const { data: neg } = await supabase.from("negocios").select("id").eq("slug", slug).single();
      if (neg) {
        setNegocioId(neg.id);
        const { data: srv } = await supabase.from("servicios").select("id, nombre").eq("negocio_id", neg.id);
        const { data: prof } = await supabase.from("profesionales").select("id, nombre").eq("negocio_id", neg.id);
        if (srv) {
          setServicios(srv);
          if (srv.length > 0) setNuevoTurnoData(prev => ({ ...prev, servicio_id: srv[0].id }));
        }
        if (prof) setProfesionales(prof);
      }
    };
    init();
  }, [slug]);

  const cargarTurnos = async () => {
    if (!negocioId) return;
    const { data, error } = await supabase
      .from("turnos")
      .select(`
        id, hora, estado, cliente_nombre, cliente_telefono, profesional_id,
        servicios:servicio_id ( nombre ), 
        profesionales:profesional_id ( nombre )
      `)
      .eq("negocio_id", negocioId)
      .eq("fecha", fechaString)
      .order("hora", { ascending: true });

    if (error) return;

    const turnosFormateados = data.map((t: any) => ({
      ...t,
      servicio_nombre: t.servicios?.nombre || "Servicio General",
      profesional_nombre: t.profesionales?.nombre || "Sin asignar"
    }));
    setTurnos(turnosFormateados);
  };

  useEffect(() => {
    cargarTurnos();
    const channel = supabase.channel("realtime-agenda")
      .on("postgres_changes", { event: "*", schema: "public", table: "turnos" }, cargarTurnos)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fechaString, negocioId]);

  // CAMBIO DE ESTADO RÁPIDO
  const cambiarEstado = async (id: string, nuevoEstado: string) => {
    const backupTurnos = [...turnos];
    setTurnos(prev => prev.map(t => t.id === id ? { ...t, estado: nuevoEstado } : t));
    const { error } = await supabase.from("turnos").update({ estado: nuevoEstado }).eq("id", id);
    if (error) {
      toast.error("No se pudo guardar");
      setTurnos(backupTurnos);
    } else {
      toast.success(`Turno marcado como ${nuevoEstado}`);
    }
  };

  // 🚀 CREAR TURNO (CON VALIDACIÓN DE PROFESIONALES)
  const handleCrearTurno = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nuevoTurnoData.cliente_nombre || !nuevoTurnoData.servicio_id || !nuevoTurnoData.hora) {
      toast.error("Por favor completá los datos obligatorios");
      return;
    }

    // 1. Normalizar hora ("9:00" -> "09:00")
    const [h, m] = nuevoTurnoData.hora.split(":");
    const horaNuevaLimpia = `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;

    // 2. Buscar turnos ocupados a esa misma hora
    const turnosOcupadosEnHora = turnos.filter(
      t => t.hora.startsWith(horaNuevaLimpia) && t.estado !== "cancelado"
    );

    // 3. 🛡️ LÓGICA DE VALIDACIÓN ESTRICTA
    const totalProfesionales = profesionales.length > 0 ? profesionales.length : 1;

    // REGLA A: Capacidad máxima del local. 
    // Si ya hay tantos turnos como profesionales, nadie más entra a esa hora.
    if (turnosOcupadosEnHora.length >= totalProfesionales) {
      toast.error(`Capacidad máxima alcanzada a las ${horaNuevaLimpia} (${turnosOcupadosEnHora.length}/${totalProfesionales} turnos)`);
      return;
    }

    // REGLA B: Profesional específico ocupado.
    if (nuevoTurnoData.profesional_id) {
      const estaOcupado = turnosOcupadosEnHora.some(t => t.profesional_id === nuevoTurnoData.profesional_id);
      if (estaOcupado) {
        toast.error(`Ese profesional ya tiene un turno a las ${horaNuevaLimpia}`);
        return;
      }
    }

    // 4. Guardar en Supabase
    setCreandoTurno(true);
    const { error } = await supabase.from("turnos").insert([{
      negocio_id: negocioId,
      fecha: fechaString,
      hora: horaNuevaLimpia,
      estado: "confirmado",
      cliente_nombre: nuevoTurnoData.cliente_nombre,
      cliente_telefono: nuevoTurnoData.cliente_telefono,
      servicio_id: nuevoTurnoData.servicio_id,
      profesional_id: nuevoTurnoData.profesional_id || null
    }]);

    if (error) {
      toast.error("Error al crear el turno en la base de datos");
    } else {
      toast.success("Turno agendado con éxito");
      setIsModalNuevoOpen(false);
      setNuevoTurnoData({ ...nuevoTurnoData, cliente_nombre: "", cliente_telefono: "" });
      cargarTurnos(); // Fuerza recarga local inmediata sin F5
    }
    setCreandoTurno(false);
  };

  const handleExportar = () => {
    const headers = ["Hora", "Cliente", "Teléfono", "Servicio", "Profesional", "Estado"];
    const rows = turnos.map(t => [t.hora, t.cliente_nombre, t.cliente_telefono || "-", t.servicio_nombre, t.profesional_nombre, t.estado]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `agenda_${fechaString}.csv`;
    link.click();
  };

  const turnosFiltrados = turnos.filter(t => filtroEstado === "todos" ? true : t.estado === filtroEstado);

  return (
    <AdminPageLayout 
      title="Agenda del Negocio" 
      subtitle="Control total de tus turnos"
      isSidebarCollapsed={true} 
    >
      {/* HEADER DE ACCIONES */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 bg-[#131A2A] p-4 rounded-3xl border border-white/10">
        <div className="flex gap-2">
          {["todos", "confirmado", "atendido", "cancelado"].map((est) => (
            <Button 
              key={est} variant={filtroEstado === est ? "default" : "outline"} onClick={() => setFiltroEstado(est)}
              className={`h-8 text-[9px] font-black uppercase rounded-lg ${filtroEstado === est ? 'bg-[#00FF9F] text-black' : 'border-white/10 text-slate-400'}`}
            >
              {est}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleExportar} variant="outline" className="border-white/10 hover:bg-white/5 text-slate-400 gap-2 rounded-xl h-10 text-[10px] font-bold">
            <Download size={14} /> EXPORTAR CSV
          </Button>
          <Button onClick={() => setIsModalNuevoOpen(true)} className="bg-[#00FF9F] hover:bg-[#00cc7e] text-[#0B0F19] font-black gap-2 rounded-xl h-10 text-[10px]">
            <Plus size={16} /> NUEVO TURNO
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* CALENDARIO */}
        <div className="w-full lg:w-[320px] lg:sticky lg:top-8">
           <Card className="bg-[#131A2A] border-white/10 rounded-[2rem] overflow-hidden p-4">
              <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} className="text-white" />
           </Card>
        </div>

        {/* LISTADO DE TURNOS */}
        <div className="flex-1 w-full space-y-4">
          <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-4">
            {turnosFiltrados.map((t) => (
              <Card key={t.id} className="bg-[#131A2A] border-white/10 rounded-[2rem] overflow-hidden hover:border-[#00FF9F]/40 transition-all flex flex-col justify-between">
                <div className="p-4 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <span className="text-3xl font-black text-white font-mono leading-none">{t.hora.substring(0, 5)}</span>
                    </div>
                    <Badge className={`uppercase text-[9px] font-black px-2 py-1 rounded-md ${
                      t.estado === 'atendido' ? 'bg-emerald-500/10 text-emerald-400' : 
                      t.estado === 'cancelado' ? 'bg-red-500/10 text-red-400' : 'bg-[#00FF9F]/10 text-[#00FF9F]'
                    }`}>
                      {t.estado}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    {/* Cliente y Servicio */}
                    <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl mt-2">
                      <div className="w-10 h-10 rounded-xl bg-[#00FF9F]/10 flex items-center justify-center text-[#00FF9F] flex-shrink-0">
                        <User size={18} />
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-sm font-black text-white uppercase leading-none truncate">{t.cliente_nombre}</span>
                        <span className="text-[10px] text-slate-500 font-bold mt-1 uppercase flex items-center gap-1 truncate">
                          <Scissors size={10} className="text-[#00FF9F] flex-shrink-0" /> 
                          <span className="truncate">{t.servicio_nombre}</span>
                        </span>
                      </div>
                    </div>
                    
                    {/* Profesional Asignado */}
                    <div className="flex items-center gap-2 px-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white/[0.02] py-1.5 rounded-lg border border-white/5">
                      <UserCheck size={12} className="text-[#00FF9F]" />
                      <span>Prof: <span className="text-white italic">{t.profesional_nombre}</span></span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 p-4 pt-0 mt-auto">
                  {t.estado !== 'atendido' && (
                    <Button onClick={() => cambiarEstado(t.id, 'atendido')} className="flex-1 h-8 bg-[#00FF9F] hover:bg-[#00cc7e] text-[#0B0F19] font-black text-[9px] uppercase rounded-lg">Atendido</Button>
                  )}
                  {t.estado !== 'cancelado' && (
                    <Button onClick={() => cambiarEstado(t.id, 'cancelado')} variant="ghost" className="h-8 text-slate-500 hover:text-red-400 hover:bg-red-500/10 font-bold text-[9px] uppercase rounded-lg px-2"><XCircle size={14} /></Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL DE NUEVO TURNO */}
      {isModalNuevoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0F19]/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#131A2A] border border-white/10 w-full max-w-md rounded-[2rem] shadow-2xl p-6 relative animate-in zoom-in-95 duration-200">
            
            <button 
              onClick={() => setIsModalNuevoOpen(false)}
              className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"
            >
              <XCircle size={24} />
            </button>

            <div className="mb-6">
              <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Agendar Turno</h2>
              <p className="text-[10px] text-[#00FF9F] uppercase tracking-widest font-bold mt-1">
                Para el {date.toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })}
              </p>
            </div>

            <form onSubmit={handleCrearTurno} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Hora</label>
                  <Input 
                    type="time" 
                    required
                    value={nuevoTurnoData.hora}
                    onChange={(e) => setNuevoTurnoData({...nuevoTurnoData, hora: e.target.value})}
                    className="bg-white/5 border-white/10 text-white h-12 rounded-xl focus:border-[#00FF9F]/50 mt-1" 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Profesional</label>
                  <select 
                    value={nuevoTurnoData.profesional_id}
                    onChange={(e) => setNuevoTurnoData({...nuevoTurnoData, profesional_id: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 text-white h-12 rounded-xl px-2 outline-none mt-1 focus:border-[#00FF9F]/50"
                  >
                    <option value="" className="bg-[#131A2A]">Cualquiera</option>
                    {profesionales.map(p => (
                      <option key={p.id} value={p.id} className="bg-[#131A2A]">{p.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Cliente</label>
                <Input 
                  type="text" 
                  required
                  placeholder="Nombre completo"
                  value={nuevoTurnoData.cliente_nombre}
                  onChange={(e) => setNuevoTurnoData({...nuevoTurnoData, cliente_nombre: e.target.value})}
                  className="bg-white/5 border-white/10 text-white h-12 rounded-xl focus:border-[#00FF9F]/50 mt-1" 
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Servicio</label>
                <select 
                  required
                  value={nuevoTurnoData.servicio_id}
                  onChange={(e) => setNuevoTurnoData({...nuevoTurnoData, servicio_id: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 text-white h-12 rounded-xl px-3 focus:border-[#00FF9F]/50 outline-none mt-1"
                >
                  {servicios.map(s => (
                    <option key={s.id} value={s.id} className="bg-[#131A2A] text-white">{s.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="pt-4">
                <Button 
                  type="submit" 
                  disabled={creandoTurno}
                  className="w-full h-12 bg-[#00FF9F] text-[#0B0F19] hover:bg-[#00cc7e] font-black uppercase tracking-widest rounded-xl transition-all"
                >
                  {creandoTurno ? <Loader2 className="animate-spin mx-auto" /> : "Guardar Turno"}
                </Button>
              </div>
            </form>

          </div>
        </div>
      )}
    </AdminPageLayout>
  );
}