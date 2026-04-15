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
  Mail
} from "lucide-react";
// Types
type Servicio = {
  id?: string;
  nombre: string;
  precio: number;
  duracion_min: number;
};

type DiaHorario = {
  dia: string;
  desde: string;
  hasta: string;
};

type HorarioConfig = {
  dia_semana: number;
  esta_abierto: boolean;
  hora_apertura: string;
  hora_cierre: string;
};

type Negocio = {
  id?: string;
  nombre: string;
  rubro: string;
  telefono: string;
  direccion: string;
  email: string;
  logo_url?: string;

  horarios: DiaHorario[];
  duracion_turno: number;
  intervalo_turno: number;
};

type HorarioDisponible = {
  hora: string;
  disponible: boolean;
};

// Props del componente
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
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date | undefined>(undefined);
  const [horariosDisponibles, setHorariosDisponibles] = useState<HorarioDisponible[]>([]);
  const [horarioSeleccionado, setHorarioSeleccionado] = useState<string>("");

  // Datos del cliente
  const [nombreCliente, setNombreCliente] = useState("");
  const [telefonoCliente, setTelefonoCliente] = useState("");
  const [emailCliente, setEmailCliente] = useState("");

  const [paso, setPaso] = useState(1);
  const [reservando, setReservando] = useState(false);

  //servicios de carga del negocio
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [horariosConfig, setHorariosConfig] = useState<HorarioConfig[]>([]);

  const calendarStyles = `
    .rdp-day_selected { background-color: #00FF9F !important; color: black !important; font-weight: bold !important; }
    .rdp-button:hover:not(.rdp-day_selected) { background-color: rgba(0, 255, 159, 0.1) !important; color: #00FF9F !important; }
    .rdp-head_cell { color: #94a3b8; font-weight: 500; }
    `;

  // Cargar datos del negocio
  useEffect(() => {
    cargarNegocio();
  }, [slug]); // ✅ Agregado slug a las dependencias

  const cargarNegocio = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("🔍 Buscando negocio con slug:", slug);

      const { data, error: supabaseError } = await supabase
        .from("negocios")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (supabaseError) {
        console.error("❌ Error de Supabase:", supabaseError);
        setError(supabaseError.message);
        setNegocio(null);
      } else if (!data) {
        console.error("❌ No se encontró el negocio");
        setNegocio(null);
      } else {
        console.log("✅ Negocio encontrado:", data);

        setNegocio(data as Negocio);
        await cargarServicios(data.id);
        await cargarHorariosConfig(data.id);

      }
    } catch (err) {
      console.error("❌ Error general:", err);
      setError("Error al cargar el negocio");
      setNegocio(null);
    } finally {
      setLoading(false);
    }
  };
  const cargarServicios = async (negocioId: string) => {
    const { data, error } = await supabase
      .from("servicios")
      .select("*")
      .eq("negocio_id", negocioId);

    if (error) {
      console.error("Error cargando servicios:", error);
      return;
    }
    setServicios(data || []);
  };

  const cargarHorariosConfig = async (negocioId: string) => {
    const { data, error } = await supabase
      .from("horarios_config")
      .select("*")
      .eq("negocio_id", negocioId);

    if (error) {
      console.error("Error cargando horarios:", error);
      return;
    }
    console.log("👉 Datos de horarios_config para este negocio:", data);
    setHorariosConfig(data || []);
  };

  // Generar horarios disponibles para una fecha
  useEffect(() => {
    if (fechaSeleccionada && negocio && horariosConfig.length > 0) {
      generarHorarios();
    }
  }, [fechaSeleccionada, negocio, horariosConfig]);

  const generarHorarios = async () => {
    if (!fechaSeleccionada || !negocio || horariosConfig.length === 0) return;

    const diaSemana = fechaSeleccionada.getDay();
    const configDia = horariosConfig.find(h => h.dia_semana === diaSemana);

    if (!configDia || !configDia.esta_abierto || !configDia.hora_apertura || !configDia.hora_cierre) {
      setHorariosDisponibles([]);
      return;
    }

    const slots: HorarioDisponible[] = [];
    const [horaInicio, minInicio] = configDia.hora_apertura.split(":").map(Number);
    const [horaFin, minFin] = configDia.hora_cierre.split(":").map(Number);

    let horaActualMinutos = horaInicio * 60 + minInicio;
    const horaFinMinutos = horaFin * 60 + minFin;

    // --- Lógica para NO mostrar horas pasadas si es HOY ---
    const ahora = new Date();
    const esHoy = fechaSeleccionada.toDateString() === ahora.toDateString();
    const minutosAhora = ahora.getHours() * 60 + ahora.getMinutes();

    const fechaString = fechaSeleccionada.toISOString().split('T')[0];

    const { data: turnosOcupados } = await supabase
      .from('turnos')
      .select('hora')
      .eq('negocio_id', negocio.id)
      .eq('fecha', fechaString)
      .neq('estado', 'cancelado'); // Traemos todo lo que NO esté cancelado

    // Normalizamos las horas ocupadas a formato "HH:mm"
    const horasOcupadas = new Set(
      turnosOcupados?.map(t => t.hora.substring(0, 5)) || []
    );

    const servicio = servicios.find(s => (s.id || s.nombre) === servicioSeleccionado);
    // Valor por defecto de 30 min si todo lo demás falla para evitar bucles infinitos
    const duracion = servicio?.duracion_min || negocio.duracion_turno || 30;

    while (horaActualMinutos + duracion <= horaFinMinutos) {
      const horas = Math.floor(horaActualMinutos / 60);
      const minutos = horaActualMinutos % 60;
      const horaFormato = `${String(horas).padStart(2, "0")}:${String(minutos).padStart(2, "0")}`;

      // VALIDACIÓN DOBLE: ¿Está ocupado? Y si es hoy, ¿ya pasó la hora?
      const ocupado = horasOcupadas.has(horaFormato);
      const yaPaso = esHoy && (horaActualMinutos <= minutosAhora + 15); // Margen de 15 min para que no reserven algo "ya"

      slots.push({
        hora: horaFormato,
        disponible: !ocupado && !yaPaso,
      });

      horaActualMinutos += duracion + (negocio.intervalo_turno || 0);
    }

    setHorariosDisponibles(slots);
  };

  // Validar que el día esté en los horarios del negocio
  const esDiaDisponible = (date: Date) => {
    if (!negocio || horariosConfig.length === 0) return false;

    const diaSemana = date.getDay();
    const configDia = horariosConfig.find(h => h.dia_semana === diaSemana);

    return configDia ? configDia.esta_abierto : false;
  };

  // Confirmar reserva
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
        fecha: fechaString,
        hora: horarioSeleccionado,
        cliente_nombre: nombreCliente,
        cliente_telefono: telefonoCliente,
        cliente_email: emailCliente,
        estado: "confirmado",
      };

      console.log("📝 Guardando reserva:", reserva);

      const { data, error } = await supabase
        .from('turnos')
        .insert([reserva])
        .select();

      if (error) {
        console.error("❌ Error al guardar turno:", error);
        alert("Hubo un error al confirmar tu turno. Intenta de nuevo.");
        return;
      }

      console.log("✅ Turno guardado:", data);
      setPaso(4);

    } catch (error) {
      console.error("❌ Error al confirmar reserva:", error);
      alert("Hubo un error al confirmar tu turno. Intenta de nuevo.");
    } finally {
      setReservando(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (error || !negocio) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">❌</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Negocio no encontrado
            </h2>
            <p className="text-gray-600 mb-4">
              El link que ingresaste no es válido o el negocio ya no existe.
            </p>
            {error && (
              <p className="text-sm text-red-600 bg-red-50 p-3 rounded">
                Error: {error}
              </p>
            )}
            <p className="text-sm text-gray-500 mt-4">
              Slug buscado: <code className="bg-gray-100 px-2 py-1 rounded">{slug}</code>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#05050a] text-slate-200 py-8 px-4 font-sans">
      <style>{calendarStyles}</style>

      <div className="max-w-4xl mx-auto">
        {/* HEADER DEL NEGOCIO - Estilo Glassmorphism */}
        <Card className="mb-6 bg-white/5 border-white/10 backdrop-blur-xl shadow-2xl">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {negocio.logo_url ? (
                <img
                  src={negocio.logo_url}
                  alt={negocio.nombre}
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-[#00FF9F]/30 shadow-[0_0_20px_rgba(0,255,159,0.15)]"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-[#00FF9F]/10 flex items-center justify-center text-4xl border border-[#00FF9F]/20 text-[#00FF9F]">
                  🏪
                </div>
              )}

              <div className="flex-1 text-center md:text-left">
                <h1 className="text-4xl font-black tracking-tighter text-white">
                  {negocio.nombre}
                </h1>
                <p className="text-[#00FF9F] font-bold tracking-widest uppercase text-[10px] mt-1 bg-[#00FF9F]/10 w-fit px-2 py-0.5 rounded md:mx-0 mx-auto">
                  {negocio.rubro}
                </p>

                {/* Información de contacto con alto contraste */}
                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  {negocio.direccion && (
                    <p className="flex items-center gap-2 justify-center md:justify-start text-slate-200">
                      <span className="text-[#00FF9F]">📍</span> {negocio.direccion}
                    </p>
                  )}
                  <p className="flex items-center gap-2 justify-center md:justify-start text-slate-200 font-mono">
                    <span className="text-[#00FF9F]">📞</span> {negocio.telefono}
                  </p>
                  {/* AQUÍ ESTÁ EL MAIL QUE FALTABA */}
                  <p className="flex items-center gap-2 justify-center md:justify-start text-slate-200">
                    <span className="text-[#00FF9F]">✉️</span> {negocio.email}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CONTENIDO PRINCIPAL - Card Transparente */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-md shadow-xl overflow-hidden">
          <CardContent className="p-6 md:p-10">
            <AnimatePresence mode="wait">
              <motion.div key={paso} initial="hidden" animate="visible" exit="exit" variants={stepVariants} transition={{ duration: 0.3 }}>

                {/* PASO 1: SERVICIOS */}
                {paso === 1 && (
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-6">Seleccioná un servicio</h2>
                    <div className="space-y-3">
                      {servicios.map((servicio) => (
                        <button
                          key={servicio.id}
                          onClick={() => { setServicioSeleccionado(servicio.id || servicio.nombre); setPaso(2); }}
                          className={`w-full p-5 rounded-2xl border-2 text-left transition-all duration-300 group ${servicioSeleccionado === (servicio.id || servicio.nombre)
                              ? "border-[#00FF9F] bg-[#00FF9F]/10 shadow-[0_0_20px_rgba(0,255,159,0.1)]"
                              : "border-white/5 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.08]"
                            }`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-black text-xl text-white group-hover:text-[#00FF9F] transition-colors tracking-tight">
                                {servicio.nombre}
                              </h3>
                              <p className="text-slate-400 text-xs font-medium uppercase tracking-widest mt-1">
                                {servicio.duracion_min} minutos de sesión
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-black font-mono text-[#00FF9F]">
                                ${servicio.precio}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* PASO 2: FECHA Y HORA (El corazón del Fix) */}
                {paso === 2 && (
                  <div>
                    <button onClick={() => setPaso(1)} className="text-[#00FF9F] text-sm mb-6 flex items-center gap-2 hover:opacity-80 transition-opacity">
                      ← Volver a servicios
                    </button>
                    <h2 className="text-2xl font-bold text-white mb-8">Elegí fecha y horario</h2>

                    <div className="grid lg:grid-cols-2 gap-10">
                      {/* CALENDARIO - Forzamos colores oscuros */}
                      <div className="bg-black/20 p-4 rounded-3xl border border-white/5">
                        <Calendar
                          mode="single"
                          selected={fechaSeleccionada}
                          onSelect={setFechaSeleccionada}
                          disabled={(date) => date < new Date() || !esDiaDisponible(date)}
                          className="text-white"
                        />
                      </div>

                      {/* GRILLA DE HORARIOS */}
                      <div className="flex flex-col">
                        <p className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-widest">
                          Disponibles para el {fechaSeleccionada?.toLocaleDateString()}
                        </p>
                        <div className="grid grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                          {horariosDisponibles.map((slot) => (
                            <button
                              key={slot.hora}
                              disabled={!slot.disponible}
                              onClick={() => setHorarioSeleccionado(slot.hora)}
                              className={`
                                py-4 rounded-xl text-sm font-mono transition-all duration-300 border
                                ${!slot.disponible
                                  ? "bg-white/5 text-slate-600 border-transparent opacity-40 cursor-not-allowed"
                                  : horarioSeleccionado === slot.hora
                                    ? "bg-[#00FF9F] text-black border-[#00FF9F] shadow-[0_0_15px_rgba(0,255,159,0.4)] font-bold"
                                    : "bg-white/5 text-white border-white/10 hover:border-[#00FF9F]/50 hover:bg-[#00FF9F]/5"
                                }
                              `}
                            >
                              {slot.hora}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {horarioSeleccionado && (
                      <Button onClick={() => setPaso(3)} className="w-full mt-10 h-14 bg-[#00FF9F] text-black hover:bg-[#00cc7e] font-black text-lg rounded-2xl shadow-lg transition-transform active:scale-[0.98]">
                        Continuar
                      </Button>
                    )}
                  </div>
                )}
{/* PASO 3: TUS DATOS */}
{paso === 3 && (
  <div>
    <button
      onClick={() => setPaso(2)}
      className="text-[#00FF9F] text-sm mb-6 flex items-center gap-2 hover:opacity-80 transition-all font-bold"
    >
      ← Volver a fecha y hora
    </button>

    <h2 className="text-3xl font-black text-white mb-6 tracking-tighter">TUS DATOS</h2>

    <div className="space-y-6">
      <div className="group">
        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1 group-focus-within:text-[#00FF9F] transition-colors">
          Nombre completo
        </label>
        <Input
          type="text"
          placeholder="Juan Pérez"
          className="bg-white/5 border-white/10 text-white h-12 rounded-xl focus:border-[#00FF9F]/50 focus:ring-0 transition-all placeholder:text-slate-600"
          value={nombreCliente}
          onChange={(e) => setNombreCliente(e.target.value)}
        />
      </div>

      <div className="group">
        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1 group-focus-within:text-[#00FF9F] transition-colors">
          Teléfono / WhatsApp
        </label>
        <Input
          type="tel"
          placeholder="+54 9 11 1234-5678"
          className="bg-white/5 border-white/10 text-white h-12 rounded-xl focus:border-[#00FF9F]/50 focus:ring-0 transition-all placeholder:text-slate-600"
          value={telefonoCliente}
          onChange={(e) => setTelefonoCliente(e.target.value)}
        />
      </div>

      <div className="group">
        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1 group-focus-within:text-[#00FF9F] transition-colors">
          Email de contacto
        </label>
        <Input
          type="email"
          placeholder="juan@example.com"
          className="bg-white/5 border-white/10 text-white h-12 rounded-xl focus:border-[#00FF9F]/50 focus:ring-0 transition-all placeholder:text-slate-600"
          value={emailCliente}
          onChange={(e) => setEmailCliente(e.target.value)}
        />
      </div>
    </div>

    {/* RESUMEN DE RESERVA - Estilo Ticket de Cristal */}
    <div className="mt-8 p-6 bg-[#00FF9F]/5 border border-[#00FF9F]/20 rounded-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
         <Sparkles className="text-[#00FF9F]" size={40} />
      </div>
      <h3 className="font-black text-white uppercase text-[10px] tracking-[0.3em] mb-6 border-b border-white/10 pb-4">
        Resumen de tu selección
      </h3>
      <div className="grid grid-cols-2 gap-y-6 gap-x-4">
        <div className="space-y-1">
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Servicio</p>
          <p className="text-white font-bold leading-tight">
            {servicios.find(s => (s.id || s.nombre) === servicioSeleccionado)?.nombre}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Precio</p>
          <p className="text-[#00FF9F] font-mono font-black text-xl leading-tight">
            ${servicios.find(s => (s.id || s.nombre) === servicioSeleccionado)?.precio}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Fecha</p>
          <p className="text-white font-bold">
            {fechaSeleccionada?.toLocaleDateString("es-AR", { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Horario</p>
          <p className="text-white font-black font-mono">
            {horarioSeleccionado} HS
          </p>
        </div>
      </div>
    </div>

    <Button
      onClick={confirmarReserva}
      disabled={reservando}
      className="w-full mt-8 h-14 bg-[#00FF9F] text-black font-black text-lg rounded-2xl hover:bg-[#00cc7e] shadow-[0_0_25px_rgba(0,255,159,0.2)] transition-all active:scale-[0.98]"
    >
      {reservando ? <Loader2 className="animate-spin mr-2" /> : "CONFIRMAR TURNO"}
    </Button>
  </div>
)}

{/* PASO 4: CONFIRMACIÓN EXITOSA */}
{paso === 4 && (
  <div className="text-center py-10">
    <div className="w-24 h-24 bg-[#00FF9F]/10 border border-[#00FF9F]/30 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(0,255,159,0.15)] animate-in zoom-in duration-500">
      <CheckCircle2 className="w-12 h-12 text-[#00FF9F]" />
    </div>

    <h2 className="text-4xl font-black text-white mb-3 tracking-tighter">¡LISTO, AGENDADO!</h2>
    <p className="text-slate-400 mb-10 max-w-xs mx-auto text-sm leading-relaxed">
      Te enviamos los detalles de tu reserva a <span className="text-[#00FF9F] font-bold">{emailCliente}</span>
    </p>

    <div className="max-w-md mx-auto p-8 bg-white/5 border border-white/10 rounded-[2rem] text-left relative overflow-hidden shadow-2xl">
      {/* Efecto decorativo de ticket */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#00FF9F]/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
      
      <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-6">
        <h3 className="font-black text-white uppercase text-[10px] tracking-[0.4em]">
          Ticket de Reserva
        </h3>
        <div className="text-[10px] font-mono text-slate-500">#{Math.floor(Math.random() * 90000) + 10000}</div>
      </div>
      
      <div className="space-y-5">
        <div className="flex justify-between items-end">
          <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Negocio</span>
          <span className="text-white font-bold border-b border-[#00FF9F]/30 pb-1">{negocio.nombre}</span>
        </div>
        <div className="flex justify-between items-end">
          <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Fecha</span>
          <span className="text-white font-bold">{fechaSeleccionada?.toLocaleDateString("es-AR", { weekday: 'short', day: 'numeric', month: 'short' })}</span>
        </div>
        <div className="flex justify-between items-end">
          <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Hora</span>
          <span className="text-[#00FF9F] font-black font-mono text-xl">{horarioSeleccionado} HS</span>
        </div>
        <div className="flex justify-between items-end">
          <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Dirección</span>
          <span className="text-white font-medium text-xs text-right max-w-[150px] italic">{negocio.direccion}</span>
        </div>
      </div>

      <div className="mt-10 pt-8 border-t border-dashed border-white/20">
        <Button
          onClick={() => {
            setPaso(1);
            setServicioSeleccionado("");
            setFechaSeleccionada(undefined);
            setHorarioSeleccionado("");
            setNombreCliente("");
            setTelefonoCliente("");
            setEmailCliente("");
          }}
          variant="outline"
          className="w-full border-white/10 text-white hover:bg-white/5 hover:text-[#00FF9F] rounded-2xl h-14 font-black text-xs tracking-widest uppercase transition-all"
        >
          Reservar otro turno
        </Button>
      </div>
    </div>
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
