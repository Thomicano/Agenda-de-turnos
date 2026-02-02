"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";

// Types
type Servicio = {
  id?: string;
  nombre: string;
  precio: string;
  duracion: string;
};

type DiaHorario = {
  dia: string;
  desde: string;
  hasta: string;
};

type Negocio = {
  id?: string;
  nombre: string;
  rubro: string;
  telefono: string;
  direccion: string;
  email: string;
  imagenUrl?: string;
  servicios: Servicio[];
  horarios: DiaHorario[];
  duracionTurno: number;
  intervaloTurno: number;
};

type HorarioDisponible = {
  hora: string;
  disponible: boolean;
};

// Props del componente
type ReservarTurnoProps = {
  slug: string; // El identificador único del negocio
};

export default function ReservarTurno({ slug }: ReservarTurnoProps) {
  // Estados
  const [negocio, setNegocio] = useState<Negocio | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Estados del formulario
  const [servicioSeleccionado, setServicioSeleccionado] = useState<string>("");
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date | undefined>(undefined);
  const [horariosDisponibles, setHorariosDisponibles] = useState<HorarioDisponible[]>([]);
  const [horarioSeleccionado, setHorarioSeleccionado] = useState<string>("");
  
  // Datos del cliente
  const [nombreCliente, setNombreCliente] = useState("");
  const [telefonoCliente, setTelefonoCliente] = useState("");
  const [emailCliente, setEmailCliente] = useState("");
  
  const [paso, setPaso] = useState(1); // 1: Servicio, 2: Fecha/Hora, 3: Datos personales, 4: Confirmación
  const [reservando, setReservando] = useState(false);

  // Cargar datos del negocio
  useEffect(() => {
    cargarNegocio();
  }, [slug]);

  const cargarNegocio = async () => {
    try {
      // AQUÍ irá la consulta a Supabase
      // const { data, error } = await supabase
      //   .from('negocios')
      //   .select('*')
      //   .eq('slug', slug)
      //   .single()

      // Por ahora datos de ejemplo
      const negocioEjemplo: Negocio = {
        id: "1",
        nombre: "Peluquería Elegante",
        rubro: "Peluquería",
        telefono: "+54 9 11 1234-5678",
        direccion: "Av. Corrientes 1234, CABA",
        email: "contacto@peluqueria.com",
        servicios: [
          { id: "1", nombre: "Corte de cabello", precio: "5000", duracion: "30" },
          { id: "2", nombre: "Tintura", precio: "8000", duracion: "60" },
          { id: "3", nombre: "Brushing", precio: "3000", duracion: "30" },
        ],
        horarios: [
          { dia: "Lunes", desde: "09:00", hasta: "18:00" },
          { dia: "Martes", desde: "09:00", hasta: "18:00" },
          { dia: "Miércoles", desde: "09:00", hasta: "18:00" },
          { dia: "Jueves", desde: "09:00", hasta: "18:00" },
          { dia: "Viernes", desde: "09:00", hasta: "20:00" },
          { dia: "Sábado", desde: "10:00", hasta: "16:00" },
        ],
        duracionTurno: 30,
        intervaloTurno: 5,
      };

      setNegocio(negocioEjemplo);
      setLoading(false);
    } catch (error) {
      console.error("Error al cargar negocio:", error);
      setLoading(false);
    }
  };

  // Generar horarios disponibles para una fecha
  useEffect(() => {
    if (fechaSeleccionada && negocio) {
      generarHorarios();
    }
  }, [fechaSeleccionada, negocio]);

  const generarHorarios = () => {
    if (!fechaSeleccionada || !negocio) return;

    const diasSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    const diaSemana = diasSemana[fechaSeleccionada.getDay()];

    // Buscar el horario de ese día
    const horarioDia = negocio.horarios.find(h => h.dia === diaSemana);

    if (!horarioDia) {
      setHorariosDisponibles([]);
      return;
    }

    // Generar slots de tiempo
    const slots: HorarioDisponible[] = [];
    const [horaInicio, minInicio] = horarioDia.desde.split(":").map(Number);
    const [horaFin, minFin] = horarioDia.hasta.split(":").map(Number);

    let horaActual = horaInicio * 60 + minInicio; // minutos desde medianoche
    const horaFinMinutos = horaFin * 60 + minFin;

    while (horaActual < horaFinMinutos) {
      const horas = Math.floor(horaActual / 60);
      const minutos = horaActual % 60;
      const horaFormato = `${String(horas).padStart(2, "0")}:${String(minutos).padStart(2, "0")}`;

      // AQUÍ verificarías en Supabase si el horario está ocupado
      // Por ahora todos disponibles
      const disponible = Math.random() > 0.3; // 70% disponibles (simulado)

      slots.push({
        hora: horaFormato,
        disponible: disponible,
      });

      horaActual += negocio.duracionTurno + negocio.intervaloTurno;
    }

    setHorariosDisponibles(slots);
  };

  // Validar que el día esté en los horarios del negocio
  const esDiaDisponible = (date: Date) => {
    if (!negocio) return false;
    
    const diasSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    const diaSemana = diasSemana[date.getDay()];
    
    return negocio.horarios.some(h => h.dia === diaSemana);
  };

  // Confirmar reserva
  const confirmarReserva = async () => {
    if (!nombreCliente || !telefonoCliente || !emailCliente) {
      alert("Por favor completá todos los campos");
      return;
    }

    setReservando(true);

    try {
      const reserva = {
        negocioId: negocio?.id,
        servicioId: servicioSeleccionado,
        fecha: fechaSeleccionada,
        hora: horarioSeleccionado,
        clienteNombre: nombreCliente,
        clienteTelefono: telefonoCliente,
        clienteEmail: emailCliente,
        estado: "confirmado",
      };

      console.log("Reserva a guardar:", reserva);

      // AQUÍ irá la inserción en Supabase
      // const { data, error } = await supabase.from('turnos').insert([reserva])

      await new Promise(resolve => setTimeout(resolve, 1000));

      setPaso(4);
    } catch (error) {
      console.error("Error al confirmar reserva:", error);
      alert("Hubo un error al confirmar tu turno. Intenta de nuevo.");
    } finally {
      setReservando(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Cargando...</p>
      </div>
    );
  }

  if (!negocio) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Negocio no encontrado
            </h2>
            <p className="text-gray-600">
              El link que ingresaste no es válido o el negocio ya no existe.
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
              {negocio.imagenUrl && (
                <img
                  src={negocio.imagenUrl}
                  alt={negocio.nombre}
                  className="w-24 h-24 rounded-lg object-cover"
                />
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
                <div className="space-y-3">
                  {negocio.servicios.map((servicio) => (
                    <button
                      key={servicio.id}
                      onClick={() => {
                        setServicioSeleccionado(servicio.id || "");
                        setPaso(2);
                      }}
                      className={`
                        w-full p-4 rounded-lg border-2 text-left transition
                        hover:border-indigo-600 hover:bg-indigo-50
                        ${
                          servicioSeleccionado === servicio.id
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
                            {servicio.duracion} minutos
                          </p>
                        </div>
                        <p className="text-lg font-bold text-indigo-600">
                          ${servicio.precio}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
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
                      {negocio.servicios.find(s => s.id === servicioSeleccionado)?.nombre}
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
                      {negocio.servicios.find(s => s.id === servicioSeleccionado)?.precio}
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
                      {negocio.servicios.find(s => s.id === servicioSeleccionado)?.nombre}
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
