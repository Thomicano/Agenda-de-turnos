"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";

import { supabase } from "@/lib/supabaseClient";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
// Types

type Servicio = {
  nombre: string;
  precio: string;
  duracion: string;
};

type DiaHorario = {
  dia: string;
  activo: boolean;
  desde: string;
  hasta: string;
};


const DIAS_SEMANA = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

export default function CrearNegocioPage() {
  // States
  const [nombreNegocio, setNombreNegocio] = useState("");
  const [rubro, setRubro] = useState("Peluquería");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [email, setEmail] = useState("");
  const [imagenFile, setImagenFile] = useState<File | null>(null);
  const [imagenPreview, setImagenPreview] = useState<string>("");

  const [servicios, setServicios] = useState<Servicio[]>([
    { nombre: "", precio: "", duracion: "" },
  ]);

  const router = useRouter();

  const [mostrarExito, setMostrarExito] = useState(false);
  const [finalSlug, setFinalSlug] = useState("");

  const [duracionTurno, setDuracionTurno] = useState("");
  const [intervaloTurno, setIntervaloTurno] = useState("");
  const [intervaloAutomatico, setIntervaloAutomatico] = useState(true);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [mostrarPreview, setMostrarPreview] = useState(false);
  const [horariosDia, setHorariosDia] = useState<DiaHorario[]>([
    { dia: "Lunes", activo: false, desde: "", hasta: "" },
    { dia: "Martes", activo: false, desde: "", hasta: "" },
    { dia: "Miércoles", activo: false, desde: "", hasta: "" },
    { dia: "Jueves", activo: false, desde: "", hasta: "" },
    { dia: "Viernes", activo: false, desde: "", hasta: "" },
    { dia: "Sábado", activo: false, desde: "", hasta: "" },
    { dia: "Domingo", activo: false, desde: "", hasta: "" },
  ]);

  const { user, isLoading: authLoading } = useAuth();

  // Calcular intervalo automático basado en duración
  const calcularIntervaloAutomatico = (duracion: string) => {
    const duracionNum = parseInt(duracion);
    if (!duracionNum) return "0";

    // Lógica: 10% del tiempo del turno, mínimo 5 minutos
    const intervaloCalculado = Math.max(5, Math.ceil(duracionNum * 0.1));
    return intervaloCalculado.toString();
  };

  // Actualizar intervalo cuando cambia la duración (si está en modo automático)
  const handleDuracionChange = (valor: string) => {
    setDuracionTurno(valor);
    if (intervaloAutomatico && valor) {
      setIntervaloTurno(calcularIntervaloAutomatico(valor));
    }
  };

  // Manejo de imagen
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Por favor sube una imagen válida (JPG, PNG o WEBP)');
      return;
    }

    // Validar tamaño (5MB máximo)
    const maxSize = 5 * 1024 * 1024; // 5MB en bytes
    if (file.size > maxSize) {
      alert('La imagen es muy grande. El tamaño máximo es 5MB');
      return;
    }

    setImagenFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagenPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Funciones para servicios
  const agregarServicio = () => {
    setServicios([...servicios, { nombre: "", precio: "", duracion: "" }]);
  };

  const eliminarServicio = (index: number) => {
    setServicios(servicios.filter((_, i) => i !== index));
  };

  const actualizarServicio = (
    index: number,
    campo: keyof Servicio,
    valor: string
  ) => {
    const copia = [...servicios];
    copia[index][campo] = valor;
    setServicios(copia);
  };

  // Funciones para horarios
  const toggleDia = (index: number) => {
    const copia = [...horariosDia];
    copia[index].activo = !copia[index].activo;
    setHorariosDia(copia);
  };

  // Validación
  const validarFormulario = () => {
    const newErrors: { [key: string]: string } = {};

    if (!nombreNegocio.trim()) {
      newErrors.nombreNegocio = "El nombre del negocio es obligatorio";
    }

    if (!telefono.trim()) {
      newErrors.telefono = "El teléfono es obligatorio";
    }

    if (!email.trim()) {
      newErrors.email = "El email es obligatorio";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "El email no es válido";
    }

    // Validar que haya al menos un servicio completo
    const serviciosValidos = servicios.filter(
      s => s.nombre.trim() && s.precio && s.duracion
    );
    if (serviciosValidos.length === 0) {
      newErrors.servicios = "Debes agregar al menos un servicio completo";
    }

    // Validar que haya al menos un horario completo
    const diasActivos = horariosDia.filter(d => d.activo);

    if (diasActivos.length === 0) {
      newErrors.horarios = "Debes seleccionar al menos un día de atención";
    } else {
      // Verificar que todos los días activos tengan horario
      const diasSinHorario = diasActivos.filter(d => !d.desde || !d.hasta);
      if (diasSinHorario.length > 0) {
        newErrors.horarios = "Debes indicar el horario para todos los días seleccionados";
      }
    }

    if (!duracionTurno) {
      newErrors.duracionTurno = "La duración del turno es obligatoria";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validarFormulario()) return;
    setLoading(true);

    try {
      // 1. Verificación de Seguridad
      const { data: { user: currentUser } } = await supabase.auth.getUser();

      if (!currentUser) {
        toast.error("¡Pará! Tenés que iniciar sesión o registrarte para crear un negocio.");
        router.push("/login");
        return;
      }

      // 2. Preparación de datos y Slug único (usando timestamp para no colisionar)
      const slugBase = nombreNegocio.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      const uniqueSlug = `${slugBase}-${new Date().getTime()}`;

      // 3. Inserción del Negocio (con el owner_id)
      const { data: negocioData, error: negocioError } = await supabase
        .from('negocios')
        .insert([{
          nombre: nombreNegocio,
          rubro,
          telefono,
          direccion,
          email,
          slug: uniqueSlug,
          owner_id: currentUser.id,
          duracion_turno: parseInt(duracionTurno),
          intervalo_turno: intervaloTurno ? parseInt(intervaloTurno) : 0,
        }])
        .select()
        .single();

      if (negocioError) throw negocioError;

      const negocioId = negocioData.id;

      // 4. Inserción de datos relacionados en paralelo usando Promise.all
      const serviciosAInsertar = servicios
        .filter(s => s.nombre.trim())
        .map(s => ({
          negocio_id: negocioId,
          nombre: s.nombre,
          precio: parseFloat(s.precio),
          duracion_min: parseInt(s.duracion)
        }));

      const horariosAInsertar = horariosDia
        .filter(d => d.activo)
        .map(d => ({
          negocio_id: negocioId,
          dia_semana: DIAS_SEMANA.indexOf(d.dia),
          esta_abierto: true,
          hora_apertura: d.desde,
          hora_cierre: d.hasta
        }));

      const [servRes, horRes] = await Promise.all([
        supabase.from('servicios').insert(serviciosAInsertar),
        supabase.from('horarios_config').insert(horariosAInsertar)
      ]);

      if (servRes.error) throw servRes.error;
      if (horRes.error) throw horRes.error;

      // --- ÉXITO TOTAL ---
      setFinalSlug(uniqueSlug);
      setMostrarExito(true);

    } catch (error: any) {
      console.error("❌ Error en el despliegue del negocio:", error);
      toast.error(error.message || "Ocurrió un error inesperado al crear el negocio.");
    } finally {
      setLoading(false);
    }
  };

  // Bloqueos de renderización por autenticación
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium text-sm">Verificando sesión...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center">
          <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Acceso Denegado</h2>
          <p className="text-slate-500 text-sm mb-8">
            Tenés que iniciar sesión o registrar tu cuenta para poder crear un negocio en TurneroPro.
          </p>
          <div className="flex flex-col gap-3">
            <Link 
              href="/login" 
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl transition-colors"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/registro"
              className="text-indigo-600 hover:text-indigo-700 font-medium text-sm transition-colors py-2"
            >
              Crear cuenta gratis
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow">
        {/* TÍTULO */}
        <h1 className="text-3xl font-bold text-gray-900">
          Configurá tu negocio
        </h1>

        <p className="mt-2 text-gray-600">
          Completá los datos básicos para que tus clientes puedan reservar turnos.
        </p>

        {/* FORMULARIO */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-8">
          {/* ========================= */}
          {/* DATOS DEL NEGOCIO */}
          {/* ========================= */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800">
              Datos del negocio
            </h2>

            <div className="mt-4 space-y-4">
              {/* NOMBRE */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nombre del negocio *
                </label>
                <input
                  type="text"
                  placeholder="Ej: Peluquería Juan"
                  className="input-base"
                  value={nombreNegocio}
                  onChange={(e) => setNombreNegocio(e.target.value)}
                />
                {errors.nombreNegocio && (
                  <p className="text-red-500 text-sm mt-1">{errors.nombreNegocio}</p>
                )}
              </div>

              {/* RUBRO */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Rubro
                </label>
                <select
                  className="input-base"
                  value={rubro}
                  onChange={(e) => setRubro(e.target.value)}
                >
                  <option>Peluquería</option>
                  <option>Barbería</option>
                  <option>Estética</option>
                  <option>Consultorio</option>
                  <option>Gimnasio</option>
                  <option>Veterinaria</option>
                  <option>Otro</option>
                </select>
              </div>

              {/* TELÉFONO */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  placeholder="Ej: +54 9 11 1234-5678"
                  className="input-base"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                />
                {errors.telefono && (
                  <p className="text-red-500 text-sm mt-1">{errors.telefono}</p>
                )}
              </div>

              {/* EMAIL */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email *
                </label>
                <input
                  type="email"
                  placeholder="Ej: contacto@negocio.com"
                  className="input-base"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* DIRECCIÓN */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Dirección
                </label>
                <input
                  type="text"
                  placeholder="Ej: Av. Corrientes 1234, CABA"
                  className="input-base"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                />
              </div>

              {/* IMAGEN */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagen o logo
                </label>

                {!imagenPreview ? (
                  <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg
                        className="w-10 h-10 mb-3 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <p className="mb-2 text-sm text-gray-600">
                        <span className="font-semibold">Click para subir</span> o arrastrá la imagen
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG o WEBP (MAX. 5MB)
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                ) : (
                  <div className="relative">
                    <img
                      src={imagenPreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg border-2 border-gray-300"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-40 transition rounded-lg flex items-center justify-center group">
                      <div className="hidden group-hover:flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setImagenPreview("");
                            setImagenFile(null);
                          }}
                          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition cursor-pointer"
                        >
                          🗑️ Eliminar
                        </button>
                        <label className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition cursor-pointer">
                          📷 Cambiar
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ========================= */}
          {/* SERVICIOS */}
          {/* ========================= */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800">
              Servicios *
            </h2>

            <p className="text-sm text-gray-600 mt-1">
              Cada servicio puede tener su propio precio y duración
            </p>

            <div className="mt-4 space-y-4">
              {servicios.map((servicio, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* SERVICIO */}
                      <input
                        type="text"
                        placeholder="Servicio (ej: Corte)"
                        className="input-base"
                        value={servicio.nombre}
                        onChange={(e) =>
                          actualizarServicio(index, "nombre", e.target.value)
                        }
                      />

                      {/* PRECIO */}
                      <input
                        type="number"
                        placeholder="Precio"
                        className="input-base"
                        value={servicio.precio}
                        onChange={(e) =>
                          actualizarServicio(index, "precio", e.target.value)
                        }
                      />

                      {/* DURACIÓN */}
                      <input
                        type="number"
                        placeholder="Duración (min)"
                        className="input-base"
                        value={servicio.duracion}
                        onChange={(e) =>
                          actualizarServicio(index, "duracion", e.target.value)
                        }
                      />
                    </div>

                    {servicios.length > 1 && (
                      <Button
                        type="button"
                        variant="destructive"
                        className="mt-3"
                        onClick={() => eliminarServicio(index)}
                      >
                        Eliminar servicio
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {errors.servicios && (
              <p className="text-red-500 text-sm mt-2">{errors.servicios}</p>
            )}

            {/* BOTÓN AGREGAR SERVICIO */}
            <button
              type="button"
              className="mt-4 text-indigo-600 text-sm hover:underline"
              onClick={agregarServicio}
            >
              + Agregar otro servicio
            </button>
          </section>

          {/* ========================= */}
          {/* CONFIGURACIÓN TURNOS */}
          {/* ========================= */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800">
              Configuración de turnos
            </h2>

            <div className="mt-4 space-y-4">
              {/* DURACIÓN TURNO */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Duración por turno (min) *
                </label>
                <input
                  type="number"
                  placeholder="30"
                  className="input-base"
                  value={duracionTurno}
                  onChange={(e) => handleDuracionChange(e.target.value)}
                />
                {errors.duracionTurno && (
                  <p className="text-red-500 text-sm mt-1">{errors.duracionTurno}</p>
                )}
              </div>

              {/* INTERVALO AUTOMÁTICO */}
              <div className="flex items-center gap-2 p-3 bg-indigo-50 rounded-lg">
                <input
                  type="checkbox"
                  id="intervalo-auto"
                  checked={intervaloAutomatico}
                  onChange={(e) => {
                    setIntervaloAutomatico(e.target.checked);
                    if (e.target.checked && duracionTurno) {
                      setIntervaloTurno(calcularIntervaloAutomatico(duracionTurno));
                    }
                  }}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <label htmlFor="intervalo-auto" className="text-sm text-gray-700">
                  Calcular intervalo automáticamente (10% de la duración)
                </label>
              </div>

              {/* INTERVALO MANUAL */}
              {!intervaloAutomatico && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Intervalo entre turnos (min)
                  </label>
                  <input
                    type="number"
                    placeholder="5"
                    className="input-base"
                    value={intervaloTurno}
                    onChange={(e) => setIntervaloTurno(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Tiempo de descanso entre turnos
                  </p>
                </div>
              )}

              {/* MOSTRAR INTERVALO CALCULADO */}
              {intervaloAutomatico && duracionTurno && (
                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                  ℹ️ Intervalo calculado: <strong>{intervaloTurno} minutos</strong>
                  <br />
                  <span className="text-xs">
                    Total: {(parseInt(duracionTurno) + parseInt(intervaloTurno || "0"))} min
                  </span>
                </div>
              )}
            </div>
          </section>

          {/* ========================= */}
          {/* HORARIOS */}
          {/* ========================= */}
          {/* ========================= */}
          {/* HORARIOS DE ATENCIÓN */}
          {/* ========================= */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800">
              Horarios de atención *
            </h2>

            <p className="text-sm text-gray-600 mt-1">
              Seleccioná los días y el horario en el que atendés
            </p>

            {/* DÍAS */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {horariosDia.map((d, index) => (
                <button
                  key={d.dia}
                  type="button"
                  onClick={() => toggleDia(index)}
                  className={`
          px-4 py-2 rounded-lg border text-sm font-medium transition
          ${d.activo
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                    }
        `}
                >
                  {d.dia}
                </button>
              ))}
            </div>

            {/* HORARIOS POR DÍA */}
            {horariosDia.filter(d => d.activo).length > 0 && (
              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-medium text-gray-800">Horarios por día</h3>
                {horariosDia.filter(d => d.activo).map((dia) => {
                  const originalIndex = horariosDia.findIndex(d => d.dia === dia.dia);
                  return (
                    <div key={dia.dia} className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">{dia.dia}</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Desde
                          </label>
                          <Input
                            type="time"
                            className="input-base"
                            value={dia.desde}
                            onChange={(e) => {
                              const copia = [...horariosDia];
                              copia[originalIndex].desde = e.target.value;
                              setHorariosDia(copia);
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Hasta
                          </label>
                          <Input
                            type="time"
                            className="input-base"
                            value={dia.hasta}
                            onChange={(e) => {
                              const copia = [...horariosDia];
                              copia[originalIndex].hasta = e.target.value;
                              setHorariosDia(copia);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* ========================= */}
          {/* BOTONES FINALES */}
          {/* ========================= */}
          <div className="pt-6 space-y-3">
            {/* Botón Preview */}
            <button
              type="button"
              onClick={() => setMostrarPreview(true)}
              className="
                w-full
                bg-white
                border-2
                border-indigo-600
                text-indigo-600
                py-3
                rounded-lg
                text-lg
                hover:bg-indigo-50
                transition
                font-semibold
              "
            >
              👁️ Vista previa de mi agenda
            </button>

            {/* Botón Crear */}
            <button
              type="submit"
              disabled={loading}
              className="
                w-full
                bg-indigo-600
                text-white
                py-3
                rounded-lg
                text-lg
                hover:bg-indigo-700
                transition
                disabled:bg-gray-400
                disabled:cursor-not-allowed
                font-semibold
              "
            >
              {loading ? "Creando agenda..." : "✨ Crear mi agenda"}
            </button>
          </div>
        </form>
        {mostrarExito && (
          <div className="fixed inset-0 bg-indigo-900/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <Card className="max-w-md w-full border-none shadow-2xl">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
                  🎉
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Ya estás online!</h2>
                <p className="text-gray-600 mb-8">Tu agenda se creó correctamente. Copiá tus accesos:</p>

                <div className="space-y-4 text-left">
                  <div>
                    <label className="text-xs font-bold text-indigo-600 uppercase">Link para tus clientes</label>
                    <div className="flex gap-2 mt-1">
                      <Input readOnly value={`http://localhost:3000/${finalSlug}`} className="bg-gray-50" />
                      <Button variant="outline" onClick={() => {
                        navigator.clipboard.writeText(`http://localhost:3000/${finalSlug}`);
                        alert("¡Copiado!");
                      }}>Copiar</Button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-amber-600 uppercase">Tu Panel Administrador</label>
                    <div className="flex gap-2 mt-1">
                      <Input readOnly value={`http://localhost:3000/admin/${finalSlug}`} className="bg-amber-50" />
                      <Button variant="outline" onClick={() => {
                        navigator.clipboard.writeText(`http://localhost:3000/admin/${finalSlug}`);
                        alert("¡Copiado!");
                      }}>Copiar</Button>
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full mt-8 bg-indigo-600 hover:bg-indigo-700 h-12 text-lg"
                  onClick={() => router.push(`/admin/${finalSlug}`)}
                >
                  Ir a mi Agenda ahora →
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
        {/* ========================= */}
        {/* MODAL DE PREVIEW */}
        {/* ========================= */}
        {mostrarPreview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header del Modal */}
              <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  Vista previa de tu agenda
                </h2>
                <button
                  onClick={() => setMostrarPreview(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>

              {/* Contenido del Preview */}
              <div className="p-6">
                {/* Header del negocio */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-lg mb-6">
                  <div className="flex items-start gap-4">
                    {imagenPreview ? (
                      <img
                        src={imagenPreview}
                        alt={nombreNegocio}
                        className="w-20 h-20 rounded-lg object-cover border-2 border-white"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-lg bg-white bg-opacity-20 flex items-center justify-center text-4xl">
                        🏪
                      </div>
                    )}
                    <div className="flex-1">
                      <h1 className="text-2xl font-bold">
                        {nombreNegocio || "Nombre de tu negocio"}
                      </h1>
                      <p className="text-indigo-100 mt-1">{rubro}</p>
                      {direccion && (
                        <p className="text-sm text-indigo-100 mt-2">📍 {direccion}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Información de contacto */}
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Teléfono</p>
                    <p className="font-semibold text-gray-900">
                      {telefono || "No especificado"}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-semibold text-gray-900">
                      {email || "No especificado"}
                    </p>
                  </div>
                </div>

                {/* Servicios */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    📋 Servicios disponibles
                  </h3>
                  {servicios.filter(s => s.nombre).length === 0 ? (
                    <p className="text-gray-500 text-sm">
                      Aún no agregaste servicios
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {servicios
                        .filter(s => s.nombre)
                        .map((servicio, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center p-3 bg-white border rounded-lg"
                          >
                            <div>
                              <p className="font-semibold text-gray-900">
                                {servicio.nombre}
                              </p>
                              <p className="text-sm text-gray-600">
                                {servicio.duracion} minutos
                              </p>
                            </div>
                            <p className="text-lg font-bold text-indigo-600">
                              ${servicio.precio}
                            </p>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {/* Horarios */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    🕐 Horarios de atención
                  </h3>
                  {horariosDia.filter(d => d.activo && d.desde && d.hasta).length === 0 ? (
                    <p className="text-gray-500 text-sm">
                      Aún no configuraste horarios
                    </p>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-2">
                      {horariosDia
                        .filter(d => d.activo && d.desde && d.hasta)
                        .map((horario, index) => (
                          <div
                            key={index}
                            className="flex justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <span className="font-medium text-gray-900">
                              {horario.dia}
                            </span>
                            <span className="text-gray-600">
                              {horario.desde} - {horario.hasta}
                            </span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {/* Configuración de turnos */}
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    ⚙️ Configuración
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duración por turno:</span>
                      <span className="font-semibold text-gray-900">
                        {duracionTurno || "0"} minutos
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Intervalo entre turnos:</span>
                      <span className="font-semibold text-gray-900">
                        {intervaloTurno || "0"} minutos {intervaloAutomatico && "(automático)"}
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-2 mt-2">
                      <span className="text-gray-600">Tiempo total por slot:</span>
                      <span className="font-semibold text-indigo-600">
                        {(parseInt(duracionTurno || "0") + parseInt(intervaloTurno || "0"))} minutos
                      </span>
                    </div>
                  </div>
                </div>

                {/* Ejemplo de horarios disponibles */}
                {duracionTurno && horariosDia.some(d => d.activo && d.desde && d.hasta) && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      📅 Ejemplo de horarios generados
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Así verán los clientes los horarios disponibles para reservar:
                    </p>
                    {(() => {
                      const primerHorario = horariosDia.find(d => d.activo && d.desde && d.hasta);
                      if (!primerHorario) return null;

                      const [horaInicio, minInicio] = primerHorario.desde.split(":").map(Number);
                      const slots = [];
                      let horaActual = horaInicio * 60 + minInicio;
                      const duracion = parseInt(duracionTurno);
                      const intervalo = parseInt(intervaloTurno || "0");

                      // Generar los primeros 6 slots como ejemplo
                      for (let i = 0; i < 6; i++) {
                        const horas = Math.floor(horaActual / 60);
                        const minutos = horaActual % 60;
                        slots.push(`${String(horas).padStart(2, "0")}:${String(minutos).padStart(2, "0")}`);
                        horaActual += duracion + intervalo;
                      }

                      return (
                        <div className="grid grid-cols-3 gap-2">
                          {slots.map((slot, index) => (
                            <div
                              key={index}
                              className="p-2 bg-white border-2 border-indigo-200 rounded text-center text-sm font-medium text-gray-900"
                            >
                              {slot}
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* Footer del Modal */}
              <div className="sticky bottom-0 bg-gray-50 border-t p-4">
                <button
                  onClick={() => setMostrarPreview(false)}
                  className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition font-semibold"
                >
                  Cerrar vista previa
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}