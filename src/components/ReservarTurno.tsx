"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { supabase } from "@/lib/supabaseClient";

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
  imagen_url?: string;
  
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
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* HEADER DEL NEGOCIO */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-start gap-6">
              {negocio.imagen_url ? (
                <img
                  src={negocio.imagen_url}
                  alt={negocio.nombre}
                  className="w-24 h-24 rounded-lg object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-lg bg-indigo-100 flex items-center justify-center text-4xl">
                  🏪
                </div>
              )}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900">
                  {negocio.nombre}
                </h1>
                <p className="text-gray-600 mt-1">{negocio.rubro}</p>
                <div className="mt-3 space-y-1 text-sm text-gray-600">
                  {negocio.direccion && <p>📍 {negocio.direccion}</p>}
                  <p>📞 {negocio.telefono}</p>
                  <p>✉️ {negocio.email}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* STEPPER */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[
              { num: 1, texto: "Servicio" },
              { num: 2, texto: "Fecha y hora" },
              { num: 3, texto: "Tus datos" },
              { num: 4, texto: "Confirmación" },
            ].map((step, index) => (
              <div key={step.num} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center font-semibold
                      ${paso >= step.num
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-200 text-gray-600"
                      }
                    `}
                  >
                    {step.num}
                  </div>
                  <p className="text-xs mt-2 text-gray-600">{step.texto}</p>
                </div>
                {index < 3 && (
                  <div
                    className={`h-1 flex-1 ${
                      paso > step.num ? "bg-indigo-600" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CONTENIDO POR PASO */}
        <Card>
          <CardContent className="p-6">
            {/* PASO 1: SELECCIONAR SERVICIO */}
            {paso === 1 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Elegí un servicio
                </h2>
                {servicios.length === 0 ? (
                  <p className="text-gray-500">No hay servicios disponibles</p>
                ) : (
                  <div className="space-y-3">
                    {servicios.map((servicio, index) => (
                      <button
                        key={servicio.id || index}
                        onClick={() => {
                          setServicioSeleccionado(servicio.id || servicio.nombre);
                          setPaso(2);
                        }}
                        className={`
                          w-full p-4 rounded-lg border-2 text-left transition
                          hover:border-indigo-600 hover:bg-indigo-50
                          ${
                            servicioSeleccionado === (servicio.id || servicio.nombre)
                              ? "border-indigo-600 bg-indigo-50"
                              : "border-gray-200"
                          }
                        `}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {servicio.nombre}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {servicio.duracion_min} minutos
                            </p>
                          </div>
                          <p className="text-lg font-bold text-indigo-600">
                            ${servicio.precio}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* PASO 2: SELECCIONAR FECHA Y HORA */}
            {paso === 2 && (
              <div>
                <button
                  onClick={() => setPaso(1)}
                  className="text-indigo-600 text-sm mb-4 hover:underline"
                >
                  ← Volver a servicios
                </button>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Elegí fecha y horario
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* CALENDARIO */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-3">
                      Seleccioná una fecha:
                    </p>
                    <Calendar
                      mode="single"
                      selected={fechaSeleccionada}
                      onSelect={setFechaSeleccionada}
                      disabled={(date) => 
                        date < new Date() || !esDiaDisponible(date)
                      }
                      className="rounded-md border"
                    />
                  </div>

                  {/* HORARIOS */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-3">
                      Horarios disponibles:
                    </p>
                    {!fechaSeleccionada ? (
                      <p className="text-gray-500 text-sm">
                        Primero seleccioná una fecha
                      </p>
                    ) : horariosDisponibles.length === 0 ? (
                      <p className="text-gray-500 text-sm">
                        No hay horarios disponibles este día
                      </p>
                    ) : (
                      <div className="grid grid-cols-3 gap-2 max-h-96 overflow-y-auto">
                        {horariosDisponibles.map((slot) => (
                          <button
                            key={slot.hora}
                            disabled={!slot.disponible}
                            onClick={() => setHorarioSeleccionado(slot.hora)}
                            className={`
                              p-2 rounded text-sm font-medium transition
                              ${
                                !slot.disponible
                                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                  : horarioSeleccionado === slot.hora
                                  ? "bg-indigo-600 text-white"
                                  : "bg-white border-2 border-gray-200 hover:border-indigo-600"
                              }
                            `}
                          >
                            {slot.hora}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {horarioSeleccionado && (
                  <Button
                    onClick={() => setPaso(3)}
                    className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700"
                  >
                    Continuar
                  </Button>
                )}
              </div>
            )}

            {/* PASO 3: DATOS DEL CLIENTE */}
            {paso === 3 && (
              <div>
                <button
                  onClick={() => setPaso(2)}
                  className="text-indigo-600 text-sm mb-4 hover:underline"
                >
                  ← Volver a fecha y hora
                </button>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Tus datos
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre completo
                    </label>
                    <Input
                      type="text"
                      placeholder="Juan Pérez"
                      value={nombreCliente}
                      onChange={(e) => setNombreCliente(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono
                    </label>
                    <Input
                      type="tel"
                      placeholder="+54 9 11 1234-5678"
                      value={telefonoCliente}
                      onChange={(e) => setTelefonoCliente(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <Input
                      type="email"
                      placeholder="juan@example.com"
                      value={emailCliente}
                      onChange={(e) => setEmailCliente(e.target.value)}
                    />
                  </div>
                </div>

                {/* RESUMEN */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Resumen de tu turno:
                  </h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>
                      <strong>Servicio:</strong>{" "}
                      {servicios.find(s => (s.id || s.nombre) === servicioSeleccionado)?.nombre}
                    </p>
                    <p>
                      {servicios.find(s => (s.id || s.nombre) === servicioSeleccionado)?.duracion_min} minutos
                    </p>
                    <p>
                      <strong>Fecha:</strong>{" "}
                      {fechaSeleccionada?.toLocaleDateString("es-AR")}
                    </p>
                    <p>
                      <strong>Hora:</strong> {horarioSeleccionado}
                    </p>
                    <p>
                      <strong>Precio:</strong> $
                      {servicios.find(s => (s.id || s.nombre) === servicioSeleccionado)?.precio}
                    </p>
                  </div>
                </div>

                <Button
                  onClick={confirmarReserva}
                  disabled={reservando}
                  className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700"
                >
                  {reservando ? "Confirmando..." : "Confirmar turno"}
                </Button>
              </div>
            )}

            {/* PASO 4: CONFIRMACIÓN */}
            {paso === 4 && (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-10 h-10 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  ¡Turno confirmado!
                </h2>

                <p className="text-gray-600 mb-6">
                  Te enviamos un email de confirmación a {emailCliente}
                </p>

                <div className="max-w-md mx-auto p-6 bg-gray-50 rounded-lg text-left">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Detalles de tu turno:
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>
                      <strong>Negocio:</strong> {negocio.nombre}
                    </p>
                    <p>
                      <strong>Servicio:</strong>{" "}
                      {servicios.find(s => (s.id || s.nombre) === servicioSeleccionado)?.nombre}
                    </p>
                    <p>
                      <strong>Fecha:</strong>{" "}
                      {fechaSeleccionada?.toLocaleDateString("es-AR", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <p>
                      <strong>Hora:</strong> {horarioSeleccionado}
                    </p>
                    <p>
                      <strong>Dirección:</strong> {negocio.direccion}
                    </p>
                    <p>
                      <strong>Teléfono:</strong> {negocio.telefono}
                    </p>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    // Resetear formulario
                    setPaso(1);
                    setServicioSeleccionado("");
                    setFechaSeleccionada(undefined);
                    setHorarioSeleccionado("");
                    setNombreCliente("");
                    setTelefonoCliente("");
                    setEmailCliente("");
                  }}
                  variant="outline"
                  className="mt-6"
                >
                  Reservar otro turno
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
