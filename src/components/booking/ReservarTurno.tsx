"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Scissors, 
  User, 
  Sparkles, 
  CheckCircle2, 
  Loader2, 
  ArrowLeft,
  Smartphone,
  Mail,
  MapPin,
  ChevronRight
} from "lucide-react";

// Types
type Servicio = {
  id?: string;
  nombre: string;
  precio: number;
  duracion_min: number;
};

type DiaHorario = {
  dia?: string;
  dia_semana?: number; // Para compatibilidad con el Admin
  activo?: boolean;
  esta_abierto?: boolean; // El que te está pidiendo Vercel
  desde?: string;
  hora_apertura?: string;
  hasta?: string;
  hora_cierre?: string;
};

type Profesional = {
  id: string;
  nombre: string;
  especialidad: string;
  avatar_url: string;
};

type Negocio = {
  id?: string;
  nombre: string;
  rubro: string;
  telefono: string;
  direccion: string;
  email: string;
  logo_url?: string;
  horarios: DiaHorario[]; // AHORA USAMOS EL JSONB
  duracion_turno: number;
  intervalo_turno: number;
};

type HorarioDisponible = {
  hora: string;
  disponible: boolean;
};

type ReservarTurnoProps = {
  slug: string;
};

const stepVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 }
};

export default function ReservarTurno({ slug }: ReservarTurnoProps) {
  // Estados
  const [negocio, setNegocio] = useState<Negocio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  // Estados del formulario
  const [servicioSeleccionado, setServicioSeleccionado] = useState<string>("");
  const [profesionalSeleccionado, setProfesionalSeleccionado] = useState<string>(""); // NUEVO
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date | undefined>(undefined);
  const [horariosDisponibles, setHorariosDisponibles] = useState<HorarioDisponible[]>([]);
  const [horarioSeleccionado, setHorarioSeleccionado] = useState<string>("");

  // Datos del cliente
  const [nombreCliente, setNombreCliente] = useState("");
  const [telefonoCliente, setTelefonoCliente] = useState("");
  const [emailCliente, setEmailCliente] = useState("");

  const [paso, setPaso] = useState(1);
  const [reservando, setReservando] = useState(false);

  // Servicios y Profesionales
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [profesionales, setProfesionales] = useState<Profesional[]>([]); // NUEVO

  const calendarStyles = `
    .rdp-day_selected { background-color: #00FF9F !important; color: black !important; font-weight: bold !important; }
    .rdp-button:hover:not(.rdp-day_selected) { background-color: rgba(0, 255, 159, 0.1) !important; color: #00FF9F !important; }
    .rdp-head_cell { color: #94a3b8; font-weight: 500; }
  `;

  // Cargar datos del negocio
  useEffect(() => {
    cargarNegocio();
  }, [slug]);

  const cargarNegocio = async () => {
    try {
      setLoading(true);
      setError("");

      const { data, error: supabaseError } = await supabase
        .from("negocios")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (supabaseError || !data) {
        setError(supabaseError?.message || "Negocio no encontrado");
        setNegocio(null);
      } else {
        setNegocio(data as Negocio);
        await cargarServiciosYProfesionales(data.id); // Consolidamos la carga
      }
    } catch (err) {
      setError("Error al cargar el negocio");
      setNegocio(null);
    } finally {
      setLoading(false);
    }
  };

  const cargarServiciosYProfesionales = async (negocioId: string) => {
    // 1. Cargar Servicios
    const { data: srvData } = await supabase.from("servicios").select("*").eq("negocio_id", negocioId);
    if (srvData) setServicios(srvData);

    // 2. Cargar Profesionales (NUEVO)
    const { data: profData } = await supabase.from("profesionales").select("*").eq("negocio_id", negocioId);
    if (profData) setProfesionales(profData);
  };

  // Generar horarios disponibles
  useEffect(() => {
    if (fechaSeleccionada && negocio && negocio.horarios && negocio.horarios.length > 0) {
      generarHorarios();
    }
  }, [fechaSeleccionada, negocio, servicioSeleccionado]);

  const DIAS_SEMANA_MAP = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

  const generarHorarios = async () => {
    if (!fechaSeleccionada || !negocio || !negocio.horarios) return;

    const configDia = obtenerConfigDia(fechaSeleccionada);

    if (!configDia || !configDia.activo || !configDia.desde || !configDia.hasta) {
      setHorariosDisponibles([]);
      return;
    }

    const slots: HorarioDisponible[] = [];
    const [horaInicio, minInicio] = configDia.desde.split(":").map(Number);
    const [horaFin, minFin] = configDia.hasta.split(":").map(Number);

    let horaActualMinutos = horaInicio * 60 + minInicio;
    const horaFinMinutos = horaFin * 60 + minFin;

    const ahora = new Date();
    const esHoy = fechaSeleccionada.toDateString() === ahora.toDateString();
    const minutosAhora = ahora.getHours() * 60 + ahora.getMinutes();

    const fechaString = fechaSeleccionada.toISOString().split('T')[0];

    // 1. Traemos TODOS los turnos de ese día para este negocio
    const { data: turnosOcupados } = await supabase
      .from('turnos')
      .select('hora, profesional_id')
      .eq('negocio_id', negocio.id)
      .eq('fecha', fechaString)
      .neq('estado', 'cancelado');

    // 2. Definimos la capacidad máxima (cantidad de profesionales)
    const capacidadMaxima = profesionales.length > 0 ? profesionales.length : 1;

    const servicio = servicios.find(s => (s.id || s.nombre) === servicioSeleccionado);
    const duracion = servicio?.duracion_min || negocio.duracion_turno || 30;

    while (horaActualMinutos + duracion <= horaFinMinutos) {
      const horas = Math.floor(horaActualMinutos / 60);
      const minutos = horaActualMinutos % 60;
      const horaFormato = `${String(horas).padStart(2, "0")}:${String(minutos).padStart(2, "0")}`;

      // 3. Filtrar turnos que caen exactamente en este slot
      const turnosEnEsteSlot = turnosOcupados?.filter(t => t.hora.substring(0, 5) === horaFormato) || [];

      let disponible = true;

      // REGLA A: Si ya se alcanzó la capacidad máxima del local, nadie más entra.
      if (turnosEnEsteSlot.length >= capacidadMaxima) {
        disponible = false;
      } 
      // REGLA B: Si el cliente eligió un profesional específico, ver si ese profesional está ocupado.
      else if (profesionalSeleccionado !== "sin-preference") {
        const profOcupado = turnosEnEsteSlot.some(t => t.profesional_id === profesionalSeleccionado);
        if (profOcupado) disponible = false;
      }

      // REGLA C: Validar que no sea una hora que ya pasó
      const yaPaso = esHoy && (horaActualMinutos <= minutosAhora + 15);

      slots.push({ 
        hora: horaFormato, 
        disponible: disponible && !yaPaso 
      });

      horaActualMinutos += duracion + (negocio.intervalo_turno || 0);
    }

    setHorariosDisponibles(slots);
  };

  const obtenerConfigDia = (date: Date) => {
    if (!negocio || !negocio.horarios || !Array.isArray(negocio.horarios)) return null;

    const jsDay = date.getDay(); // 0 = Domingo, 1 = Lunes...
    const DIAS_SEMANA_MAP = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    const nombreDia = DIAS_SEMANA_MAP[jsDay];

    // El panel de admin guarda de 0 (Lunes) a 6 (Domingo)
    const adminDiaIndex = jsDay === 0 ? 6 : jsDay - 1;

    // Buscamos si el día coincide con el formato del Onboarding (dia) o del Admin (dia_semana)
    const config = negocio.horarios.find((h: any) => 
      h.dia === nombreDia || h.dia_semana === adminDiaIndex
    );

    if (!config) return null;

    // Normalizamos para que el calendario lo entienda
    return {
      activo: config.activo !== undefined ? config.activo : config.esta_abierto,
      desde: config.desde || config.hora_apertura,
      hasta: config.hasta || config.hora_cierre
    };
  };

  const esDiaDisponible = (date: Date) => {
    const configDia = obtenerConfigDia(date);
    return configDia ? configDia.activo : false;
  };

  const confirmarReserva = async () => {
    if (!nombreCliente || !telefonoCliente || !emailCliente) {
      alert("Por favor completá todos los campos");
      return;
    }
    setReservando(true);
    try {
      const fechaString = fechaSeleccionada?.toISOString().split('T')[0];
      const reserva = {
        negocio_id: negocio?.id,
        servicio_id: servicioSeleccionado,
        profesional_id: profesionalSeleccionado !== "sin-preferencia" ? profesionalSeleccionado : null,
        fecha: fechaString,
        hora: horarioSeleccionado,
        cliente_nombre: nombreCliente,
        cliente_telefono: telefonoCliente,
        cliente_email: emailCliente,
        estado: "confirmado",
      };

      // 1. Insertamos y pedimos el cancel_token de vuelta
      const { data: turnoCreado, error } = await supabase
        .from('turnos')
        .insert([reserva])
        .select('cancel_token') // <--- CLAVE: Traemos el token generado
        .single();

      if (error) throw error;

      // 2. Si el turno se creó, disparamos el mail de Resend
      if (turnoCreado?.cancel_token) {
        try {
          await fetch('/api/send-confirmation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: emailCliente,
              nombreCliente: nombreCliente,
              nombreNegocio: negocio?.nombre,
              fecha: `${fechaString} a las ${horarioSeleccionado}`,
              token: turnoCreado.cancel_token
            })
          });
        } catch (mailErr) {
          console.error("Error al enviar el mail, pero el turno se guardó:", mailErr);
        }
      }

      setPaso(5); // Ir a la pantalla de éxito
    } catch (error) {
      console.error(error);
      alert("Hubo un error al confirmar tu turno. Intenta de nuevo.");
    } finally {
      setReservando(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-[var(--background)] flex items-center justify-center"><Loader2 className="animate-spin text-[#00FF9F] w-12 h-12" /></div>;

  if (error || !negocio) return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-[var(--card)] border-white/10">
        <CardContent className="p-8 text-center text-white">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">❌</div>
          <h2 className="text-2xl font-black uppercase mb-2">Negocio no encontrado</h2>
          <p className="text-slate-400">El link que ingresaste no es válido.</p>
        </CardContent>
      </Card>
    </div>
  );

  return (
    // ✨ CAMBIO: Ahora usa var(--background) de la Landing
    <main className="min-h-screen bg-[var(--background)] text-slate-200 py-8 px-4 font-sans selection:bg-[#00FF9F] selection:text-black">
      <style>{calendarStyles}</style>

      <div className="max-w-4xl mx-auto">
        {/* HEADER DEL NEGOCIO */}
        <Card className="mb-6 bg-[var(--card)] border-white/10 shadow-2xl">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {negocio.logo_url ? (
                <img src={negocio.logo_url} alt={negocio.nombre} className="w-24 h-24 rounded-2xl object-cover border border-white/10 shadow-xl" />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-white/5 flex items-center justify-center text-4xl border border-white/10">🏪</div>
              )}

              <div className="flex-1 text-center md:text-left">
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white uppercase italic">{negocio.nombre}</h1>
                <p className="text-[#00FF9F] font-bold tracking-widest uppercase text-[10px] mt-2 bg-[#00FF9F]/10 w-fit px-3 py-1 rounded-md md:mx-0 mx-auto">
                  {negocio.rubro}
                </p>

                <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-4 text-xs font-bold text-slate-400">
                  {negocio.direccion && <p className="flex items-center gap-1.5"><MapPin size={14} className="text-[#00FF9F]" /> {negocio.direccion}</p>}
                  <p className="flex items-center gap-1.5"><Smartphone size={14} className="text-[#00FF9F]" /> {negocio.telefono}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CONTENIDO PRINCIPAL - STEPPER */}
        <Card className="bg-[var(--card)] border-white/10 shadow-xl overflow-hidden min-h-[500px]">
          <CardContent className="p-6 md:p-10">
            <AnimatePresence mode="wait">
              <motion.div key={paso} initial="hidden" animate="visible" exit="exit" variants={stepVariants} transition={{ duration: 0.3 }}>

                {/* PASO 1: SERVICIOS */}
                {paso === 1 && (
                  <div>
                    <div className="mb-8">
                      <p className="text-[#00FF9F] text-[10px] font-black uppercase tracking-[0.3em] mb-2">Paso 01</p>
                      <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">¿Qué te querés hacer?</h2>
                    </div>
                    <div className="space-y-3">
                      {servicios.map((servicio) => (
                        <button
                          key={servicio.id}
                          onClick={() => { setServicioSeleccionado(servicio.id || servicio.nombre); setPaso(profesionales.length > 0 ? 2 : 3); }}
                          className={`w-full p-5 rounded-2xl border transition-all duration-300 group flex justify-between items-center ${servicioSeleccionado === (servicio.id || servicio.nombre) ? "border-[#00FF9F] bg-[#00FF9F]/10" : "border-white/5 bg-white/5 hover:border-white/20 hover:bg-white/10"}`}
                        >
                          <div className="text-left">
                            <h3 className="font-black text-lg text-white group-hover:text-[#00FF9F] transition-colors">{servicio.nombre}</h3>
                            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1 flex items-center gap-1"><Clock size={12}/> {servicio.duracion_min} MIN</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <p className="text-xl font-black font-mono text-[#00FF9F]">${servicio.precio}</p>
                            <ChevronRight size={20} className="text-slate-600 group-hover:text-[#00FF9F] transition-colors" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* PASO 2: PROFESIONAL (NUEVO) */}
                {paso === 2 && profesionales.length > 0 && (
                  <div>
                    <button onClick={() => setPaso(1)} className="text-slate-500 hover:text-white text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2 transition-colors"><ArrowLeft size={14}/> Atrás</button>
                    <div className="mb-8">
                      <p className="text-[#00FF9F] text-[10px] font-black uppercase tracking-[0.3em] mb-2">Paso 02</p>
                      <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">¿Con quién te atendés?</h2>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <button onClick={() => { setProfesionalSeleccionado("sin-preferencia"); setPaso(3); }} className={`p-4 flex flex-col items-center justify-center gap-3 rounded-2xl border transition-all ${profesionalSeleccionado === "sin-preferencia" ? 'border-[#00FF9F] bg-[#00FF9F]/10' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
                         <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center border border-white/20"><User className="text-slate-400" /></div>
                         <span className="text-xs font-black text-white uppercase text-center">Cualquiera disponible</span>
                      </button>

                      {profesionales.map((prof) => (
                        <button key={prof.id} onClick={() => { setProfesionalSeleccionado(prof.id); setPaso(3); }} className={`p-4 flex flex-col items-center justify-center gap-3 rounded-2xl border transition-all ${profesionalSeleccionado === prof.id ? 'border-[#00FF9F] bg-[#00FF9F]/10' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
                           {prof.avatar_url ? (
                             <img src={prof.avatar_url} className="w-16 h-16 rounded-full object-cover border border-white/20" />
                           ) : (
                             <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center font-black text-xl text-white border border-white/20">{prof.nombre.charAt(0)}</div>
                           )}
                           <div className="text-center">
                             <span className="block text-xs font-black text-white uppercase">{prof.nombre}</span>
                             <span className="block text-[9px] font-bold text-[#00FF9F] tracking-widest uppercase mt-1">{prof.especialidad}</span>
                           </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* PASO 3: FECHA Y HORA */}
                {paso === 3 && (
                  <div>
                    <button onClick={() => setPaso(profesionales.length > 0 ? 2 : 1)} className="text-slate-500 hover:text-white text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2 transition-colors"><ArrowLeft size={14}/> Atrás</button>
                    <div className="mb-8">
                      <p className="text-[#00FF9F] text-[10px] font-black uppercase tracking-[0.3em] mb-2">Paso 03</p>
                      <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Tu momento</h2>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-10">
                      <div className="bg-white/5 p-4 rounded-3xl border border-white/10 flex justify-center">
                        <Calendar mode="single" selected={fechaSeleccionada} onSelect={setFechaSeleccionada} disabled={(date) => date < new Date(new Date().setHours(0,0,0,0)) || !esDiaDisponible(date)} className="text-white" />
                      </div>

                      <div className="flex flex-col">
                        <p className="text-[10px] font-black text-slate-500 mb-4 uppercase tracking-[0.2em] bg-white/5 w-fit px-3 py-1 rounded-md">
                          {fechaSeleccionada ? fechaSeleccionada.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'short' }) : 'Seleccioná un día'}
                        </p>
                        
                        {fechaSeleccionada ? (
                          <div className="grid grid-cols-3 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {horariosDisponibles.length > 0 ? (
                              horariosDisponibles.map((slot) => (
                                <button
                                  key={slot.hora} disabled={!slot.disponible} onClick={() => setHorarioSeleccionado(slot.hora)}
                                  className={`py-3 rounded-xl text-sm font-mono font-black transition-all border ${!slot.disponible ? "bg-white/5 text-slate-700 border-transparent cursor-not-allowed" : horarioSeleccionado === slot.hora ? "bg-[#00FF9F] text-black border-[#00FF9F] shadow-[0_0_15px_rgba(0,255,159,0.3)] scale-105" : "bg-white/5 text-slate-300 border-white/10 hover:border-[#00FF9F]/50"}`}
                                >
                                  {slot.hora}
                                </button>
                              ))
                            ) : (
                              <p className="col-span-3 text-center text-slate-500 text-xs py-10 font-bold uppercase tracking-widest">No hay turnos para este día</p>
                            )}
                          </div>
                        ) : (
                          <div className="h-full flex items-center justify-center border-2 border-dashed border-white/10 rounded-2xl opacity-50">
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">El calendario te espera</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {horarioSeleccionado && (
                      <Button onClick={() => setPaso(4)} className="w-full mt-8 h-16 bg-[#00FF9F] text-black hover:bg-[#00cc7e] font-black uppercase tracking-widest rounded-2xl shadow-[0_0_20px_rgba(0,255,159,0.2)] transition-all">
                        Ir a confirmar
                      </Button>
                    )}
                  </div>
                )}

                {/* PASO 4: TUS DATOS */}
                {paso === 4 && (
                  <div>
                    <button onClick={() => setPaso(3)} className="text-slate-500 hover:text-white text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2 transition-colors"><ArrowLeft size={14}/> Atrás</button>
                    <div className="mb-8">
                      <p className="text-[#00FF9F] text-[10px] font-black uppercase tracking-[0.3em] mb-2">Paso Final</p>
                      <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Últimos detalles</h2>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nombre y Apellido</label>
                        <Input type="text" placeholder="Ej: Juan Pérez" className="bg-white/5 border-white/10 text-white h-14 rounded-xl focus:border-[#00FF9F]/50 mt-1" value={nombreCliente} onChange={(e) => setNombreCliente(e.target.value)} />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">WhatsApp</label>
                          <Input type="tel" placeholder="+54 9..." className="bg-white/5 border-white/10 text-white h-14 rounded-xl focus:border-[#00FF9F]/50 mt-1" value={telefonoCliente} onChange={(e) => setTelefonoCliente(e.target.value)} />
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email</label>
                          <Input type="email" placeholder="correo@ejemplo.com" className="bg-white/5 border-white/10 text-white h-14 rounded-xl focus:border-[#00FF9F]/50 mt-1" value={emailCliente} onChange={(e) => setEmailCliente(e.target.value)} />
                        </div>
                      </div>
                    </div>

                    {/* Ticket de Resumen */}
                    <div className="mt-8 p-5 bg-white/5 border border-white/10 rounded-2xl">
                      <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-4">
                        <span className="text-[10px] font-black text-[#00FF9F] uppercase tracking-widest">Resumen</span>
                        <span className="text-xl font-black font-mono text-white">${servicios.find(s => (s.id || s.nombre) === servicioSeleccionado)?.precio}</span>
                      </div>
                      <div className="space-y-2 text-sm font-bold text-slate-300">
                        <div className="flex justify-between"><span className="text-slate-500">Servicio:</span> <span>{servicios.find(s => (s.id || s.nombre) === servicioSeleccionado)?.nombre}</span></div>
                        {profesionalSeleccionado !== "sin-preferencia" && <div className="flex justify-between"><span className="text-slate-500">Con:</span> <span>{profesionales.find(p => p.id === profesionalSeleccionado)?.nombre}</span></div>}
                        <div className="flex justify-between"><span className="text-slate-500">Día:</span> <span>{fechaSeleccionada?.toLocaleDateString("es-AR", { day: 'numeric', month: 'short' })}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Hora:</span> <span className="text-[#00FF9F] font-mono">{horarioSeleccionado}</span></div>
                      </div>
                    </div>

                    <Button onClick={confirmarReserva} disabled={reservando} className="w-full mt-8 h-16 bg-[#00FF9F] text-black font-black text-lg rounded-2xl hover:bg-[#00cc7e] shadow-[0_0_20px_rgba(0,255,159,0.2)] transition-all uppercase tracking-widest">
                      {reservando ? <Loader2 className="animate-spin" /> : "Confirmar Reserva"}
                    </Button>
                  </div>
                )}

                {/* PASO 5: ÉXITO */}
                {paso === 5 && (
                  <div className="text-center py-10">
                    <div className="w-24 h-24 bg-[#00FF9F]/10 border border-[#00FF9F]/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(0,255,159,0.15)]">
                      <CheckCircle2 className="w-12 h-12 text-[#00FF9F]" />
                    </div>
                    <h2 className="text-4xl font-black text-white mb-2 uppercase italic tracking-tighter">¡Turno Confirmado!</h2>
                    <p className="text-slate-400 text-sm max-w-sm mx-auto mb-8">Te enviamos los detalles a <span className="text-white font-bold">{emailCliente}</span></p>
                    
                    <Button onClick={() => window.location.reload()} variant="outline" className="border-white/10 text-slate-300 hover:bg-white/5 hover:text-white rounded-xl h-12 px-8 font-black text-xs uppercase tracking-widest">
                      Nueva Reserva
                    </Button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}